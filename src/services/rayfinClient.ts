/**
 * Optional Rayfin backend client.
 *
 * The app deploys to Azure Static Web Apps / GitHub Pages *and* to Rayfin
 * (Fabric Data App). Rayfin support is additive: when `VITE_RAYFIN_API_URL` is
 * set the app invokes Rayfin functions, otherwise it keeps calling the Azure
 * Functions endpoints under `/api`.
 *
 * Env vars (build-time):
 *   VITE_RAYFIN_API_URL         — Rayfin API base URL (enables the Rayfin path)
 *   VITE_RAYFIN_PUBLISHABLE_KEY — publishable key (`pk-…`), safe for the client
 *   VITE_RAYFIN_FUNCTIONS_URL   — optional; points at a local `func start` host
 *
 * These are generated into `.env.local` by `rayfin env --framework vite`.
 */

import { RayfinClient } from '@microsoft/rayfin-client';

import type { OntologyPlaygroundSchema } from '../../rayfin/data/schema';
import type { AppFunctionsSchema } from '../../rayfin/functions/src/types';

type AppRayfinClient = RayfinClient<OntologyPlaygroundSchema, AppFunctionsSchema>;

let client: AppRayfinClient | null = null;

function isLocalBackendUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/** True when a Rayfin backend is configured for this build. */
export function isRayfinConfigured(): boolean {
  return Boolean(import.meta.env.VITE_RAYFIN_API_URL);
}

/**
 * Lazily create the Rayfin client. Throws if Rayfin isn't configured — callers
 * should guard with `isRayfinConfigured()` first.
 */
export function getRayfinClient(): AppRayfinClient {
  if (client) return client;

  const apiUrl = import.meta.env.VITE_RAYFIN_API_URL;
  if (!apiUrl) {
    throw new Error(
      'Rayfin is not configured. Set VITE_RAYFIN_API_URL to enable the Rayfin backend.'
    );
  }

  const publishableKey = import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY;
  if (!publishableKey && !isLocalBackendUrl(apiUrl)) {
    throw new Error('VITE_RAYFIN_PUBLISHABLE_KEY is required for a deployed Rayfin backend.');
  }

  client = new RayfinClient<OntologyPlaygroundSchema, AppFunctionsSchema>({
    baseUrl: apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`,
    publishableKey: publishableKey ?? 'local-dev-key',
    useProxy: false,
    authStorage: true,
    functionsBaseUrl: import.meta.env.VITE_RAYFIN_FUNCTIONS_URL,
  });

  return client;
}
