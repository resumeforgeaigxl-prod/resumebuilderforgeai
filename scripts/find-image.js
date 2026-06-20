const fs = require('fs');
const path = require('path');

const downloadsDir = 'C:\\Users\\LENOVO\\Downloads';
try {
  console.log('Listing files in:', downloadsDir);
  const files = fs.readdirSync(downloadsDir)
    .map(name => {
      const filePath = path.join(downloadsDir, name);
      const stat = fs.statSync(filePath);
      return { name, time: stat.mtimeMs, size: stat.size };
    })
    .sort((a, b) => b.time - a.time); // Sort by newest first

  console.log('Top 10 newest files in Downloads:');
  files.slice(0, 10).forEach((f, idx) => {
    console.log(`${idx + 1}. ${f.name} (Size: ${f.size} bytes, Time: ${new Date(f.time).toISOString()})`);
  });
} catch (e) {
  console.error('Error listing downloads:', e);
}
