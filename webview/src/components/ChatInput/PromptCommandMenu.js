import React from "react";
import styled from "styled-components";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { usePromptInputContext } from "./promptInputService";

const CommandMenuContainer = styled.div`
  height: 200px;
  background-color: var(--vscode-sideBar-background, #252526);
`;

const CommandMenuHeader = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: var(--vscode-menu-foreground);
  margin: 10px 0px 5px 8px;
`;

const InputCommandMenu = () => {
  const { isCommandMenuOpen, commands } = usePromptInputContext();
  const [currentIndex, setCurrentIndex] = React.useState(undefined);

  const cursorDown = () => {
    if (currentIndex === undefined) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((currentIndex + 1) % commands.length);
    }
  };

  const cursorUp = () => {
    if (currentIndex === undefined) {
      setCurrentIndex(0);
    } else {
      const nextIndex = currentIndex - 1;
      if (nextIndex === -1) {
        setCurrentIndex(commands.length - 1);
      } else {
        setCurrentIndex(nextIndex);
      }
    }
  };

  const onKeydown = (e) => {
    if (isCommandMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        cursorDown();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        cursorUp();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onEnterKey();
      }
    }
  };

  const onEnterKey = () => {
    commands[currentIndex].action();
  };

  React.useEffect(() => {
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [isCommandMenuOpen, currentIndex, commands]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!isCommandMenuOpen) {
      setCurrentIndex(0);
    }
  }, [isCommandMenuOpen]);

  if (!isCommandMenuOpen) return null;

  return (
    <div>
      <CommandMenuContainer>
        <VSCodeDivider />
        <CommandMenuHeader>SNIPPETS</CommandMenuHeader>
        {commands.map((command, i) => (
          <SlashMenuItem
            key={command.title}
            title={command.title}
            selected={currentIndex === i}
            onClick={command.action}
            onMouseOver={() => setCurrentIndex(i)}
          />
        ))}
        <CommandMenuHeader>TEMPLATES</CommandMenuHeader>
      </CommandMenuContainer>
    </div>
  );
};

const CodeSnippetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={19}
    fill="none"
    style={{ marginRight: "6px", opacity: ".9" }}
  >
    <path
      stroke="currentColor"
      strokeWidth={1.25}
      d="M7 7 4.5 9.5 7 12m5 0 2.5-2.5L12 7m6-3v11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"
    />
  </svg>
);

const MenuItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 10px;
  font-weight: 400;
`;

const SlashMenuItem = ({ title, selected, onClick, onMouseOver }) => {
  return (
    <MenuItemContainer
      style={
        selected
          ? {
              backgroundColor: "var(--vscode-menu-selectionBackground)",
              color: "var(--vscode-menu-selectionForeground)",
            }
          : undefined
      }
      onClick={onClick}
      onMouseOver={onMouseOver}
    >
      <CodeSnippetIcon />
      {title}
    </MenuItemContainer>
  );
};

export default InputCommandMenu;
