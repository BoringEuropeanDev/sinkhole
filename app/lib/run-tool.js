'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { tools } from '.././tools';

export default function ToolPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const tool = useMemo(() => tools.find((t) => t.slug === slug), [slug]);

  const [input, setInput] = useState('');
  const [result, setResult] = useState('Debug ready.');
  const [running, setRunning] = useState(false);

  if (!tool) {
    return (
      <div className="page">
        <h1>Tool not found</h1>
        <pre>{JSON.stringify({ slug }, null, 2)}</pre>
      </div>
    );
  }

  async function run() {
    setRunning(true);
    setResult('clicked');

    try {
      const body = new FormData();
      body.append('slug', tool.slug);
      body.append('text', input || 'hello world');

      setResult(`posting to /api/tools with slug=${tool.slug}`);

      const res = await fetch('/api/tools', {
        method: 'POST',
        body,
      });

      const contentType = res.headers.get('content-type') || '';
      const raw = await res.text();

      setResult(
        JSON.stringify(
          {
            ok: res.ok,
            status: res.status,
            contentType,
            raw,
          },
          null,
          2
        )
      );
    } catch (err) {
      setResult(
        JSON.stringify(
          {
            error: err instanceof Error ? err.message : 'Unknown error',
          },
          null,
          2
        )
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>

      <div className="toolShell">
        <label>
          Input
          <textarea
            placeholder="Type anything here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          />
        </label>

        <button type="button" className="btn" onClick={run} disabled={running}>
          {running ? 'Running...' : 'Run Tool'}
        </button>

        <pre>{result}</pre>
      </div>
    </div>
  );
}
