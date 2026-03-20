const { exec } = require('child_process');
const fs = require('fs');

exec('npm run build', (error, stdout, stderr) => {
  const output = stdout + '\n' + stderr;
  fs.writeFileSync('full_build_log_utf8.txt', output, 'utf8');
  if (error) {
    console.log('Build failed, logged to full_build_log_utf8.txt');
    process.exit(1);
  } else {
    console.log('Build succeeded, logged to full_build_log_utf8.txt');
    process.exit(0);
  }
});
