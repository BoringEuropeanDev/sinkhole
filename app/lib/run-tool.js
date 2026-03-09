export function getInitialOptions(tool) {
  if (!tool?.options?.length) return {};
  return Object.fromEntries(
    tool.options.map((opt) => [opt.key, opt.defaultValue ?? ''])
  );
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

  if (
    ['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-unlock', 'pdf-to-images'].includes(slug)
  ) {
    return '.pdf,application/pdf';
  }

  if (
    ['video-to-gif', 'video-compressor', 'video-thumbnail-generator'].includes(slug)
  ) {
    return 'video/*';
  }

  return undefined;
}

export function buildTextPayload(tool, input, optionValues) {
  if (tool?.mode === 'text') {
    return input || '';
  }

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

export async function runTool({
  tool,
  input = '',
  files = [],
  optionValues = {},
}) {
  if (!tool?.slug) {
    return {
      ok: false,
      message: 'Missing tool slug.',
    };
  }

  if (tool.mode === 'file' && (!files || files.length === 0)) {
    return {
      ok: false,
      message: 'Please choose a file first.',
    };
  }

  if (tool.mode === 'text' && !String(input || '').trim()) {
    return {
      ok: false,
      message: 'Please enter some input first.',
    };
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
      message: err instanceof Error ? err.message : 'Network request failed.',
      debug: { stage: 'fetch' },
    };
  }

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null);
      return {
        ok: false,
        message: String(data?.error || `Request failed with status ${res.status}.`),
        debug: {
          stage: 'http-error',
          status: res.status,
          contentType,
        },
      };
    }

    const raw = await res.text().catch(() => '');
    return {
      ok: false,
      message: raw || `Request failed with status ${res.status}.`,
      debug: {
        stage: 'http-error',
        status: res.status,
        contentType,
      },
    };
  }

  if (contentType.includes('application/json')) {
    const data = await res.json();
    const value = data?.result;

    return {
      ok: true,
      kind: 'json',
      value,
      display: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      debug: {
        stage: 'json-success',
        status: res.status,
      },
    };
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  const filename = match?.[1] || `tool-output-${tool.slug}`;

  return {
    ok: true,
    kind: 'file',
    url,
    filename,
    display: `Download ready: ${filename}`,
    debug: {
      stage: 'file-success',
      status: res.status,
      contentType,
    },
  };
}
