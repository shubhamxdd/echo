# Progress Tracker

## Current Status

- **Status**: Implemented & Compiles Cleanly (Waiting for user instructions to run or build).
- **Phase**: Phase 1 & 2 — Working Core & Auth Helpers (Completed)

## Current Goal

- Launching the development server (`npm run tauri dev`) to verify execution, check the SQLite table persistence, and run sample REST API requests.

## Completed

- **Environment Verification**: Checked Node, VS Build Tools, and installed Rust stable globally.
- **Tauri App Scaffolding**: Setup Tauri v2 + React + Vite + TypeScript.
- **Tailwind CSS v4 Integration**: Integrated Tailwind v4 into Vite config and established global theme styling variables.
- **Tauri Plugins**: Added and configured `tauri-plugin-sql` (with SQLite) and `tauri-plugin-http`.
- **Database Logic**: Set up `db.ts` to initialize tables (`collections`, `requests`, `history`) with support for nested collections.
- **Request Executor Hook**: Implemented `useRequest.ts` using `@tauri-apps/plugin-http` to execute CORS-free requests, compile query parameters/headers, apply auth helpers, and measure durations.
- **Collections & History CRUD Hooks**: Created `useCollections.ts` and `useHistory.ts` to handle database CRUD operations, recursive collection structures, and history pruning to 500 records.
- **UI Components**:
  - `Sidebar` (recursive `CollectionTree` with hover CRUD triggers, and `HistoryList` grouped by date).
  - `RequestPanel` (`UrlBar` with method selector, `AuthEditor` supporting Bearer/Basic/API Key, `BodyEditor` with raw/JSON/form-data support, and tab layouts).
  - `ResponsePanel` (`StatusBar` for timings, `ResponseHeaders` with copy helpers, and `JsonViewer` using `react-json-view-lite` for JSON folding).
  - `common` (reusable `KeyValueEditor` and blur-backdrop `Modal` dialogs).
- **TypeScript Compliance**: Reran `tsc --noEmit` and resolved all type issues and unused imports. All builds compile 100% cleanly.

## In Progress

- Phase 3 & 4 (Built but ready for manual verification and running dev build).

## Next Up

- Run `npm run tauri dev` to launch the application.
- Verify making requests (e.g. GET/POST on `https://httpbin.org`).
- Verify creating nested collections and adding requests to them.
- Verify history log recording and deletion.

## Open Questions

- None.

## Architecture Decisions

- **Flat Object SQLite mappings**: Encapsulated parameters and headers as serialized JSON strings within the `requests` and `history` tables, and parsed them on loading. This keeps database schemas incredibly simple while maintaining complete request structure detail.
- **CSS-only JSON Viewer Customization**: Customized `react-json-view-lite` rendering styling using theme variables mapped to standard classes, eliminating TypeScript compiler errors while ensuring visual consistency.
