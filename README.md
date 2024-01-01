# CodeGPT VSCode Extension

ChatGPT in your IDE. Featuring:
- Locally stored API key
- Editable system prompt
- Streaming chat responses
- Markdown & code rendering in chat
- Copy & paste between chat and active editor window
- Slash-command menu shortcuts
- Editable chat history
- Color theme support
- Native look and feel, using Microsoft's [webview ui toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit)

# Structure
The chat UI and network interface with AI APIs are built as a react app, rendered by the extension via a webview. The extension host process code lives in the `src` directory. The react chat app code is inside the `webview` directory.

[demo](https://vimeo.com/899047172)
