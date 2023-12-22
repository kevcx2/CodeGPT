import React from "react";
import styled from "styled-components";
import Markdown from "./Markdown";
import ShowMoreText from "react-show-more-text";
import { VSCodeLink, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { VscTrash, VscEdit, VscAccount, VscWand } from "react-icons/vsc";
import { useChat } from "../chatService";

const MessageContainer = styled.div`
  padding: 5px 12px;
`;
const MessageSpeakerLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: -5px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const MessageContentContainer = styled.div`
  margin-left: 4px;
`;

const UserMessageContentContiner = styled(ShowMoreText)`
  margin: 20px 0px;
`;
const UserIcon = styled(VscAccount)`
  transform: scale(1.4);
  margin-right: 11px;
  margin-left: 5px;
  color: var(--vscode-icon-foreground);
`;

const WandIcon = styled(VscWand)`
  transform: scale(1.4);
  margin-right: 11px;
  margin-left: 5px;
  color: var(--vscode-icon-foreground);
`;

const TrashIcon = styled(VscTrash)`
  padding-left: 1px;
  color: var(--vscode-icon-foreground);
`;

const EditIcon = styled(VscEdit)`
  color: var(--vscode-icon-foreground);
`;

const IconButton = styled(VSCodeButton)`
  transform: scale(1.3);
  margin-right: 10px;
`;

const AssistantMessage = ({ message, onDelete, editable }) => {
  return (
    <MessageContainer>
      <MessageSpeakerLabel>
        <FlexContainer>
          <WandIcon />
          GPT
        </FlexContainer>
        <FlexContainer>
          <IconButton disabled={!editable} appearance="icon" onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </FlexContainer>
      </MessageSpeakerLabel>
      <MessageContentContainer>
        <Markdown>{message}</Markdown>
      </MessageContentContainer>
    </MessageContainer>
  );
};

const UserMessageContainer = styled(MessageContainer)`
  background-color: var(--vscode-input-background);
  margin-bottom: 2px;
`;

const UserMessage = ({ message, onDelete, onEdit, editable }) => {
  return (
    <UserMessageContainer>
      <MessageSpeakerLabel>
        <FlexContainer>
          <UserIcon />
          You
        </FlexContainer>
        <FlexContainer>
          <IconButton disabled={!editable} appearance="icon" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton disabled={!editable} appearance="icon" onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </FlexContainer>
      </MessageSpeakerLabel>
      <MessageContentContainer>
        <UserMessageContentContiner
          lines={3}
          more={
            <>
              <div />
              <VSCodeLink>Show full message</VSCodeLink>
            </>
          }
          less={null}
        >
          {message}
        </UserMessageContentContiner>
      </MessageContentContainer>
    </UserMessageContainer>
  );
};

const ChatDialog = ({ messages = [] }) => {
  const { deleteMessage, editUserMessage, isLoading } = useChat();

  return messages.map((message, i) => {
    if (message.role === "assistant") {
      return (
        <AssistantMessage
          key={i}
          message={message.content}
          onDelete={() => deleteMessage(i)}
          editable={!isLoading}
        />
      );
    } else if (message.role === "user") {
      return (
        <UserMessage
          key={i}
          message={message.content}
          onDelete={() => deleteMessage(i)}
          onEdit={() => editUserMessage(i)}
          editable={!isLoading}
        />
      );
    } else {
      return null;
    }
  });
};

export default ChatDialog;
