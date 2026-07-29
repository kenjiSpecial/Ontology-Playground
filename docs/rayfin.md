# Deploying on Rayfin (Microsoft Fabric)

The Playground can be deployed as a [Rayfin](https://github.com/microsoft/project-rayfin) app
(a Fabric Data App) in addition to Azure Static Web Apps and GitHub Pages.

Rayfin support is **purely additive** — `api/`, `staticwebapp.config.json` and the existing SWA /
GitHub Pages workflows are untouched and keep working exactly as before.

## How the two backends coexist

The frontend picks its backend at runtime:

| Condition | Backend used |
| --- | --- |
| `VITE_RAYFIN_API_URL` is set | Rayfin functions, via `client.functions.<name>.invoke(...)` |
| otherwise (default) | Existing Azure Functions endpoints under `/api` |

The switch lives in `src/services/rayfinClient.ts` (`isRayfinConfigured()`), and there are only two
call sites: `src/components/NLBuilderModal.tsx` and `src/lib/github.ts`.

Because `VITE_RAYFIN_API_URL` is unset in a normal checkout, `npm run dev`, `npm run build`, the test
suite and the SWA/Pages deployments all keep using the `/api` path.

### Functions are RPC-style, not HTTP routes

Azure Functions in `api/` are HTTP-triggered and use route templates. Rayfin functions are **RPC**:
they are declared with `udf.func(name, handler)` and invoked by name. `api/` and `rayfin/functions/`
are therefore two implementations of the same behaviour — **if you change one, change the other.**

| `api/` (Azure Functions) | `rayfin/functions/` (Rayfin) |
| --- | --- |
| `POST /api/generate-ontology` | `generateOntology(description)` |
| `POST /api/github-oauth/{*path}` | `githubOAuth(path, body)` |

The proxy's `{*path}` wildcard segment becomes an explicit `path` parameter, guarded by the same
two-entry allowlist (`login/device/code`, `login/oauth/access_token`).

`rayfin/functions/src/types.ts` is **auto-generated** from the `udf.func()` registrations — it is
rewritten by `rayfin dev functions apply`, so hand-written types belong in `models.ts` instead.

## Prerequisites

- Node.js 20+
- .NET 6 SDK — only needed to debug functions locally
- Azure Functions Core Tools v4 (`npm install -g azure-functions-core-tools@4`) — same

## Configure secrets

The `generateOntology` function reads its Azure OpenAI configuration through `ctx.getSecret(...)`.
Secrets are stored encrypted on the deployed workload, so the item has to exist first:

```bash
npx rayfin up                                  # deploy once to create the endpoint
npx rayfin secret set AZURE_OPENAI_ENDPOINT    # prompts for the value (masked)
npx rayfin secret set AZURE_OPENAI_API_KEY
npx rayfin secret set AZURE_OPENAI_DEPLOYMENT
npx rayfin secret list                         # names and timestamps only
```

The name passed to `rayfin secret set` is exactly the name read by `ctx.getSecret(...)` in
`rayfin/functions/src/function_app.ts`.

`AZURE_OPENAI_DEPLOYMENT` is optional and defaults to `gpt-4o-mini`.

For local function debugging, copy `rayfin/functions/local.settings.json.template` to
`local.settings.json` and put the same values under `Values` instead.

## Deploy

```bash
npx rayfin login     # sign in with Entra ID
npx rayfin up        # build + deploy static content and functions
npx rayfin up status # verify endpoint health
```

`rayfin up` runs the build commands declared in `rayfin/rayfin.yml`:

- static hosting → `npm run build:rayfin` at the repo root, output in `build/`
- functions → `npm install && npm run build` inside `rayfin/functions`

### Why `build:rayfin` rather than `build`

`vite.config.ts` derives a GitHub Pages base path (`/Ontology-Playground/`) whenever
`GITHUB_ACTIONS=true`. Rayfin serves the app from the root of its hosting URL, so `build:rayfin`
forces `VITE_BASE_PATH=/`. Without it, a `rayfin up` executed from a GitHub Actions runner would emit
asset URLs that 404.

### Feature flags

Both optional features are compiled in at build time, so set them for the deployment or the UI never
renders:

| Variable | Needed for |
| --- | --- |
| `VITE_ENABLE_AI_BUILDER=true` | The natural-language ontology builder (`generateOntology`) |
| `VITE_GITHUB_CLIENT_ID=<id>` | GitHub device-flow publishing (`githubOAuth`) |

## Local development

```bash
npm run dev          # plain Vite — uses the /api backend, no Rayfin needed
npm run dev:rayfin   # starts Rayfin services, then Vite
```

`dev:rayfin` runs `rayfin env --framework vite` first, which regenerates `.env.local` from
`rayfin/.env`. To debug the functions themselves, run `npx rayfin dev functions apply` (needs the
.NET SDK and Core Tools listed above).

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_RAYFIN_API_URL` | Rayfin API base URL. **Setting this enables the Rayfin backend.** |
| `VITE_RAYFIN_PUBLISHABLE_KEY` | Publishable key (`pk-…`). Safe to expose client-side. |
| `VITE_RAYFIN_FUNCTIONS_URL` | Optional. Points at a local `func start` host for debugging. |

These are generated into `.env.local` by `rayfin env --framework vite` — don't edit that file by hand.

## Known gaps

- **Anonymous invocation is unverified.** The app has no sign-in step, so functions are invoked with
  only the publishable key and no `Authorization` header. Whether the Fabric runtime accepts that has
  not been confirmed against a live deployment. If invocations come back `401`, the fix is to add
  Fabric SSO (`@microsoft/rayfin-auth-provider-fabric`) and gate *only* these two features behind it,
  not the whole app — everything else in the Playground works offline and must stay anonymous.
- **If anonymous invocation does work, `generateOntology` is publicly callable.** The publishable key
  ships in the bundle, so anyone can drive the metered Azure OpenAI deployment. The function caps the
  prompt at 4000 characters, but there is no rate limiting — put a quota on the Azure OpenAI
  deployment before treating this as production-ready.
- `VITE_GITHUB_OAUTH_BASE` takes precedence over the Rayfin function on both backends. Set it if
  you'd rather route the device flow through an external worker.
- **The GitHub publishing UI is currently dormant upstream.** `src/lib/github.ts` is covered by tests
  but isn't imported by any component yet, on `main` or here, so the device flow (and therefore the
  `githubOAuth` function) is not reachable from the UI. The port keeps both backends at parity so the
  feature works on Rayfin as soon as the UI is wired up.
- No data entities are defined (`rayfin/data/schema.ts` is intentionally empty) — the Playground keeps
  its state client-side, so the `data` service is disabled in `rayfin.yml`.
