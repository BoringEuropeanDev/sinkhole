import Link from 'next/link';
import { tools } from '../lib/tools';

export default function ToolsPage() {
  const textTools = tools.filter((t) => t.mode === 'text');
  const fileTools = tools.filter((t) => t.mode === 'file');

  const renderGroup = (title, list) => (
    <section className="toolGroup">
      <h2>{title}</h2>
      <div className="grid">
        {list.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="card"
            prefetch
          >
            <div className="cardHeader">
              <h3>{tool.name}</h3>
              <span className={`badge badge-${tool.mode}`}>
                {tool.mode === 'file' ? 'File Tool' : 'Text Tool'}
              </span>
            </div>

            <p>{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="page">
      <h1>Tool Vault</h1>

      <p className="intro">
        Pick a utility, drop your input, and get output instantly — no credits,
        no accounts, no nonsense.
      </p>

      {renderGroup('Text Utilities', textTools)}
      {renderGroup('File Utilities', fileTools)}
    </div>
  );
}
