const fs = require('fs');
const path = require('path');

const replacements = {
  '#14C3A3': 'var(--sage-green)',
  '#0D9488': 'var(--sage-green)',
  '#121B2A': 'var(--slate-black)',
  '#64748B': 'var(--slate-gray)',
  '#64748b': 'var(--slate-gray)',
  '#F1F5F9': 'var(--soft-gray)',
  '#f1f5f9': 'var(--soft-gray)',
  '#E2E8F0': 'var(--soft-gray)',
  '#e2e8f0': 'var(--soft-gray)',
  '#F8FAFC': 'var(--ice-gray)',
  '#f8fafc': 'var(--ice-gray)'
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
