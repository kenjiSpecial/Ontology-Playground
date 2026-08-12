import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface LocalizedCourseFiles {
  directory: string;
  files: readonly string[];
}

const CONTENT_ROOT = join(process.cwd(), 'content', 'learn');
const JAPANESE_TEXT = /[\u3040-\u30ff\u3400-\u9fff]/;

// Add a course entry here when its Markdown content has been localized.
const TRANSLATED_COURSES: readonly LocalizedCourseFiles[] = [
  {
    directory: 'ontology-fundamentals',
    files: [
      '_meta.md',
      '01-what-is-an-ontology.md',
      '02-understanding-rdf-and-owl.md',
      '03-fabric-iq-ontology-concepts.md',
      '04-building-your-first-ontology.md',
      '05-ontology-design-patterns.md',
      '06-contributing-to-the-catalogue.md',
    ],
  },
  {
    directory: 'cosmic-coffee-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-core-orders.md',
      '03-adding-stores.md',
      '04-complete-supply-chain.md',
    ],
  },
  {
    directory: 'ecommerce-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-core-marketplace.md',
      '03-shopping-carts.md',
      '04-complete-platform.md',
    ],
  },
  {
    directory: 'finance-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-customer-accounts.md',
      '03-transactions.md',
      '04-complete-banking.md',
    ],
  },
  {
    directory: 'healthcare-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-care-delivery.md',
      '03-diagnoses.md',
      '04-complete-care.md',
    ],
  },
  {
    directory: 'manufacturing-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-factory-floor.md',
      '03-production.md',
      '04-complete-factory.md',
    ],
  },
  {
    directory: 'university-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-academic-core.md',
      '03-faculty.md',
      '04-complete-university.md',
    ],
  },
  {
    directory: 'hr-system-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-organization-core.md',
      '03-assignments.md',
      '04-complete-model.md',
    ],
  },
  {
    directory: 'iq-lab-retail-supply-chain',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-core-commerce.md',
      '03-order-details-and-categories.md',
      '04-geography.md',
      '05-fulfillment-and-logistics.md',
      '06-inventory-and-demand.md',
      '07-complete-model.md',
    ],
  },
  {
    directory: 'zava-grove-to-shelf',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-orchard-foundation.md',
      '03-harvest-and-quality.md',
      '04-cold-chain-logistics.md',
      '05-retail-fulfillment.md',
      '06-complete-model.md',
    ],
  },
  {
    directory: 'supply-chain-disruption-path',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-core-entities.md',
      '03-risk-propagation-model.md',
      '04-mitigation-execution.md',
    ],
  },
  {
    directory: 'fibo-loans-lab',
    files: [
      '_meta.md',
      '01-scenario-overview.md',
      '02-core-loan-triad.md',
      '03-collateral-and-schedules.md',
      '04-servicing-and-payment-history.md',
      '05-risk-and-classifiers.md',
    ],
  },
];

function parseMarkdownFile(path: string): { frontmatter: Map<string, string>; body: string } {
  const content = readFileSync(path, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`${path} is missing a frontmatter block`);
  }

  const frontmatter = new Map<string, string>();
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator !== -1) {
      frontmatter.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
  }

  return { frontmatter, body: match[2] };
}

function quizLines(body: string, prefix: 'Q:' | '>'): string[] {
  const lines: string[] = [];
  for (const match of body.matchAll(/```quiz\n([\s\S]*?)```/g)) {
    lines.push(
      ...match[1]
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith(prefix)),
    );
  }
  return lines;
}

describe('Japanese learning content', () => {
  it('keeps every translated Markdown file metadata and prose in Japanese', () => {
    for (const course of TRANSLATED_COURSES) {
      for (const file of course.files) {
        const path = join(CONTENT_ROOT, course.directory, file);
        const { frontmatter } = parseMarkdownFile(path);

        expect(frontmatter.get('title'), `${course.directory}/${file} title`).toEqual(
          expect.stringMatching(JAPANESE_TEXT),
        );
        expect(frontmatter.get('description'), `${course.directory}/${file} description`).toEqual(
          expect.stringMatching(JAPANESE_TEXT),
        );
      }
    }
  });

  it('localizes all article headings and quiz questions and explanations', () => {
    for (const course of TRANSLATED_COURSES) {
      for (const file of course.files) {
        const path = join(CONTENT_ROOT, course.directory, file);
        const { body } = parseMarkdownFile(path);
        const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());

        for (const heading of headings) {
          expect(heading, `${course.directory}/${file} heading`).toEqual(
            expect.stringMatching(JAPANESE_TEXT),
          );
        }
        for (const question of quizLines(body, 'Q:')) {
          expect(question, `${course.directory}/${file} quiz question`).toEqual(
            expect.stringMatching(JAPANESE_TEXT),
          );
        }
        for (const explanation of quizLines(body, '>')) {
          expect(explanation, `${course.directory}/${file} quiz explanation`).toEqual(
            expect.stringMatching(JAPANESE_TEXT),
          );
        }
      }
    }
  });
});
