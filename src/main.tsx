import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AlertDialogProvider } from "./components/common/AlertDialog";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AlertDialogProvider>
      <App />
    </AlertDialogProvider>
  </React.StrictMode>,
);
