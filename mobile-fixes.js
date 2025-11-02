
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

// === HERO: iOS Chrome 固定高さ（最大値ロック） ===
(function(){
  var maxVH = 0;
  function currentVH(){
    var vvh = (window.visualViewport && window.visualViewport.height) ? Math.round(window.visualViewport.height) : 0;
    var ih  = window.innerHeight || 0;
    var ch  = document.documentElement ? document.documentElement.clientHeight : 0;
    return Math.max(vvh, ih, ch);
  }
  function apply(v){ document.documentElement.style.setProperty('--vh0', String(v)); }

  // 連続サンプリング（読み込み直後〜650ms）
  function sampleFor(ms){
    var t0 = performance.now();
    var timer = setInterval(function(){
      var h = currentVH();
      if (h > maxVH && h > 200) { maxVH = h; apply(maxVH); }
      if (performance.now() - t0 > ms) clearInterval(timer);
    }, 50);
    // 一発目も反映
    var first = currentVH();
    if (first > maxVH && first > 200) { maxVH = first; apply(maxVH); }
  }

  // 初期化
  sampleFor(650);

  // 画面の向き変更時のみ、少し待ってから再サンプリング
  window.addEventListener('orientationchange', function(){
    setTimeout(function(){ maxVH = 0; sampleFor(800); }, 300);
  }, { passive: true });
})();
(function () {
  var root = document.documentElement;
  var box  = document.querySelector('.mainVisual');
  var hero = document.querySelector('.mainVisual .hero');
  if (!box || !hero) return;

  function measureVH() {
    var vvh = (window.visualViewport && window.visualViewport.height) || 0;
    var ih  = window.innerHeight || 0;
    var ch  = root.clientHeight || 0;
    var h   = Math.max(vvh, ih, ch);
    if (h < 240) h = ih || ch || 640;
    return Math.round(h);
  }

  function apply(h) {
    box.style.height  = h + 'px';
    hero.style.height = h + 'px';
  }

  function lockOnce() {
    var maxH = 0;
    var t0 = performance.now();
    var timer = setInterval(function () {
      var h = measureVH();
      if (h > maxH) { maxH = h; apply(maxH); }
      if (performance.now() - t0 > 650) clearInterval(timer);
    }, 50);
    var first = measureVH();
    if (first > maxH) { maxH = first; apply(maxH); }
  }

  lockOnce();
  window.addEventListener('orientationchange', function () {
    setTimeout(function () { lockOnce(); }, 300);
  }, { passive: true });
})();
