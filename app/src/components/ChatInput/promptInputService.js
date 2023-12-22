import { useState } from "react";
import constate from "constate";
import { COMMAND_SNIPPETS } from "./snippetService";

const usePromptInput = () => {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [closedMenuAtWordStart] = useState(null);
  const [commandText, setCommandText] = useState(null);
  const [prompt, setPrompt] = useState("");

  const onPromptChange = (prompt, selection) => {
    setPrompt(prompt);
    onInputInteraction(prompt, selection - 1);
  };

  // When the prompt input text or selection changes,
  // this function determines the state of the input
  // command menu.
  const onInputInteraction = (text, selectionStart) => {
    const { isCommandSelected, selectedWordStart, selectedWord } =
      parseInputCommandText(text, selectionStart);

    if (isCommandMenuOpen) {
      setCommandText(selectedWord);
      if (!isCommandSelected) {
        setIsCommandMenuOpen(false);
        setCommandText(null);
      }
    } else {
      if (isCommandSelected && closedMenuAtWordStart !== selectedWordStart) {
        setCommandText(selectedWord);
        setIsCommandMenuOpen(true);
      }
    }
  };

  const replaceCommand = (replacementText) => {
    const currentPrompt = prompt;
    const currentCommmand = commandText;
    const replacedPrompt = currentPrompt.replace(
      currentCommmand,
      replacementText
    );
    setPrompt(replacedPrompt);
    setCommandText(null);
    setIsCommandMenuOpen(false);
  };

  const addEditorSelectionCommand = () => {
    replaceCommand(COMMAND_SNIPPETS.EDITOR_SELECTION);
  };

  const addEditorFileCommand = () => {
    replaceCommand(COMMAND_SNIPPETS.EDITOR_ACTIVE_FILE);
  };

  return {
    prompt,
    setPrompt,
    onPromptChange,
    isCommandMenuOpen,
    commands: [
      {
        title: "Add text: Current editor selection",
        type: "snippet",
        action: addEditorSelectionCommand,
      },
      {
        title: "Add text: Current editor file",
        type: "snippet",
        action: addEditorFileCommand,
      },
    ],
  };
};

const parseInputCommandText = (text, selectionStart) => {
  let formattedText = text;
  const selectedChar = formattedText.charAt(selectionStart);
  let selectedWordStart = selectionStart;
  let selectedWordEnd = selectionStart;
  let selectedWord = "";
  let isCommandSelected = false;

  // Find the start of the slash command
  const lastSlashCharacter = formattedText.lastIndexOf("/", selectionStart);
  const lastNewlineCharacter = formattedText.lastIndexOf("\n", selectionStart);
  selectedWordStart = lastSlashCharacter;
  if (lastNewlineCharacter > lastSlashCharacter) {
    selectedWordStart = lastNewlineCharacter;
  }

  // Find the end of the slash command
  selectedWordEnd = formattedText.indexOf("\n", selectedWordStart);
  selectedWord = formattedText.slice(
    selectedWordStart,
    selectedWordEnd === -1 ? undefined : selectedWordEnd
  );
  isCommandSelected =
    selectedWord.startsWith("/") && selectedWord.trim().length >= 1;

  return {
    isCommandSelected,
    selectedWordStart,
    selectedWordEnd,
    selectedWord,
    selectedChar,
  };
};

const [PromptInputProvider, usePromptInputContext] = constate(usePromptInput);

export { PromptInputProvider, usePromptInputContext };
