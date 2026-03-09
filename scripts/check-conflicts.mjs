import { readFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOTS = ['app'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);
const MARKER_REGEX = /^(<<<<<<<|=======|>>>>>>>)(.*)$/m;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(full, out);
      continue;
    }
    if (entry.isFile()) out.push(full);
  }
  return out;
}

async function main() {
  const offenders = [];

  for (const root of ROOTS) {
    const files = await walk(root);
    for (const file of files) {
      const size = statSync(file).size;
      if (size > 1024 * 1024 * 3) continue;
      const content = readFileSync(file, 'utf8');
      if (MARKER_REGEX.test(content)) offenders.push(file);
    }
  }

  if (offenders.length) {
    console.error('Merge conflict markers detected in:');
    offenders.forEach((f) => console.error(`- ${f}`));
    process.exit(1);
  }

  console.log('No merge conflict markers found.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
