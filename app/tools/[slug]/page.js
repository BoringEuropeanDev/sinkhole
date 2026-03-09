"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { tools } from "../../lib/tools";
import {
  getInitialOptions,
  getAcceptValue,
  runTool,
} from "../../lib/run-tool";

export default function ToolPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const tool = useMemo(() => tools.find((t) => t.slug === slug), [slug]);

  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [optionValues, setOptionValues] = useState({});
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");

  useEffect(() => {
    if (!tool) return;
    setInput("");
    setFiles([]);
    setOptionValues(getInitialOptions(tool));
    setResult(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
      setDownloadName("");
    }
  }, [tool]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  if (!tool) {
    return (
      <div className="page">
        <h1>Tool not found</h1>
      </div>
    );
  }

  async function handleRunTool() {
    if (running) return;
    setRunning(true);
    setResult({ type: "loading", text: "Working…" });
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
      setDownloadName("");
    }

    try {
      const response = await runTool({ tool, input, files, optionValues });

      if (!response.ok) {
        setResult({ type: "error", text: response.message || "Tool request failed." });
        return;
      }

      setResult({ type: "success", text: response.display || "Done." });

      if (response.kind === "file") {
        setDownloadUrl(response.url);
        setDownloadName(response.filename);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px" }}>{tool.name}</h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>{tool.description}</p>
      </div>

      <div className="toolShell">
        {tool.mode === "text" && (
          <label>
            Input
            <textarea
              placeholder="Paste text or a URL here"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
            />
          </label>
        )}

        {tool.mode === "file" && (
          <>
            {!!tool.options?.length && (
              <div className="toolOptions">
                <p style={{ color: "var(--muted)", margin: "0 0 8px", fontWeight: 600 }}>Options</p>
                {tool.options.map((opt) => (
                  <label key={opt.key}>
                    {opt.label}
                    {opt.type === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(optionValues[opt.key])}
                        onChange={(e) =>
                          setOptionValues((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                        }
                      />
                    ) : (
                      <input
                        type={opt.type === "number" ? "number" : "text"}
                        value={optionValues[opt.key] ?? ""}
                        min={opt.min}
                        max={opt.max}
                        step={opt.step}
                        placeholder={opt.placeholder}
                        onChange={(e) =>
                          setOptionValues((prev) => ({ ...prev, [opt.key]: e.target.value }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            )}

            <label>
              {tool.acceptsMultipleFiles ? "Files" : "File"}
              <input
                type="file"
                accept={getAcceptValue(tool.slug)}
                multiple={Boolean(tool.acceptsMultipleFiles)}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
          </>
        )}

        <button
          type="button"
          className="btn"
          onClick={handleRunTool}
          disabled={running}
          style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
        >
          {running ? "Running…" : "Run Tool"}
        </button>

        {/* Result box — only shows after clicking Run */}
        {result && (
          <div style={{
            borderRadius: 8,
            border: `1px solid ${result.type === "error" ? "#7f1d1d" : result.type === "loading" ? "var(--border)" : "#1a4731"}`,
            background: result.type === "error" ? "#1a0a0a" : result.type === "loading" ? "var(--surface-2)" : "#0a1f14",
            padding: "12px 14px",
          }}>
            {result.type === "loading" && (
              <span style={{ color: "var(--muted)", fontStyle: "italic" }}>⏳ {result.text}</span>
            )}
            {result.type === "error" && (
              <span style={{ color: "#f87171" }}>⚠️ {result.text}</span>
            )}
            {result.type === "success" && (
              <pre style={{
                margin: 0,
                border: "none",
                background: "transparent",
                padding: 0,
                color: "var(--text)",
                fontSize: "0.9rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {result.text}
              </pre>
            )}
          </div>
        )}

        {/* Download button */}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            className="btn"
            style={{
              width: "100%",
              textAlign: "center",
              padding: "12px",
              fontSize: "1rem",
            }}
          >
            ⬇️ Download {downloadName}
          </a>
        )}
      </div>
    </div>
  );
}
