import Link from 'next/link';
import { tools } from '../lib/tools';

export default function ToolsPage() {
  return (
    <div className="page">
      <h1>Tool Vault</h1>
      <p>Pick a utility, drop your input, and get output without credits or forced accounts.</p>
      <div className="grid">
        {tools.map((t) => (
          <Link key={t.slug} href={`/tools/${t.slug}`} className="card">
            <h3>{t.name}</h3>
            <p>{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
