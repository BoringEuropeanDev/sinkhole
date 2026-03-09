import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { bump } from '../savings/route';
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

async function loadPdf(file) {
  const buf = await readFileBuffer(file);
  return PDFDocument.load(buf, { ignoreEncryption: true });
}

function contentDisposition(filename) {
  return `attachment; filename="${filename.replace(/"/g, '')}"`;
}
