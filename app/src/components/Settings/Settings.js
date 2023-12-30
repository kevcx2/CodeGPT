import React from "react";
import styled from "styled-components";
import {
  VSCodeTextArea,
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { useSettingsContext } from "./settingsService";

const SettingsTextField = styled(VSCodeTextField)`
  width: 100%;
  max-width: 900px;
  margin: 10px 0px;
`;

const SettingsTextArea = styled(VSCodeTextArea)`
  width: 100%;
  max-width: 900px;
  margin-top: 10px;
`;

const Settings = () => {
  const {
    apiKey,
    setApiKey,
    AVAIALBLE_MODELS,
    model: currentModel,
    setModel,
    systemPrompt,
    setSystemPrompt,
    setDefaultSystemPrompt,
  } = useSettingsContext();

  return (
    <>
      <SettingsTextField
        type="text" value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      >
        OpenAI API key
      </SettingsTextField>
      <VSCodeRadioGroup
        orientation="vertical"
        onChange={(e) => setModel(e.target.value)}
      >
        <label slot="label">Chat model</label>
        {AVAIALBLE_MODELS.map((model) => (
          <VSCodeRadio
            key={model}
            checked={currentModel === model}
            value={model}
          >
            {model}
          </VSCodeRadio>
        ))}
      </VSCodeRadioGroup>
      <SettingsTextArea
        rows={8}
        value={systemPrompt}
        onInput={(event) => {
          setSystemPrompt(event.target.value);
        }}
      >
        System prompt
      </SettingsTextArea>
      <VSCodeButton onClick={setDefaultSystemPrompt}>Use default</VSCodeButton>
    </>
  );
};

export default Settings;
