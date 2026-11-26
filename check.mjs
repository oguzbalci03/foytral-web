// FOYTRAL web kontrolleri: node build.mjs && node check.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const dist = path.join(root, 'dist');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const files = [];
(function walk(d) { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(dist);
const htmls = files.filter((f) => f.endsWith('.html'));
ok(htmls.length === 9, `9 HTML sayfası var (${htmls.length})`);
for (const f of htmls) {
  const rel = path.relative(dist, f);
  const s = fs.readFileSync(f, 'utf8');
  ok(!/__[A-Z][A-Z0-9_]+__/.test(s), `${rel}: yer tutucu kalmadı`);
  ok(s.includes('assets/site.css') && !/<style[\s>]/i.test(s), `${rel}: yalnız ortak CSS`);
  ok(/<meta name="viewport"/.test(s) && /<html lang="tr">/.test(s), `${rel}: viewport + lang`);
  for (const m of s.matchAll(/(?:href|src)="([^"#:?]+)(?:#[^"]*)?"/g)) {
    const target = path.normalize(path.join(path.dirname(f), m[1]));
    ok(fs.existsSync(target), `${rel}: bağlantı ${m[1]}`);
  }
}
const css = fs.readFileSync(path.join(dist, 'assets/site.css'), 'utf8');
for (const c of ['#080615', '#111024', '#1A1732', '#34294F', '#913CFF', '#D56BFF', '#F9F7FF', '#B8B0CF']) ok(css.toUpperCase().includes(c), `palet ${c}`);
const all = files.filter((f) => /\.(html|css)$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n').toLowerCase();
for (const bad of ['#ff3b4e', '#ff334d', '#f97316', '#fb923c', '#f59e0b', '#ffa500', 'orange']) ok(!all.includes(bad), `yasak renk yok: ${bad}`);
const del = fs.readFileSync(path.join(dist, 'public-legal/delete-account.html'), 'utf8');
ok(del.includes("DELETE_FUNCTION='foytral-delete-account-v2'"), 'hesap silme: foytral-delete-account-v2 bağlantısı');
ok(del.includes("SUPABASE_URL='https://") && del.includes("SUPABASE_KEY='sb_publishable_"), 'hesap silme: Supabase herkese açık istemci değerleri dolu');
ok(del.includes('shouldCreateUser:false'), 'hesap silme: yeni hesap açılmaz (shouldCreateUser:false)');
ok(del.includes("SUPABASE_URL+'/functions/v1/'+DELETE_FUNCTION"), 'hesap silme: fonksiyon adresi değişmedi');
const home = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
ok(!/\d[\d.,]*\s*\+?\s*(kullanıcı|indirme|yorum|puan|üye)/i.test(home) && !/★|yıldız/i.test(home), 'ana sayfa: uydurma sayı/yorum yok');
ok(/Google Play’de yakında/.test(home), 'ana sayfa: Google Play yakında alanı');
for (const f of ['Spor haritası', 'Antrenör bulma', 'Topluluk', 'Canlı koşu', 'FOYTRAL Fit']) ok(home.includes(f), `ana sayfa özelliği: ${f}`);
console.log(fail ? `\n${fail} kontrol BAŞARISIZ` : '\nTüm kontroller geçti');
process.exit(fail ? 1 : 0);
