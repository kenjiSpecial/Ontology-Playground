/**
 * Function schema types for RayfinClient.
 *
 * AUTO-GENERATED — do not edit manually.
 * Re-generated automatically when function source files change.
 *
 * If this file is not updating automatically, run:
 *   rayfin dev functions apply
 *
 * The schema is a closed object type: only the function names listed
 * below are accepted by RayfinClient.functions.<name>.invoke(...).
 * Adding, renaming, or changing the signature of a udf.func() call
 * regenerates this file and surfaces type errors at every consumer.
 *
 * IMPORTANT: This file must NOT import any Node.js packages — it is
 * resolved by the frontend app's TypeScript compiler.
 */

export type AppFunctionsSchema = {
  generateOntology: {
    input: { description: string };
    output: { ontology: { name: string; description?: undefined | string; entityTypes: { id: string; name: string; description: string; properties: { name: string; type: string; isIdentifier?: undefined | false | true; values?: undefined | string[]; unit?: undefined | string }[]; icon?: undefined | string; color?: undefined | string }[]; relationships: { id: string; name: string; from: string; to: string; cardinality: string; description?: undefined | string }[] } };
  };
  githubOAuth: {
    input: { path: string; body: object };
    output: { status: number; body: { device_code?: undefined | string; user_code?: undefined | string; verification_uri?: undefined | string; expires_in?: undefined | number; interval?: undefined | number; access_token?: undefined | string; token_type?: undefined | string; scope?: undefined | string; error?: undefined | string; error_description?: undefined | string } };
  };
};
