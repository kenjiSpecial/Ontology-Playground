/**
 * Build-time catalogue compiler.
 *
 * Reads all catalogue/**\/*.rdf files, parses each via the RDF parser,
 * reads associated metadata.json, and emits public/catalogue.json.
 *
 * Usage: npx tsx scripts/compile-catalogue.ts
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { parseRDF } from '../src/lib/rdf/parser.js';
import { serializeToRDF } from '../src/lib/rdf/serializer.js';
import {
  applyCatalogueLocalization,
  parseCatalogueLocalization,
} from '../src/lib/catalogueLocalization.js';
import { validateOntologyStyle } from './style-validator.js';
import type { CatalogueEntry, Catalogue } from '../src/types/catalogue.js';
import type { DataBinding, Ontology } from '../src/data/ontology.js';

// Provide DOMParser for the RDF parser (browser API not available in Node)
const dom = new JSDOM('');
globalThis.DOMParser = dom.window.DOMParser;

const DEFAULT_ROOT = join(import.meta.dirname, '..');

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface CatalogueMetadata {
  name: string;
  description: string;
  icon?: string;
  category: string;
  tags?: string[];
  author?: string;
}

interface CompileLogger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface CompileCatalogueOptions {
  rootDir?: string;
  logger?: CompileLogger;
}

// ------------------------------------------------------------------
// Validation helpers
// ------------------------------------------------------------------

const REQUIRED_METADATA_FIELDS = ['name', 'description', 'category'] as const;
const VALID_CATEGORIES = ['retail', 'healthcare', 'finance', 'manufacturing', 'education', 'food', 'media', 'events', 'technology', 'general', 'iq-lab', 'school', 'fibo'];

function validateMetadata(meta: unknown, filePath: string): CatalogueMetadata {
  if (typeof meta !== 'object' || meta === null) {
    throw new Error(`${filePath}: metadata.json must be a JSON object`);
  }
  const obj = meta as Record<string, unknown>;
  for (const field of REQUIRED_METADATA_FIELDS) {
    if (typeof obj[field] !== 'string' || (obj[field] as string).length === 0) {
      throw new Error(`${filePath}: metadata.json missing required field "${field}"`);
    }
  }
  if (!VALID_CATEGORIES.includes(obj['category'] as string)) {
    throw new Error(
      `${filePath}: invalid category "${obj['category']}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    );
  }
  return meta as CatalogueMetadata;
}

function assertRegularFile(filePath: string, context: string): void {
  const stat = lstatSync(filePath);
  if (stat.isSymbolicLink()) {
    throw new Error(`${context} must be a regular file; symlinks are not allowed`);
  }
  if (!stat.isFile()) {
    throw new Error(`${context} must be a regular file`);
  }
}

// ------------------------------------------------------------------
// Discover ontology directories
// ------------------------------------------------------------------

// Validate that a directory name is a safe slug (no traversal, no special chars)
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9\-_]*[a-z0-9]$|^[a-z0-9]$/;

function discoverOntologyDirs(baseDir: string): string[] {
  const dirs: string[] = [];
  if (!existsSync(baseDir)) return dirs;
  for (const entry of readdirSync(baseDir)) {
    const full = join(baseDir, entry);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) {
      console.error(`✘ ${baseDir}/${entry}: symlinks are not allowed in the catalogue`);
      continue;
    }
    if (!stat.isDirectory()) continue;
    if (!SAFE_SLUG_RE.test(entry)) {
      console.error(`✘ ${baseDir}/${entry}: directory name contains unsafe characters (only lowercase alphanumeric, hyphens, underscores allowed)`);
      continue;
    }
    dirs.push(full);
  }
  return dirs;
}

function discoverLocalizationFiles(baseDir: string): string[] {
  let rootStat: ReturnType<typeof lstatSync>;
  try {
    rootStat = lstatSync(baseDir);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw cause;
  }
  if (rootStat.isSymbolicLink()) {
    throw new Error(`${baseDir}: symlinks are not allowed in catalogue localization overlays`);
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`${baseDir}: catalogue localization overlay root must be a directory`);
  }

  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = lstatSync(fullPath);
      if (stat.isSymbolicLink()) {
        throw new Error(`${fullPath}: symlinks are not allowed in catalogue localization overlays`);
      }
      if (stat.isDirectory()) {
        visit(fullPath);
      } else if (entry.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  };

  visit(baseDir);
  return files.sort();
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

export function compileCatalogue(options: CompileCatalogueOptions = {}): Catalogue {
  const rootDir = options.rootDir ?? DEFAULT_ROOT;
  const logger = options.logger ?? console;
  const catalogueDir = join(rootDir, 'catalogue');
  const localizationDir = join(rootDir, 'content', 'ja', 'catalogue');
  let entries: CatalogueEntry[] = [];
  const seenIds = new Set<string>();
  let errors = 0;

  for (const tier of ['official', 'community', 'external'] as const) {
    const tierDir = join(catalogueDir, tier);
    // For community and external, ontologies are nested one level deeper:
    // community/<user>/<slug>/  or  external/<source-name>/<slug>/
    const ontologyDirs: { dir: string; source: typeof tier }[] = [];

    if (tier === 'official') {
      for (const dir of discoverOntologyDirs(tierDir)) {
        ontologyDirs.push({ dir, source: tier });
      }
    } else {
      // community/<username>/<ontology-slug>/  or  external/<source>/<ontology-slug>/
      for (const userDir of discoverOntologyDirs(tierDir)) {
        for (const dir of discoverOntologyDirs(userDir)) {
          ontologyDirs.push({ dir, source: tier });
        }
      }
    }

    for (const { dir, source } of ontologyDirs) {
      const slug = basename(dir);
      const metadataPath = join(dir, 'metadata.json');
      const rdfFiles = readdirSync(dir).filter((f) => f.endsWith('.rdf') || f.endsWith('.owl'));

      if (rdfFiles.length === 0) {
        logger.error(`✘ ${dir}: no .rdf or .owl file found`);
        errors++;
        continue;
      }

      // Parse metadata
      let metadata: CatalogueMetadata;
      try {
        assertRegularFile(metadataPath, 'metadata.json');
        const raw = JSON.parse(readFileSync(metadataPath, 'utf-8'));
        metadata = validateMetadata(raw, metadataPath);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
          logger.error(`✘ ${dir}: missing metadata.json`);
        } else {
          logger.error(`✘ ${metadataPath}: ${(e as Error).message}`);
        }
        errors++;
        continue;
      }

      // Derive a stable ID from the filesystem path: <source>/<slug>
      // For community ontologies the path is deeper: community/<user>/<slug>
      const relPath = dir.slice(tierDir.length + 1).replace(/\\/g, '/'); // e.g. "cosmic-coffee" or "alice/my-ontology"
      const entryId = `${source}/${relPath}`;

      if (seenIds.has(entryId)) {
        logger.error(`✘ ${dir}: duplicate catalogue path "${entryId}"`);
        errors++;
        continue;
      }

      // Parse RDF
      const rdfPath = join(dir, rdfFiles[0]);
      let ontology: Ontology;
      let bindings: DataBinding[];
      try {
        for (const rdfFile of rdfFiles) {
          assertRegularFile(join(dir, rdfFile), 'source RDF/OWL');
        }
        const rdfXml = readFileSync(rdfPath, 'utf-8');
        const parsed = parseRDF(rdfXml);
        ontology = parsed.ontology;
        bindings = parsed.bindings;
      } catch (e) {
        logger.error(`✘ ${rdfPath}: ${(e as Error).message}`);
        errors++;
        continue;
      }

      // Round-trip check: serialize back and re-parse to verify fidelity
      try {
        const reserialized = serializeToRDF(ontology, bindings);
        parseRDF(reserialized);
      } catch (e) {
        logger.error(`✘ ${rdfPath}: round-trip verification failed — ${(e as Error).message}`);
        errors++;
        continue;
      }

      // Style validation: check naming conventions and spelling
      const styleErrors = validateOntologyStyle(ontology);
      if (styleErrors.length > 0) {
        for (const styleError of styleErrors) {
          if (styleError.severity === 'error') {
            logger.error(`✘ ${rdfPath}: ${styleError.message} (in "${styleError.label}")`);
            errors++;
          } else {
            logger.warn(`⚠ ${rdfPath}: ${styleError.message} (in "${styleError.label}")`);
          }
        }
        if (styleErrors.some(e => e.severity === 'error')) {
          continue;
        }
      }

      seenIds.add(entryId);
      entries.push({
        id: entryId,
        name: metadata.name,
        description: metadata.description,
        icon: metadata.icon,
        category: metadata.category,
        tags: metadata.tags ?? [],
        author: metadata.author ?? 'unknown',
        source,
        ontology,
        bindings,
      });

      logger.log(`✔ ${source}/${slug}`);
    }
  }

  if (errors > 0) {
    throw new Error(`Catalogue compilation failed with ${errors} error(s)`);
  }

  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  for (const overlayPath of discoverLocalizationFiles(localizationDir)) {
    const relativePath = relative(localizationDir, overlayPath).replace(/\\/g, '/');
    if (relativePath === 'schema.json') continue;

    const entryId = relativePath.replace(/\.json$/, '');
    const entry = entriesById.get(entryId);
    if (!entry) {
      throw new Error(`${overlayPath}: unknown catalogue entry "${entryId}"`);
    }

    const overlay = parseCatalogueLocalization(
      readFileSync(overlayPath, 'utf-8'),
      entry,
      overlayPath,
    );
    entriesById.set(entryId, applyCatalogueLocalization(entry, overlay));
  }
  entries = entries.map((entry) => entriesById.get(entry.id)!);

  return {
    generatedAt: new Date().toISOString(),
    count: entries.length,
    entries,
  };
}

// ------------------------------------------------------------------
// Run
// ------------------------------------------------------------------

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outputPath = join(DEFAULT_ROOT, 'public', 'catalogue.json');
  try {
    const catalogue = compileCatalogue();
    writeFileSync(outputPath, JSON.stringify(catalogue, null, 2) + '\n', 'utf-8');
    console.log(`\n✔ Wrote ${catalogue.count} entries to ${outputPath}`);
  } catch (e) {
    console.error(`\n${(e as Error).message}`);
    process.exit(1);
  }
}
