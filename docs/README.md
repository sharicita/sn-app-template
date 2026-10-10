# Starter App — Documentation

| | |
|---|---|
| **Application** | Starter App (`x_starter`, a placeholder for your scope), a ServiceNow scoped application built with Fluent / ServiceNow SDK 4.13.x |
| **Status** | _e.g. In development: not yet installed on an instance_ |
| **Version** | `0.0.1` (package.json) |
| **Date** | _YYYY-MM-DD_ |
| **Owner** | _name or team_ |

_One paragraph: what the app does, for whom, and the problem it solves._

## Documents

| # | Document | Covers |
|---|---|---|
| 01 | [Overview & Scope](architecture/01-overview-and-scope.md) | Purpose, users and roles, features, product boundary |
| 02 | [System Architecture](architecture/02-system-architecture.md) | Components, request flow, project layout, build pipeline, performance |
| 03 | [Core Engine](architecture/03-core-engine.md) | The app's main logic: inputs, rules, outputs, known limits |
| 04 | [Security Architecture](architecture/04-security-architecture.md) | Roles, ACLs, data exposure, secrets, threat model |
| 05 | [Integrations](architecture/05-integrations.md) | External systems, AI providers, MCP, outbound calls |
| 06 | [Risks, Assumptions & Decisions](architecture/06-risks-assumptions-decisions.md) | Decision log, verified vs unverified items, risks, open items |
| — | [Data Dictionary](data-dictionary.md) | Tables, columns, properties (with roles), roles, menu and modules |
| — | [API Reference](api-reference.md) | REST endpoints |
| — | [User Guide](user-guide.md) | How to use the app |
| — | [Install & Deployment](install-and-deploy.md) | Every install route, how scopes and profiles work, keeping the repo publishable. End-user steps: [INSTALL.md](../INSTALL.md) |
| — | [Developer Setup](dev-setup.md) | Prerequisites, commands, conventions, tests, troubleshooting |
| — | [New App Build Standards](new-app-build-standards.md) | The baseline checklist every app should meet |
| — | [Lessons Learned](lessons-learned.md) | What each build taught us (update it every build) |
| — | [Build Log](build-log.md) | What was built, fixed and verified in each iteration |
| — | [ADRs](adr/) | Architecture decision records ([template](adr/ADR-0000-template.md)) |

## Architecture decision records

| ADR | Title | Status |
|---|---|---|
| [ADR-0001](adr/ADR-0001-placeholder-scope-and-install-profiles.md) | Placeholder scope and local install profiles | Accepted |
| [ADR-0002](adr/ADR-0002-styles-in-js-bundle.md) | Ship styles inside the cache-busted JS bundle | Accepted |

## Change log

| Version | Date | Change |
|---|---|---|
| 0.0.1 | _YYYY-MM-DD_ | Created from the ServiceNow app starter template |
