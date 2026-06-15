# Code Standards

## General Principles

- **Modular Design**: Separate database queries, HTTP network request processing, and UI component render logic.
- **Fail Gracefully**: Wrap all SQLite operations and network requests in robust `try/catch` statements and surface clean, readable errors in the UI.
- **No Side-Effects in Render**: Keep components pure. Side-effects should be isolated in hooks or handlers.

## TypeScript

- **Strict Mode**: Enforce strict type checking across the project.
- **No `any`**: Avoid the `any` type completely. Use interfaces, explicit union types, or `unknown` with runtime assertion/type guards.
- **Type Definitions**: Place all types in `src/types/index.ts` to prevent duplication.

## React & Styling

- **Tailwind CSS v4 Utility Classes**: Style elements using Tailwind utility classes. Use CSS custom properties in global styles or Tailwind config for theme values.
- **Shadcn UI Base Components**: Build custom UI using Shadcn's primitives (e.g. Button, Input, Tabs, Dialog, DropdownMenu). Avoid styling custom buttons/inputs manually.
- **Focus Rings**: Rely on Shadcn's focus ring utility classes (`focus-visible:ring-1 focus-visible:ring-ring`) instead of custom focus-visible borders.
- **Component Splitting**: Keep files under 200 lines where possible. Break down components (e.g., `UrlBar`, `AuthEditor`) into their own files.
- **State Locality**: Keep state as close to where it's used as possible. Lift state to `App.tsx` only if multiple panels need access (e.g., current request configuration, active response).

## HTTP Requests

- **CORS Bypass**: Never use browser-level `fetch`. Always use `fetch` from `@tauri-apps/plugin-http`.
- **Request Serialization**: Correctly serialize headers (key-value list), query params (appended to URL), and bodies (JSON, raw text, or form-data) before handing off to the native HTTP client.
- **Duration Tracking**: Wrap the request in high-resolution timing (`performance.now()`) to report response duration.

## Database & SQLite

- **Initialization Invariant**: Database tables (`collections`, `requests`, `history`) must be created on application launch.
- **Prepared Statements / SQL Bindings**: Always pass parameterized inputs to queries to prevent SQL injection (e.g., `db.execute("INSERT INTO... VALUES (?, ?)", [val1, val2])`).
- **Cascade Deletes**: Let the database handle cascades (e.g., deleting a parent collection must cascade delete its children and requests via `ON DELETE CASCADE`).

## File Organization

- `src/components/` — Small, presentation-focused components.
- `src/components/ui/` — Base primitive UI elements managed via Shadcn CLI.
- `src/hooks/` — Custom React hooks containing logic (e.g., SQL queries, HTTP execution).
- `src/lib/db.ts` — Connection instantiation, migrations, and core SQL initialization.
- `src/types/index.ts` — Shared TypeScript type interfaces.
