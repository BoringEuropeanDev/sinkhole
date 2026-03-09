"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { tools } from "../../lib/tools";
import { getInitialOptions, getAcceptValue, runTool } from "../../lib/run-tool";

const toolSEO = {
  'image-compressor':          { title: 'Image Compressor — Free Online, No Signup', description: 'Compress JPG, PNG and WebP images online for free. Reduce image file size instantly — no signup, no upload limits, no watermarks. Works in your browser.', keywords: ['free image compressor', 'compress image online free', 'reduce image size free', 'image size reducer online', 'compress jpg free', 'compress png free', 'compress webp free', 'shrink image file size free', 'image optimizer free', 'optimize image online free', 'tinypng alternative free', 'squoosh alternative free'] },
  'image-converter':           { title: 'Image Converter — Free Online, No Signup', description: 'Convert images between JPG, PNG, WebP, AVIF and TIFF online for free. No signup, no limits. Instant browser-based image format conversion.', keywords: ['free image converter', 'convert image online free', 'jpg to png free', 'png to jpg free', 'jpg to webp free', 'webp to jpg free', 'png to webp free', 'image format converter free', 'avif converter free', 'tiff converter free', 'convertio alternative free', 'cloudconvert alternative free'] },
  'image-resize':              { title: 'Image Resizer — Free Online, No Signup', description: 'Resize images online for free. Change width, height or dimensions of any image instantly — no signup, no watermarks, no limits.', keywords: ['free image resizer', 'resize image online free', 'resize photo online free', 'change image dimensions free', 'scale image free', 'reduce image resolution free', 'iloveimg alternative free'] },
  'image-crop':                { title: 'Image Cropper — Free Online, No Signup', description: 'Crop images online for free. Trim any photo to exact dimensions — no signup, no watermarks, instant results in your browser.', keywords: ['free image cropper', 'crop image online free', 'crop photo online free', 'trim image online free', 'cut image online free'] },
  'image-rotator':             { title: 'Image Rotator — Free Online, No Signup', description: 'Rotate or flip images online for free. Rotate by any angle — 90, 180, 270 degrees or custom. No signup, no watermarks.', keywords: ['free image rotator', 'rotate image online free', 'rotate photo online free', 'flip image online free', 'rotate image 90 degrees free'] },
  'image-blur-tool':           { title: 'Image Blur Tool — Free Online, No Signup', description: 'Blur images online for free. Apply gaussian blur to any photo instantly — no signup, no watermarks, works in your browser.', keywords: ['free image blur tool', 'blur image online free', 'blur photo online free', 'blur background free online', 'gaussian blur image free'] },
  'heic-to-jpg':               { title: 'HEIC to JPG Converter — Free Online, No Signup', description: 'Convert HEIC to JPG free online. Turn iPhone HEIC photos into JPEG instantly — no signup, no app download needed. Works in your browser.', keywords: ['heic to jpg free', 'heic to jpeg free', 'convert heic free', 'iphone photo to jpg free', 'heif to jpg free', 'heic converter online free', 'open heic file free'] },
  'webp-to-png':               { title: 'WebP to PNG Converter — Free Online, No Signup', description: 'Convert WebP images to PNG for free online. Instant conversion, no signup, no watermarks. Works in your browser.', keywords: ['webp to png free', 'convert webp to png free', 'webp to png online', 'save webp as png free'] },
  'background-remover':        { title: 'Background Remover — Free Online, No Signup', description: 'Remove backgrounds from images online for free. Get transparent backgrounds instantly — no signup, no watermarks.', keywords: ['free background remover', 'remove background from image free', 'transparent background maker free', 'background eraser free', 'remove image background free online', 'remove bg alternative free'] },
  'image-format-detector':     { title: 'Image Format Detector — Free Online, No Signup', description: 'Detect image format and view metadata for free. Check file type, dimensions, color space and EXIF data instantly — no signup.', keywords: ['free image format detector', 'detect image format online', 'image metadata viewer free', 'exif viewer online free', 'photo metadata checker free'] },
  'metadata-viewer':           { title: 'Image Metadata Viewer — Free Online, No Signup', description: 'View EXIF and image metadata free online. See dimensions, format, color space, DPI and file size — no signup, instant results.', keywords: ['free metadata viewer', 'view image metadata online free', 'exif data viewer free', 'view exif data free', 'image info viewer free'] },
  'universal-file-converter':  { title: 'Universal File Converter — Free Online, No Signup', description: 'Convert any image file format online for free. JPG, PNG, WebP, AVIF, TIFF and more — no signup, no limits, instant conversion.', keywords: ['free file converter', 'universal file converter free', 'convert any file online free', 'online file converter free', 'cloudconvert alternative free'] },
  'pdf-merge':                 { title: 'PDF Merger — Free Online, No Signup', description: 'Merge PDF files online for free. Combine multiple PDFs into one document instantly — no signup, no watermarks, no limits.', keywords: ['free pdf merger', 'merge pdf files free', 'combine pdf online free', 'join pdf files free', 'pdf combiner free', 'merge multiple pdfs free', 'ilovepdf alternative free', 'smallpdf alternative free'] },
  'pdf-split':                 { title: 'PDF Splitter — Free Online, No Signup', description: 'Split PDF files online for free. Separate PDF pages into individual documents instantly — no signup, no watermarks.', keywords: ['free pdf splitter', 'split pdf online free', 'separate pdf pages free', 'extract pdf pages free', 'divide pdf free', 'ilovepdf alternative free'] },
  'pdf-compress':              { title: 'PDF Compressor — Free Online, No Signup', description: 'Compress PDF files online for free. Reduce PDF file size instantly — no signup, no watermarks, no upload limits.', keywords: ['free pdf compressor', 'compress pdf online free', 'reduce pdf file size free', 'shrink pdf free', 'pdf size reducer free', 'smallpdf alternative free'] },
  'pdf-unlock':                { title: 'PDF Unlocker — Free Online, No Signup', description: 'Remove PDF passwords and unlock protected PDFs online for free — no signup, no watermarks, instant results.', keywords: ['free pdf unlocker', 'remove pdf password free', 'unlock pdf online free', 'pdf password remover free', 'decrypt pdf free', 'open locked pdf free'] },
  'pdf-to-images':             { title: 'PDF to Images Converter — Free Online, No Signup', description: 'Convert PDF pages to JPG or PNG images online for free — no signup, no watermarks, instant conversion.', keywords: ['pdf to images free', 'convert pdf to jpg free', 'pdf to png free', 'pdf page to image free', 'extract images from pdf free'] },
  'video-to-gif':              { title: 'Video to GIF Converter — Free Online, No Signup', description: 'Convert video to GIF online for free. Turn MP4, MOV or any video into an animated GIF instantly — no signup.', keywords: ['free video to gif', 'convert video to gif free', 'mp4 to gif free', 'video to gif converter free', 'make gif from video free', 'ezgif alternative free'] },
  'video-compressor':          { title: 'Video Compressor — Free Online, No Signup', description: 'Compress video online for free. Reduce video file size without losing quality — no signup, no watermarks.', keywords: ['free video compressor', 'compress video online free', 'reduce video size free', 'shrink video file free', 'compress mp4 free'] },
  'video-thumbnail-generator': { title: 'Video Thumbnail Generator — Free Online, No Signup', description: 'Extract thumbnails from videos online for free. Grab any frame as an image — no signup, instant results.', keywords: ['free video thumbnail generator', 'extract thumbnail from video free', 'video screenshot free', 'grab frame from video free'] },
  'word-counter':              { title: 'Word Counter — Free Online, No Signup', description: 'Count words, characters and lines online for free. Paste any text and get instant word count — no signup, no limits.', keywords: ['free word counter', 'count words online free', 'word count tool free', 'character counter free', 'letter counter free', 'line counter free'] },
  'text-case-converter':       { title: 'Text Case Converter — Free Online, No Signup', description: 'Convert text to uppercase, lowercase or title case online for free. Instant text case transformation — no signup.', keywords: ['free text case converter', 'uppercase converter free', 'lowercase converter free', 'title case converter free', 'sentence case converter free'] },
  'duplicate-line-remover':    { title: 'Duplicate Line Remover — Free Online, No Signup', description: 'Remove duplicate lines from text online for free. Deduplicate any list instantly — no signup, no limits.', keywords: ['free duplicate line remover', 'remove duplicate lines free', 'deduplicate text free', 'remove repeated lines free', 'unique lines filter free'] },
  'json-formatter':            { title: 'JSON Formatter — Free Online, No Signup', description: 'Format and validate JSON online for free. Beautify, pretty-print or validate any JSON instantly — no signup.', keywords: ['free json formatter', 'format json online free', 'json beautifier free', 'json pretty print free', 'json validator free', 'json viewer free'] },
  'base64-encoder-decoder':    { title: 'Base64 Encoder & Decoder — Free Online, No Signup', description: 'Encode or decode Base64 strings online for free. Instant Base64 conversion — no signup, no limits.', keywords: ['free base64 encoder', 'free base64 decoder', 'base64 encode online free', 'base64 decode online free', 'encode string base64 free', 'decode base64 string free'] },
  'url-encoder-decoder':       { title: 'URL Encoder & Decoder — Free Online, No Signup', description: 'Encode or decode URLs online for free. Percent-encode or decode any URL string instantly — no signup.', keywords: ['free url encoder', 'free url decoder', 'url encode online free', 'url decode online free', 'percent encode url free'] },
  'markdown-previewer':        { title: 'Markdown Previewer — Free Online, No Signup', description: 'Preview and render Markdown online for free. Live Markdown to HTML preview — no signup, instant results.', keywords: ['free markdown previewer', 'preview markdown online free', 'render markdown free', 'markdown to html free', 'markdown live preview free'] },
  'article-cleaner':           { title: 'Article Cleaner — Free Online, No Signup', description: 'Strip HTML tags and clean article text online for free. Extract plain text from HTML instantly — no signup.', keywords: ['free article cleaner', 'strip html tags free', 'clean html text free', 'remove html formatting free', 'plain text extractor free', 'html to plain text free'] },
  'website-screenshot-generator': { title: 'Website Screenshot Generator — Free Online, No Signup', description: 'Take screenshots of any website online for free. Capture a webpage preview from any URL — no signup.', keywords: ['free website screenshot', 'screenshot website online free', 'capture webpage free', 'website preview free', 'take screenshot of url free'] },
  'webhook-request-bin':       { title: 'Webhook Tester & Request Bin — Free Online, No Signup', description: 'Test and debug webhooks online for free. Capture and inspect HTTP requests instantly — no signup.', keywords: ['free webhook tester', 'webhook request bin free', 'test webhook online free', 'webhook inspector free', 'http request bin free', 'webhook debugger free'] },
};

