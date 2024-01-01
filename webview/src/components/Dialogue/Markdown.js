import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  prism,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeLink,
} from "@vscode/webview-ui-toolkit/react";

const isDarkColor = (hexColor) => {
  hexColor = hexColor.substring(1); // strip #
  var rgb = parseInt(hexColor, 16); // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff; // extract red
  var g = (rgb >> 8) & 0xff; // extract green
  var b = (rgb >> 0) & 0xff; // extract blue

  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 128;
};

const rootStyles = getComputedStyle(document.documentElement);
const editorBackground = rootStyles.getPropertyValue(
  "--vscode-editor-background"
);

const isDarkBackground = isDarkColor(editorBackground);

const syntaxHighlighterTheme = isDarkBackground ? vscDarkPlus : prism;
syntaxHighlighterTheme['pre[class*="language-"]']["background"] =
  editorBackground;

const CodeBlockContainer = styled.div`
  position: relative;
  padding-top: 30px;
  margin-top: 20px;
  background-color: ${editorBackground};
`;

const BlockAction = styled.div`
  position: absolute;
  right: 6px;
  top: 4px;
`;

const BlockLanguageLabel = styled.div`
  position: absolute;
  left: 15px;
  top: 9px;
  text-selection: none;
  pointer-events: none;
  cursor: default;
  opacity: 0.7;
`;

const BlockHeaderDivider = styled(VSCodeDivider)`
  opacity: 0.5;
`;

const CodeBlock = ({ children, language, ...props }) => {
  return (
    <CodeBlockContainer>
      <BlockHeaderDivider />
      <SyntaxHighlighter
        {...props}
        wrapLongLines
        children={children}
        style={syntaxHighlighterTheme}
        language={language}
        PreTag="div"
      />
      <BlockAction>
        <VSCodeButton
          appearance="secondary"
          onClick={() =>
            window.vscode.postMessage({
              api: "env.clipboard.writeText",
              arguments: [children],
            })
          }
        >
          Copy
        </VSCodeButton>
      </BlockAction>
      <BlockLanguageLabel>{language}</BlockLanguageLabel>
    </CodeBlockContainer>
  );
};

const InlineCode = styled.code`
  background-color: var(--vscode-editor-background);
  padding: 2px 6px;
  border-radius: 3px;
`;

const Code = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match && match[1];
  const code = String(children).replace(/\n$/, "");
  return !inline ? (
    <CodeBlock language={language} {...props}>
      {code}
    </CodeBlock>
  ) : (
    <InlineCode {...props} className={className}>
      {children}
    </InlineCode>
  );
};

const Markdown = ({ children: markDownContent }) => {
  return (
    <ReactMarkdown
      components={{
        code: (nodeData) => <Code {...nodeData} />,
        pre: (nodeData) => <div {...nodeData} />,
        a: ({ children, node, ...nodeData }) => (
          <VSCodeLink {...nodeData}>{children}</VSCodeLink>
        ),
      }}
    >
      {markDownContent}
    </ReactMarkdown>
  );
};

export default Markdown;
