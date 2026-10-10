# Data Dictionary

Everything the app installs. `x_starter` stands for your scope. Update this page in the same commit as the Fluent change.

## 1. Tables

_None yet._ For each table: name, label, purpose, and a column list.

| Column | Type | Label | Notes (choice columns use `dropdown_without_none`) |
|---|---|---|---|

## 2. Properties

All are managed under **Configuration → Properties** and are readable and writable by app admins only. Server code reads them for everyone with `gs.getProperty`.

| Property | Type | Default | Read / write roles | Meaning |
|---|---|---|---|---|
| `x_starter.ui.instance_theme` | boolean | `false` | `x_starter.admin` / `x_starter.admin` | Follow each user's own ServiceNow theme (including dark appearance) instead of the app's fixed colours |
| `x_starter.search.limit` | integer | `20` | `x_starter.admin` / `x_starter.admin` | Example: the most records one search returns (1–100) |

## 3. Roles

| Role | Contains | Purpose |
|---|---|---|
| `x_starter.user` | — | Use the app |
| `x_starter.admin` | `x_starter.user` | Configure the app |

## 4. Application menu and modules

| Order | Module | Type | Opens | Roles |
|---|---|---|---|---|
| 100 | Home | Direct | `x_starter_app.do` | `x_starter.user` |
| 1000 | **Configuration** | Separator | — | `x_starter.admin`, `admin` |
| 1100 | Properties | Direct | `x_starter_app.do?view=settings` | `x_starter.admin`, `admin` |

## 5. Other metadata

| Type | Name | Source |
|---|---|---|
| UI page | `x_starter_app.do` | `src/fluent/ui-pages/app-page.now.ts` |
| Scripted REST API | Starter App (`/api/x_starter/app`) | `src/fluent/rest/api.now.ts` |
