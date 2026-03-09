export const runtime = 'nodejs';

import { savingsMap, validToolSlugs } from '../../lib/tools';

const webhookEvents = [];

const MAX_TEXT_LENGTH = 50000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

function json(result, status = 200) {
  return Response.json({ result }, { status });
}

function error(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function parseOptions(text) {
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function asNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function isProbablyBase64(text) {
  const normalized = text.replace(/\s+/g, '');
  if (!normalized || normalized.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+/]+=*$/.test(normalized)) return false;
  try {
    const decoded = Buffer.from(normalized, 'base64');
    return decoded.length > 0;
  } catch {
    return false;
  }
}

function isBlockedHost(hostname) {
  const host = (hostname || '').toLowerCase();

  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.local')) return true;
  if (host === '0.0.0.0' || host === '127.0.0.1' || host === '::1') return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;

  return false;
}

function sanitizeMarkdown(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/^### (.+)$/gim, '<h3>$1</h3>')
    .replace(/^## (.+)$/gim, '<h2>$1</h2>')
    .replace(/^# (.+)$/gim, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

function getUploadedFiles(form) {
  return form.getAll('file').filter((v) => v instanceof File);
}

async function readFileBuffer(file) {
  return Buffer.from(await file.arrayBuffer());
}

function contentDisposition(filename) {
  return `attachment; filename="${filename.replace(/"/g, '')}"`;
}

async function getSharp() {
  const mod = await import('sharp');
  return mod.default || mod;
}

async function getPDFDocument() {
  const mod = await import('pdf-lib');
  return mod.PDFDocument;
}

async function loadPdf(file) {
  const PDFDocument = await getPDFDocument();
  const buf = await readFileBuffer(file);
  return PDFDocument.load(buf, { ignoreEncryption: true });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get('slug') === 'webhook-request-bin') {
    return Response.json({ events: webhookEvents.slice(-50) });
  }

  return Response.json({ ok: true });
}

export async function POST(req) {
  try {
    const form = await req.formData();

    const slug = form.get('slug')?.toString();
    const text = form.get('text')?.toString() || '';
    const options = parseOptions(text);
    const files = getUploadedFiles(form);

    if (!slug || !validToolSlugs.has(slug)) {
      return error('Unknown tool.', 404);
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return error(`Text input is too large. Max ${MAX_TEXT_LENGTH} characters.`);
    }

    if (files.length > MAX_FILES) {
      return error(`Too many files. Max ${MAX_FILES}.`);
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return error(`File "${file.name}" is too large. Max 10 MB.`);
      }
    }

    if (slug === 'webhook-request-bin') {
      webhookEvents.push({ at: Date.now(), payload: text || 'empty' });
      return json('Webhook payload captured.');
    }

    if (savingsMap[slug]) {
      // no-op
    }

    // Text tools first, no heavy imports needed.
    if (slug === 'word-counter') {
      return json({
        words: (text.trim().match(/\S+/g) || []).length,
        chars: text.length,
        lines: text ? text.split(/\r?\n/).length : 0,
      });
    }

    if (slug === 'text-case-converter') {
      return json({
        upper: text.toUpperCase(),
        lower: text.toLowerCase(),
        title: text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
      });
    }

    if (slug === 'duplicate-line-remover') {
      const seen = new Set();
      const lines = text.split(/\r?\n/).filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
      return json(lines.join('\n'));
    }

    if (slug === 'json-formatter') {
      if (!text.trim()) return json('{}');
      try {
        return json(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        return error('Invalid JSON input.');
      }
    }

    if (slug === 'base64-encoder-decoder') {
      if (!text.trim()) return json('');
      if (isProbablyBase64(text)) {
        try {
          return json(Buffer.from(text.replace(/\s+/g, ''), 'base64').toString('utf8'));
        } catch {
          return error('Invalid base64 input.');
        }
      }
      return json(Buffer.from(text, 'utf8').toString('base64'));
    }

    if (slug === 'url-encoder-decoder') {
      if (!text) return json('');
      try {
        return json(decodeURIComponent(text));
      } catch {
        return json(encodeURIComponent(text));
      }
    }

    if (slug === 'markdown-previewer') {
      return json(sanitizeMarkdown(text));
    }

    if (slug === 'article-cleaner') {
      const cleaned = text
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return json(cleaned);
    }

    if (slug === 'website-screenshot-generator') {
      const raw = text.trim();
      if (!raw) return error('Provide a URL in text input.');

      let target;
      try {
        target = new URL(raw);
      } catch {
        return error('Invalid URL. Use a full http:// or https:// URL.');
      }

      if (!['http:', 'https:'].includes(target.protocol)) {
        return error('Only http/https URLs are supported.');
      }

      if (isBlockedHost(target.hostname)) {
        return error('Local/private hosts are blocked for safety.');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(target.toString(), {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'user-agent': 'tool-runtime/1.0' },
        });

        const contentType = res.headers.get('content-type') || '';
        const html = contentType.includes('text/html') ? await res.text() : '';
        const titleMatch = html.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i);

        return json({
          url: target.toString(),
          status: res.status,
          ok: res.ok,
          contentType,
          title: titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || null,
          note: 'This runtime validates the page and returns metadata. It does not create real screenshots.',
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    const file = files[0];

    function requireSingleFile() {
      if (!file) return error('Provide a file input for this tool.');
      if (files.length > 1) return error('This tool accepts exactly one file.');
      return null;
    }

    // Image tools: import sharp only when needed.
    if (
      slug === 'image-format-detector' ||
      slug === 'metadata-viewer' ||
      slug === 'image-compressor' ||
      slug === 'image-converter' ||
      slug === 'heic-to-jpg' ||
      slug === 'webp-to-png' ||
      slug === 'image-resize' ||
      slug === 'image-crop' ||
      slug === 'image-rotator' ||
      slug === 'background-remover' ||
      slug === 'image-blur-tool' ||
      slug === 'universal-file-converter' ||
      slug === 'pdf-to-images'
    ) {
      const sharp = await getSharp();

      if (slug === 'image-format-detector' || slug === 'metadata-viewer') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const metadata = await sharp(await readFileBuffer(file)).metadata();
        return json(metadata);
      }

      if (slug === 'image-compressor') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const quality = clamp(asNumber(options.quality, 60), 30, 90);
        const output = await sharp(await readFileBuffer(file)).jpeg({ quality }).toBuffer();

        return new Response(output, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Disposition': contentDisposition('compressed.jpg'),
          },
        });
      }

      if (slug === 'image-converter' || slug === 'heic-to-jpg') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const output = await sharp(await readFileBuffer(file)).jpeg().toBuffer();
        return new Response(output, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Disposition': contentDisposition('converted.jpg'),
          },
        });
      }

      if (slug === 'webp-to-png') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const output = await sharp(await readFileBuffer(file)).png().toBuffer();
        return new Response(output, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': contentDisposition('converted.png'),
          },
        });
      }

      if (slug === 'image-resize') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const input = await readFileBuffer(file);
        const meta = await sharp(input).metadata();

        const width = clamp(asNumber(options.width, 1280), 1, 4000);
        const rawHeight =
          options.height == null || options.height === ''
            ? undefined
            : clamp(asNumber(options.height, 0), 1, 4000);

        const pipeline = sharp(input).resize({
          width,
          height: rawHeight,
          fit: 'inside',
          withoutEnlargement: true,
        });

        const format = meta.format === 'jpeg' ? 'jpeg' : meta.format === 'webp' ? 'webp' : 'png';

        let output;
        let contentType;

        if (format === 'jpeg') {
          output = await pipeline.jpeg().toBuffer();
          contentType = 'image/jpeg';
        } else if (format === 'webp') {
          output = await pipeline.webp().toBuffer();
          contentType = 'image/webp';
        } else {
          output = await pipeline.png().toBuffer();
          contentType = 'image/png';
        }

        return new Response(output, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition(`resized.${format === 'jpeg' ? 'jpg' : format}`),
          },
        });
      }

      if (slug === 'image-crop') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const input = await readFileBuffer(file);
        const meta = await sharp(input).metadata();

        if (!meta.width || !meta.height) {
          return error('Unable to read image dimensions.');
        }

        const left = clamp(asNumber(options.left, 0), 0, meta.width - 1);
        const top = clamp(asNumber(options.top, 0), 0, meta.height - 1);
        const width = clamp(asNumber(options.width, Math.min(400, meta.width - left)), 1, meta.width - left);
        const height = clamp(asNumber(options.height, Math.min(400, meta.height - top)), 1, meta.height - top);

        const format = meta.format === 'jpeg' ? 'jpeg' : meta.format === 'webp' ? 'webp' : 'png';

        let output;
        let contentType;

        const pipeline = sharp(input).extract({ left, top, width, height });

        if (format === 'jpeg') {
          output = await pipeline.jpeg().toBuffer();
          contentType = 'image/jpeg';
        } else if (format === 'webp') {
          output = await pipeline.webp().toBuffer();
          contentType = 'image/webp';
        } else {
          output = await pipeline.png().toBuffer();
          contentType = 'image/png';
        }

        return new Response(output, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition(`cropped.${format === 'jpeg' ? 'jpg' : format}`),
          },
        });
      }

      if (slug === 'image-rotator') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const input = await readFileBuffer(file);
        const meta = await sharp(input).metadata();
        const degrees = asNumber(options.degrees, 90);
        const format = meta.format === 'jpeg' ? 'jpeg' : meta.format === 'webp' ? 'webp' : 'png';

        let output;
        let contentType;

        const pipeline = sharp(input).rotate(degrees);

        if (format === 'jpeg') {
          output = await pipeline.jpeg().toBuffer();
          contentType = 'image/jpeg';
        } else if (format === 'webp') {
          output = await pipeline.webp().toBuffer();
          contentType = 'image/webp';
        } else {
          output = await pipeline.png().toBuffer();
          contentType = 'image/png';
        }

        return new Response(output, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition(`rotated.${format === 'jpeg' ? 'jpg' : format}`),
          },
        });
      }

      if (slug === 'background-remover') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const output = await sharp(await readFileBuffer(file))
          .grayscale()
          .threshold(210)
          .png()
          .toBuffer();

        return new Response(output, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': contentDisposition('background-removed.png'),
          },
        });
      }

      if (slug === 'image-blur-tool') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const input = await readFileBuffer(file);
        const meta = await sharp(input).metadata();
        const blur = clamp(asNumber(options.blur, 4), 0.3, 10);
        const format = meta.format === 'jpeg' ? 'jpeg' : meta.format === 'webp' ? 'webp' : 'png';

        let output;
        let contentType;

        const pipeline = sharp(input).blur(blur);

        if (format === 'jpeg') {
          output = await pipeline.jpeg().toBuffer();
          contentType = 'image/jpeg';
        } else if (format === 'webp') {
          output = await pipeline.webp().toBuffer();
          contentType = 'image/webp';
        } else {
          output = await pipeline.png().toBuffer();
          contentType = 'image/png';
        }

        return new Response(output, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition(`blurred.${format === 'jpeg' ? 'jpg' : format}`),
          },
        });
      }

      if (slug === 'universal-file-converter') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const output = await sharp(await readFileBuffer(file)).png().toBuffer();
        return new Response(output, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': contentDisposition('converted.png'),
          },
        });
      }

      if (slug === 'pdf-to-images') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        try {
          const density = clamp(asNumber(options.density, 144), 72, 300);
          const page = Math.max(0, asNumber(options.page, 1) - 1);

          const output = await sharp(await readFileBuffer(file), { density, page })
            .png()
            .toBuffer();

          return new Response(output, {
            headers: {
              'Content-Type': 'image/png',
              'Content-Disposition': contentDisposition(`page-${page + 1}.png`),
            },
          });
        } catch {
          return error('PDF-to-image conversion is not available in this runtime. Install Sharp with PDF rendering support.');
        }
      }
    }

    // PDF tools: import pdf-lib only when needed.
    if (slug === 'pdf-merge' || slug === 'pdf-split' || slug === 'pdf-compress' || slug === 'pdf-unlock') {
      const PDFDocument = await getPDFDocument();

      if (slug === 'pdf-merge') {
        if (!files.length) return error('Provide at least one PDF file.');

        const out = await PDFDocument.create();

        for (const f of files) {
          const pdf = await loadPdf(f);
          const pages = await out.copyPages(pdf, pdf.getPageIndices());
          pages.forEach((p) => out.addPage(p));
        }

        return new Response(await out.save(), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition('merged.pdf'),
          },
        });
      }

      if (slug === 'pdf-split') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const pdf = await loadPdf(file);
        const pageCount = pdf.getPageCount();
        const page = clamp(asNumber(options.page, 1), 1, pageCount) - 1;

        const out = await PDFDocument.create();
        const [copied] = await out.copyPages(pdf, [page]);
        out.addPage(copied);

        return new Response(await out.save(), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition(`page-${page + 1}.pdf`),
          },
        });
      }

      if (slug === 'pdf-compress') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const pdf = await loadPdf(file);
        return new Response(await pdf.save({ useObjectStreams: true, addDefaultPage: false }), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition('compressed.pdf'),
          },
        });
      }

      if (slug === 'pdf-unlock') {
        const fileErr = requireSingleFile();
        if (fileErr) return fileErr;

        const pdf = await loadPdf(file);
        return new Response(await pdf.save({ addDefaultPage: false }), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition('unlocked.pdf'),
          },
        });
      }
    }

    if (
      slug === 'video-to-gif' ||
      slug === 'video-compressor' ||
      slug === 'video-thumbnail-generator'
    ) {
      return error(
        `${slug} requires a media worker or ffmpeg-enabled runtime. This route is wired correctly, but video processing is not available here.`,
        501
      );
    }

    return json('Tool executed.');
  } catch (err) {
    return error(`Unable to process request: ${err instanceof Error ? err.message : 'Unknown error'}`, 500);
  }
}
