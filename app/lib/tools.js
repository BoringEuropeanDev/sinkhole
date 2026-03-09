export const tools = [
  ['image-compressor', 'Image Compressor', 'Compress JPG/PNG files for faster sharing.', 'file'],
  ['image-converter', 'Image Converter', 'Convert images between common formats.', 'file'],
  ['image-resize', 'Image Resize', 'Resize images to a web-friendly width.', 'file'],
  ['image-crop', 'Image Crop', 'Apply a centered crop for quick previews.', 'file'],
  ['image-rotator', 'Image Rotator', 'Rotate image output quickly.', 'file'],
  ['image-format-detector', 'Image Format Detector', 'Detect image format and metadata.', 'file'],
  ['background-remover', 'Background Remover', 'Auto-remove simple backgrounds.', 'file'],
  ['image-blur-tool', 'Image Blur Tool', 'Apply controllable blur strength.', 'file'],
  ['universal-file-converter', 'Universal File Converter', 'Convert uploaded images to PNG.', 'file'],
  ['heic-to-jpg', 'HEIC to JPG', 'Convert HEIC uploads to JPG.', 'file'],
  ['webp-to-png', 'WEBP to PNG', 'Convert WEBP image files into PNG.', 'file'],
  ['video-to-gif', 'Video to GIF', 'Generate animated GIF snippets.', 'file'],
  ['video-compressor', 'Video Compressor', 'Reduce video file size.', 'file'],
  ['video-thumbnail-generator', 'Video Thumbnail Generator', 'Extract preview thumbnails from video.', 'file'],
  ['pdf-merge', 'PDF Merge', 'Combine PDF pages from an upload.', 'file'],
  ['pdf-split', 'PDF Split', 'Extract the first page from a PDF.', 'file'],
  ['pdf-compress', 'PDF Compress', 'Optimize PDF file size.', 'file'],
  ['pdf-unlock', 'PDF Unlock', 'Load and rewrite restricted PDFs.', 'file'],
  ['pdf-to-images', 'PDF to Images', 'Prepare PDF pages for downstream conversion.', 'file'],
  ['website-screenshot-generator', 'Website Screenshot Generator', 'Capture webpage screenshots.', 'text'],
  ['metadata-viewer', 'Metadata Viewer', 'Inspect file and EXIF metadata.', 'file'],
  ['article-cleaner', 'Article Cleaner', 'Extract readable article text.', 'text'],
  ['word-counter', 'Word Counter', 'Count words, chars, and lines.', 'text'],
  ['text-case-converter', 'Text Case Converter', 'Convert text case styles.', 'text'],
  ['duplicate-line-remover', 'Duplicate Line Remover', 'Drop repeated lines instantly.', 'text'],
  ['markdown-previewer', 'Markdown Previewer', 'Render markdown into safe HTML.', 'text'],
  ['json-formatter', 'JSON Formatter', 'Prettify and validate JSON.', 'text'],
  ['base64-encoder-decoder', 'Base64 Encoder / Decoder', 'Encode/decode Base64 safely.', 'text'],
  ['url-encoder-decoder', 'URL Encoder / Decoder', 'Encode/decode URL components.', 'text'],
  ['webhook-request-bin', 'Webhook Request Bin', 'Temporary endpoint for webhook payloads.', 'text']
].map(([slug, name, description, mode]) => ({ slug, name, description, mode }));

export const validToolSlugs = new Set(tools.map((tool) => tool.slug));

export const savingsMap = {
  'image-compressor': 1,
  'pdf-merge': 2,
  'video-to-gif': 3,
  'background-remover': 2
};
