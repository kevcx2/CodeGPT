import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { syncEditorState } from "./bridge";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerCustomView(context));
}

function registerCustomView(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.window.registerWebviewViewProvider(
    "CodeGPT",
    new YourCustomViewProvider(context),
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }
  );
}

export class YourCustomViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    const buildPath = path.join(this.context.extensionPath, "app", "build");
    const indexHtml = getIndexHtml(buildPath);
    const injectedHtml = injectScriptIntoHtml(indexHtml);

    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = replaceRelativePathsWithWebviewUri(
      buildPath,
      webviewView,
      injectedHtml
    );

    const postMessageListener = listenToMessagesFromWebView(webviewView);
    const unsubscribeListeners = syncEditorState((state) =>
      notifyWebView(webviewView, state)
    );

    webviewView.onDidDispose(() => {
      postMessageListener.dispose();
      unsubscribeListeners();
    });
  }
}

function getIndexHtml(buildPath: string): string {
  return fs.readFileSync(path.join(buildPath, "index.html"), "utf-8");
}

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

function replaceRelativePathsWithWebviewUri(
  buildPath: string,
  webviewView: vscode.WebviewView,
  html: string
): string {
  return html.replace(/(href|src)="(.*?)"/g, (match, p1, p2) => {
    if (p2.startsWith("http://") || p2.startsWith("https://")) {
      return `${p1}="${p2}"`;
    } else {
      const replacedPath = webviewView.webview
        .asWebviewUri(vscode.Uri.file(path.join(buildPath, p2)))
        .toString();

      return `${p1}="${replacedPath}"`;
    }
  });
}

function listenToMessagesFromWebView(
  webviewView: vscode.WebviewView
): vscode.Disposable {
  return webviewView.webview.onDidReceiveMessage((event) => {
    if (event.api === "env.clipboard.writeText") {
      vscode.env.clipboard.writeText(event.arguments[0]);
    }
  });
}

function notifyWebView(webviewView: vscode.WebviewView, state: any): void {
  webviewView.webview.postMessage({ ...state, type: "editorSync" });
}
