# Echo — Personal API Client

Echo is a lightweight, local-first API client built with **Tauri v2**, **React**, **TypeScript**, **Tailwind CSS v4**, and **SQLite**. It offers a clean, lightning-fast developer experience with CORS-free network requests, recursive collection hierarchies, environments management, code generation, and persistent request history.

---

## 🎨 Core Features & User Guide

Here is a guide on how to operate Echo and where to find key features:

```
+--------------------------------------------------------------------------------+
|  E  Echo   🔍 Filter collections...  [Env: No Environment ⚙️]  (☀️/🌙)  + New Tab  |  <- Top Bar
+--------------------------------------------------------------------------------+
|  COLLECTIONS  |  HISTORY            |  GET  https://fakestoreapi.com/users     |  <- Request URL Bar
+------------------------------------+-------------------------------------------+
|  📂 Users Service                  |  Query Params | Headers | Body | Auth     |  <- Request Editors
|    ├─ GET Get profile  [Copy] [X]  +-------------------------------------------+
|    └─ POST Create user             |  Key: api_token  | Value: 123456  | [x]   |
|                                    +-------------------------------------------+
|                                    |  [ Drag Handle to Resize Vertically ]     |  <- Vertical Resizer
|                                    +-------------------------------------------+
|                                    |  Status: 200 OK | Time: 45 ms             |  <- Status Bar
|                                    |  { "status": "success", "user": ... }     |  <- Response Pane
+------------------------------------+-------------------------------------------+
```

### 1. The Left Sidebar (Collections & History)
* **Collections Tab**: Displays your API folders and requests in a nested, recursive tree.
  * **Create Folder/Request**: Hover over any collection and click the `+ File` (FilePlus) or `+ Folder` (FolderPlus) icons.
  * **Duplication**: Hover over a collection or request and click the **Copy** icon to clone it (including all nested subfolders and requests) instantly.
  * **Renaming/Deleting**: Rename folders via the Edit button. Deletions will request confirmation first.
  * **Export/Import**: Click the export icon on folders to generate a JSON bundle. Click the import button at the top of the sidebar to import collections.
  * **Drag and Drop**: [TODO] A nested drag-and-drop mechanism to reorganize requests directly within collection folders is planned for a future update.
  * **Onboarding Walkthrough**: Click the **Compass** icon in the sidebar header to launch the interactive step-by-step UI Tour. The walkthrough automatically seeds your workspace with live, real-world mock user data fetched from the public `https://fakestoreapi.com/users` API.
* **History Tab**: Automatically records every request executed. Click any history item to reload its full request parameters and response details.
* **Sidebar Collapse**: Click the arrow (`<` or `>`) at the top of the sidebar to collapse it, maximizing your coding real estate.

### 2. The Workspace (Multi-Tabs)
* **Tab Strip**: Located below the Top Bar. Work on multiple requests in parallel. Double-click tabs to switch, and click `×` to close.
* **Method Select**: Dropdown next to the URL input. Supports `GET`, `POST`, `PUT`, `DELETE`, and `PATCH` with Postman-style color-coded badges.
* **Variable Resolution**: Type `{{variable_name}}` in the URL, headers, query params, request body, or authorization inputs. Echo resolves these automatically on execution based on your active Environment.

### 3. Request Editor Panels (Middle Section)
* **Query Params**: Table to add key-value query parameters (e.g. `?limit=10`).
* **Headers**: Custom HTTP headers. Includes checkbox toggles to quickly enable/disable individual headers.
* **Body**: Supports `none`, `raw` (Text), `json` (Auto-validates JSON), and `form` (x-www-form-urlencoded key-value editor).
* **Authorization**: Supports `Bearer Token`, `Basic Auth`, and `API Key` (configurable to inject into headers or query parameters).

### 4. Resizable Panels & Response Viewer (Bottom Section)
* **Panel Resizer**: The horizontal bar dividing the Request and Response sections is fully draggable! Click and drag it up or down to adjust panel heights.
* **Cancel Request**: If an API request is taking too long or hanging, the **Send** button changes to a red **Cancel** button. Click it to abort the network request immediately.
* **Response View**: Shows the status code, response time (ms), headers, and a formatted JSON viewer with syntax highlighting.

