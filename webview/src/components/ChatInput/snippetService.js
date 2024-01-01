import constate from "constate";
import { useEditorSyncContext } from "../../bridge";

export const COMMAND_SNIPPETS = {
  EDITOR_SELECTION: "@selection",
  EDITOR_ACTIVE_FILE: "@file",
};

const useSnippets = () => {
  const { activeEditorDocument, activeEditorSelection } =
    useEditorSyncContext();

  const addSnippetText = (text) => {
    let replacedText = text;
    replacedText = replacedText.replace(
      COMMAND_SNIPPETS.EDITOR_SELECTION,
      activeEditorSelection
    );
    replacedText = replacedText.replace(
      COMMAND_SNIPPETS.EDITOR_ACTIVE_FILE,
      activeEditorDocument
    );
    return replacedText;
  };

  return { addSnippetText };
};

const [SnippetsProvider, useSnippetsContext] = constate(useSnippets);

export { SnippetsProvider, useSnippetsContext };
