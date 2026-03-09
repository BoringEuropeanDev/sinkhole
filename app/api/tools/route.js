export const tools = [
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress uploaded images to JPG with adjustable quality.',
    mode: 'file',
    options: [
      {
        key: 'quality',
        type: 'number',
        label: 'JPEG quality',
        min: 30,
        max: 90,
        step: 1,
        defaultValue: 60,
      },
    ],
  },
  {
    slug: 'image-converter',
    name: 'Image Converter',
    description: 'Convert uploaded image files to JPG.',
    mode: 'file',
  },
  {
    slug: 'image-resize',
    name: 'Image Resize',
    description: 'Resize an uploaded image while preserving aspect ratio.',
    mode: 'file',
    options: [
      {
        key: 'width',
        type: 'number',
        label: 'Max width',
        min: 1,
        max: 4000,
        step: 1,
        defaultValue: 1280,
      },
      {
        key: 'height',
        type: 'number',
        label: 'Max height',
        min: 1,
        max: 4000,
        step: 1,
        placeholder: 'Optional',
      },
    ],
  },
  {
    slug: 'image-crop',
    name: 'Image Crop',
    description: 'Crop an uploaded image using left, top, width, and height values.',
    mode: 'file',
    options: [
      { key: 'left', type: 'number', label: 'Left', min: 0, step: 1, defaultValue: 0 },
      { key: 'top', type: 'number', label: 'Top', min: 0, step: 1, defaultValue: 0 },
      { key: 'width', type: 'number', label: 'Width', min: 1, step: 1, defaultValue: 400 },
      { key: 'height', type: 'number', label: 'Height', min: 1, step: 1, defaultValue: 400 },
    ],
  },
  {
    slug: 'image-rotator',
    name: 'Image Rotator',
    description: 'Rotate an uploaded image by a custom number of degrees.',
    mode: 'file',
    options: [
      {
        key: 'degrees',
        type: 'number',
        label: 'Degrees',
        min: -360,
        max: 360,
        step: 1,
        defaultValue: 90,
      },
    ],
  },
  {
    slug: 'image-format-detector',
    name: 'Image Format Detector',
    description: 'Detect uploaded image format and metadata.',
    mode: 'file',
  },
  {
    slug: 'background-remover',
    name: 'Background Remover',
    description: 'Apply a simple threshold-based background removal fallback and return PNG.',
    mode: 'file',
  },
  {
    slug: 'image-blur-tool',
    name: 'Image Blur Tool',
    description: 'Apply adjustable blur to an uploaded image.',
    mode: 'file',
    options: [
      {
        key: 'blur',
        type: 'number',
        label: 'Blur strength',
        min: 0.3,
        max: 10,
        step: 0.1,
        defaultValue: 4,
      },
    ],
  },
  {
    slug: 'universal-file-converter',
    name: 'Universal File Converter',
    description: 'Convert supported uploaded image files to PNG.',
    mode: 'file',
  },
  {
    slug: 'heic-to-jpg',
    name: 'HEIC to JPG',
    description: 'Convert uploaded HEIC image files to JPG.',
    mode: 'file',
  },
  {
    slug: 'webp-to-png',
    name: 'WEBP to PNG',
    description: 'Convert uploaded WEBP image files to PNG.',
    mode: 'file',
  },
  {
    slug: 'video-to-gif',
    name: 'Video to GIF',
    description: 'Reserved for GIF generation in ffmpeg-enabled runtimes.',
    mode: 'file',
  },
  {
    slug: 'video-compressor',
    name: 'Video Compressor',
    description: 'Reserved for video compression in ffmpeg-enabled runtimes.',
    mode: 'file',
  },
  {
    slug: 'video-thumbnail-generator',
    name: 'Video Thumbnail Generator',
    description: 'Reserved for thumbnail extraction in ffmpeg-enabled runtimes.',
    mode: 'file',
  },
  {
    slug: 'pdf-merge',
    name: 'PDF Merge',
    description: 'Merge one or more uploaded PDF files into a single PDF.',
    mode: 'file',
    acceptsMultipleFiles: true,
  },
  {
    slug: 'pdf-split',
    name: 'PDF Split',
    description: 'Extract a single page from an uploaded PDF.',
    mode: 'file',
    options: [
      {
        key: 'page',
        type: 'number',
        label: 'Page number',
        min: 1,
        step: 1,
        defaultValue: 1,
      },
    ],
  },
  {
    slug: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Rewrite an uploaded PDF with object streams enabled.',
    mode: 'file',
  },
  {
    slug: 'pdf-unlock',
    name: 'PDF Unlock',
    description: 'Load and rewrite uploaded PDFs with encryption ignored where possible.',
    mode: 'file',
  },
  {
    slug: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Render a selected PDF page to PNG when PDF raster support is available.',
    mode: 'file',
    options: [
      {
        key: 'page',
        type: 'number',
        label: 'Page number',
        min: 1,
        step: 1,
        defaultValue: 1,
      },
      {
        key: 'density',
        type: 'number',
        label: 'Density',
        min: 72,
        max: 300,
        step: 1,
        defaultValue: 144,
      },
    ],
  },
  {
    slug: 'website-screenshot-generator',
    name: 'Website Screenshot Generator',
    description: 'Validate a public URL and return fetched page metadata in this runtime.',
    mode: 'text',
  },
  {
    slug: 'metadata-viewer',
    name: 'Metadata Viewer',
    description: 'Inspect uploaded file metadata supported by Sharp.',
    mode: 'file',
  },
  {
    slug: 'article-cleaner',
    name: 'Article Cleaner',
    description: 'Strip scripts, styles, and HTML tags from pasted article markup.',
    mode: 'text',
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, and lines.',
    mode: 'text',
  },
  {
    slug: 'text-case-converter',
    name: 'Text Case Converter',
    description: 'Convert text to upper, lower, and title case.',
    mode: 'text',
  },
  {
    slug: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    description: 'Remove repeated lines while preserving first occurrence order.',
    mode: 'text',
  },
  {
    slug: 'markdown-previewer',
    name: 'Markdown Previewer',
    description: 'Render basic markdown into escaped HTML.',
    mode: 'text',
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Validate and prettify JSON input.',
    mode: 'text',
  },
  {
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode plain text to Base64 or decode valid Base64 to text.',
    mode: 'text',
  },
  {
    slug: 'url-encoder-decoder',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URL components.',
    mode: 'text',
  },
  {
    slug: 'webhook-request-bin',
    name: 'Webhook Request Bin',
    description: 'Store posted webhook payload text in a temporary in-memory list.',
    mode: 'text',
  },
];

export const validToolSlugs = new Set(tools.map((tool) => tool.slug));

export const toolsBySlug = Object.fromEntries(
  tools.map((tool) => [tool.slug, tool])
);

export const savingsMap = {
  'image-compressor': 1,
  'pdf-merge': 2,
  'video-to-gif': 3,
  'background-remover': 2,
};
