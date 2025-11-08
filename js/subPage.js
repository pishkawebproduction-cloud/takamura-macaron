// ===================== ボタンアニメーション =====================
(() => {
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger の不要なリフレッシュを減らす
  if (window.ScrollTrigger && ScrollTrigger.config) {
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      ignoreMobileResize: true
    });
  }

  // prefers-reduced-motion を考慮してアニメ制御
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.utils.toArray(".btnRow").forEach(row => {
    const buttons = row.querySelectorAll(".btn");

    if (reduced) {
      buttons.forEach(b => {
        b.style.opacity = 1;
        b.style.transform = "none";
      });
      return;
    }

    // ScrollTrigger 登録
    gsap.from(buttons, {
      scrollTrigger: {
        trigger: row,
        start: "top 95%",
        toggleActions: "play reverse play reverse"
      },
      duration: 0.9,
      opacity: 0,
      y: 20,
      ease: "power2.out",
      stagger: { each: 0.08 },
      clearProps: "opacity,transform"
    });
  });
})();


// ===================== 住所コピー =====================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#copyAddress');
  if (!btn) return;

  const text = '〒150-0001 東京都渋谷区桜丘町1-23 さくらヒルズビル 5F';

  // Clipboard API が使えない環境でも安全にフォールバック
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'コピーしました ✓';
      setTimeout(() => btn.textContent = '住所をコピー', 1500);
    }).catch(() => alert('コピーに失敗しました'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      btn.textContent = 'コピーしました ✓';
      setTimeout(() => btn.textContent = '住所をコピー', 1500);
    } catch {
      alert('コピーに失敗しました');
    } finally {
      document.body.removeChild(ta);
    }
  }
});
