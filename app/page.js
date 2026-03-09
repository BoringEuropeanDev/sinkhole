import Link from 'next/link';
import { tools } from './lib/tools';

const stats = [
  { label: 'Tools unlocked', value: '30+' },
  { label: 'Paywalls dodged', value: '∞' },
  { label: 'Account required', value: '0' }
];

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <div className="sinkhole" aria-hidden>
          <span /> <span /> <span />
        </div>
        <p className="kicker">MISSION: De-Subscription The Internet</p>
        <h1>Send overpriced tools into the Sinkhole</h1>
        <p>Fast utilities. Zero sign-up. Real output files. Built to feel like a product, not a template.</p>
        <div className="ctaRow">
          <Link className="btn" href="/tools">Enter the Tool Vault</Link>
          <Link className="btn ghost" href="/open-source">Why this exists</Link>
        </div>
        <div className="statsGrid">
          {stats.map((s) => (
            <article key={s.label} className="statCard">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Trending drops</h2>
        <div className="grid">
          {tools.slice(0, 8).map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="card">
              <h3>{t.name}</h3>
              <p>{t.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
