const fs = require('fs');
const path = 'c:/ai_score_project/frontend/mobile_app/assets/icon.png';
const buffer = fs.readFileSync(path);
console.log('File size:', buffer.length);
console.log('Header (first 8 bytes):', buffer.slice(0, 8).toString('hex'));
if (buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
  console.log('Valid PNG header found.');
} else {
  console.log('NOT a valid PNG!');
}
