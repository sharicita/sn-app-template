# Developer Setup

## 1. Prerequisites

- Node.js 20.18+ and npm.
- A ServiceNow instance with admin rights (a Personal Developer Instance is fine).
- The ServiceNow SDK is installed locally from the lockfile (`@servicenow/sdk` 4.13.x). Read the SDK orientation docs for each new project (`npx now-sdk explain quickstart --list`) and each subcommand's `--help` before first use.

## 2. First run

```bash
npm ci
npm run setup        # guided: login, scope, profile, install
# or by hand:
npx now-sdk auth --add https://<instance>.service-now.com --type basic --alias mypdi
npm run profile -- add mypdi --alias mypdi --scope x_<company code>_<app code>
npm run deploy
```

- `npx now-sdk auth --list` shows saved logins (stored outside the project).
- `deploy` prints a **rollback link** for each installation.
- Then grant `x_starter.user` (and `x_starter.admin` to administrators), preferably through a group.

## 3. Project layout

| Path | What lives there |
|---|---|
| `now.config.json` | Scope (placeholder), scope ID, app name and description |
| `now.prebuild.mjs` / `now.dev.mjs` | Client build (Rollup) and dev watcher; the prebuild embeds `app.css` into `styles.generated.ts` |
| `src/fluent/` | Fluent metadata: roles (`security/`), menu (`navigation/`), REST API (`rest/`), UI page (`ui-pages/`), properties (`settings.now.ts`), generated record keys (`generated/keys.ts`) |
| `src/server/` | Server modules: REST handlers (`rest/`), settings module (`admin/`), shared helpers such as `rankedSearch` (`lib/`) |
| `src/client/` | React UI: `app.tsx` (shell and routing), `views/`, shared `components/`, `services/Api.ts`, `utils/`, `app.css` |
| `tools/` | Profiles, profile builds, dev server, guided setup, `scope.mjs`, `new-app.mjs` |
| `tests/offline/` | Offline test runner, Glide fakes and `*.test.js` files |
| `docs/` | This documentation set |

## 4. Everyday commands

| Task | Command |
|---|---|
| Build (type check + client bundle + metadata) | `npm run build` |
| Install on the instance | `npm run deploy` (one profile) or `npm run deploy -- --profile <name>` (required when several profiles exist) |
| Build with the profile scope only | `npm run deploy:build` |
| Live UI dev server against the instance | `npm run dev` (port 3000, or the first free port from 8081) |
| Installable package (update set ZIP) | `npm run package` |
| Offline tests | `npm test` |
| Look up instance data | `npx now-sdk query <table> -q "<encoded query>" -o json --auth <alias>` |
| SDK documentation | `npx now-sdk explain <topic> --format=raw` |

## 5. Conventions that matter

| Rule | Why |
|---|---|
| Server modules import each other with **explicit `.ts`** (`./search.ts`) | The platform module resolver can't find extensionless paths |
| Module code imports Glide APIs from `@servicenow/glide` and must not use `globalThis` | Module sandbox; the SDK linter rejects `globalThis` |
| REST handlers call `response.setBody(result)` (not `{ result }`) | The platform already wraps responses |
| Admin routes call `requireAdmin()` | Admin rules are enforced on the server (403), not only by hiding UI |
| Data returned to users comes from `GlideRecordSecure`; user text goes through `queryText()` or `addQuery(field, op, value)` | Results mirror the user's access; user text can't add query conditions |
| Edit **`src/client/app.css`**; never edit `styles.generated.ts` | The prebuild regenerates it; keep it committed because the type check runs before the prebuild ([ADR-0002](adr/ADR-0002-styles-in-js-bundle.md)) |
| Use the `app-` class prefix and `--app-` tokens; space sections with `--app-section-gap` and blocks with `--app-block-gap` | One design system and one spacing standard |
| Never hand-edit `src/fluent/generated/keys.ts`; commit it | It holds stable sys_ids for every record. Profile builds copy new keys back with the placeholder scope |
| Write the scope only as `x_starter` in source; never commit a real scope, instance name or company code | Profiles replace the placeholder at build time ([install-and-deploy §8](install-and-deploy.md#8-keeping-the-repository-publishable)) |
| Don't delete a `Table()` / `Record()` / API definition without deciding whether the deletion should reach installed instances | Removing Fluent code creates a delete record through `keys.ts` |
| Choice columns set `dropdown: 'dropdown_without_none'` | The default is free text |
| `.now.ts` text with apostrophes uses double quotes | The Fluent parser fails on unescaped apostrophes |
| Fluent `Record` data: pass role names as string arrays, not Role objects | The record plugin can't serialize Role objects in data fields |
| A string-script UI action's `require()` path contains scope and version: keep it in step with `package.json` | The path changes when the version does |
| On Windows, write multi-line edit scripts to a file rather than a shell heredoc | Apostrophes and backslashes break heredocs |

## 6. Adding things

| To add | Do this |
|---|---|
| A setting | Property in `src/fluent/settings.now.ts` (admin read/write roles) → name, default and validation in `src/server/admin/settings.ts` → field with an ⓘ in `SettingsView.tsx` → row in the data dictionary |
| A REST route | Handler in `src/server/rest/handlers.ts` (wrapped in `handle()`, `requireAdmin()` if admin) → route in `src/fluent/rest/api.now.ts` → method in `services/Api.ts` → API reference |
| A page | View in `src/client/views/`, name in `utils/nav.ts`, tab in `Header.tsx`, module in `menu.now.ts` |
| An admin page | Add it to `ConfigNav.tsx` and as a module under the Configuration separator |
| A list | `useSort` + `SortTh` + `ListBreadcrumb` + `GroupedRows` + `ListActions` (see `views/HomeView.tsx`) |
| A test | A `*.test.js` file in `tests/offline/`, and the module it needs in the `sources` list of `run.mjs` |

## 7. Testing

- **Offline:** `npm test` compiles the listed server modules to `.test-build/` and runs every `tests/offline/*.test.js`. `glide-fakes.js` replaces `@servicenow/glide` (GlideRecord with simple encoded-query matching, `gs.getProperty`, `gs.hasRole`).
- **On the instance:** verify each feature as a user with only `x_starter.user` (admin UI hidden **and** admin API 403) and as an admin. Check keyboard paths (Tab, Shift+Tab, Esc, arrows, Shift+F10).
- **REST:** call the API from the browser console on the UI page (the session supplies `g_ck`).

## 8. Dependency maintenance

| Check | Command | Expected |
|---|---|---|
| Shipped (runtime) code | `npm audit --omit=dev` | `found 0 vulnerabilities` |
| Origin and signatures | `npm audit signatures` | All verified |
| Reproducible install | `npm ci` | Uses `package-lock.json` exactly |

- **Upgrading the SDK:** `npm install --save-dev --save-exact @servicenow/sdk@<version>`, then build, test, deploy and smoke-test.
- **`overrides` in `package.json`** force patched versions of the SDK's inner build-tool dependencies. After each SDK upgrade, run `npm ls <package> --all` and remove an override once the SDK ships that version or newer itself.
- Never run `npm audit fix --force`: it can downgrade the SDK to an old major version.

## 9. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `ModuleResolutionException: No module with path …` | A server import without `.ts` |
| Styles don't change after deploy | Hard-refresh the page (Ctrl+Shift+R) |
| `Cannot find module './styles.generated'` | Run `npm run build` once, or restore the committed `styles.generated.ts` |
| 403 on `/admin/*` | The caller lacks `x_starter.admin` |
| "Unable to install application as application was null" | The profile's scope ID doesn't match the installed app; `npm run deploy` prints the fix |
