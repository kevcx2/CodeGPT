import { useState, useEffect, useRef } from "react";

import { useChatHistoryContext } from "./chatHistoryService";
import { useChatStreamContext } from "./chatStreamService";
import { usePromptInputContext } from "./ChatInput/promptInputService";

// useChat exposes an interface over the chatHistory and chatStream
// contexts -- unifying them into a single chat API used by components.
export const useChat = () => {
  const {
    activeChat,
    activeChatId,
    updateChatHistory,
    deleteMessage,
    deleteAllMessagesFrom,
  } = useChatHistoryContext();

  const {
    messages: streamingMessages,
    submitPrompt,
    isLoading,
    abortStream,
  } = useChatStreamContext();

  const { setPrompt } = usePromptInputContext();

  // The stream comes very fast. Because of the many useEffect's
  // and state management callbacks that fire when a message is updated,
  // this can cause a "maximum update depth exceeded" warning.
  // Debouncing prevents this, as well as reducing rendering jank
  // from very fast re-renders.
  const debouncedMessages = useDebounce(streamingMessages, 100);
  useEffect(() => {
    if (streamingMessages.length) {
      updateChatHistory(debouncedMessages, activeChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMessages]);

  const sendUserMessage = (message) => {
    const newMessage = { role: "user", content: message };
    submitPrompt(activeChat, newMessage);
  };

  const editUserMessage = (messageIndex) => {
    const messageToEdit = activeChat[messageIndex];
    setPrompt(messageToEdit.content);
    const newChats = deleteAllMessagesFrom(messageIndex);
    updateChatHistory(newChats, activeChatId);
  };

  return {
    activeChat,
    isLoading,
    sendUserMessage,
    editUserMessage,
    deleteMessage,
    cancelSentMessage: abortStream,
  };
};

// Custom hook for debouncing value changes.
// Given a value that changes often, it returns the latest version
// of that value every X ms (determined by the delay).
function useDebounce(value, delay) {
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const liveValueRef = useRef();

  // Keep a reference to the most up-to-date value
  useEffect(() => {
    liveValueRef.current = value;
  }, [value, delay]);

  // Debounce the value update. shouldUpdate is true
  // every <delay value> ms.
  useEffect(() => {
    if (shouldUpdate) {
      setShouldUpdate(false);
      setTimeout(() => {
        setShouldUpdate(true);
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Set the debounced value when the `shouldUpdate` flag is true
  useEffect(() => {
    if (shouldUpdate) {
      setDebouncedValue(liveValueRef.current);
    }
  }, [shouldUpdate]);

  // Return the debounced value
  return debouncedValue;
}
