import { useState, useCallback, useEffect } from "react";
import { core } from "@tauri-apps/api";
import { open, save } from "@tauri-apps/plugin-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "./utils/cn";

const SAMPLE_MARKDOWN = `# Welcome to MD Studio

This is a **professional** markdown editor that supports all common markdown features.

## Features

- 📄 Open any \`.md\` file from your computer
- ✏️ Edit markdown with live preview
- 💾 Save your changes back to a file
- ✨ Beautiful syntax highlighting for code blocks
- 📱 Responsive design that works on all devices

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: "Welcome to MD Studio" };
}

greet("Developer");
\`\`\`

## Table Support

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Lists | ✅ |
| Code Blocks | ✅ |
| Tables | ✅ |
| Links | ✅ |

## Links & Images

Check out [GitHub](https://github.com) for more information.

> **Note:** Switch between Edit and Preview modes using the tabs above!

---

*Start editing or open your own markdown file!*
`;

export function App() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [originalMarkdown, setOriginalMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [fileName, setFileName] = useState<string>("sample.md");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  const hasChanges = markdown !== originalMarkdown;
  const canSave = hasChanges || !filePath;

  const extractName = useCallback((pathValue: string) => {
    const normalized = pathValue.trim().replace(/^\"|\"$/g, "");
    return normalized.split(/[\\/]/).pop() || normalized;
  }, []);

  const handleFileRead = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
      setOriginalMarkdown(content);
      setFileName(file.name);
      setFilePath(null);
    };
    reader.readAsText(file);
  }, []);

  const loadFileFromPath = useCallback(
    async (path: string) => {
      const normalized = path.trim().replace(/^\"|\"$/g, "");
      const name = extractName(normalized);

      try {
        const content = await core.invoke<string>("read_markdown_file", {
          path: normalized,
        });
        setMarkdown(content);
        setOriginalMarkdown(content);
        setFileName(name);
        setFilePath(normalized);
        setStatusMessage(null);
      } catch (error) {
        console.error("Failed to open markdown file:", error);
        setStatusMessage({
          text: "Failed to open file. Check the console for details.",
          tone: "error",
        });
      }
    },
    [extractName]
  );

  useEffect(() => {
    let cancelled = false;

    core
      .invoke<string[]>("take_open_files")
      .then((paths) => {
        if (cancelled || !paths?.length) {
          return;
        }

        return loadFileFromPath(paths[0]);
      })
      .catch((error) => {
        console.error("Failed to read startup file list:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [loadFileFromPath]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.match(/\.(md|markdown|txt)$/i)) {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleOpenDialog = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
      });
      if (!selected) {
        return;
      }
      const path = Array.isArray(selected) ? selected[0] : selected;
      await loadFileFromPath(path);
    } catch (error) {
      console.error("Failed to open file dialog:", error);
      setStatusMessage({ text: "Failed to open the file dialog.", tone: "error" });
    }
  }, [loadFileFromPath]);

  const handleSaveAs = useCallback(async () => {
    try {
      const target = await save({
        defaultPath: fileName,
        filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
      });
      if (!target) {
        return;
      }

      await core.invoke("write_markdown_file", {
        path: target,
        contents: markdown,
      });

      setFilePath(target);
      setFileName(extractName(target));
      setOriginalMarkdown(markdown);
      setStatusMessage({ text: "Saved.", tone: "success" });
    } catch (error) {
      console.error("Failed to save markdown file:", error);
      setStatusMessage({
        text: "Failed to save file. Check the console for details.",
        tone: "error",
      });
    }
  }, [extractName, fileName, markdown]);

  const handleSave = useCallback(async () => {
    if (!filePath) {
      await handleSaveAs();
      return;
    }

    try {
      await core.invoke("write_markdown_file", {
        path: filePath,
        contents: markdown,
      });
      setOriginalMarkdown(markdown);
      setStatusMessage({ text: "Saved.", tone: "success" });
    } catch (error) {
      console.error("Failed to save markdown file:", error);
      setStatusMessage({
        text: "Failed to save file. Check the console for details.",
        tone: "error",
      });
    }
  }, [filePath, handleSaveAs, markdown]);

  useEffect(() => {
    if (statusMessage?.tone === "success" && hasChanges) {
      setStatusMessage(null);
    }
  }, [hasChanges, statusMessage]);

  return (
    <div
      className="min-h-screen bg-gray-50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenDialog}
                className="inline-flex cursor-pointer items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 rounded"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Open
              </button>
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <label className="inline-flex cursor-pointer items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 rounded">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import
                <input
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-base font-medium text-gray-900">MD Studio</h1>
            <p className="text-sm text-gray-500">{fileName}</p>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAs}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50"
                type="button"
              >
                Save As
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors",
                  canSave
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-0 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setIsEditing(false)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                !isEditing
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Preview
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                isEditing
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Edit
            </button>
          </div>
        </div>
      </header>

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95">
          <div className="border-2 border-dashed border-gray-400 px-16 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-gray-100">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-900">
              Drop your markdown file here
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Release to view the file
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        {isEditing ? (
          <div className="bg-white border border-gray-200">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[calc(100vh-280px)] min-h-[500px] p-6 font-mono text-sm text-gray-800 resize-none focus:outline-none"
              placeholder="Write your markdown here..."
              spellCheck={false}
            />
          </div>
        ) : (
          <article
            className={cn(
              "prose prose-gray max-w-none bg-white border border-gray-200 p-8",
              "prose-headings:font-medium prose-headings:text-gray-900",
              "prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6",
              "prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4",
              "prose-h3:text-lg",
              "prose-p:text-gray-600 prose-p:leading-7",
              "prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600",
              "prose-strong:text-gray-900 prose-strong:font-medium",
              "prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none prose-code:rounded",
              "prose-pre:bg-[#282c34] prose-pre:p-0 prose-pre:rounded",
              "prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:py-0.5 prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:not-italic prose-blockquote:text-gray-600",
              "prose-ul:text-gray-600 prose-ol:text-gray-600",
              "prose-li:marker:text-gray-400",
              "prose-table:border prose-table:border-gray-200",
              "prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:font-medium prose-th:text-gray-900 prose-th:border prose-th:border-gray-200",
              "prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2.5",
              "prose-hr:border-gray-200"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match && !className;
                  return !isInline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.25rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm text-gray-500">
            {hasChanges && (
              <span className="inline-flex items-center gap-1.5 mr-4">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Unsaved changes
              </span>
            )}
            {statusMessage && (
              <span className="inline-flex items-center gap-1.5 mr-4">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    statusMessage.tone === "success"
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  )}
                ></span>
                {statusMessage.text}
              </span>
            )}
            Drag and drop a{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 rounded">
              .md
            </code>{" "}
            ,{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 rounded">
              .markdown
            </code>
            , or{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 rounded">
              .txt
            </code>{" "}
            file anywhere or use the Open button
          </p>
        </div>
      </footer>
    </div>
  );
}
