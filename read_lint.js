
const fs = require('fs');
const content = fs.readFileSync('lint_full.txt', 'utf16le');
console.log(content.split('\n').filter(line => line.includes('Error:') || line.includes('./app') || line.includes('./components')).join('\n'));
