// scripts/generate-assets.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function makePng(width, height, label, filename) {
  const fontSize = Math.round(Math.min(width, height) / 6);
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#28a745"/>
    <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}" fill="#ffffff"
          text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, filename));
  console.log('✓ created', filename);
}

(async () => {
  await makePng(1024, 1024, 'ICON', 'icon.png');
  await makePng(1242, 2436, 'SPLASH', 'splash.png');
  await makePng(1024, 1024, 'ADAPTIVE', 'adaptive-icon.png');
  console.log('✅ all assets generated in /assets');
})();
