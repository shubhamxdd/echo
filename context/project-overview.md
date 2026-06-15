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

### Response Inspection
- Status bar displaying HTTP code, response time, and content size.
- Pretty-printed JSON viewer with collapsible nodes.
- Full response headers viewer.

## Scope

### In Scope
- Tauri v2 single-window Windows desktop application.
- Vite + React + TypeScript + Tailwind CSS v4 frontend.
- Local SQLite database managed via `tauri-plugin-sql`.
- Direct CORS-free HTTP requests using `@tauri-apps/plugin-http`.
- Hierarchical collections (nested folders).
- Auto-logged history up to 500 records.

### Out of Scope
- Multi-window workspace support.
- Cloud synchronization, team collaboration, or shared workspaces.
- Pre-request scripting or test assertion engines.
- Environment variables management (out of scope for Phase 1-4).

## Success Criteria

1. RestDesk successfully makes requests to external APIs (e.g. `https://httpbin.org`) without CORS blocks.
2. Users can create, rename, nest, and delete collections and save request configurations within them.
3. Every request sent is saved in the SQLite history database and visible in the history sidebar.
4. The history auto-prunes to the most recent 500 items to maintain database efficiency.
