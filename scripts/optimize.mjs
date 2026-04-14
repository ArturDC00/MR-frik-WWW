import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

const TARGET_KB = 100;
const MAX_WIDTH = 1920;
const QUALITY_STEPS = [90, 85, 80, 75, 70, 65, 60];

function formatKB(bytes) {
  return (bytes / 1024).toFixed(1) + ' kb';
}

async function optimizeFile(inputPath) {
  const ext = extname(inputPath).toLowerCase();
    const supported = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  if (!supported.includes(ext)) return;

  const dir = dirname(inputPath);
  const base = basename(inputPath, ext);
  const outputPath = join(dir, base + '.webp');

  const { size: originalSize } = await stat(inputPath);

  let img = sharp(inputPath);
  const meta = await img.metadata();

  if (meta.width > MAX_WIDTH) {
    img = img.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  let resultBuffer;
  let usedQuality = QUALITY_STEPS[0];

  for (const q of QUALITY_STEPS) {
    resultBuffer = await img.webp({ quality: q }).toBuffer();
    usedQuality = q;
    if (resultBuffer.length <= TARGET_KB * 1024) break;
  }

  await sharp(resultBuffer).toFile(outputPath);

  const saved = ((1 - resultBuffer.length / originalSize) * 100).toFixed(0);
  const sizeAfter = formatKB(resultBuffer.length);
  const sizeBefore = formatKB(originalSize);
  const belowTarget = resultBuffer.length <= TARGET_KB * 1024 ? '✓' : '~';

  console.log(`${belowTarget} ${basename(inputPath)}`);
  console.log(`  ${sizeBefore}  →  ${sizeAfter}  (jakość ${usedQuality}, -${saved}%)`);
  console.log(`  → ${outputPath}`);
}

async function processFolder(folderPath) {
  console.log(`\n📁 ${folderPath}\n${'─'.repeat(60)}`);
  const files = await readdir(folderPath);
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
      await optimizeFile(join(folderPath, file));
    }
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Użycie: node scripts/optimize.mjs <ścieżka_do_folderu_lub_pliku>');
  process.exit(1);
}

for (const arg of args) {
  const s = await stat(arg);
  if (s.isDirectory()) {
    await processFolder(arg);
  } else {
    await optimizeFile(arg);
  }
}
