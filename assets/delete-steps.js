// Hesap silme sayfası: adım göstergesini mevcut akışın durumuna göre günceller.
// Silme akışına (satır içi modül betiği) dokunmaz; yalnızca #after ve #msg öğelerini izler.
(function () {
  var steps = document.querySelectorAll('#silme-adimlar li');
  var after = document.getElementById('after');
  var msg = document.getElementById('msg');
  if (!steps.length || !after || !msg) return;
  function set(active) {
    steps.forEach(function (li, i) {
      li.classList.toggle('is-done', i < active || active === steps.length);
      li.classList.toggle('is-active', i === active);
      if (i === active) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }
  function update() {
    var ok = msg.className === 'ok';
    var text = msg.textContent || '';
    if (ok && after.hidden && /silindi/i.test(text)) return set(steps.length); // 4: silindi
    if (!after.hidden) return set(2);                                          // 3: onay
    if (ok) return set(1);                                                     // 2: bağlantı gönderildi
    set(0);                                                                    // 1: e-posta
  }
  new MutationObserver(update).observe(after, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(update).observe(msg, { attributes: true, childList: true, characterData: true, subtree: true });
  update();
})();
