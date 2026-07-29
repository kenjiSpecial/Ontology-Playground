import { UserDataFunctions } from '@microsoft/fabric-user-data-functions';
import type { RayfinContext } from '@microsoft/fabric-user-data-functions';

import type { GeneratedOntology, GitHubOAuthResponse } from './types.js';

const udf = new UserDataFunctions();

// ─── generateOntology ───────────────────────────────────────────────────────

/**
 * Rayfin port of `api/generate-ontology`. The prompt and request shape are kept
 * identical to the Azure Functions version so both backends behave the same.
 */
const SYSTEM_PROMPT = `You are an expert ontology extraction system. Given a business scenario description, extract entities, relationships, and properties to create a complete ontology.

Output ONLY valid JSON matching this exact schema:
{
  "name": "string - Name for this ontology",
  "entityTypes": [
    {
      "id": "string - lowercase, snake_case identifier",
      "name": "string - Display name",
      "description": "string - Brief description",
      "properties": [
        {
          "name": "string - camelCase property name",
          "type": "string|integer|decimal|boolean|date|datetime|enum",
          "isIdentifier": boolean (true for primary key),
          "values": ["array of enum values if type is enum"],
          "unit": "string - optional unit like USD, kg, etc."
        }
      ],
      "icon": "string - single emoji representing this entity",
      "color": "string - hex color code like #0078D4, #107C10, #5C2D91, #FFB900, #D83B01, #00A9E0"
    }
  ],
  "relationships": [
    {
      "id": "string - lowercase identifier like entity1_verb_entity2",
      "name": "string - verb describing the relationship",
      "from": "string - id of source entity",
      "to": "string - id of target entity",
      "cardinality": "one-to-one|one-to-many|many-to-one|many-to-many",
      "description": "string - optional description"
    }
  ]
}

Rules:
1. Extract nouns as entities, verbs as relationships
2. Each entity MUST have at least one property with isIdentifier: true
3. Include 3-6 meaningful properties per entity
4. Use appropriate cardinality based on business logic
5. Generate descriptive relationship names (verbs like "places", "contains", "manages")
6. Use relevant emojis for icons
7. Assign unique hex colors to each entity (use Microsoft palette: #0078D4, #107C10, #5C2D91, #FFB900, #D83B01, #00A9E0, #8764B8, #00B294)
8. Output ONLY the JSON, no explanations`;

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

udf.func(
  'generateOntology',
  async (
    ctx: RayfinContext,
    description: string
  ): Promise<{ ontology: GeneratedOntology }> => {
    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new Error("Missing 'description' parameter.");
    }

    // Secrets live in `rayfin/.env` as RAYFIN_SECRET_* and are pushed with
    // `rayfin up secrets apply`. For local debugging use local.settings.json.
    const endpoint = ctx.getSecret('AZURE_OPENAI_ENDPOINT');
    const apiKey = ctx.getSecret('AZURE_OPENAI_API_KEY');
    const deployment = ctx.getSecret('AZURE_OPENAI_DEPLOYMENT') || 'gpt-4o-mini';

    if (!endpoint || !apiKey) {
      throw new Error(
        'Azure OpenAI not configured. Set the AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY secrets ' +
          '(RAYFIN_SECRET_AZURE_OPENAI_ENDPOINT / RAYFIN_SECRET_AZURE_OPENAI_API_KEY in rayfin/.env, ' +
          'then run `rayfin up secrets apply`).'
      );
    }

    const baseUrl = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
    const response = await fetch(
      `${baseUrl}openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: description },
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[generateOntology] Azure OpenAI error: ${errorText}`);
      throw new Error('Failed to generate ontology from Azure OpenAI');
    }

    const data = (await response.json()) as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Azure OpenAI response');
    }

    let ontology: GeneratedOntology;
    try {
      ontology = JSON.parse(content) as GeneratedOntology;
    } catch {
      throw new Error('Azure OpenAI returned malformed JSON');
    }

    if (
      !ontology.name ||
      !Array.isArray(ontology.entityTypes) ||
      !Array.isArray(ontology.relationships)
    ) {
      throw new Error('Invalid ontology structure returned');
    }

    return { ontology };
  }
);

// ─── githubOAuth ────────────────────────────────────────────────────────────

/**
 * Rayfin port of `api/github-oauth-proxy`.
 *
 * GitHub's device-flow endpoints don't send CORS headers, so the browser can't
 * call them directly. Only the two device-flow paths are proxied.
 *
 * The Azure Functions version took the path from the `{*path}` route segment;
 * Rayfin functions are RPC-style, so it becomes an explicit parameter.
 *
 * Note: GitHub signals OAuth-level failures (`authorization_pending`,
 * `slow_down`, …) inside a 200 response body. Those are returned to the caller
 * as data — `pollForToken()` drives its polling loop from them — so only a
 * disallowed path or a transport failure throws.
 */
const ALLOWED_PATHS = new Set(['login/device/code', 'login/oauth/access_token']);

udf.func(
  'githubOAuth',
  async (path: string, body: object): Promise<GitHubOAuthResponse> => {
    if (!ALLOWED_PATHS.has(path)) {
      throw new Error(`Unsupported GitHub OAuth path: ${path}`);
    }

    let upstream: Response;
    try {
      upstream = await fetch(`https://github.com/${path}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body ?? {}),
      });
    } catch {
      throw new Error('Proxy request to GitHub failed');
    }

    const text = await upstream.text();

    try {
      return JSON.parse(text) as GitHubOAuthResponse;
    } catch {
      throw new Error(
        `GitHub returned a non-JSON response (HTTP ${upstream.status})`
      );
    }
  }
);