### 5. Environments Manager (Top Right)
* **Dropdown**: Click the **Env** selector in the Top Bar.
* **Manage Environments**: Click **⚙️ Manage...** to create environments (e.g., Development, Staging, Production) and define local variable keys and values.

### 6. Code Snippet Generator
* **Generate Code**: Click the **Code** button next to **Save** in the Url Bar.
* Select from **cURL**, **JavaScript Fetch**, **Python Requests**, or **Rust Reqwest** to get copy-pasteable snippets, pre-resolved with your active environment variables.

### 7. Collapsible AI Assistant (Right Sidebar)
* **AI Chatbot**: Click the **Sparkles** icon in the Top Header Bar to toggle the context-aware AI chatbot assistant.
* **Context Integration**: The chatbot automatically analyzes the active request parameters, environment variables, headers, and response payloads to help you generate assertions, write integration code snippets, explain payload schemas, and diagnose errors.
* **Gemini Support**: Paste your Gemini API key (stored securely in your local browser storage) to get started. Includes quick-trigger command macro buttons.

---

## 🛠️ Under Active Development

The following premium features are currently scaffolded at the backend and database levels, with UI integration in progress:

* **OpenAPI & cURL Importing**:
  * Implemented parser utilities in [curl.ts](file:///C:/Users/Shubham/Desktop/app/postman/src/lib/curl.ts) and [openapi.ts](file:///C:/Users/Shubham/Desktop/app/postman/src/lib/openapi.ts) to handle raw cURL command structures and OpenAPI/Swagger JSON specifications.
* **Response Assertions**:
  * SQLite database table migration in [db.ts](file:///C:/Users/Shubham/Desktop/app/postman/src/lib/db.ts) and typing structures in [types/index.ts](file:///C:/Users/Shubham/Desktop/app/postman/src/types/index.ts) are fully prepared to support validation rules (e.g. status code verification, response time limits, JSON body matching).
* **Sidebar Drag & Drop**:
  * Re-architecting the mouse/drag handles to provide a native-feeling, glitch-free drag experience across sub-folders in WebView2 environments.

---

## 🎹 Keyboard Shortcuts

* **`Ctrl + Enter`**: Send the HTTP Request.
* **`Ctrl + S`**: Save request configuration.
* **`Ctrl + N`**: Open a new workspace request tab.
* **`Ctrl + B`**: Toggle sidebar visibility.
* **`Ctrl + Alt + E`**: Toggle Environments Manager modal.
* **`Ctrl + Shift + C`**: Toggle Code Snippet Generator modal.
* **`Alt + [1 - 9]`**: Switch to Tab 1-9.
* **`Escape`**: Close active modal.
* **`?`**: Press outside input fields to toggle the shortcuts cheatsheet overlay.

---

## 🛠️ Tech Stack
* **Desktop Platform**: Tauri v2
* **Frontend**: React + TypeScript + Vite
* **Styling**: Tailwind CSS v4 + Custom CSS Scrollbars
* **Database**: Local SQLite (via `tauri-plugin-sql`)
* **HTTP Client**: Tauri Native Client (via `@tauri-apps/plugin-http` for CORS-free requests)

---

## 🚀 Getting Started (Development Mode)

### Prerequisites
1. **Node.js**: Version 20 or higher.
2. **Rust & Cargo**: Standard toolchain.
3. **C++ Build Tools**:
   * On Windows, install **Visual Studio Build Tools 2022** with the "Desktop development with C++" workload.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Desktop Application
```bash
npm run tauri dev
```
> ℹ️ **Note**: The first build will compile the Rust backend binary and download dependencies. This takes **2 to 5 minutes** depending on your hardware. Subsequent runs start up in seconds.

---

## 📦 Production Standalone Build

To compile a production standalone installer or portable `.exe`:
```bash
npm run tauri build
```
Compiled binaries will be generated at:
`src-tauri/target/release/bundle/`
