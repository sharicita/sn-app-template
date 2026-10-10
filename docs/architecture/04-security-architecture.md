# 04 · Security Architecture

> Who can do what, what data the app exposes, and how it is protected. Keep this in step with the code.

## 1. Roles

| Role | Purpose | Contains |
|---|---|---|
| `x_starter.user` | Use the app | — |
| `x_starter.admin` | Configure the app (Properties and other Configuration pages) | `x_starter.user` |
| `admin` (platform) | Passes every role check | — |

## 2. Enforcement

- Every REST route checks `x_starter.user`; admin routes also check `x_starter.admin` and answer **403** otherwise (`src/server/rest/handlers.ts`). The UI hides admin pages too, but the server is the control.
- App properties are readable and writable by `x_starter.admin` only (`src/fluent/settings.now.ts`). Server code still reads them with `gs.getProperty`.
- The Configuration separator and its modules carry `x_starter.admin` and `admin`.

## 3. Data access

- Searches and lists that return data to users use `GlideRecordSecure`, so results mirror the signed-in user's own access; empty results are expected for low-privilege users.
- User text is never concatenated into encoded queries without `queryText()` (removes `^` and line breaks), or uses `addQuery(field, op, value)`.

## 4. Secrets

- Nothing secret is stored in the repository. SDK logins live in the OS credential store; install profiles are git-ignored.
- _If the app stores API keys: encrypted fields, admin-only, never returned to the browser, scrubbed from error messages (with tests)._

## 5. Destructive actions

_Admin-only, inline confirmation, logged (`gs.info` with the user name); archive offered as the safer alternative._

## 6. Threat model

| Threat | Mitigation |
|---|---|
| A non-admin calls an admin route directly | Server-side role check → 403 |
| Query injection through search text | `queryText()` / `addQuery` |
| Data leak beyond the user's access | `GlideRecordSecure` |
| _add app-specific threats_ | |
