// Yasal metin eşitlik kanıtı: her yasal sayfanın görünür metnini (etiketler hariç)
// baz sürümden (git) ve güncel kaynaktan çıkarıp karşılaştırır.
//   Baz: <main> içeriği.  Güncel: data-legal ile işaretli bölgeler (sırayla).
//   Ek: HTML yorumları, form id'leri ve hesap silme satır içi betiği birebir aynı mı?
// Kullanım: node scripts/legal-text-check.mjs [baz-commit]   (varsayılan: 19e21fd)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const base = process.argv[2] || '19e21fd';
const pages = ['index', 'privacy', 'terms', 'community', 'delete-account', 'contact', 'about', 'third-party'];
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rarr: '→', larr: '←' };

const text = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m))
  .replace(/\s+/g, ' ')
  .trim();
const comments = (html) => (html.match(/<!--[\s\S]*?-->/g) || []).join('\n');
const ids = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).filter((i) => /^(email|send|after|session|delete|msg)$/.test(i)).join(',');
const mainOf = (html) => html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];

function legalRegions(html) {
  const out = [];
  const re = /<([a-z0-9]+)\b[^>]*\sdata-legal\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const tr = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    tr.lastIndex = re.lastIndex;
    let depth = 1, t;
    while (depth && (t = tr.exec(html))) depth += t[1] ? -1 : 1;
    out.push(html.slice(re.lastIndex, t.index));
    re.lastIndex = tr.lastIndex;
  }
  return out.join(' ');
}

let fail = 0;
for (const p of pages) {
  const rel = `public-legal/${p}.html`;
  const before = execSync(`git -C "${root}" show ${base}:${rel}`, { encoding: 'utf8' });
  const after = fs.readFileSync(path.join(root, rel), 'utf8');
  const a = text(mainOf(before));
  const region = legalRegions(after);
  const b = text(region);
  const sameText = a === b;
  const sameComments = comments(mainOf(before)) === comments(region);
  const sameIds = ids(mainOf(before)) === ids(region);
  let line = `${sameText && sameComments && sameIds ? 'AYNI ' : 'FARKLI'} ${rel}: ${a.length} karakter, ${a.split(' ').length} kelime`;
  if (!sameText) {
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    line += `\n   ilk fark @${i}: baz «${a.slice(i - 30, i + 40)}» / yeni «${b.slice(i - 30, i + 40)}»`;
  }
  if (!sameComments) line += '\n   HTML yorumları farklı';
  if (!sameIds) line += `\n   form id'leri farklı: ${ids(mainOf(before))} / ${ids(region)}`;
  if (p === 'delete-account') {
    const s0 = before.match(/<script type="module">[\s\S]*?<\/script>/)[0];
    const s1 = (after.match(/<script type="module">[\s\S]*?<\/script>/) || [''])[0];
    const sameScript = s0 === s1;
    line += `\n   satır içi silme betiği birebir aynı: ${sameScript ? 'EVET' : 'HAYIR'} (${s0.length} karakter)`;
    if (!sameScript) fail++;
  }
  if (!(sameText && sameComments && sameIds)) fail++;
  console.log(line);
}
console.log(fail ? `\n${fail} sayfada FARK VAR` : '\nTüm yasal sayfaların metni baz sürümle birebir aynı.');
process.exit(fail ? 1 : 0);
