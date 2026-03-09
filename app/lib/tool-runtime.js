'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { tools } from '../../lib/tools';
import {
  getInitialOptions,
  getAcceptValue,
  runToolRequest,
} from '../../lib/tool-runtime';

export default function ToolPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const tool = useMemo(() => tools.find((t) => t.slug === slug), [slug]);

  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [optionValues, setOptionValues] = useState({});
  const [result, setResult] = useState('Run a tool to see the output.');
  const [running, setRunning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  useEffect(() => {
    if (!tool) return;
    setInput('');
    setFiles([]);
    setOptionValues(getInitialOptions(tool));
    setResult('Run a tool to see the output.');

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
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

  async function run() {
    if (running) return;

    setRunning(true);
    setResult('Working...');

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }

    const response = await runToolRequest({
      tool,
      input,
      files,
      optionValues,
    });

    if (!response.ok) {
      setResult(response.message || 'Tool request failed.');
      setRunning(false);
      return;
    }

    setResult(response.display || 'Done.');

    if (response.kind === 'file') {
      setDownloadUrl(response.url);
      setDownloadName(response.filename);
    }

    setRunning(false);
  }

  return (
    <div className="page">
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>

      <div className="toolShell">
        {tool.mode === 'text' && (
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

        {tool.mode === 'file' && (
          <>
            {!!tool.options?.length && (
              <div className="toolOptions">
                <h3>Options</h3>
                {tool.options.map((opt) => (
                  <label key={opt.key}>
                    {opt.label}
                    {opt.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={Boolean(optionValues[opt.key])}
                        onChange={(e) =>
                          setOptionValues((prev) => ({
                            ...prev,
                            [opt.key]: e.target.checked,
                          }))
                        }
                      />
                    ) : (
                      <input
                        type={opt.type === 'number' ? 'number' : 'text'}
                        value={optionValues[opt.key] ?? ''}
                        min={opt.min}
                        max={opt.max}
                        step={opt.step}
                        placeholder={opt.placeholder}
                        onChange={(e) =>
                          setOptionValues((prev) => ({
                            ...prev,
                            [opt.key]: e.target.value,
                          }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            )}

            <label>
              {tool.acceptsMultipleFiles ? 'Files' : 'File'}
              <input
                type="file"
                accept={getAcceptValue(tool.slug)}
                multiple={Boolean(tool.acceptsMultipleFiles)}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
          </>
        )}

        <button type="button" className="btn" onClick={run} disabled={running}>
          {running ? 'Running...' : 'Run Tool'}
        </button>

        {downloadUrl && (
          <p>
            <a href={downloadUrl} download={downloadName}>
              Download result
            </a>
          </p>
        )}

        <pre>{result}</pre>
      </div>
    </div>
  );
}
