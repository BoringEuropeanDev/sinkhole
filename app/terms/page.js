export const metadata = {
  title: 'Terms of Use — Sinkhole',
  description: 'Terms of use for Sinkhole — free online tools. Free to use, MIT licensed, no warranty.',
};

export default function TermsPage() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1>Terms of Use</h1>
      <p style={{ color: 'var(--muted)' }}>Last updated: March 2026</p>

      <h2>Using Sinkhole</h2>
      <p>
        Sinkhole is a free, open-source collection of browser-based utilities. You may use
        it for personal or commercial purposes at no cost. No account or payment is required.
      </p>

      <h2>What you may not do</h2>
      <ul>
        <li>Use the service to process illegal content or violate third-party rights.</li>
        <li>Attempt to overload, attack or reverse-engineer our API infrastructure.</li>
        <li>Resell or white-label access to Sinkhole as if it were your own paid service.</li>
      </ul>

      <h2>No warranty</h2>
      <p>
        Sinkhole is provided <strong>"as is"</strong> without warranty of any kind.
        We make no guarantees about uptime, accuracy of output, or fitness for a specific purpose.
        Use at your own risk — always keep backups of important files.
      </p>

      <h2>Open source</h2>
      <p>
        The source code is MIT licensed and available on{' '}
        <a href="https://github.com/BoringEuropeanDev/sinkhole" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>.
        You are free to fork, modify and self-host it under the terms of the MIT license.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Sinkhole and its contributors shall not be
        liable for any damages arising from the use or inability to use this service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or concerns? Open an issue on{' '}
        <a href="https://github.com/BoringEuropeanDev/sinkhole" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>.
      </p>
    </div>
  );
}
