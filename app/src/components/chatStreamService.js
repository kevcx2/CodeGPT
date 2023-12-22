import { useCallback, useState } from "react";
import constate from "constate";
import { useSettingsContext } from "./Settings/settingsService";

const OPENAI_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const MILLISECONDS_PER_SECOND = 1000;

const updateLastItem = (currentItems, updatedLastItem) => {
  const newItems = currentItems.slice(0, -1);
  newItems.push(updatedLastItem);
  return newItems;
};

const getOpenAIRequestMessage = ({ content, role }) => ({
  content,
  role,
});

const getOpenAIRequestOptions = (apiKey, model, messages, signal) => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  method: "POST",
  body: JSON.stringify({
    model,
    messages: messages.map(getOpenAIRequestMessage),
    stream: true,
  }),
  signal,
});

const createChatMessage = ({ content, role, meta }) => ({
  content,
  role,
  timestamp: Date.now(),
  meta: {
    loading: false,
    responseTime: "",
    chunks: [],
    ...meta,
  },
});

export const useOpenAIChatStream = () => {
  const { model, openAiKey } = useSettingsContext();
  const apiKey = openAiKey;

  const [messages, setMessages] = useState([]);
  const [controller, setController] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetMessages = () => setMessages([]);

  const abortStream = () => {
    if (!controller) return;
    controller.abort();
    setController(null);
  };

  const closeStream = (startTimestamp) => {
    const endTimestamp = Date.now();
    const differenceInSeconds =
      (endTimestamp - startTimestamp) / MILLISECONDS_PER_SECOND;
    const formattedDiff = `${differenceInSeconds.toFixed(2)}s`;

    setMessages((prevMessages) => {
      const lastMessage = prevMessages.at(-1);
      if (!lastMessage) return [];

      const updatedLastMessage = {
        ...lastMessage,
        timestamp: endTimestamp,
        meta: {
          ...lastMessage.meta,
          loading: false,
          responseTime: formattedDiff,
        },
      };

      return updateLastItem(prevMessages, updatedLastMessage);
    });
  };

  // Todo: clean this up for readability
  const submitPrompt = useCallback(
    async (oldPrompts, newPrompt) => {
      if (isLoading || !newPrompt.content) return;

      setIsLoading(true);

      const startTimestamp = Date.now();
      const chatMessages = [...oldPrompts, createChatMessage(newPrompt)];
      setMessages(chatMessages);

      const newController = new AbortController();
      const signal = newController.signal;
      setController(newController);

      try {
        const response = await fetch(
          OPENAI_COMPLETIONS_URL,
          getOpenAIRequestOptions(apiKey, model, chatMessages, signal)
        );

        if (!response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const placeholderMessage = createChatMessage({
          content: "",
          role: "",
          meta: { loading: true },
        });
        let currentMessages = [...chatMessages, placeholderMessage];

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            closeStream(startTimestamp);
            break;
          }
          const chunk = decoder.decode(value);
          const lines = chunk.split(/(\n){2}/);

          const parsedLines = lines
            .map((line) => line.replace(/(\n)?^data:\s*/, "").trim())
            .filter((line) => line !== "" && line !== "[DONE]")
            .map((line) => JSON.parse(line));

          for (const parsedLine of parsedLines) {
            if (!parsedLine.choices) return;
            let chunkContent = parsedLine.choices[0].delta.content ?? "";
            // chunkContent = chunkContent.replace(/^`\s*/, '`');
            const chunkRole = parsedLine.choices[0].delta.role ?? "";

            const lastMessage = currentMessages.at(-1);
            if (!lastMessage) return;

            const updatedLastMessage = {
              content: `${lastMessage.content}${chunkContent}`,
              role: `${lastMessage.role}${chunkRole}`,
              timestamp: 0,
              meta: {
                ...lastMessage.meta,
                chunks: [
                  ...lastMessage.meta.chunks,
                  {
                    content: chunkContent,
                    role: chunkRole,
                    timestamp: Date.now(),
                  },
                ],
              },
            };

            currentMessages = updateLastItem(
              currentMessages,
              updatedLastMessage
            );
            setMessages(currentMessages);
          }
        }
      } catch (error) {
        if (signal.aborted) {
          console.error(`Request aborted`, error);
        } else {
          console.error(`Error during chat response streaming`, error);
        }
      } finally {
        setController(null);
        setIsLoading(false);
      }
    },
    [apiKey, isLoading, model]
  );

  return { messages, submitPrompt, resetMessages, isLoading, abortStream };
};

const [ChatStreamProvider, useChatStreamContext] =
  constate(useOpenAIChatStream);
export { ChatStreamProvider, useChatStreamContext };
