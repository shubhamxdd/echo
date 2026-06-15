# RestDesk — Project Overview

## Overview

RestDesk is a lightweight, high-performance, and secure personal REST API client (desktop application) built with Tauri v2, React, TypeScript, and SQLite. It provides developer-friendly request building, nested collection management, and request history, entirely running locally on Windows. By leveraging Tauri's native host capabilities, it bypasses browser sandboxing (CORS restrictions) and provides a clean desktop-native experience.

## Goals

1. **Bypass CORS Restrictions**: Execute HTTP requests via Tauri's native backend client so that cross-origin requests succeed seamlessly.
2. **Local-First & Secure**: Store all user data (history, collections, auth credentials) locally in SQLite, avoiding external cloud reliance.
3. **High-Performance UI**: Render rich, interactive request elements and large, collapsible JSON responses instantly without lag.
4. **Developer-Centric UX**: Deliver premium developer aesthetics with a dark technical theme, micro-animations, and fast keyboard shortcuts.

## Core User Flow

1. **Launch**: User opens RestDesk on their desktop.
2. **Configure Request**: The user selects an HTTP method (GET, POST, PUT, DELETE, PATCH), enters a URL, and configures headers, query params, auth credentials, or request bodies.
3. **Execute**: The user clicks "Send" (or presses `Ctrl+Enter`).
4. **Inspect Response**: RestDesk executes the request and renders the response status, headers, execution time, size, and a pretty-printed collapsible JSON viewer.
5. **Save to Collections**: The user saves the configured request into a hierarchy of nested collections (folders) for future use.
6. **Browse History**: The user views and clicks past requests from the automatically populated history sidebar to reload them.

## Features

### Request Builder & Execution
- Multi-method support (GET, POST, PUT, DELETE, PATCH).
- Dynamic key-value editors for Headers and Query Parameters.
- Auth helpers (Bearer Token, Basic Auth, API Key) that automatically format request headers/params.
- Rich raw/JSON body editor.

### Sidebar Management
- **Nested Collections**: Hierarchical folder structure allowing users to organize saved requests recursively.
- **Request History**: Automatic logging of all sent requests with quick-reload, capped at the last 500 entries (auto-pruned).
- **Request Renaming**: Inline options to rename saved requests from the collections sidebar.

### Response Inspection
- Status bar displaying HTTP code, response time, and content size.
- Pretty-printed JSON viewer with collapsible nodes, filtering, and copy options.
- Full response headers viewer with individual header copy helpers.
- **Saved Response Cache**: Automatically persists and loads the last response context (status, duration, size, headers, body) for saved requests, indicated by a pulsing orange "Saved Output" badge.

### Environment variables
- Manage multiple environments with key-value variables that resolve dynamically using `{{variable_name}}` syntax in URL, parameters, headers, and body.

### Collection Portability
- Recursive export of collection folders, nested folders, requests, parameters, and headers into the standard Postman Collection v2.1.0 JSON format.

## Scope

### In Scope
- Tauri v2 single-window Windows desktop application.
- Vite + React + TypeScript + Tailwind CSS v4 frontend using the **Shadcn UI** components library.
- Local SQLite database managed via `tauri-plugin-sql`.
- Direct CORS-free HTTP requests using `@tauri-apps/plugin-http`.
- Hierarchical collections (nested folders).
- Auto-logged history up to 500 records.
- Environment variables management and dynamic placeholder resolution.
- Request renaming, duplication, and database-level cascading deletion.
- Saved HTTP response cache stored in the SQLite `requests` table.
- Exporter module converting hierarchical collection trees to Postman Collection v2.1.0 format.

### Out of Scope
- Multi-window workspace support.
- Cloud synchronization, team collaboration, or shared workspaces.
- Pre-request scripting or test assertion engines.

## Success Criteria

1. RestDesk successfully makes requests to external APIs (e.g. `https://httpbin.org`) without CORS blocks.
2. Users can create, rename, nest, and delete collections and save request configurations within them.
3. Every request sent is saved in the SQLite history database and visible in the history sidebar.
4. The history auto-prunes to the most recent 500 items to maintain database efficiency.
