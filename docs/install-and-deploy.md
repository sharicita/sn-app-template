# Install and Deployment Reference

The step-by-step guide for end users is **[INSTALL.md](../INSTALL.md)** at the project root. This page explains how installation works, covers every scenario, and lists the rules for keeping the repository safe to publish.

## 1. Scenarios at a glance

| Scenario | Recommended route | Commands / screens |
|---|---|---|
| First install from GitHub, any skill level | Guided setup | `npm run setup` |
| First install, no local tools | ServiceNow IDE Git clone of a scoped branch | GitHub Action *Prepare a branch with my scope*, then IDE: clone, build, install |
| Classic admin hand-off | Update set XML | `npm run package`, then *Retrieved Update Sets → Import Update Set from XML* |
| Update an existing install | Same profile | `npm run deploy` |
| Several instances (PDI, dev, test) | One profile per instance | `npm run deploy -- --profile <name>` |
| Move between your own instances, no source | Publish to update set | App record → *Publish to Update Set* → export XML → import |
| Undo an install | Rollback context | Link printed by every install |

## 2. How the scope works

Every custom ServiceNow app has a **scope**, such as `x_12345_myapp`. It prefixes the app's tables, roles, properties, REST path and UI page. Normally the scope starts with the instance's company code (system property `glide.appcreator.company.code`); the SDK warns when it doesn't.

To keep the repository free of any one company's code:

- **The committed source uses the placeholder `x_starter` everywhere**, with a neutral `scopeId` (`now.config.json`).
- **An install profile** supplies the real values. Profiles live in `<package name>.local.json` (git-ignored):

  ```json
  {
      "default": "pdi",
      "profiles": {
          "pdi": {
              "instance": "https://<instance>.service-now.com",
              "alias": "pdi",
              "scope": "x_<company code>_<app code>",
              "scopeId": "<sys_id of the sys_app record>"
          }
      }
  }
  ```

  | Field | Meaning |
  |---|---|
  | `alias` | The SDK login (`now-sdk auth`) used to install. The credentials themselves stay in the OS credential store. |
  | `scope` | The app scope on that instance, at most 18 characters. |
  | `scopeId` | The `sys_app` sys_id. **Reuse the installed app's sys_id to update it in place.** A new random ID creates a separate app. |

- **`npm run deploy`** copies the project into `.deploy/<profile>/` (git-ignored), replaces `x_starter` with the profile's scope in the copy, and runs `now-sdk build` and `now-sdk install --auth <alias>` there. Before installing, it checks (read-only) that an app already on the instance with that scope has the profile's scope ID.
- New record keys the SDK adds to the copy's `keys.ts` are copied back to `src/fluent/generated/keys.ts`, with the placeholder restored. Commit that file.
- **`tools/scope.mjs <scope>`** rewrites a checkout in place. Use it only for a branch or fork that the ServiceNow IDE builds directly. The *Prepare a branch with my scope* GitHub Action runs it. Never commit the result to `main`.

> **In these docs**, `x_starter` means *your* scope. On an instance where the scope is `x_12345_myapp`, the role `x_starter.user` is `x_12345_myapp.user`.

## 3. Commands

| Command | What it does |
|---|---|
| `npm run setup` | Guided setup page (see §4) |
| `npm run deploy` | Build and install the profile, when only one exists. **With two or more profiles you must name one** (`--profile <name>`): the tools never guess which instance to change |
| `npm run deploy -- --profile test` | Same, for a named profile |
| `npm run deploy:build` | Profile build only (checks it compiles) |
| `npm run package` | Profile build plus `now-sdk pack`. The installable ZIP goes to `.deploy/<profile>/target/` |
| `npm run profile -- list` | Show profiles (`*` marks the default) |
| `npm run profile -- add <name> --alias <login> --scope <scope> [--scope-id <id>] [--instance <url>] [--default]` | Add or replace a profile |
| `npm run profile -- default <name>` | Change the default profile |
| `npm run build` | Build the neutral source (`x_starter`) for type checks only; **never install this from the project root on an instance that has a profile install** (it would create a second app) |
| `npm run dev` | Live UI dev server for the profile, in its own copy (`.deploy/<profile>.dev`) |
| `npm test` | Offline tests |

## 4. The guided setup

`npm run setup` starts `tools/setup/server.mjs`, a small web server that uses only Node's built-in modules, so it works before `npm ci`. It reads the app's name, description and placeholder scope from `now.config.json` and `package.json`.

| Step | What happens |
|---|---|
| 1 Get ready | Checks the Node.js version (20.18+) and whether the SDK is installed. It can run `npm ci`, which uses the exact lockfile versions. |
| 2 Connect | Lists saved SDK logins, or adds one with `now-sdk auth --add … --username … --password-stdin`. |
| 3 Scope | Reads `glide.appcreator.company.code` and existing installs of the app (`now-sdk query`). Offers *Update the existing install* (reusing its sys_id) or a new scope, checks the name is free, and saves the profile. |
| 4 Install | Runs the profile build and install, shows progress, and puts the full output under *Show technical details*. |
| 5 Next steps | Links to the app and the role list, and the docs. |

**Security design**

- Listens on `127.0.0.1` only, on a random port.
- Every API call needs a random one-time key, passed in the address fragment (`#…`), which browsers never send over the network, and then kept in session storage.
- The `Host` header must be `127.0.0.1:<port>` or `localhost:<port>` (blocks DNS rebinding). A strict Content Security Policy is applied, with no third-party scripts.
- Passwords go from the form straight to the SDK's stdin; the SDK stores them in the operating system's credential store. The setup never writes or logs them and masks them in error messages.
- The first profile becomes the default; later setups never replace an existing default.
- Only one job runs at a time. The server stops when you select *Close the setup*, or after an hour without activity.

## 5. ServiceNow IDE route

The ServiceNow IDE recognizes a Fluent app by `now.config.json` at the repository root, clones it from Git, and builds and installs it on the instance. Clone the `scope/<your scope>` branch created by the GitHub Action, or `main` to install as `x_starter`. Make changes in the repository, not in the instance editor, because `packageSourceCodeOnInstance` is `false`.

## 6. Update sets and packages

- `npm run package` produces the SDK's installable ZIP for your profile's scope: update set XML plus `package_inventory.csv`.
- **Public release (maintainers):** build the neutral source and pack it at the root (`npx now-sdk build && npx now-sdk pack`). Attach the ZIP to a GitHub release named for `package.json`'s `version`. This package installs as `x_starter`.

## 7. What carries over between instances

| Part of the app | Moves? |
|---|---|
| Tables, roles, ACLs, UI page, REST API, menu, properties (defaults) | Yes |
| Role assignments | No: assign `x_starter.user` / `.admin` again |
| Records the app stores | No: they are data, not app metadata |
| API keys and secrets | No: encrypted per instance and never exported |
| Changed property values | No: they return to the defaults |

## 8. Keeping the repository publishable

| Never commit | Where it lives instead |
|---|---|
| Instance URLs, logins, company code, real scope, app sys_id | `<package name>.local.json` (git-ignored) |
| Passwords, OAuth tokens | OS credential store, managed by `now-sdk auth` |
| API keys the app uses | Encrypted fields on the instance |
| Per-profile build copies | `.deploy/` (git-ignored) |

Before every push, search the tracked files for your own identifiers:

```bash
git grep -n -i -e "<your company code>" -e "<your instance name>" -e "<your email>"
```

**Git history:** these rules protect new commits only. If a real identifier was ever committed, publishing a clean history needs a fresh repository (`git init`, one commit) or a history rewrite (for example `git filter-repo`) and a force push.
