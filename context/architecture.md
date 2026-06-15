# Architecture Context

## Stack

| Layer     | Technology                  | Role |
| --------- | --------------------------- | ---- |
| Framework | Tauri v2 + Vite + React     | Native desktop wrapper + Frontend runner |
| UI        | Tailwind CSS v4             | Utility-first responsive styling framework |
| Language  | TypeScript                  | Type safety across the React application |
| Database  | SQLite (`tauri-plugin-sql`) | Local data persistence for collections, history, and environments |
| HTTP      | `@tauri-apps/plugin-http`  | Rust-backed native fetch client (bypasses CORS) |

## System Boundaries

- `src/` — React frontend containing UI components, hooks, DB query interfaces, and utilities.
- `src/components/` — UI components divided into:
  - `Sidebar/` (Collections tree and History list).
  - `RequestPanel/` (URL bar, parameters, headers, body, and auth editors).
  - `ResponsePanel/` (Status bar, collapsible JSON viewer, response headers).
  - `common/` (Reusable key-value grids, modals, alerts).
  - `ui/` (Shadcn UI base components: tabs, button, input, dropdown-menu, dialog).
- `src/hooks/` — Custom hooks encapsulating business logic:
  - `useRequest.ts` (handles sending request via native HTTP and measuring execution duration).
  - `useCollections.ts` (handles CRUD for nested collections and saved requests).
  - `useHistory.ts` (handles logging requests and pruning to 500 entries).
  - `useEnvironments.ts` (handles CRUD for variables/environments).
- `src/lib/` — Shared libraries including `db.ts` (SQLite connection initialization, table migration, and raw query wrappers).
- `src-tauri/` — Rust Tauri configuration, backend plugins declaration (SQL, HTTP), permissions settings, and app bundling configurations.

## Storage Model

- **Local SQLite Database (`restdesk.db`)**: Managed via `tauri-plugin-sql` and stored automatically in the operating system's application data directory (`%APPDATA%/RestDesk/restdesk.db` on Windows).
  - **`collections`**: Stores folder metadata, including `parent_id` to allow recursive nesting.
  - **`requests`**: Stores saved request configurations (URL, method, headers, params, body, auth) and the cached response context (`response_status`, `response_status_text`, `response_duration_ms`, `response_headers`, `response_body`, `response_error`).
  - **`history`**: Stores sent request logs (method, URL, status, duration, request/response headers, request/response body, error).
  - **`environments`**: Stores environment metadata and serialized variables JSON.

## Auth and Access Model

- **Local-Only Access**: No user login is required; the database is created and accessed locally on the user's host machine.
- **Credential Storage**: Credentials (Bearer tokens, Basic Auth passwords, API Keys) are stored in plain text inside the local SQLite database. They are never sent to external servers other than the target API endpoints.

## Invariants

1. **Bypass Browser Fetch**: The app must never use the web browser's standard `fetch()` API for external requests to avoid CORS issues. It must always use the Tauri HTTP plugin (`@tauri-apps/plugin-http`).
2. **Database Isolation**: UI components must never construct raw SQL queries. All DB operations must occur within `src/lib/db.ts` or custom hooks.
3. **History Size Limit**: The history table must not exceed 500 entries. New additions must trigger a query to delete older entries exceeding this count.
4. **Data Integrity**: Deleting a parent collection must cascade delete all nested sub-collections and all associated saved requests.
