const sharp = require('sharp');
const fs = require('fs');

async function createIcons() {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    }
  })
  .png()
  .toFile('public/icon-192x192.png');

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    }
  })
  .png()
  .toFile('public/icon-512x512.png');
  
  console.log("Icons created successfully");
}

createIcons();
