import React from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput/ChatInput";
import ChatDialogue from "./Dialogue/ChatDialogue";
import { PromptInputProvider } from "./ChatInput/promptInputService";
import { SnippetsProvider } from "./ChatInput/snippetService";
import SlashCommandMenu from "./ChatInput/PromptCommandMenu";

import { ChatHistoryProvider } from "./chatHistoryService";
import { ChatStreamProvider } from "./chatStreamService";
import { useChat } from "./chatService";
import useScrollTrap from "./useScrollTrap.js";

const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--vscode-editor-foreground);
`;

const DialogAreaContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
`;
const DialogAreaInnerContainer = styled.div`
  width: 100%;
  max-width: 900px;
`;

const InputAreaContainer = styled.div`
  height: 130px;
`;

const Chat = () => {
  return (
    <PromptInputProvider>
      <SnippetsProvider>
        <ChatStreamProvider>
          <ChatHistoryProvider>
            <ChatWithContext />
          </ChatHistoryProvider>
        </ChatStreamProvider>
      </SnippetsProvider>
    </PromptInputProvider>
  );
};

const ChatWithContext = () => {
  const dialogContainerRef = React.useRef(null);
  const { activeChat, sendUserMessage, isLoading } = useChat();

  useScrollTrap(dialogContainerRef, [isLoading], [activeChat]);

  return (
    <ChatContainer>
      <DialogAreaContainer ref={dialogContainerRef}>
        <DialogAreaInnerContainer>
          <ChatDialogue messages={activeChat} />
        </DialogAreaInnerContainer>
      </DialogAreaContainer>
      <SlashCommandMenu />
      <InputAreaContainer>
        <ChatInput onSubmit={sendUserMessage} isLoading={isLoading} />
      </InputAreaContainer>
    </ChatContainer>
  );
};

export default Chat;
