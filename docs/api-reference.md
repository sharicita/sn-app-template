# API Reference

Scripted REST API **Starter App**, base path `/api/x_starter/app`. Requests and responses are JSON; the platform wraps every response body in `{ "result": … }`. Errors are `{ "result": { "error": { "message": "…" } } }` with status 400, 403 or 404.

Every route requires `x_starter.user`. Routes marked **admin** also require `x_starter.admin` and return **403** otherwise. From the UI page, send the session token as the `X-UserToken` header (`window.g_ck`).

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/me` | user | The signed-in user's capabilities |
| GET | `/search?q=` | user | Example ranked search of active groups the user can read |
| GET | `/admin/settings` | **admin** | Current settings |
| PUT | `/admin/settings` | **admin** | Save settings |

## GET /me

```json
{ "user": "abel.tuter", "is_admin": false, "instance_theme": false, "theme": { "name": "Instance default", "appearance": "default" } }
```

## GET /search

Query parameter `q` (optional). Ranked: name starts with `q`, then description starts with `q`, then either contains it. At most `x_starter.search.limit` results, only groups the user can read (`GlideRecordSecure`). `^` and line breaks in `q` are replaced with spaces.

```json
[{ "sys_id": "…", "name": "Service Desk", "description": "…", "email": "…" }]
```

## GET / PUT /admin/settings

```json
{ "instance_theme": false, "search_limit": 20 }
```

PUT accepts any subset of the fields and returns the saved settings. `search_limit` must be 1–100.
