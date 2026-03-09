'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { tools } from '../../lib/tools';

function getInitialOptions(tool) {
  if (!tool?.options?.length) return {};
  return Object.fromEntries(
    tool.options.map((opt) => [opt.key, opt.defaultValue ?? ''])
  );
}

function getAcceptValue(slug) {
  if (
    [
      'image-compressor',
      'image-converter',
      'image-resize',
      'image-crop',
      'image-rotator',
      'image-format-detector',
      'background-remover',
      'image-blur-tool',
      'universal-file-converter',
      'heic-to-jpg',
      'webp-to-png',
      'metadata-viewer',
    ].includes(slug)
  ) {
    return 'image/*,.heic,.heif,.webp,.jpg,.jpeg,.png';
  }

  if (
    ['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-unlock', 'pdf-to-images'].includes(slug)
  ) {
    return '.pdf,application/pdf';
  }

  if (
    ['video-to-gif', 'video-compressor', 'video-thumbnail-generator'].includes(slug)
  ) {
    return 'video/*';
  }

  return undefined;
}

function buildTextPayload(tool, input, optionValues) {
  if (tool.mode === 'text') {
    return input || '';
  }

  const cleaned = {};

  for (const [key, value] of Object.entries(optionValues || {})) {
    if (value === '' || value === null || value === undefined) continue;

    const option = tool.options?.find((opt) => opt.key === key);

    if (option?.type === 'number') {
      const n = Number(value);
      if (Number.isFinite(n)) cleaned[key] = n;
      continue;
    }

    if (option?.type === 'boolean') {
      cleaned[key] = Boolean(value);
      continue;
    }

    cleaned[key] = value;
  }

  return JSON.stringify(cleaned);
}

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

    try {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl('');
        setDownloadName('');
      }

      if (tool.mode === 'file' && files.length === 0) {
        setResult('Please choose a file first.');
        return;
      }

      if (tool.mode === 'text' && !String(input || '').trim()) {
        setResult('Please enter some input first.');
        return;
      }

      const body = new FormData();
      body.append('slug', tool.slug);
      body.append('text', buildTextPayload(tool, input, optionValues));

      for (const file of files) {
        body.append('file', file);
      }

      const res = await fetch('/api/tools', {
        method: 'POST',
        body,
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          setResult(String(data?.error || `Tool request failed with status ${res.status}.`));
        } else {
          const text = await res.text().catch(() => '');
          setResult(text || `Tool request failed with status ${res.status}.`);
        }
        return;
      }

      if (contentType.includes('application/json')) {
        const data = await res.json();
        const value = data?.result;
        setResult(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/i);
      const filename = match?.[1] || `tool-output-${tool.slug}`;

      setDownloadUrl(url);
      setDownloadName(filename);
      setResult(`Download ready: ${filename}`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Unexpected error while running tool.');
    } finally {
      setRunning(false);
    }
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
