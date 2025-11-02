
/* === mobile-fixes.js ===
   Guards against iOS URL bar resize storms and rebuild loops.
   Load this AFTER your existing animation.js.
*/

(function () {
  // 3) Gallery / marquee rebuild guard: only rebuild when WIDTH changes
  var lastW = window.innerWidth;
  var rafId = 0;
  var rebuild = function () {
    // Build function is defined in your main script; call only if present
    if (typeof buildMarquee === 'function') {
      Promise.resolve(buildMarquee()).then(function () {
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          window.ScrollTrigger.refresh();
        }
      });
    }
  };

  window.addEventListener('resize', function () {
    var nowW = window.innerWidth;
    // ignore height-only changes (URL bar open/close)
    if (Math.abs(nowW - lastW) < 1) return;
    lastW = nowW;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(rebuild);
  }, { passive: true });

  // 1) Hint the browser to keep hero on its own layer (extra safety)
  var hero = document.querySelector('.mainVisual .hero img');
  if (hero) {
    hero.style.backfaceVisibility = 'hidden';
    hero.style.transform = 'translateZ(0)';
    hero.style.willChange = 'transform';
  }
})();

// === HERO: 固定vh変数セット（Android Chrome向け） ===
(function(){
  function setVhOnce(){
    var vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
    // 端末差を吸収。極端な値（キーボード展開直後など）は弾く
    if (vh > 200) {
      document.documentElement.style.setProperty('--vh0', String(vh));
    }
  }
  // 初期化
  setVhOnce();
  // 画面の向き変更時のみ再測定（スクロールでは更新しない）
  window.addEventListener('orientationchange', function(){
    setTimeout(setVhOnce, 300);
  }, { passive: true });
})();
