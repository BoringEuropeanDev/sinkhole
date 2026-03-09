export const runtime = 'nodejs';

import { validToolSlugs } from '../../lib/tools';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const webhookEvents = [];
const MAX_TEXT_LENGTH = 50000;

function json(result, status = 200) {
  return Response.json({ result }, { status });
}

function error(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function fileResponse(buffer, mimeType, filename) {
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function isProbablyBase64(text) {
  const normalized = text.replace(/\s+/g, '');
  if (!normalized || normalized.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+/]+=*$/.test(normalized)) return false;
  try { Buffer.from(normalized, 'base64'); return true; } catch { return false; }
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
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .replace(/^### (.+)$/gim, '<h3>$1</h3>')
    .replace(/^## (.+)$/gim, '<h2>$1</h2>')
    .replace(/^# (.+)$/gim, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('slug') === 'webhook-request-bin') {
    return Response.json({ events: webhookEvents.slice(-50) });
  }
  return Response.json({ ok: true, message: 'api-tools-live' });
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const slug = form.get('slug')?.toString() || '';
    const text = form.get('text')?.toString() || '';

    if (!slug || !validToolSlugs.has(slug)) {
      return error(`Unknown tool: ${slug || '(empty)'}`, 404);
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return error(`Text input is too large. Max ${MAX_TEXT_LENGTH} characters.`);
    }

    // ── Text tools ────────────────────────────────────────────────

    if (slug === 'webhook-request-bin') {
      webhookEvents.push({ at: Date.now(), payload: text || 'empty' });
      return json('Webhook payload captured.');
    }

    if (slug === 'word-counter') {
      const words = (text.trim().match(/\S+/g) || []).length;
      const chars = text.length;
      const lines = text ? text.split(/\r?\n/).length : 0;
      return json(`Words:      ${words}\nCharacters: ${chars}\nLines:      ${lines}`);
    }

    if (slug === 'text-case-converter') {
      const upper = text.toUpperCase();
      const lower = text.toLowerCase();
      const title = text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
      return json(`UPPERCASE:\n${upper}\n\nlowercase:\n${lower}\n\nTitle Case:\n${title}`);
    }

    if (slug === 'duplicate-line-remover') {
      const seen = new Set();
      const lines = text.split(/\r?\n/).filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
      const removed = text.split(/\r?\n/).length - lines.length;
      return json(`${lines.join('\n')}\n\n— ${removed} duplicate line${removed === 1 ? '' : 's'} removed.`);
    }

    if (slug === 'json-formatter') {
      if (!text.trim()) return json('{}');
      try {
        return json(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        return error('Invalid JSON input. Check your syntax and try again.');
      }
    }

    if (slug === 'base64-encoder-decoder') {
      if (!text.trim()) return json('');
      if (isProbablyBase64(text)) {
        try {
          return json(`Decoded:\n${Buffer.from(text.replace(/\s+/g, ''), 'base64').toString('utf8')}`);
        } catch {
          return error('Invalid base64 input.');
        }
      }
      return json(`Encoded:\n${Buffer.from(text, 'utf8').toString('base64')}`);
    }

    if (slug === 'url-encoder-decoder') {
      if (!text) return json('');
      try {
        return json(`Decoded:\n${decodeURIComponent(text)}`);
      } catch {
        return json(`Encoded:\n${encodeURIComponent(text)}`);
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
      if (!raw) return error('Provide a URL in the text input.');
      let target;
      try { target = new URL(raw); } catch { return error('Invalid URL. Use a full http:// or https:// URL.'); }
      if (!['http:', 'https:'].includes(target.protocol)) return error('Only http/https URLs are supported.');
      if (isBlockedHost(target.hostname)) return error('Local/private hosts are blocked for safety.');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(target.toString(), {
          method: 'GET', redirect: 'follow', signal: controller.signal,
          headers: { 'user-agent': 'tool-runtime/1.0' },
        });
        const contentType = res.headers.get('content-type') || '';
        const html = contentType.includes('text/html') ? await res.text() : '';
        const titleMatch = html.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i);
        const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || 'No title found';
        return json(`URL:          ${target.toString()}\nStatus:       ${res.status} ${res.ok ? '✓ OK' : '✗ Error'}\nContent-Type: ${contentType}\nPage Title:   ${title}`);
      } finally {
        clearTimeout(timeout);
      }
    }

    // ── File tools — parse file first ────────────────────────────

    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return error('No file uploaded. Please select a file first.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';
    const originalName = file.name || 'upload';
    const baseName = originalName.replace(/\.[^.]+$/, '');

    // ── Metadata / format detector ────────────────────────────────

    if (['image-format-detector', 'metadata-viewer'].includes(slug)) {
      try {
        const meta = await sharp(buffer).metadata();
        return json(
          `Filename:    ${originalName}\n` +
          `Format:      ${meta.format ?? mimeType}\n` +
          `Width:       ${meta.width ?? '?'} px\n` +
          `Height:      ${meta.height ?? '?'} px\n` +
          `Channels:    ${meta.channels ?? '?'}\n` +
          `Color Space: ${meta.space ?? '?'}\n` +
          `Has Alpha:   ${meta.hasAlpha ? 'Yes' : 'No'}\n` +
          `DPI:         ${meta.density ?? '?'}\n` +
          `Size:        ${(buffer.length / 1024).toFixed(2)} KB`
        );
      } catch {
        return json(
          `Filename: ${originalName}\nType:     ${mimeType}\nSize:     ${(buffer.length / 1024).toFixed(2)} KB`
        );
      }
    }

    // ── Image compressor ──────────────────────────────────────────

    if (slug === 'image-compressor') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const quality = Math.min(100, Math.max(1, Number(optionsRaw.quality) || 80));
      const img = sharp(buffer);
      const meta = await img.metadata();
      let out;
      if (meta.format === 'png') {
        out = await img.png({ quality, compressionLevel: 9 }).toBuffer();
      } else if (meta.format === 'webp') {
        out = await img.webp({ quality }).toBuffer();
      } else {
        out = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
      }
      const saved = (((buffer.length - out.length) / buffer.length) * 100).toFixed(1);
      return fileResponse(out, `image/${meta.format ?? 'jpeg'}`, `compressed-${baseName}.${meta.format ?? 'jpg'}`);
    }

    // ── Image converter ───────────────────────────────────────────

    if (slug === 'image-converter') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const targetFormat = (optionsRaw.format || 'webp').toLowerCase();
      const allowed = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff'];
      if (!allowed.includes(targetFormat)) return error(`Unsupported format: ${targetFormat}. Choose from: ${allowed.join(', ')}`);
      const ext = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
      const out = await sharp(buffer).toFormat(ext).toBuffer();
      return fileResponse(out, `image/${ext}`, `${baseName}.${targetFormat}`);
    }

    // ── Image resize ──────────────────────────────────────────────

    if (slug === 'image-resize') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const width = optionsRaw.width ? Number(optionsRaw.width) : null;
      const height = optionsRaw.height ? Number(optionsRaw.height) : null;
      if (!width && !height) return error('Provide at least a width or height in options.');
      const out = await sharp(buffer)
        .resize(width || null, height || null, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      const meta = await sharp(out).metadata();
      return fileResponse(out, `image/${meta.format}`, `resized-${originalName}`);
    }

    // ── Image crop ────────────────────────────────────────────────

    if (slug === 'image-crop') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const left = Number(optionsRaw.left) || 0;
      const top = Number(optionsRaw.top) || 0;
      const width = Number(optionsRaw.width) || 200;
      const height = Number(optionsRaw.height) || 200;
      const out = await sharp(buffer).extract({ left, top, width, height }).toBuffer();
      const meta = await sharp(out).metadata();
      return fileResponse(out, `image/${meta.format}`, `cropped-${originalName}`);
    }

    // ── Image rotator ─────────────────────────────────────────────

    if (slug === 'image-rotator') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const angle = Number(optionsRaw.angle) || 90;
      const out = await sharp(buffer).rotate(angle).toBuffer();
      const meta = await sharp(out).metadata();
      return fileResponse(out, `image/${meta.format}`, `rotated-${originalName}`);
    }

    // ── Image blur ────────────────────────────────────────────────

    if (slug === 'image-blur-tool') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const sigma = Math.min(100, Math.max(0.3, Number(optionsRaw.sigma) || 5));
      const out = await sharp(buffer).blur(sigma).toBuffer();
      const meta = await sharp(out).metadata();
      return fileResponse(out, `image/${meta.format}`, `blurred-${originalName}`);
    }

    // ── HEIC to JPG ───────────────────────────────────────────────

    if (slug === 'heic-to-jpg') {
      const out = await sharp(buffer).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      return fileResponse(out, 'image/jpeg', `${baseName}.jpg`);
    }

    // ── WebP to PNG ───────────────────────────────────────────────

    if (slug === 'webp-to-png') {
      const out = await sharp(buffer).png().toBuffer();
      return fileResponse(out, 'image/png', `${baseName}.png`);
    }

    // ── Universal file converter ──────────────────────────────────

    if (slug === 'universal-file-converter') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const targetFormat = (optionsRaw.format || 'webp').toLowerCase();
      const out = await sharp(buffer).toFormat(targetFormat).toBuffer();
      return fileResponse(out, `image/${targetFormat}`, `${baseName}.${targetFormat}`);
    }

    // ── Background remover (placeholder — needs remove.bg API) ────

    if (slug === 'background-remover') {
      return error('Background removal requires an AI API key. Coming soon.');
    }

    // ── PDF tools ─────────────────────────────────────────────────

    if (slug === 'pdf-compress') {
      // pdf-lib doesn't truly compress but can strip metadata to reduce size slightly
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      const out = await pdfDoc.save({ useObjectStreams: true });
      return fileResponse(Buffer.from(out), 'application/pdf', `compressed-${originalName}`);
    }

    if (slug === 'pdf-unlock') {
      try {
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const out = await pdfDoc.save();
        return fileResponse(Buffer.from(out), 'application/pdf', `unlocked-${originalName}`);
      } catch {
        return error('Could not unlock this PDF. It may use strong encryption.');
      }
    }

    if (slug === 'pdf-merge') {
      const allFiles = form.getAll('file');
      if (allFiles.length < 2) return error('Upload at least 2 PDF files to merge.');
      const merged = await PDFDocument.create();
      for (const f of allFiles) {
        if (typeof f === 'string') continue;
        const bytes = Buffer.from(await f.arrayBuffer());
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      return fileResponse(Buffer.from(out), 'application/pdf', 'merged.pdf');
    }

    if (slug === 'pdf-split') {
      const optionsRaw = text ? JSON.parse(text) : {};
      const pageNum = Math.max(1, Number(optionsRaw.page) || 1) - 1; // 0-indexed
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const total = pdfDoc.getPageCount();
      if (pageNum >= total) return error(`PDF only has ${total} pages. Pick a page number between 1 and ${total}.`);
      const part1 = await PDFDocument.create();
      const part2 = await PDFDocument.create();
      const pages1 = await part1.copyPages(pdfDoc, Array.from({ length: pageNum }, (_, i) => i));
      pages1.forEach((p) => part1.addPage(p));
      const pages2 = await part2.copyPages(pdfDoc, Array.from({ length: total - pageNum }, (_, i) => i + pageNum));
      pages2.forEach((p) => part2.addPage(p));
      const out1 = await part1.save();
      // Return just part 1 for now; returning multiple files needs a zip
      return fileResponse(Buffer.from(out1), 'application/pdf', `split-part1-${originalName}`);
    }

    if (slug === 'pdf-to-images') {
      return error('PDF to images requires a rendering engine not available on this server. Coming soon.');
    }

    // ── Video tools ───────────────────────────────────────────────

    if (['video-to-gif', 'video-compressor', 'video-thumbnail-generator'].includes(slug)) {
      return error('Video processing requires a dedicated server. Coming soon.');
    }

    return error(`Tool "${slug}" is not enabled yet.`, 501);

  } catch (err) {
    return error(
      err instanceof Error ? `Unable to process request: ${err.message}` : 'Unknown server error.',
      500
    );
  }
}
