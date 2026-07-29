/**
 * Domain types for the Rayfin functions.
 *
 * Kept separate from `types.ts`, which is auto-generated from the `udf.func()`
 * registrations and overwritten by `rayfin dev functions apply`.
 */

/**
 * Ontology shape returned by `generateOntology`.
 *
 * Structurally compatible with `Ontology` in `src/data/ontology.ts`, but
 * declared independently so the functions stay free of frontend imports.
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
 * Raw JSON body returned by GitHub's OAuth device-flow endpoints, paired with
 * the upstream HTTP status so the caller can reproduce the same error handling
 * it would apply to a direct `fetch`.
 *
 * GitHub reports OAuth protocol states (`authorization_pending`, `slow_down`,
 * …) in the body of a 200 response, so a non-2xx `status` means a genuine
 * transport-level failure.
 */
export interface GitHubOAuthResult {
  status: number;
  body: {
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
    // Protocol-level errors
    error?: string;
    error_description?: string;
  };
}
