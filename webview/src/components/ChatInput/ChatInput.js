import React, { useState } from "react";
import { encode } from "gpt-token-utils";
import {
  VSCodeDivider,
  VSCodeTextArea,
  VSCodeButton,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "styled-components";
import { usePromptInputContext } from "./promptInputService";
import { useSnippetsContext } from "./snippetService";
import { useChat } from "../chatService";
import { useSettingsContext } from "../Settings/settingsService";

const InputTextArea = styled(VSCodeTextArea)`
  box-sizing: border-box;
  width: calc(100% - 4px);
  margin: 0px 3px 2px 1px;
`;

const InputText = styled.div`
  font-weight: 500;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const InputActionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InputSubmitButton = styled(VSCodeButton)`
  margin-right: 3px;
`;

const InputProgressRing = styled(VSCodeProgressRing)`
  height: 13px;
  margin: 1px 2px 0px -10px;
`;

const CancelButtonInnerContainer = styled.div`
  display: flex;
`;

const TokenCount = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--vscode-editor-foreground);
  margin: 0px;
  opacity: 0.85;
`;

const TOKEN_LIMITS = {
  "gpt-4": 8000,
  "gpt-3.5-turbo": 4000,
  "gpt-4-32k": 32000,
};

const ChatInput = ({ onSubmit, isLoading }) => {
  const { prompt, onPromptChange } = usePromptInputContext();
  const { addSnippetText } = useSnippetsContext();
  const [promptTokenCount, setPromptTokenCount] = useState(
    encode(prompt).length
  );
  const { activeChat, cancelSentMessage } = useChat();
  const { model } = useSettingsContext();

  const TOKEN_LIMIT = TOKEN_LIMITS[model];

  React.useEffect(() => {
    let allMessages = "";
    activeChat.forEach((message) => (allMessages += message.content));
    allMessages += addSnippetText(prompt);
    setPromptTokenCount(encode(allMessages).length);
  }, [prompt, addSnippetText, activeChat]);

  const onUpdate = (event) => {
    const textareaEl = event.target.shadowRoot.querySelector("textarea");
    const { selectionStart, value } = textareaEl;
    onPromptChange(value, selectionStart);
  };

  const onSubmitPrompt = () => {
    onSubmit(addSnippetText(prompt));
    onPromptChange("", 0);
  };

  const hasPrompt = prompt && prompt.length > 0;

  return (
    <>
      <VSCodeDivider />
      <InputContainer>
        <InputTextArea
          rows={4}
          value={prompt}
          onInput={onUpdate}
          onClick={onUpdate}
        />
        <InputActionsContainer>
          <TokenCount>
            {`TOKEN COUNT: ${promptTokenCount} / ${TOKEN_LIMIT}`}
          </TokenCount>
          {isLoading ? (
            <InputSubmitButton
              appearance="secondary"
              onClick={cancelSentMessage}
            >
              <CancelButtonInnerContainer>
                <InputProgressRing />
                <InputText>Stop Response</InputText>
              </CancelButtonInnerContainer>
            </InputSubmitButton>
          ) : (
            <InputSubmitButton
              appearance="primary"
              disabled={!hasPrompt}
              onClick={onSubmitPrompt}
            >
              <InputText>Send</InputText>
            </InputSubmitButton>
          )}
        </InputActionsContainer>
      </InputContainer>
    </>
  );
};

export default ChatInput;
