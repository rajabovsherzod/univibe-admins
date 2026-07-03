const fs = require('fs');
const content = fs.readFileSync('public/icon.svg', 'utf8').split('#006ab0').join('#ffffff');
fs.writeFileSync('public/icon-white.svg', content);
console.log('icon-white.svg created');
