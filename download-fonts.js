// Downloads Noto Sans TTF (Regular + Bold) for react-pdf Cyrillic support
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const dest = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

const files = [
  {
    url: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf',
    out: 'NotoSans-Regular.ttf',
  },
  {
    url: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNjXhFVadyBx2pqPIif.ttf',
    out: 'NotoSans-Bold.ttf',
  },
];

let done = 0;
files.forEach(({ url, out }) => {
  const dest_file = path.join(dest, out);
  const file = fs.createWriteStream(dest_file);
  https.get(url, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded:', out);
      done++;
      if (done === files.length) console.log('All fonts ready in public/fonts/');
    });
  }).on('error', (err) => {
    fs.unlink(dest_file, () => {});
    console.error('Failed:', out, err.message);
  });
});
