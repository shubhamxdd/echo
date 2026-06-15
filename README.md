# Echo — Personal API Client

Echo is a lightweight, local-first REST API client built with Tauri v2, React, TypeScript, Tailwind CSS v4, and SQLite. It provides a clean, native developer experience with CORS-free network requests, recursive collection hierarchies, and persistent request history.

---

## Tech Stack
* **Framework**: Tauri v2
* **Frontend**: React + TypeScript + Vite
* **Styling**: Tailwind CSS v4
* **Database**: Local SQLite (via `tauri-plugin-sql`)
* **HTTP Client**: Tauri Native Client (via `@tauri-apps/plugin-http`)

---

## Prerequisites

Ensure you have the following installed on your system:

1. **Node.js**: Version 20 or higher.
2. **Rust & Cargo**: Standard toolchain.
3. **C++ Build Tools**: 
   * On Windows, install **Visual Studio Build Tools 2022** with the "Desktop development with C++" workload.

---

## Getting Started (Development Mode)

Follow these steps to run the application in your local development environment:

### 1. Install Dependencies
Install the required Node.js packages:
```bash
npm install
```

### 2. Run the Desktop Application
Launch the Tauri dev environment. This command starts the frontend dev server and compiles the Rust backend binary:
```bash
npm run tauri dev
```
> **Note**: The first compilation will download and build all backend dependencies. This can take **2 to 5 minutes** depending on your hardware. Subsequent runs will start up in a few seconds.

---

## Production Build

To compile a production-ready, optimized standalone binary (portable `.exe` and `.msi` installer on Windows):

```bash
npm run tauri build
```

The output executables will be generated at:
`src-tauri/target/release/bundle/`

---

## Key Configurations

### 1. Local Database
Echo stores collections, saved requests, and request history locally in a SQLite database.
* **Database Path**: `%APPDATA%\Echo\echo.db` (on Windows).
* Deleting a collection cascades and automatically removes all child collections and saved requests.

### 2. Network Requests & CORS
The application utilizes Tauri's native HTTP client to execute requests. This operates outside of the browser sandbox, allowing you to hit endpoints without facing CORS issues.
* **Allowed Scopes**: Configured in `src-tauri/capabilities/default.json` to allow all `http://**` and `https://**` traffic, including localhost.

---

## Keyboard Shortcuts
Echo supports fast keyboard shortcuts to speed up your testing workflows:
* **`Ctrl + Enter`**: Execute the current HTTP request (Send).
* **`Ctrl + S`**: Save the current request configurations to a collection folder.
* **`Ctrl + N`**: Clear the workspace and reset to a new, empty request.
