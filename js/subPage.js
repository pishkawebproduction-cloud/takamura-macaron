(() => {
  const header = document.querySelector('.site-header');
  const nav = header.querySelector('nav');
  const toggle = header.querySelector('.search-toggle');
  const input = header.querySelector('input[type="search"]');
  const searchClose = header.querySelector('.searchClose');

  // navの実高さを CSS 変数へ（検索バーの高さに使う）
  const syncHeaderH = () => {
    const h = nav.offsetHeight;
    header.style.setProperty('--header-h', h + 'px');
  };
  syncHeaderH();
  window.addEventListener('resize', syncHeaderH);

  const open = () => {
    header.classList.add('is-search-open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => input && input.focus(), 10);
  };
  const close = () => {
    header.classList.remove('is-search-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    header.classList.contains('is-search-open') ? close() : open();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-search-open')) close();
  });
  searchClose.addEventListener('click', () => {
    header.classList.contains('is-search-open') ? close() : open();
  });

})();




(() => {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.mainVisual') || document.body; // ヒーロー要素があれば指定
  const H = () => header.querySelector('nav')?.offsetHeight || 100;

  if (header.hasAttribute('data-lock-scrolled')) {
  // 念のためクラスを付け直して終了（JSによる上書きを回避）
  header.classList.add('is-scrolled');
  return;
}
  // ヒーローの下端がヘッダー高さを越えたら "is-scrolled" を付与
  const io = new IntersectionObserver(([e]) => {
    // 交差していない＝ヒーローを抜けた → is-scrolled
    header.classList.toggle('is-scrolled', !e.isIntersecting);
  }, {
    root: null,
    // ヘッダー高さ分だけ上にオフセットして、ヘッダーの下に来たら発火
    rootMargin: `-${H()}px 0px 0px 0px`,
    threshold: 0
  });

  // 監視対象（ヒーローの“最上部領域”）
  io.observe(hero);

  // 画像/フォントでヘッダー高さが変わる対策
  addEventListener('load', () => {
    io.disconnect();
    new IntersectionObserver(([e]) => {
      header.classList.toggle('is-scrolled', !e.isIntersecting);
    }, { rootMargin: `-${H()}px 0px 0px 0px` }).observe(hero);
  });
})();


//文字のアニメーション
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const targets = document.querySelectorAll('.reveal-letters');
  if (!targets.length) return;

  targets.forEach(el => {
    const raw = el.innerHTML;
    const lines = raw.split(/<br\s*\/?>/i);
    el.innerHTML = '';

    const chars = [];

    lines.forEach((line, i) => {
  const frag = document.createDocumentFragment();

  // ← 行頭の余白を削除
  const cleanLine = line.replace(/^\s+/, "");

  [...cleanLine].forEach(ch => {
    if (ch === " ") {
      frag.appendChild(document.createTextNode(" "));
    } else {
      const wrap = document.createElement('span');
      wrap.className = 'charWrap';
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      wrap.appendChild(span);
      frag.appendChild(wrap);
      chars.push(span);
    }
  });

  el.appendChild(frag);
  if (i < lines.length - 1) {
    const br = document.createElement('span');
    br.className = 'br';
    el.appendChild(br);
  }
});

  const total = chars.length;
    gsap.from(chars, {
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        toggleActions: "play reverse play reverse"
      },
      duration: 1.2,
      ease: "expo.out",
      opacity: 0,
      y: (i) => gsap.utils.mapRange(0, total - 1, 10, 40)(i),
      scaleY: (i) => gsap.utils.mapRange(0, total - 1, 0.8, 0.4)(i),
      delay: (i) => gsap.utils.mapRange(0, total - 1, 0.0, 0.35)(i),
      stagger: { amount: 0.12 }
    });
  });
})();






(() => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".sectionWrap img").forEach(img => {
    gsap.from(img, {
      scrollTrigger: {
        trigger: img,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      duration: 1,
      opacity: 0,   // 透明度だけ
      y: 100,        // 下からふわっと上がる
      ease: "power2.out",
      clearProps: "opacity,transform" // ← 終了後はinline style消去、hoverに干渉しない
    });
  });
})();

(() => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".menuPic img").forEach(img => {
    gsap.from(img, {
      scrollTrigger: {
        trigger: img,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      duration: 1,
      opacity: 0,   // 透明度だけ
      y: 100,        // 下からふわっと上がる
      ease: "power2.out",
      clearProps: "opacity,transform" // ← 終了後はinline style消去、hoverに干渉しない
    });
  });
})();


(() => {
  gsap.registerPlugin(ScrollTrigger);

  // 1) 各 .btnRow を単位に、子ボタンをまとめてアニメ（入場は順番に）
  gsap.utils.toArray(".btnRow").forEach(row => {
    const buttons = row.querySelectorAll(".btn");

    gsap.from(buttons, {
      scrollTrigger: {
        trigger: row,
        start: "top 95%",                // 画面に入ったら
        toggleActions: "play reverse play reverse"
      },
      duration: 0.9,
      opacity: 0,
      y: 20,                             // 下から
      ease: "power2.out",
      stagger: { each: 0.08 },           // ボタンを順番に
      clearProps: "opacity,transform"    // 終了後はinline styleを消してhoverに干渉しない
    });
  });

  // 低速/動きを減らす設定のユーザー配慮（任意）
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
      navigator.clipboard.writeText(text).then(()=>{
        e.target.textContent = 'コピーしました ✓';
        setTimeout(()=> e.target.textContent = '住所をコピー', 1500);
      });
    }
  });





(() => {
  // GSAP/ScrollTriggerは既に読み込み済み想定
  const topBar = document.querySelector('.barTop');
  const bottomBar = document.querySelector('.barBottom');

  // ページ読込時：開く（= 上は上へ、下は下へ退場）
  window.addEventListener('load', () => {
    gsap.to(topBar,    { duration: 0.9, yPercent: -100, ease: "power4.inOut" });
    gsap.to(bottomBar, { duration: 0.9, yPercent:  100, ease: "power4.inOut", delay: 0.05 });
  });

  // ページ遷移時：閉じる（= 画面を覆う位置へ）
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || a.target === '_blank') return;

      e.preventDefault();
      // まず戻す（yPercent:0 で40vh/60vh位置に“閉じる”）
      gsap.to(topBar,    { duration: 0.9, yPercent: 0, ease: "power4.inOut" });
      gsap.to(bottomBar, { duration: 0.9, yPercent: 0, ease: "power4.inOut", delay: 0.05,
        onComplete: () => { window.location.href = href; }
      });
    });
  });
})();



(() => {
  const burger = document.querySelector('.burger');
  if (!burger) return;

  burger.addEventListener('click', () => {
    document.body.classList.toggle('is-nav-open');
    const expanded = document.body.classList.contains('is-nav-open');
    burger.setAttribute('aria-expanded', expanded);
  });
})();