export async function generateMetadata({ params }) {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) return { title: 'Tool Not Found', description: 'This tool does not exist.' };

  const seo = toolSEO[slug] || {};
  const title = seo.title || `${tool.name} — Free Online Tool, No Signup`;
  const description = seo.description || `${tool.description} Free, instant, no signup required. Works in your browser.`;
  const url = `https://www.sinkhole.app/tools/${slug}`;

  return {
    title,
    description,
    keywords: seo.keywords || [`free ${tool.name.toLowerCase()}`, 'free online tool', 'no signup'],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Sinkhole',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default function ToolPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const tool = useMemo(() => tools.find((t) => t.slug === slug), [slug]);

  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [optionValues, setOptionValues] = useState({});
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  useEffect(() => {
    if (!tool) return;
    setInput('');
    setFiles([]);
    setOptionValues(getInitialOptions(tool));
    setResult(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }
  }, [tool]);

  useEffect(() => {
    return () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); };
  }, [downloadUrl]);

  if (!tool) {
    return <div className="page"><h1>Tool not found</h1></div>;
  }

  const seo = toolSEO[slug] || {};

  async function handleRunTool() {
    if (running) return;
    setRunning(true);
    setResult({ type: 'loading', text: 'Working…' });
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }
    try {
      const response = await runTool({ tool, input, files, optionValues });
      if (!response.ok) {
        setResult({ type: 'error', text: response.message || 'Tool request failed.' });
        return;
      }
      setResult({ type: 'success', text: response.display || 'Done.' });
      if (response.kind === 'file') {
        setDownloadUrl(response.url);
        setDownloadName(response.filename);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      {/* JSON-LD structured data per tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            description: seo.description || tool.description,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            url: `https://www.sinkhole.app/tools/${slug}`,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: (seo.keywords || []).slice(0, 5).join(', '),
            mainEntity: {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `How do I use ${tool.name} for free?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Go to sinkhole.app/tools/${slug}, ${tool.mode === 'file' ? 'upload your file' : 'paste your text'} and click Run Tool. No signup or account required.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `Is ${tool.name} really free?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes. ${tool.name} on Sinkhole is completely free with no signup, no watermarks, and no usage limits.`,
                  },
                },
              ],
            },
          }),
        }}
      />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px' }}>{tool.name}</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>{tool.description}</p>
      </div>

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
                <p style={{ color: 'var(--muted)', margin: '0 0 8px', fontWeight: 600 }}>Options</p>
                {tool.options.map((opt) => (
                  <label key={opt.key}>
                    {opt.label}
                    {opt.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={Boolean(optionValues[opt.key])}
                        onChange={(e) =>
                          setOptionValues((prev) => ({ ...prev, [opt.key]: e.target.checked }))
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
                          setOptionValues((prev) => ({ ...prev, [opt.key]: e.target.value }))
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

        <button
          type="button"
          className="btn"
          onClick={handleRunTool}
          disabled={running}
          style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
        >
          {running ? 'Running…' : 'Run Tool'}
        </button>

        {result && (
          <div style={{
            borderRadius: 8,
            border: `1px solid ${result.type === 'error' ? '#7f1d1d' : result.type === 'loading' ? 'var(--border)' : '#1a4731'}`,
            background: result.type === 'error' ? '#1a0a0a' : result.type === 'loading' ? 'var(--surface-2)' : '#0a1f14',
            padding: '12px 14px',
          }}>
            {result.type === 'loading' && (
              <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>⏳ {result.text}</span>
            )}
            {result.type === 'error' && (
              <span style={{ color: '#f87171' }}>⚠️ {result.text}</span>
            )}
            {result.type === 'success' && (
              <pre style={{
                margin: 0,
                border: 'none',
                background: 'transparent',
                padding: 0,
                color: 'var(--text)',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {result.text}
              </pre>
            )}
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            className="btn"
            style={{ width: '100%', textAlign: 'center', padding: '12px', fontSize: '1rem' }}
          >
            ⬇️ Download {downloadName}
          </a>
        )}
      </div>
    </div>
  );
}
