# ADR-0002: Ship Styles Inside the Cache-Busted JS Bundle

| | |
|---|---|
| **Status** | Accepted (inherited from the starter template) |
| **Relates to** | [02 · System Architecture](../architecture/02-system-architecture.md), [Developer Setup](../dev-setup.md) |

## Context
The SDK's client build can publish `app.css` as a separate asset. In the reference implementation the instance kept serving the **previous** stylesheet after each deploy, even though the asset had the new content. The JS bundle is loaded with a cache-busting parameter (`uxpcb`) and always updates.

## Decision
- `now.prebuild.mjs` copies `src/client/app.css` into `src/client/styles.generated.ts` (`export const APP_CSS`).
- `main.tsx` injects it as a `<style>` element. No CSS file is imported.
- `styles.generated.ts` stays committed, because the SDK type check runs before the prebuild. The dev server (`npm run dev`) regenerates it when `app.css` changes.

## Consequences
- ✅ Style changes appear on the next deploy with no cache flush.
- ⚠️ Developers edit `app.css` only; the generated file is overwritten on every build.
- ⚠️ The bundle grows by the size of the stylesheet (uncompressed).
