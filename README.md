# FOYTRAL Web

FOYTRAL'ın tanıtım sitesi ve yasal sayfaları (gizlilik, koşullar, topluluk kuralları, hesap silme, iletişim, üçüncü taraflar).

## Yapı
- `index.html` — tanıtım ana sayfası
- `public-legal/` — 8 yasal sayfa (**şablon**: `__YER_TUTUCU__` alanları kaynakta kalır)
- `assets/site.css` — tek ortak stil dosyası (mobil öncelikli; HTML içinde `<style>` yok)
- `assets/site.js` — küçük yardımcı betik (mobil menüyü kapatma, görünme animasyonu); JS kapalıyken site tam çalışır
- `assets/delete-steps.js` — hesap silme sayfasındaki adım göstergesi (silme akışına dokunmaz)
- `assets/fonts/` — Inter / Inter Tight (SIL OFL), Latin+Türkçe alt kümeli woff2, self-host
- `assets/img/` — gerçek uygulama ekranları (durum çubuğu kırpılmış, 320w/640w webp)
- `assets/og-image.jpg` — 1200×630 paylaşım görseli (feature graphic'ten)
- `assets/` — FOYTRAL logosu ve uygulama ikonları
- `scripts/legal-text-check.mjs` — yasal sayfaların görünür metninin baz sürümle birebir aynı olduğunu kanıtlar (`data-legal` bölgeleri)
- `site.config.json` — yer tutucu değerleri (herkese açık bilgiler). `site.config.local.json` varsa o kullanılır (git dışı).
- `build.mjs` — yer tutucuları doldurup `dist/` üretir; zorunlu alan boşsa durur.
- `check.mjs` — bağlantı, yer tutucu, palet, hesap silme bağlantısı kontrolleri.

## Komutlar
```
node build.mjs && node check.mjs
node scripts/legal-text-check.mjs   # yasal metin eşitliği
```

Yasal sayfalarda hukuki metin `data-legal` ile işaretli bölgelerdedir; kabuk (üst bar, içindekiler, adımlar, alt bilgi) bu bölgelerin dışındadır.

## Yayın (GitHub Pages — sahip onayıyla)
1. GitHub'da `foytral-web` adlı depo oluştur, bu klasörü gönder.
2. Settings › Pages › Source: **GitHub Actions**.
3. `deploy/github-pages.yml` dosyasını `.github/workflows/pages.yml` olarak taşı; sonra Actions › "FOYTRAL web - GitHub Pages" › **Run workflow** (yalnız elle tetiklenir).
4. Settings › Pages › Custom domain: `foytral.com`, "Enforce HTTPS" açık.
5. Turhost DNS: `foytral.com` için A kayıtları 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153; `www` için CNAME `<kullanici>.github.io`.

## Uygulama projesiyle bağlantı
`FOYTRAL_SPOR` içindeki `npm run legal:build`, `store:preflight` ve `production-check` bu klasörü (`../FOYTRAL_WEB`) otomatik bulur; yoksa uygulama içindeki eski `public-legal` klasörüne döner.

Hesap silme sayfası Supabase Edge Function `foytral-delete-account-v2`'yi çağırır; bu ad değiştirilmemelidir.
