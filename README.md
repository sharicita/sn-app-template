# ServiceNow App Starter

**A starter template for ServiceNow scoped apps built with the ServiceNow SDK (Fluent, 4.13.x) and React 19.**

It gives every new app the same baseline from the first commit: a public-safe repository (placeholder scope, git-ignored install profiles), a guided installer, an admin-only Configuration section, ServiceNow-style list views, field help as tooltips, accessibility, offline tests and a full documentation skeleton. It implements the checklist in [docs/new-app-build-standards.md](docs/new-app-build-standards.md). [ACL Lens](https://github.com/sharicita/sn-acl-lens) is the reference implementation it was generalized from.

## What's in the box

| Area | Included |
|---|---|
| **Project** | `now.config.json`, npm scripts (`setup`, `deploy`, `deploy:build`, `package`, `profile`, `dev`, `test`, `build`, `new-app`), a prebuild that embeds `app.css` in the JS bundle, MIT license, `SECURITY.md`, `INSTALL.md` |
| **Tools** | Install profiles (`<package>.local.json`, git-ignored), profile builds in `.deploy/<profile>/` with the scope rewritten and new `keys.ts` entries copied back, a profile-based dev server, a guided setup page (`npm run setup`), `tools/scope.mjs` and a GitHub Action that prepares a branch with a user's scope |
| **Fluent** | `x_starter.user` and `x_starter.admin` roles; an application menu with a main module and an admin-only **Configuration** separator (Properties first); two admin-only properties; a scripted REST API with a `/me` route, an example ranked search and admin routes that return 403 to non-admins; a React UI page |
| **Client** | App shell and header (app name links home, tab icons, hover buttons, deep links), Properties page with the Configuration bar and the "follow each user's ServiceNow theme" option, and shared components: `Icon`, `FieldInfo`, `HelpTip`, `DocLink`, `RecordLink`, `Tip`, `TooltipLayer`, `SearchCombo`, `SortTh` / `useSort` (sort, column menu, group by, breadcrumb, right-click *Show matching* / *Filter out*, personalize columns), `ListActions` (Open list / Copy query / Export), design tokens in `app.css` |
| **Server** | `rankedSearch` with the `queryText` sanitizer, the settings module pattern, a REST handler wrapper with role checks |
| **Docs** | Index, architecture 01–06, data dictionary, API reference, user guide, install and deploy, developer setup, build log, ADR template and two ADRs, lessons learned, and the build standards |
| **Tests** | An offline runner with Glide fakes and a sample test |

## How to start a new app from this template

1. **Copy the template** into a new folder (download the ZIP, or `git clone` and then delete the `.git` folder so your app starts with its own history).
2. **Install dependencies:**

   ```bash
   npm ci
   ```

3. **Rename the placeholder scope and app.** Pick a placeholder scope for the source: `x_` plus a short app code, with **no company code** (each install profile adds the real one). At most 18 characters.

   ```bash
   npm run new-app -- --scope x_myapp --name "My App" --description "One line about what it does."
   ```

   This replaces `x_starter`, "Starter App" and the description everywhere (source, tests, docs), sets a new scope ID in `now.config.json`, renames the package, and removes the template's generated record keys so your app's first build creates its own. (`node tools/scope.mjs` changes only the scope, if that's all you need.)

4. **Check it builds,** then commit the first version (including the new `src/fluent/generated/keys.ts`):

   ```bash
   npm test
   npx now-sdk build
   ```

5. **Install it on your instance** with the guided setup. It signs in, works out your real scope from the instance's company code, saves a git-ignored profile and installs:

   ```bash
   npm run setup
   ```

6. **Make it yours:** rewrite this README, replace `src/client/views/HomeView.tsx` (an example list of groups) with your first page, replace the example property and search route, and fill in the `docs/` templates as you build. Work through [§1–§4 of the build standards](docs/new-app-build-standards.md) before writing features.

> [!IMPORTANT]
> Never commit a real scope, instance name, company code, email or installed app sys_id. They belong in `<package>.local.json` (git-ignored). Before every push, check with `git grep -n -i -e "<company code>" -e "<instance name>"`.

## Development

```bash
npm ci
npm test              # offline tests
npm run deploy:build  # build with your install profile
npm run deploy        # build and install with your install profile
npm run dev           # live UI dev server against the instance (profile scope)
```

The source uses the placeholder scope `x_starter`. Your real scope and instance stay in the git-ignored `servicenow-app-starter.local.json` ([how it works](docs/install-and-deploy.md#2-how-the-scope-works)). Full commands and conventions: [docs/dev-setup.md](docs/dev-setup.md). Installing: [INSTALL.md](INSTALL.md).

## License

[MIT](LICENSE) © 2026 sharicita. Security reports: see [SECURITY.md](SECURITY.md).
