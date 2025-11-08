// ボタン
(() => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".btnRow").forEach(row => {
    const buttons = row.querySelectorAll(".btn");

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

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ScrollTrigger.getAll().forEach(t => t.disable());
    document.querySelectorAll('.btnRow .btn').forEach(b => {
      b.style.opacity = 1;
      b.style.transform = 'none';
    });
  }
})();


// 住所コピー
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'copyAddress') {
    const text = '〒150-0001 東京都渋谷区桜丘町1-23 さくらヒルズビル 5F';
    navigator.clipboard.writeText(text).then(() => {
      e.target.textContent = 'コピーしました ✓';
      setTimeout(() => e.target.textContent = '住所をコピー', 1500);
    });
  }
});