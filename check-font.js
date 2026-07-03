const fs = require('fs');
const b = fs.readFileSync('public/fonts/NotoSans-Regular.ttf');
console.log('Size:', b.length, 'Magic:', b.slice(0, 4).toString('hex'));
