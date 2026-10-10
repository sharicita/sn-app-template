# Security policy

Security reports for Starter App are welcome and taken seriously.

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Use GitHub's private reporting instead: **Security → Report a vulnerability** on this repository.

Include what you found, how to reproduce it, and the impact you expect. You'll get an acknowledgement as soon as possible.

## Scope and design

- Two roles: `x_starter.user` uses the app, `x_starter.admin` configures it. Platform `admin` passes every check.
- Admin rules are enforced on the server: admin REST routes answer **403** to everyone else, not only by hiding the UI.
- Searches and lists that return data to users use `GlideRecordSecure`, so results mirror the signed-in user's own access.
- User text is never concatenated into encoded queries without removing `^` and line breaks (`queryText()`).
- App configuration (properties) is readable and writable by app admins only.

Details: [docs/architecture/04-security-architecture.md](docs/architecture/04-security-architecture.md).

## Never commit secrets

Instance URLs, logins, company codes and keys belong in the git-ignored `<package name>.local.json` or the operating system's credential store (`now-sdk auth`), never in this repository. API keys the app needs at runtime belong in encrypted fields on the instance. See [docs/install-and-deploy.md §8](docs/install-and-deploy.md#8-keeping-the-repository-publishable).
