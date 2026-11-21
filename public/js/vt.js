// Evita avisos en consola cuando el navegador cancela una transición de página (no afecta la navegación).
(function () {
  function quiet(t) {
    if (!t) return;
    ['ready', 'finished', 'updateCallbackDone'].forEach(function (k) { if (t[k] && t[k].catch) t[k].catch(function () {}); });
  }
  window.addEventListener('pagereveal', function (e) { quiet(e.viewTransition); });
  window.addEventListener('pageswap', function (e) { quiet(e.viewTransition); });
})();
