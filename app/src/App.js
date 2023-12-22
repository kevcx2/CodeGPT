import React from "react";
import {
  VSCodePanels,
  VSCodePanelTab,
  VSCodePanelView,
} from "@vscode/webview-ui-toolkit/react";
import styled from "styled-components";

import Chat from "./components/Chat";
import Settings from "./components/Settings/Settings";
import { SettingsProvider } from "./components/Settings/settingsService";
import { EditorSyncProvider } from "./bridge";

const AppContainer = styled.div`
  height: 100vh;
  overflow-y: hidden;
  background-color: var(--vscode-sideBar-background);
  color: var(--vscode-editor-foreground);
`;

const TabContainer = styled.div`
  height: 33px;
  margin-bottom: 10px;
`;

const ContentContainer = styled.div`
  height: calc(100% - 43px);
`;
const TABS = {
  CHAT: "tab-chat",
  SETTINGS: "tab-settings",
};
function App() {
  const [activeTab, setActiveTab] = React.useState(TABS.CHAT);

  // I want to use the tab components from the webview-ui-toolkit to maintain visual
  // consistency with the VSC editor. However their implementation destroys the panel component
  // and re-renders it when you switch between tabs. I want to preserve the state of the
  // chat even if we switch between tabs. This can be solved by lifting state up and out of
  // the Chat component, but until I do that, I do some hacky stuff where I hide the
  // VSCodePanelView and re-implement them myself.
  return (
    <AppContainer>
      <SettingsProvider>
        <EditorSyncProvider>
          <TabContainer>
            <VSCodePanels>
              <VSCodePanelTab
                id={TABS.CHAT}
                onClick={() => setActiveTab(TABS.CHAT)}
              >
                CHAT
              </VSCodePanelTab>
              <VSCodePanelTab
                id={TABS.SETTINGS}
                onClick={() => setActiveTab(TABS.SETTINGS)}
              >
                SETTINGS
              </VSCodePanelTab>
              <VSCodePanelView style={{ display: "none" }} />
              <VSCodePanelView style={{ display: "none" }} />
            </VSCodePanels>
          </TabContainer>
          <ContentContainer>
            <div
              style={{
                height: "100%",
                display: activeTab === TABS.CHAT ? "initial" : "none",
              }}
            >
              <Chat />
            </div>
            <div
              style={{
                height: "100%",
                display: activeTab === TABS.SETTINGS ? "initial" : "none ",
              }}
            >
              <Settings />
            </div>
          </ContentContainer>
        </EditorSyncProvider>
      </SettingsProvider>
    </AppContainer>
  );
}

export default App;
