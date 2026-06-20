const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\LENOVO\\Downloads\\ChatGPT Image Jun 20, 2026, 11_45_39 AM.png';
const destDir = path.join(__dirname, '..', 'public', 'images');
const destPath = path.join(destDir, 'auth-side.png');

try {
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source image not found at ${srcPath}`);
  }
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(srcPath, destPath);
  console.log('Successfully copied newest pixel art image to:', destPath);
} catch (err) {
  console.error('Error copying image:', err);
}
