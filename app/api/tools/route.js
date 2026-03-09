import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { bump } from '../savings/route';
import { savingsMap, validToolSlugs } from '../../lib/tools';

const webhookEvents = [];
const MAX_TEXT_LENGTH = 50000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function parseOptions(text) {
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isBlockedHost(hostname) {
  const host = (hostname || '').toLowerCase();
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.local')) return true;
  if (host === '0.0.0.0' || host === '127.0.0.1' || host === '::1') return true;
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
  return false;
}

function json(result, status = 200) {
  return Response.json({ result }, { status });
}

function error(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function sanitizeMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('slug') === 'webhook-request-bin') {
    return Response.json({ events: webhookEvents.slice(-50) });
  }
  return Response.json({ ok: true });
}

export async function POST(req) {
  const form = await req.formData();
  const slug = form.get('slug')?.toString();
  const text = form.get('text')?.toString() || '';
  const file = form.get('file');

  if (!slug || !validToolSlugs.has(slug)) return error('Unknown tool.', 404);
  if (text.length > MAX_TEXT_LENGTH) return error('Text input is too large.');

  if (slug === 'webhook-request-bin') {
    webhookEvents.push({ at: Date.now(), payload: text || 'empty' });
    return json('Webhook payload captured.');
  }

  if (savingsMap[slug]) await bump(savingsMap[slug]);

  try {
    if (slug === 'word-counter') {
      return Response.json({ result: { words: (text.trim().match(/\S+/g) || []).length, chars: text.length, lines: text ? text.split('\n').length : 0 } });
    }
    if (slug === 'text-case-converter') {
      return Response.json({ result: { upper: text.toUpperCase(), lower: text.toLowerCase(), title: text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) } });
    }
    if (slug === 'duplicate-line-remover') return json([...new Set(text.split('\n'))].join('\n'));
    if (slug === 'json-formatter') return json(JSON.stringify(JSON.parse(text || '{}'), null, 2));
    if (slug === 'base64-encoder-decoder') {
      const isLikelyBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text) && text.trim().length % 4 === 0;
      return isLikelyBase64 ? json(Buffer.from(text, 'base64').toString('utf8')) : json(Buffer.from(text, 'utf8').toString('base64'));
    }
    if (slug === 'url-encoder-decoder') {
      try {
        return json(decodeURIComponent(text));
      } catch {
        return json(encodeURIComponent(text));
      }
    }
    if (slug === 'markdown-previewer') return json(sanitizeMarkdown(text));
    if (slug === 'article-cleaner') return json(text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (slug === 'website-screenshot-generator') {
      const raw = text.trim();
      if (!raw) return error('Provide a URL in text input.');
      let target;
      try {
        target = new URL(raw);
      } catch {
        return error('Invalid URL. Use full https:// URL.');
      }
      if (!['http:', 'https:'].includes(target.protocol)) return error('Only http/https URLs are supported.');
      if (isBlockedHost(target.hostname)) return error('Local/private hosts are blocked for safety.');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(target.toString(), { method: 'GET', redirect: 'follow', signal: controller.signal });
        const html = await res.text();
        const titleMatch = html.match(/<title>([^<]{0,120})<\/title>/i);
        return Response.json({ result: { url: target.toString(), status: res.status, ok: res.ok, title: titleMatch?.[1]?.trim() || 'No title found' } });
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!file || typeof file === 'string') return error('Provide a file input for this tool.');
    if (file.size > MAX_FILE_SIZE) return error('File is too large. Max 10 MB.');
    const buf = Buffer.from(await file.arrayBuffer());
    const options = parseOptions(text);

    if (slug === 'image-format-detector' || slug === 'metadata-viewer') return Response.json({ result: await sharp(buf).metadata() });
    if (slug === 'image-compressor') {
      const quality = Math.max(30, Math.min(90, Number(options.quality) || 60));
      return new Response(await sharp(buf).jpeg({ quality }).toBuffer(), { headers: { 'Content-Type': 'image/jpeg' } });
    }
    if (slug === 'image-converter' || slug === 'heic-to-jpg') return new Response(await sharp(buf).jpeg().toBuffer(), { headers: { 'Content-Type': 'image/jpeg' } });
    if (slug === 'webp-to-png') return new Response(await sharp(buf).png().toBuffer(), { headers: { 'Content-Type': 'image/png' } });
    if (slug === 'image-resize') {
      const width = Math.max(64, Math.min(3000, Number(options.width) || 1280));
      const height = Number(options.height) ? Math.max(64, Math.min(3000, Number(options.height))) : undefined;
      return new Response(await sharp(buf).resize(width, height).toBuffer(), { headers: { 'Content-Type': file.type || 'image/png' } });
    }
    if (slug === 'image-crop') {
      const left = Math.max(0, Number(options.left) || 20);
      const top = Math.max(0, Number(options.top) || 20);
      const width = Math.max(32, Number(options.width) || 400);
      const height = Math.max(32, Number(options.height) || 400);
      return new Response(await sharp(buf).extract({ left, top, width, height }).toBuffer(), { headers: { 'Content-Type': file.type || 'image/png' } });
    }
    if (slug === 'image-rotator') return new Response(await sharp(buf).rotate(Number(options.degrees) || 90).toBuffer(), { headers: { 'Content-Type': file.type || 'image/png' } });
    if (slug === 'background-remover') return new Response(await sharp(buf).grayscale().threshold(210).png().toBuffer(), { headers: { 'Content-Type': 'image/png' } });
    if (slug === 'image-blur-tool') return new Response(await sharp(buf).blur(Math.max(0.3, Math.min(10, Number(options.blur) || 4))).toBuffer(), { headers: { 'Content-Type': file.type || 'image/png' } });
    if (slug === 'universal-file-converter') return new Response(await sharp(buf).png().toBuffer(), { headers: { 'Content-Type': 'image/png' } });

    if (slug === 'pdf-merge' || slug === 'pdf-split' || slug === 'pdf-compress' || slug === 'pdf-unlock' || slug === 'pdf-to-images') {
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      if (slug === 'pdf-split') {
        const out = await PDFDocument.create();
        const [p] = await out.copyPages(pdf, [0]);
        out.addPage(p);
        return new Response(await out.save(), { headers: { 'Content-Type': 'application/pdf' } });
      }
      if (slug === 'pdf-merge') {
        const out = await PDFDocument.create();
        const pages = await out.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => out.addPage(p));
        return new Response(await out.save(), { headers: { 'Content-Type': 'application/pdf' } });
      }
      return new Response(await pdf.save({ useObjectStreams: true }), { headers: { 'Content-Type': 'application/pdf' } });
    }

    if (slug === 'video-to-gif' || slug === 'video-compressor' || slug === 'video-thumbnail-generator') {
      return json('Video tooling endpoint is wired, but media workers are not enabled in this runtime yet.');
    }

    return json('Tool executed.');
  } catch (err) {
    return error(`Unable to process ${slug}: ${err.message}`);
  }
}
