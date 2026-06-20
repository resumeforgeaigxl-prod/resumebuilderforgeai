const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const srcPath = 'C:\\Users\\LENOVO\\Downloads\\ChatGPT Image Jun 20, 2026, 11_21_21 AM.png';
const destDir = path.join(__dirname, '..', 'public', 'images');
const destPath = path.join(destDir, 'auth-side.png');

async function crop() {
  try {
    console.log('Loading image:', srcPath);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source image not found at ${srcPath}`);
    }
    const img = await loadImage(srcPath);
    console.log(`Original dimensions: ${img.width}x${img.height}`);

    // Create public/images directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // The illustration pane is on the right, starting at ~44.5% of the width
    const cropX = Math.floor(img.width * 0.445);
    const cropWidth = img.width - cropX;
    const cropHeight = img.height;

    console.log(`Cropping area: x=${cropX}, y=0, width=${cropWidth}, height=${cropHeight}`);

    const canvas = createCanvas(cropWidth, cropHeight);
    const ctx = canvas.getContext('2d');

    // Draw the cropped section
    ctx.drawImage(img, cropX, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(destPath, buffer);
    console.log('Cropped image successfully saved to:', destPath);
  } catch (err) {
    console.error('Error during cropping:', err);
  }
}

crop();
