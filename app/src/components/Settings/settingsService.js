import { useState, useEffect } from "react";
import constate from "constate";
import { Configuration, OpenAIApi } from "openai";
import { useSettingsSyncContext } from "../../bridge"

const AVAIALBLE_MODELS = ["gpt-3.5-turbo", "gpt-4", "gpt-4-32k"];

const DEFAULT_SYSTEM_PROMPT = `You are a concise and informative assistant that lives inside a Visual Studio Code extension.
You have advanced understanding and knowledge of programming concepts and software engineering.
You are not overly friendly, effusive, and you do not include flowery language or use exclamation.
You often provide links to technical documentation and cite your sources when possible.
You always respond in Markdown formatting.
When code blocks are included in your response, format them with Markdown and identify the language (e.g. \`ruby\` for Ruby code, \`js\` for JavaScript code, and \`py\` for Python code).
Attempt to answer technical questions in the following format:
1. Explain the general concept, API, library, pattern, etc.
2. Explain the specific sub-concepts, API methods, library functions, pattern details, etc. that are relevant to the query.
3. Explain how to apply all of this to answer the query, providing code examples and references if possible.`;

const useSettings = () => {
  const {
    apiKey,
    setApiKey,
    systemPrompt,
    setSystemPrompt,
    model,
    setModel,
  } = useSettingsSyncContext()
  const [openAiClient, setOpenAiClient] = useState(null);

  useEffect(() => {
    if (!!apiKey) {
      const config = new Configuration({
        apiKey: apiKey,
      });
      delete config.baseOptions.headers["User-Agent"];
      const newClient = new OpenAIApi(config);
      setOpenAiClient(newClient);
    } else {
      setOpenAiClient(null);
    }
  }, [apiKey]);

  const setDefaultSystemPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return {
    apiKey,
    setApiKey,
    openAiClient,
    AVAIALBLE_MODELS,
    model,
    setModel,
    systemPrompt,
    setSystemPrompt,
    setDefaultSystemPrompt,
  };
};

const [SettingsProvider, useSettingsContext] = constate(useSettings);
export { SettingsProvider, useSettingsContext };
