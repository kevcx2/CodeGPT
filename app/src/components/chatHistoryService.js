import { useState, useEffect } from "react";
import { useSettingsContext } from "./Settings/settingsService";
import constate from "constate";
import clone from "rfdc";

const deepCopy = clone();

const createEmptyChatState = (systemPrompt) => {
  const systemMessage = {
    role: "system",
    content: systemPrompt || "You are a helpful assistant",
  };
  return [systemMessage];
};

const useChatHistory = () => {
  const { systemPrompt } = useSettingsContext();
  const [chats, setChats] = useState({
    1: createEmptyChatState(systemPrompt),
  });
  const [activeChatId] = useState(1);

  useEffect(() => {
    const activeChatMessages = [...chats[activeChatId]]
    const newSystemMessage = createEmptyChatState(systemPrompt)[0]
    activeChatMessages[0] = newSystemMessage
    updateChatHistory(activeChatMessages, activeChatId)
  }, [systemPrompt])

  const updateChatHistory = (messages, chatId) => {
    const updatedChats = deepCopy(chats);
    updatedChats[chatId] = messages.map(({ content, role, timestamp }) => ({
      content,
      role,
      timestamp,
    }));
    setChats(updatedChats);
  };

  const deleteMessage = (messageIndex) => {
    const updatedChats = deepCopy(chats);
    updatedChats[activeChatId].splice(messageIndex, 1);
    setChats(updatedChats);
    return updatedChats;
  };

  const deleteAllMessagesFrom = (messageIndex) => {
    const updatedChats = deepCopy(chats);
    updatedChats[activeChatId].splice(messageIndex);
    setChats(updatedChats);
    return updatedChats[activeChatId];
  };

  return {
    chats,
    activeChat: chats[activeChatId],
    activeChatId,
    updateChatHistory,
    deleteMessage,
    deleteAllMessagesFrom,
  };
};

const [ChatHistoryProvider, useChatHistoryContext] = constate(useChatHistory);
export { ChatHistoryProvider, useChatHistoryContext };
