import * as vscode from "vscode";

type EditorState = {
  activeEditorDocument: string | undefined;
  activeEditorSelection: string | undefined;
};

type EditorStateChangeCallback = (value: EditorState) => void;

function createObservedState(
  state: EditorState,
  onChange: EditorStateChangeCallback
) {
  return new Proxy(state, {
    set(
      target: EditorState,
      key: keyof EditorState,
      value: string | undefined
    ) {
      target[key] = value;
      onChange(target);
      return true;
    },
  });
}

type StateChangeCallback = (state: EditorState) => void;
export const syncEditorState = (onStateChange: StateChangeCallback) => {
  const editorState = createObservedState(
    {
      activeEditorDocument: undefined,
      activeEditorSelection: undefined,
    },
    (editorState) => {
      onStateChange(editorState);
    }
  );

  // Sync the active editor document & selection when the document changes
  const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        editorState.activeEditorDocument = editor.document.getText();
        editorState.activeEditorSelection = editor.document.getText(
          editor.selection
        );
      }
    }
  );

  // Sync the active editor selection when it changes
  const selectionChangeListener = vscode.window.onDidChangeTextEditorSelection(
    (event: vscode.TextEditorSelectionChangeEvent) => {
      const { textEditor } = event;
      if (textEditor === vscode.window.activeTextEditor) {
        editorState.activeEditorSelection = textEditor.document.getText(
          textEditor.selection
        );
      }
    }
  );

  // Upon initial extension open, set the already selected / opened text
  const activeEditor = vscode.window.activeTextEditor;
  editorState.activeEditorDocument = activeEditor?.document.getText();
  editorState.activeEditorSelection = activeEditor?.document.getText(
    activeEditor?.selection
  );
  onStateChange(editorState);

  return () => {
    activeEditorListener.dispose();
    selectionChangeListener.dispose();
  };
};
