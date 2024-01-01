import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./bridge.js";

const documentRoot = document.getElementById("root")
const reactRoot = ReactDOM.createRoot(document.getElementById("root"));

reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

 // Set defaults for css variables that vscode will provide when running as an extension
 documentRoot.style.setProperty("background-color", "#21252B");
 documentRoot.style.setProperty("--vscode-sideBar-backgroun", "#21252B");
 documentRoot.style.setProperty("--vscode-editor-foreground", "#CCCCCC");
 documentRoot.style.setProperty("--vscode-editor-background", "#282C34");
 documentRoot.style.setProperty("--vscode-menu-foreground", "#CCCCCC");
 documentRoot.style.setProperty("--vscode-menu-selectionBackground", "#2C313C");
 documentRoot.style.setProperty("--vscode-menu-selectionForeground", "#CCCCCC");
 documentRoot.style.setProperty("--vscode-icon-foreground", "#CCCCCC");
 documentRoot.style.setProperty("--vscode-input-background", "#1D1F23");
