import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data/savings.json');

async function readSavings() {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return { total: Number(parsed.total) || 0 };
  } catch {
    return { total: 0 };
  }
}

export async function GET() {
  return Response.json(await readSavings());
}

export async function bump(amount) {
  const data = await readSavings();
  data.total += amount;
  await fs.writeFile(filePath, JSON.stringify(data));
}
