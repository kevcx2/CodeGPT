import { Settings } from "http2";
import * as vscode from "vscode";

const SAVED_SETTINGS_API_KEY = 'apiKey';
const SAVED_SETTINGS_SYSTEM_PROMPT = 'systemPrompt';
const SAVED_SETTINGS_MODEL = 'model';

type SettingsState = {
  [SAVED_SETTINGS_API_KEY]: string | undefined;
  [SAVED_SETTINGS_SYSTEM_PROMPT]: string | undefined;
  [SAVED_SETTINGS_MODEL]: string | undefined;
};

type SettingsStateChangeCallback = (value: SettingsState) => void;
// Use this so we can re-assign all state values at once, and only
// trigger a single onChange callback. Helps avoid un-needed communication
// with the webview as well as bugs where partially updated state
// values were being passed to the webview.
let isBatchUpdateInProgress = false;

function createObservedState(
  state: SettingsState,
  onChange: SettingsStateChangeCallback
) {
  return new Proxy(state, {
    set(
      target: SettingsState,
      key: keyof SettingsState,
      value: string | undefined
    ) {
      target[key] = value;
      if (!isBatchUpdateInProgress) {
        onChange(target);
      }
      return true;
    },
  });
}

type StateChangeCallback = (state: SettingsState) => void;
export const syncSettingsState = (onStateChange: StateChangeCallback) => {
  const savedSettings = loadSavedSettings();

  const settingsState = createObservedState(
    { ...savedSettings },
    (settingsState) => {
      onStateChange(settingsState);
    }
  );

  // Sync settings when they change in the vscode extension host
  const configurationChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
    const savedSettings = loadSavedSettings();
    isBatchUpdateInProgress = true;
    settingsState[SAVED_SETTINGS_API_KEY] = savedSettings[SAVED_SETTINGS_API_KEY];
    settingsState[SAVED_SETTINGS_SYSTEM_PROMPT] = savedSettings[SAVED_SETTINGS_SYSTEM_PROMPT];
    isBatchUpdateInProgress = false;
    settingsState[SAVED_SETTINGS_MODEL] = savedSettings[SAVED_SETTINGS_MODEL];
  });

  // Sync upon initial extension open
  onStateChange(settingsState);

  return () => {
    configurationChangeListener.dispose();
  };
};

function loadSavedSettings(){
  const configuration = vscode.workspace.getConfiguration('CodeGPT');
  const savedSettings = {
    [SAVED_SETTINGS_API_KEY]: configuration[SAVED_SETTINGS_API_KEY],
    [SAVED_SETTINGS_SYSTEM_PROMPT]: configuration[SAVED_SETTINGS_SYSTEM_PROMPT],
    [SAVED_SETTINGS_MODEL]: configuration[SAVED_SETTINGS_MODEL],
  };
  return savedSettings;
}

export const saveSetting = (key: string, value: string | undefined) => {
  const configuration = vscode.workspace.getConfiguration('CodeGPT');
  const existingConfigValue = configuration.get(key);
  if (existingConfigValue === value) {
    return;
  }
  configuration.update(key, value, vscode.ConfigurationTarget.Global);
};
