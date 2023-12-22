import { useState, useEffect } from "react";
import constate from "constate";
import { Configuration, OpenAIApi } from "openai";

const AVAIALBLE_MODELS = ["gpt-3.5-turbo", "gpt-4", "gpt-4-32k"];

const DEFAULT_SYSTEM_PROMPT = `You are a concise and informative assistant that lives inside a Visual Studio \
Code extension. You have advanced understanding and knowledge of programming \
concepts and software engineering. You are not overly friendly, effusive, \
and you do not include flowery language or use exclamation. You often provide links to technical \
documentation and cite your sources when possible. You always respond in Markdown \
formatting. When code blocks are included in your response, format them with \
markdown and identify the language (e.g. \`\`\`ruby for Ruby code, \`\`\`js \
for JavaScript code, and \`\`\`py for Python code).`;

const useSettings = () => {
  const [openAiKey, setOpenAiKey] = useState(
    "AI KEY HERE"
  );
  const [openAiClient, setOpenAiClient] = useState(null);
  const [model, setModel] = useState(AVAIALBLE_MODELS[0]);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

  useEffect(() => {
    if (!!openAiKey) {
      const config = new Configuration({
        apiKey: openAiKey,
      });
      delete config.baseOptions.headers["User-Agent"];
      const newClient = new OpenAIApi(config);
      setOpenAiClient(newClient);
    } else {
      setOpenAiClient(null);
    }
  }, [openAiKey]);

  const setDefaultSystemPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return {
    openAiKey,
    setOpenAiKey,
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
