// FOYTRAL web derlemesi: kaynak sayfalardaki __YER_TUTUCU__ değerlerini site.config.json ile doldurup dist/ klasörüne yazar.
// Kaynak dosyalar değişmez (yer tutucular kaynakta kalır). Kullanım: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const dist = path.join(root, 'dist');
const cfgFile = fs.existsSync(path.join(root, 'site.config.local.json')) ? 'site.config.local.json' : 'site.config.json';
const cfg = JSON.parse(fs.readFileSync(path.join(root, cfgFile), 'utf8'));
const OPTIONAL = new Set(['__SUPPORT_PHONE__', '__LEGAL_OPERATOR_KEP__']);

const missing = Object.entries(cfg).filter(([k, v]) => k.startsWith('__') && !OPTIONAL.has(k) && !String(v).trim()).map(([k]) => k);
if (missing.length) {
  console.error('DERLEME DURDU: zorunlu alanlar boş → ' + missing.join(', '));
  process.exit(1);
}

fs.rmSync(dist, { recursive: true, force: true });
const copy = (rel) => {
  const src = path.join(root, rel);
  const dst = path.join(dist, rel);
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) copy(path.join(rel, name));
    return;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (rel.endsWith('.html')) {
    let html = fs.readFileSync(src, 'utf8');
    for (const [k, v] of Object.entries(cfg)) if (k.startsWith('__')) html = html.split(k).join(String(v));
    const left = html.match(/__[A-Z][A-Z0-9_]+__/g);
    if (left) { console.error(`DERLEME DURDU: ${rel} içinde doldurulmamış yer tutucu: ${[...new Set(left)].join(', ')}`); process.exit(1); }
    fs.writeFileSync(dst, html);
  } else fs.copyFileSync(src, dst);
};
for (const rel of ['index.html', 'assets', 'public-legal']) copy(rel);
fs.writeFileSync(path.join(dist, 'CNAME'), new URL(cfg.__LEGAL_WEBSITE_URL__).hostname + '\n');
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log(`FOYTRAL web derlendi → dist/ (${cfgFile})`);
