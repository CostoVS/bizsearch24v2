const fs = require('fs');
const files = [
  './app/dashboard/page.tsx', 
  './app/premium/page.tsx', 
  './app/page.tsx', 
  './app/admin/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\btext-blue-([0-9]*)/g, 'text-emerald-$1');
  content = content.replace(/\bbg-blue-([0-9]*)/g, 'bg-emerald-$1');
  content = content.replace(/\bborder-blue-([0-9]*)/g, 'border-emerald-$1');
  content = content.replace(/\bhover:text-blue-([0-9]*)/g, 'hover:text-emerald-$1');
  content = content.replace(/\bhover:bg-blue-([0-9]*)/g, 'hover:bg-emerald-$1');
  content = content.replace(/\bhover:border-blue-([0-9]*)/g, 'hover:border-emerald-$1');
  content = content.replace(/\bfocus:border-blue-([0-9]*)/g, 'focus:border-emerald-$1');
  content = content.replace(/\bfocus:ring-blue-([0-9]*)/g, 'focus:ring-emerald-$1');
  content = content.replace(/\bfocus-within:ring-blue-([0-9]*)/g, 'focus-within:ring-emerald-$1');
  content = content.replace(/\bshadow-blue-([0-9]*)/g, 'shadow-emerald-$1');
  content = content.replace(/\bfrom-blue-([0-9]*)/g, 'from-emerald-$1');
  fs.writeFileSync(file, content);
});
console.log('done replacing');
