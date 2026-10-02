const fs = require('fs');
const content = fs.readFileSync('./src/app/product/[slug]/ProductDetailClient.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('hasPurchased')) {
    console.log((i + 1) + ": " + line);
  }
});
