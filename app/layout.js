import './globals.css';
import Link from 'next/link';
import { SavingsTicker } from './components/SavingsTicker';

export const metadata = {
  title: 'Sinkhole — Gamified open-source tool vault',
  description: 'Drop pricey utility subscriptions into the Sinkhole and use free tools that actually ship output.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="logo">Sinkhole</Link>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/tools">Tool Vault</Link>
            <Link href="/open-source">Open Source</Link>
          </nav>
          <a className="tip" href="https://buymeacoffee.com/bedmakr" target="_blank" rel="noopener noreferrer">☕ Fuel Build</a>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div>
            <h4>Open source, long term</h4>
            <p>MIT licensed and community maintained, so the toolkit stays usable for everyone.</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
          </div>
          <div>
            <h4>Community savings</h4>
            <SavingsTicker />
          </div>
        </footer>
      </body>
    </html>
  );
}
