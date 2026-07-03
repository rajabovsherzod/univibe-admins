// Reads NotoSans TTF files and writes them as base64 to font-data.ts
const fs   = require('fs');
const path = require('path');

const files = [
  { key: 'NOTO_SANS_REGULAR', file: 'NotoSans-Regular.ttf' },
  { key: 'NOTO_SANS_BOLD',    file: 'NotoSans-Bold.ttf'    },
];

const lines = [
  '// AUTO-GENERATED — do not edit manually',
  '// Run: node embed-fonts.js',
  '',
];

for (const { key, file } of files) {
  const buf = fs.readFileSync(path.join('public', 'fonts', file));
  const b64 = buf.toString('base64');
  lines.push(`export const ${key} = 'data:font/ttf;base64,${b64}';`);
  lines.push('');
  console.log(`Embedded ${file} (${Math.round(buf.length / 1024)} KB)`);
}

const dest = path.join('src', 'app', '(app)', '(university-admin)', 'events', '[id]', '_components', 'font-data.ts');
fs.writeFileSync(dest, lines.join('\n'));
console.log('Done →', dest);
