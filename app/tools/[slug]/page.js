'use client';

import { useMemo, useState } from 'react';
import { tools } from '../../lib/tools';

export default function ToolPage({ params }) {
  const tool = useMemo(() => tools.find((t) => t.slug === params.slug), [params.slug]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('Run a tool to see the output.');
  const [running, setRunning] = useState(false);

  if (!tool) return <div className="page"><h1>Tool not found</h1></div>;

  const run = async () => {
    setRunning(true);
    setResult('Working...');
    try {
      const body = new FormData();
      if (file) body.append('file', file);
      body.append('text', input);
      body.append('slug', tool.slug);

      const res = await fetch('/api/tools', { method: 'POST', body });
      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        const message = contentType.includes('application/json') ? (await res.json()).error : 'Tool request failed.';
        setResult(String(message || 'Tool request failed.'));
        return;
      }

      if (contentType.includes('application/json')) {
        const data = await res.json();
        setResult(typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2));
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResult(`Download ready: ${url}`);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setResult('Tool failed due to an unexpected error.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page">
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>
      <div className="toolShell">
        <label>
          Input
          <textarea
            placeholder={'Paste text/URL, or JSON options like {"width":1200,"quality":70} for file tools'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        {tool.mode === 'file' && (
          <label>
            File
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        )}
        <button className="btn" onClick={run} disabled={running}>{running ? 'Running...' : 'Run tool'}</button>
        <pre>{result}</pre>
      </div>
    </div>
  );
}
