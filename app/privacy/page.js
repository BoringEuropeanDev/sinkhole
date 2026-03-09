export const metadata = {
  title: 'Privacy Policy — Sinkhole',
  description: 'Privacy policy for Sinkhole — free online tools. We do not store your files or personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--muted)' }}>Last updated: March 2026</p>

      <h2>The short version</h2>
      <p>
        Sinkhole does not collect, store or sell your personal data or the files you process.
        Most tools run entirely in your browser. File-based tools send your file to our server
        to process it, then immediately return the result — we do not retain uploaded files.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Nothing you upload.</strong> Files sent to our API are processed in memory and discarded immediately. We do not write them to disk or any database.</li>
        <li><strong>No account data.</strong> There is no login, no account, no email collection of any kind.</li>
        <li><strong>Basic analytics (optional).</strong> We may use privacy-friendly, cookie-free analytics (e.g. Vercel Analytics) to count page visits. No personal identifiers are tracked.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Sinkhole does not use tracking cookies or third-party advertising cookies.
        Session functionality does not require cookies.
      </p>

      <h2>Third-party services</h2>
      <ul>
        <li><strong>Vercel</strong> — hosts the application. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel's privacy policy</a>.</li>
        <li><strong>GitHub</strong> — hosts the source code. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub's privacy policy</a>.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Since we collect no personal data, there is nothing to request deletion of.
        If you have any questions, open an issue on our{' '}
        <a href="https://github.com/BoringEuropeanDev/sinkhole" target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes materially, we will update the date at the top of this page.
        Continued use of Sinkhole after changes constitutes acceptance.
      </p>
    </div>
  );
}
