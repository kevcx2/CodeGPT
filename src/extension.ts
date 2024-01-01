import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { syncEditorState } from "./state/editor";
import { syncSettingsState, saveSetting } from "./state/settings";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerCustomView(context));
}

function registerCustomView(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.window.registerWebviewViewProvider(
    "CodeGPT",
    new GPTChatViewProvider(context),
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }
  );
}

export class GPTChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    // Define the buildPath where index.html is located.
    const buildPath = path.join(this.context.extensionPath, "webview", "build");
    // Load the index.html, inject the necessary script, replace the relative paths.
    const indexHtml = getIndexHtml(buildPath);
    const injectedHtml = injectScriptIntoHtml(indexHtml);
    // Allow JavaScript to be run within the webview.
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = replaceRelativePathsWithWebviewUri(
      buildPath,
      webviewView,
      injectedHtml
    );

    const postMessageListener = listenToMessagesFromWebView(webviewView);
    
    const unsubscribeEditorListeners = syncEditorState((state) =>
      notifyWebViewOfEditorChange(webviewView, state)
    );
    const unsubscribeSettingsListeners = syncSettingsState((state) =>
      notifyWebviewOfSettingsChange(webviewView, state)
    );

    webviewView.onDidDispose(() => {
      postMessageListener.dispose();
      unsubscribeEditorListeners();
      unsubscribeSettingsListeners();
    });
  }
}

// Read the index.html file from disk. This will serve as the main
// content for the webview.
function getIndexHtml(buildPath: string): string {
  return fs.readFileSync(path.join(buildPath, "index.html"), "utf-8");
}

// HACK: There is probably a better way to do this. 
// Inject a script to provide the VS Code API within the webview.
// I don't fully remember why I couldn't do it within the webview
// app code.
function injectScriptIntoHtml(html: string): string {
  const htmlParts = html.split("</head>");
  const injected = `
    <script>
      const vscode = acquireVsCodeApi();
      window.vscode = vscode
    </script>
  `;

  return `${htmlParts[0]}${injected}${htmlParts[1]}`;
}

// Replace any relative paths found in the HTML content.
// This is necessary because Webview content runs in a separate
// context from the extension. As a result, relative paths won't
// work in the Webview and we need to manually convert them to
// `vscode-resource:` URIs.
function replaceRelativePathsWithWebviewUri(
  buildPath: string,
  webviewView: vscode.WebviewView,
  html: string
): string {
  return html.replace(/(href|src)="(.*?)"/g, (match, p1, p2) => {
    if (p2.startsWith("http://") || p2.startsWith("https://")) {
      // If the resource is already a URL, no conversion is needed.
      return `${p1}="${p2}"`;
    } else {
      // Convert the given path to a URI to be used in the webview.
      const replacedPath = webviewView.webview
        .asWebviewUri(vscode.Uri.file(path.join(buildPath, p2)))
        .toString();

      return `${p1}="${replacedPath}"`;
    }
  });
}

// Handlers for settings updates and clipboard commands
// sent from the webview via postmessage
function listenToMessagesFromWebView(
  webviewView: vscode.WebviewView
): vscode.Disposable {
  return webviewView.webview.onDidReceiveMessage((event) => {
    if (event.api === "env.clipboard.writeText") {
      vscode.env.clipboard.writeText(event.arguments[0]);
    }
    if (event.api === "saveApiKeySetting") {
      saveSetting('apiKey', event.argument);
    }
    if (event.api === 'saveSystemPromptSetting') {
      saveSetting('systemPrompt', event.argument);
    }
    if (event.api === 'saveModelSetting') {
      saveSetting('model', event.argument);
    }
  });
}

function notifyWebViewOfEditorChange(
  webviewView: vscode.WebviewView,
  state: any
): void {
  webviewView.webview.postMessage({ ...state, type: "editorSync" });
}

function notifyWebviewOfSettingsChange(
  webviewView: vscode.WebviewView,
  state: any
): void {
  webviewView.webview.postMessage({ ...state, type: "settingsSync" });
}
