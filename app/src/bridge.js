import { useEffect, useState } from "react";
import constate from "constate";

const isRunningAsVscodeExtension = !!window.vscode;

// When developing an extension, we might want to simulate the react app <> vscode bridge
if (!isRunningAsVscodeExtension) {
  window.vscode = {
    postMessage: (payload) =>
      window.alert(`sent postmessage: ${JSON.stringify(payload)}`),
  };

  // Set defaults for css variables that vscode will provide when running as an extension
  var root = document.querySelector(":root");
  root.style.setProperty("background-color", "#21252B");
  root.style.setProperty("--vscode-sideBar-backgroun", "#21252B");
  root.style.setProperty("--vscode-editor-foreground", "#CCCCCC");
  root.style.setProperty("--vscode-editor-background", "#282C34");
  root.style.setProperty("--vscode-menu-foreground", "#CCCCCC");
  root.style.setProperty("--vscode-menu-selectionBackground", "#2C313C");
  root.style.setProperty("--vscode-menu-selectionForeground", "#CCCCCC");
  root.style.setProperty("--vscode-icon-foreground", "#CCCCCC");
  root.style.setProperty("--vscode-input-background", "#1D1F23");
}

const useEditorSync = () => {
  const [activeEditorDocument, setActiveEditorDocument] = useState("");
  const [activeEditorSelection, setActiveEditorSelection] = useState("");
  const [savedSettings, setSavedSettings] = useState("");

  const update = (syncMessageEvent) => {
    const syncMessage = syncMessageEvent.data;
    if (syncMessage.type === "editorSync") {
      const { activeEditorDocument, activeEditorSelection } = syncMessage;
      setActiveEditorDocument(activeEditorDocument);
      setActiveEditorSelection(activeEditorSelection);
    }
    if (syncMessage.type === "settingsSync") {
      setSavedSettings(syncMessage);
      console.log("saved", syncMessage);
    }
  };

  useEffect(() => {
    window.addEventListener("message", update);
    return () => {
      window.removeEventListener("message", update);
    };
  }, []);

  return {
    activeEditorDocument,
    activeEditorSelection,
  };
};

const [EditorSyncProvider, useEditorSyncContext] = constate(useEditorSync);

export { EditorSyncProvider, useEditorSyncContext };
