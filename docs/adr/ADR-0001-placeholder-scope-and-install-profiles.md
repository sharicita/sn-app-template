# ADR-0001: Placeholder Scope and Local Install Profiles

| | |
|---|---|
| **Status** | Accepted (inherited from the starter template) |
| **Relates to** | [Install & Deployment](../install-and-deploy.md), [INSTALL.md](../../INSTALL.md) |

## Context
- The repository should be safe to make public, and anyone should be able to install it.
- The scope appears in many places: roles, properties, REST path, UI page, `keys.ts` and any UI action's `require` path.
- A real scope carries an instance's company code, and every installer needs a different one, because the SDK warns when the scope doesn't start with the instance's vendor prefix.

## Decision
1. **The committed source uses the placeholder scope `x_starter`** and a neutral `scopeId`. No instance name, company code, login or app sys_id is committed.
2. **Install profiles** (`<package name>.local.json`, git-ignored) hold each instance's login alias, scope and scope ID. Reusing an installed app's sys_id updates that app in place.
3. **Profile builds run in a copy** (`.deploy/<profile>/`, git-ignored). The placeholder is replaced there, and `now-sdk build` / `install` / `pack` run there with the root `node_modules` linked in. New keys are copied back to `keys.ts` with the placeholder restored.
4. **Guided setup** (`npm run setup`): a local, dependency-free web page that creates the SDK login (password piped to `--password-stdin`, never stored by the tools), proposes the scope from `glide.appcreator.company.code`, detects an existing install, and installs.
5. **IDE and Git route:** `tools/scope.mjs` and the *Prepare a branch with my scope* GitHub Action write a scope into a branch, for the ServiceNow IDE to build directly.

## Consequences
- ✅ The source contains no personal or company data; installs on several instances each keep their own scope.
- ⚠️ `npm run build` / `now-sdk install` from the root would install `x_starter` as a separate app. Use `npm run deploy` instead.
- ⚠️ With two or more profiles, commands that change an instance require `--profile`.
