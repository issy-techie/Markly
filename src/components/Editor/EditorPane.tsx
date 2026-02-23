import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { githubLight } from "@uiw/codemirror-theme-github";
import { oneDark } from "@codemirror/theme-one-dark";

interface EditorPaneProps {
  content: string;
  isDark: boolean;
  editorFontFamily: string;
  editorFontSize: number;
  lineWrapping: boolean;
  editorWidthPercent: number;
  onCreateEditor: (view: EditorView) => void;
  onChange: (value: string) => void;
  onPaste: (event: ClipboardEvent) => void;
}

const EditorPane: React.FC<EditorPaneProps> = ({
  content,
  isDark,
  editorFontFamily,
  editorFontSize,
  lineWrapping,
  editorWidthPercent,
  onCreateEditor,
  onChange,
  onPaste,
}) => {
  return (
    <div className="border-r border-slate-200 dark:border-slate-700 h-full flex flex-col" style={{ width: `${editorWidthPercent}%` }}>
      <CodeMirror
        className="flex-1 overflow-hidden"
        value={content}
        height="100%"
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          ...(lineWrapping ? [EditorView.lineWrapping] : []),
          EditorView.theme({
            "&": { fontFamily: editorFontFamily, fontSize: `${editorFontSize}px` },
            ".cm-content": { fontFamily: editorFontFamily },
            ".cm-gutters": { fontSize: `${editorFontSize}px` }
          }),
          EditorView.domEventHandlers({
            paste: (event) => {
              const items = event.clipboardData?.items;
              const hasImage = Array.from(items || []).some(item => item.type.startsWith("image/"));
              if (hasImage) {
                onPaste(event);
                return true;
              }
              return false;
            }
          })
        ]}
        theme={isDark ? oneDark : githubLight}
        onCreateEditor={(view) => onCreateEditor(view)}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: true, searchKeymap: false, highlightSelectionMatches: true }}
      />
    </div>
  );
};

export default EditorPane;
