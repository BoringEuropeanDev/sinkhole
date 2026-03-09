export const runtime = 'nodejs';

import { validToolSlugs } from '../../lib/tools';

const webhookEvents = [];
const MAX_TEXT_LENGTH = 50000;

function json(result, status = 200) {
  return Response.json({ result }, { status });
}

function error(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function isProbablyBase64(text) {
  const normalized = text.replace(/\s+/g, '');
  if (!normalized || normalized.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+/]+=*$/.test(normalized)) return false;
  try {
    Buffer.from(normalized, 'base64');
    return true;
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

    // ── Text tools ───────────────────────────────────────────────

    if (slug === 'webhook-request-bin') {
      webhookEvents.push({ at: Date.now(), payload: text || 'empty' });
      return json('Webhook payload captured.');
    }

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
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    // ── File tools ───────────────────────────────────────────────

    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return error('No file uploaded. Please select a file first.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';
    const originalName = file.name || 'upload';

    // Metadata / format detection — just reads file info, no processing needed
    if (['image-format-detector', 'metadata-viewer'].includes(slug)) {
      return json({
        filename: originalName,
        mimeType,
        sizeBytes: buffer.length,
        sizeKB: (buffer.length / 1024).toFixed(2),
      });
    }

    // Image tools — echo file back for now (replace with `sharp` later)
    if (
      [
        'image-compressor',
        'image-converter',
        'image-resize',
        'image-crop',
        'image-rotator',
        'image-blur-tool',
        'heic-to-jpg',
        'webp-to-png',
        'background-remover',
        'universal-file-converter',
      ].includes(slug)
    ) {
      // TODO: install `sharp` and add real processing here
      // For now this returns the original file so the download flow works end-to-end
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="processed-${originalName}"`,
        },
      });
    }

    // PDF tools
    if (['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-unlock', 'pdf-to-images'].includes(slug)) {
      // TODO: install `pdf-lib` and add real processing here
      return error('PDF processing coming soon.', 501);
    }

    // Video tools
    if (['video-to-gif', 'video-compressor', 'video-thumbnail-generator'].includes(slug)) {
      // TODO: requires ffmpeg — not available on standard Vercel
      return error('Video processing coming soon.', 501);
    }

    return error(`Tool "${slug}" is not enabled yet.`, 501);
  } catch (err) {
    return error(
      err instanceof Error ? `Unable to process request: ${err.message}` : 'Unknown server error',
      500
    );
  }
}
