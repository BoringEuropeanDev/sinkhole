export function getInitialOptions(tool) {
  if (!tool?.options?.length) return {};
  return Object.fromEntries(tool.options.map((opt) => [opt.key, opt.defaultValue ?? '']));
}

export function buildTextPayload(tool, input, optionValues) {
  if (tool?.mode === 'text') return input || '';

  const cleaned = {};
  for (const [key, value] of Object.entries(optionValues || {})) {
    if (value === '' || value === null || value === undefined) continue;

    const option = tool?.options?.find((opt) => opt.key === key);

    if (option?.type === 'number') {
      const n = Number(value);
      if (Number.isFinite(n)) cleaned[key] = n;
      continue;
    }

    if (option?.type === 'boolean') {
      cleaned[key] = Boolean(value);
      continue;
    }

    cleaned[key] = value;
  }

  return JSON.stringify(cleaned);
}

export function getAcceptValue(slug) {
  if (
    [
      'image-compressor',
      'image-converter',
      'image-resize',
      'image-crop',
      'image-rotator',
      'image-format-detector',
      'background-remover',
      'image-blur-tool',
      'universal-file-converter',
      'heic-to-jpg',
      'webp-to-png',
      'metadata-viewer',
    ].includes(slug)
  ) {
    return 'image/*,.heic,.heif,.webp,.jpg,.jpeg,.png';
  }

  if (['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-unlock', 'pdf-to-images'].includes(slug)) {
    return '.pdf,application/pdf';
  }

  if (['video-to-gif', 'video-compressor', 'video-thumbnail-generator'].includes(slug)) {
    return 'video/*';
  }

  return undefined;
}

export async function runToolRequest({ tool, input, files = [], optionValues = {} }) {
  if (!tool?.slug) {
    return { ok: false, kind: 'error', message: 'Missing tool slug.' };
  }

  if (tool.mode === 'file' && (!files || !files.length)) {
    return { ok: false, kind: 'error', message: 'Please choose a file first.' };
  }

  if (tool.mode === 'text' && !String(input || '').trim()) {
    return { ok: false, kind: 'error', message: 'Please enter some input first.' };
  }

  const body = new FormData();
  body.append('slug', tool.slug);
  body.append('text', buildTextPayload(tool, input, optionValues));

  for (const file of files || []) {
    body.append('file', file);
  }

  let res;
  try {
    res = await fetch('/api/tools', {
      method: 'POST',
      body,
    });
  } catch (err) {
    return {
      ok: false,
      kind: 'error',
      message: err instanceof Error ? err.message : 'Network request failed.',
    };
  }

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null);
      return {
        ok: false,
        kind: 'error',
        status: res.status,
        message: String(data?.error || `Tool request failed with status ${res.status}.`),
      };
    }

    const text = await res.text().catch(() => '');
    return {
      ok: false,
      kind: 'error',
      status: res.status,
      message: text || `Tool request failed with status ${res.status}.`,
    };
  }

  if (contentType.includes('application/json')) {
    const data = await res.json();
    return {
      ok: true,
      kind: 'json',
      value: data?.result,
      display: typeof data?.result === 'string' ? data.result : JSON.stringify(data?.result, null, 2),
    };
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);

  return {
    ok: true,
    kind: 'file',
    blob,
    url,
    filename: match?.[1] || `tool-output-${tool.slug}`,
    display: `Download ready: ${match?.[1] || `tool-output-${tool.slug}`}`,
  };
}
