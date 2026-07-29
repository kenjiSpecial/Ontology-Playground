/**
 * Function schema types for RayfinClient.
 *
 * Maps each function name to its input/output type pair. Imported by the
 * frontend when constructing RayfinClient so invocations are type-checked.
 *
 * IMPORTANT: This file must NOT import any Node.js packages — it is resolved
 * by the frontend app's TypeScript compiler.
 */

/**
 * Ontology shape returned by `generateOntology`.
 *
 * Structurally compatible with `Ontology` in `src/data/ontology.ts`, but
 * declared independently so this file stays free of frontend imports.
 * The model is prompted for this schema but its output is not guaranteed —
 * the frontend applies default colours before use.
 */
export interface GeneratedOntology {
  name: string;
  description?: string;
  entityTypes: Array<{
    id: string;
    name: string;
    description: string;
    properties: Array<{
      name: string;
      type: string;
      isIdentifier?: boolean;
      values?: string[];
      unit?: string;
    }>;
    icon?: string;
    color?: string;
  }>;
  relationships: Array<{
    id: string;
    name: string;
    from: string;
    to: string;
    cardinality: string;
    description?: string;
  }>;
}

/**
 * Raw JSON body returned by GitHub's OAuth device-flow endpoints.
 *
 * Note that GitHub reports OAuth-level failures (`authorization_pending`,
 * `slow_down`, `expired_token`, …) in the body with a 200 status, so this is
 * a success payload as far as the function is concerned.
 */
export interface GitHubOAuthResponse {
  // /login/device/code
  device_code?: string;
  user_code?: string;
  verification_uri?: string;
  expires_in?: number;
  interval?: number;
  // /login/oauth/access_token
  access_token?: string;
  token_type?: string;
  scope?: string;
  // Error payloads
  error?: string;
  error_description?: string;
}

export type AppFunctionsSchema = {
  generateOntology: {
    input: { description: string };
    output: { ontology: GeneratedOntology };
  };
  githubOAuth: {
    input: { path: string; body: object };
    output: GitHubOAuthResponse;
  };
};
