const fs = require('fs');
const path = require('path');

const replacements = {
  '--sage-green': '--main-primary',
  '--soft-sage': '--butter-cream',
  '--ice-gray': '--screen-bg',
  '--soft-gray': '--border-color',
  '--slate-black': '--text-main',
  '--slate-gray': '--text-muted'
};

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldVal, newVal] of Object.entries(replacements)) {
        if (content.includes(oldVal)) {
          content = content.split(oldVal).join(newVal);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Done');
