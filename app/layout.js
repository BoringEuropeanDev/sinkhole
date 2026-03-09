import './globals.css';
import Link from 'next/link';
import { SavingsTicker } from './components/SavingsTicker';

export const metadata = {
  metadataBase: new URL('https://www.sinkhole.app'),
  title: {
    default: 'Sinkhole — Free Online Tools, No Signup',
    template: '%s — Sinkhole',
  },
  description: 'Free online tools for images, PDFs, text and files. Compress, convert, resize, merge and more — instant, no signup, no ads, no limits. Works in your browser.',
  keywords: [
    // ── Brand / generic ───────────────────────────────────────────
    'sinkhole app',
    'sinkhole tools',
    'free online tools',
    'free web tools',
    'free browser tools',
    'free utility tools',
    'no signup tools',
    'no login tools',
    'no account tools',
    'free tools no registration',
    'instant free tools',
    'free tools online 2025',
    'free tools online 2026',
    'open source tools online',
    'free developer tools',
    'free productivity tools',

    // ── Image tools ───────────────────────────────────────────────
    'free image compressor',
    'compress image online free',
    'reduce image size free',
    'image size reducer online',
    'compress jpg free',
    'compress png free',
    'compress webp free',
    'reduce photo size free',
    'shrink image file size free',
    'image optimizer free',
    'optimize image online free',

    'free image converter',
    'convert image online free',
    'jpg to png free',
    'png to jpg free',
    'jpg to webp free',
    'webp to jpg free',
    'png to webp free',
    'webp to png free',
    'image format converter free',
    'convert photo format free',
    'avif converter free',
    'tiff converter free',

    'free image resizer',
    'resize image online free',
    'resize photo online free',
    'change image dimensions free',
    'scale image free',
    'image dimension changer free',
    'reduce image resolution free',

    'free image cropper',
    'crop image online free',
    'crop photo online free',
    'trim image online free',
    'cut image online free',

    'free image rotator',
    'rotate image online free',
    'rotate photo online free',
    'flip image online free',
    'flip photo horizontally free',
    'rotate image 90 degrees free',

    'free image blur tool',
    'blur image online free',
    'blur photo online free',
    'blur background free online',
    'gaussian blur image free',

    'heic to jpg free',
    'heic to jpeg free',
    'convert heic free',
    'iphone photo to jpg free',
    'heif to jpg free',
    'heic converter online free',
    'open heic file free',

    'webp to png free',
    'convert webp to png free',
    'webp to png online',
    'save webp as png free',

    'free background remover',
    'remove background from image free',
    'transparent background maker free',
    'background eraser free',
    'remove image background free online',
    'cut out background free',

    'free image metadata viewer',
    'view exif data free',
    'exif viewer online free',
    'image info viewer free',
    'photo metadata checker free',
    'image format detector free',

    'free file converter',
    'universal file converter free',
    'convert any file online free',
    'online file converter free',

    // ── PDF tools ─────────────────────────────────────────────────
    'free pdf merger',
    'merge pdf files free',
    'combine pdf online free',
    'join pdf files free',
    'pdf combiner free',
    'merge multiple pdfs free',
    'free pdf joiner',

    'free pdf splitter',
    'split pdf online free',
    'separate pdf pages free',
    'extract pdf pages free',
    'divide pdf free',
    'cut pdf free online',

    'free pdf compressor',
    'compress pdf online free',
    'reduce pdf file size free',
    'shrink pdf free',
    'pdf size reducer free',
    'optimize pdf free',

    'free pdf unlocker',
    'remove pdf password free',
    'unlock pdf online free',
    'pdf password remover free',
    'decrypt pdf free',
    'open locked pdf free',

    'pdf to images free',
    'convert pdf to jpg free',
    'pdf to png free',
    'pdf page to image free',
    'extract images from pdf free',
    'pdf to picture free',

    // ── Video tools ───────────────────────────────────────────────
    'free video to gif',
    'convert video to gif free',
    'mp4 to gif free',
    'video to gif converter free',
    'make gif from video free',

    'free video compressor',
    'compress video online free',
    'reduce video size free',
    'shrink video file free',
    'video size reducer free',
    'compress mp4 free',

    'free video thumbnail generator',
    'extract thumbnail from video free',
    'video screenshot free',
    'grab frame from video free',

    // ── Text tools ────────────────────────────────────────────────
    'free word counter',
    'count words online free',
    'word count tool free',
    'character counter free',
    'letter counter free',
    'line counter free',
    'word frequency counter free',

    'free text case converter',
    'uppercase converter free',
    'lowercase converter free',
    'title case converter free',
    'convert text to uppercase free',
    'convert text to lowercase free',
    'sentence case converter free',

    'free duplicate line remover',
    'remove duplicate lines free',
    'deduplicate text free',
    'remove repeated lines free',
    'unique lines filter free',

    'free json formatter',
    'format json online free',
    'json beautifier free',
    'json pretty print free',
    'json validator free',
    'json viewer free',
    'minify json free',

    'free base64 encoder',
    'free base64 decoder',
    'base64 encode online free',
    'base64 decode online free',
    'encode string base64 free',
    'decode base64 string free',

    'free url encoder',
    'free url decoder',
    'url encode online free',
    'url decode online free',
    'percent encode url free',
    'encode url parameters free',

    'free markdown previewer',
    'preview markdown online free',
    'render markdown free',
    'markdown renderer free',
    'markdown to html free',
    'markdown live preview free',

    'free article cleaner',
    'strip html tags free',
    'clean html text free',
    'remove html formatting free',
    'plain text extractor free',
    'html to plain text free',

    // ── Web / dev tools ───────────────────────────────────────────
    'free website screenshot',
    'screenshot website online free',
    'capture webpage free',
    'website preview free',
    'webpage screenshot tool free',
    'take screenshot of url free',

    'free webhook tester',
    'webhook request bin free',
    'test webhook online free',
    'webhook inspector free',
    'http request bin free',
    'webhook debugger free',

    // ── Intent-based ──────────────────────────────────────────────
    'how to compress image free',
    'how to convert heic to jpg free',
    'how to merge pdf free',
    'how to remove background free',
    'how to resize image online free',
    'how to split pdf free',
    'how to compress pdf free',
    'how to unlock pdf free',
    'how to convert image format free',
    'how to blur image free',
    'how to rotate image free',
    'how to count words free',
    'how to format json free',
    'how to encode base64 free',
    'how to remove duplicate lines free',

    // ── Competitor displacement ───────────────────────────────────
    'tinypng alternative free',
    'ilovepdf alternative free',
    'smallpdf alternative free',
    'squoosh alternative free',
    'remove bg alternative free',
    'iloveimg alternative free',
    'online convert alternative free',
    'cloudconvert alternative free',
    'ezgif alternative free',
    'convertio alternative free',
  ],
  authors: [{ name: 'Sinkhole', url: 'https://www.sinkhole.app' }],
  creator: 'Sinkhole',
  publisher: 'Sinkhole',
  alternates: {
    canonical: 'https://www.sinkhole.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.sinkhole.app',
    siteName: 'Sinkhole',
    title: 'Sinkhole — Free Online Tools, No Signup',
    description: 'Free online tools for images, PDFs, text and files. No signup, no ads, no limits. Works in your browser.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sinkhole — Free Online Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sinkhole — Free Online Tools, No Signup',
    description: 'Free tools for images, PDFs, text and files. No signup, no limits.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Sinkhole',
              url: 'https://www.sinkhole.app',
              description: 'Free online tools for images, PDFs, text and files. No signup required.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.sinkhole.app/tools?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

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
            <a href="https://github.com/BoringEuropeanDev/sinkhole" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
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
