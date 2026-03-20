const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const BRAND_COLORS = {
  purple: '#A855F7',
  blue: '#3B82F6',
  cyan: '#22D3EE',
  background: '#0B0F1A',
};

async function generateAsset(size, fileName, options = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const scale = size / 512;

  // Background
  if (options.hasBackground) {
    ctx.fillStyle = BRAND_COLORS.background;
    if (options.rounded) {
      const radius = size * 0.22;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  // Set up Gradient
  let gradient = ctx.createLinearGradient(128 * scale, 128 * scale, 384 * scale, 384 * scale);
  gradient.addColorStop(0, BRAND_COLORS.purple);
  gradient.addColorStop(0.5, BRAND_COLORS.blue);
  gradient.addColorStop(1, BRAND_COLORS.cyan);

  // 1. The "AI Forge V" Symbol
  // A thick, curved stroke with 3 branching nodes representing intelligence.
  ctx.save();
  
  // Set up Gradient
  gradient = ctx.createLinearGradient(128 * scale, 128 * scale, 384 * scale, 384 * scale);
  gradient.addColorStop(0, BRAND_COLORS.purple);
  gradient.addColorStop(0.5, BRAND_COLORS.blue);
  gradient.addColorStop(1, BRAND_COLORS.cyan);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 60 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
  ctx.shadowBlur = 15 * scale;

  // Draw the main "V" body
  ctx.beginPath();
  ctx.moveTo(160 * scale, 200 * scale);
  ctx.bezierCurveTo(180 * scale, 320 * scale, 220 * scale, 380 * scale, 256 * scale, 400 * scale);
  ctx.bezierCurveTo(300 * scale, 380 * scale, 360 * scale, 240 * scale, 360 * scale, 240 * scale);
  ctx.stroke();

  // Draw Node branches (connector lines)
  ctx.lineWidth = 10 * scale;
  ctx.beginPath();
  // Top branch
  ctx.moveTo(330 * scale, 280 * scale);
  ctx.lineTo(410 * scale, 150 * scale);
  // Center branch
  ctx.moveTo(345 * scale, 260 * scale);
  ctx.lineTo(440 * scale, 200 * scale);
  // Bottom branch
  ctx.moveTo(355 * scale, 240 * scale);
  ctx.lineTo(440 * scale, 260 * scale);
  ctx.stroke();

  // Nodes (Circles)
  // Node 1 (Top) - Detailed with white center
  ctx.fillStyle = '#D8B4FE';
  ctx.beginPath();
  ctx.arc(410 * scale, 150 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(410 * scale, 150 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Node 2 (Center)
  ctx.fillStyle = BRAND_COLORS.blue;
  ctx.beginPath();
  ctx.arc(440 * scale, 200 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Node 3 (Bottom)
  ctx.fillStyle = BRAND_COLORS.cyan;
  ctx.beginPath();
  ctx.arc(440 * scale, 260 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Save buffer to file
  const buffer = canvas.toBuffer('image/png');
  const targetPath = path.join(__dirname, '..', 'public', fileName);
  fs.writeFileSync(targetPath, buffer);
  console.log(`Generated: ${fileName} (${size}x${size})`);
}

async function main() {
  console.log('Generating ResumeForgeAI brand assets...');
  
  // Favicon (32x32 and 16x16)
  await generateAsset(16, 'favicon-16x16.png', { hasBackground: false });
  await generateAsset(32, 'favicon-32x32.png', { hasBackground: false });
  await generateAsset(32, 'favicon.png', { hasBackground: false });
  
  // Apple touch icon (180x180) - Standard size
  await generateAsset(180, 'apple-touch-icon.png', { hasBackground: true, rounded: true });
  
  // High Res Logo PNG (512x512)
  await generateAsset(512, 'logo.png', { hasBackground: true, rounded: false });
  
  // Favicon.ico (for legacy, we will copy 32x32 to ico for now, though it's not a real ico)
  // Most modern browsers will use the png if linked.
  const faviconIcoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  const faviconPngPath = path.join(__dirname, '..', 'public', 'favicon.png');
  fs.copyFileSync(faviconPngPath, faviconIcoPath);
  console.log('Generated: favicon.ico (copied from favicon.png)');
  
  console.log('All assets generated in /public/');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
