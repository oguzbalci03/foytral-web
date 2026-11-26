// FOYTRAL web — küçük yardımcı betik (menü kapatma, görünme animasyonu). JS kapalıyken site tam çalışır.
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  // Mobil menü: bağlantıya tıklayınca, Escape ile veya dışarı dokununca kapan.
  var menu = document.querySelector('.nav-mobile');
  if (menu) {
    var summary = menu.querySelector('summary');
    var sync = function () { summary.setAttribute('aria-expanded', menu.open ? 'true' : 'false'); };
    sync();
    menu.addEventListener('toggle', sync);
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.open = false; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
    });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  // Masaüstünde içindekiler açık başlasın.
  var toc = document.querySelector('.toc');
  if (toc && window.matchMedia('(min-width: 900px)').matches) toc.open = true;

  // Görünme animasyonu (hareket azaltma tercihine saygılı).
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
