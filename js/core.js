// ===================== ヘッダー（高さ同期＋検索トグル） =====================
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const nav = header.querySelector('nav');
  const toggle = header.querySelector('.search-toggle');
  const input = header.querySelector('input[type="search"]');
  const searchClose = header.querySelector('.searchClose');

  // rAFスロットル
  const rafThrottle = (fn) => {
    let scheduled = false;
    return (...args) => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn(...args);
      });
    };
  };

  // CSS変数 --header-h を同期し、変更イベントを飛ばす
  const setHeaderH = () => {
    const h = (nav?.offsetHeight) || 100;
    header.style.setProperty('--header-h', h + 'px');
    // IOのrootMargin更新用
    window.dispatchEvent(new CustomEvent('header:heightchange', { detail: { h } }));
  };
  const applyHeaderH = rafThrottle(setHeaderH);

  // 初期適用
  applyHeaderH();

  // 高さ監視：ResizeObserver優先、なければresize/load
  if ('ResizeObserver' in window && nav) {
    const ro = new ResizeObserver(() => applyHeaderH());
    ro.observe(nav);
  } else {
    window.addEventListener('resize', applyHeaderH, { passive: true });
    window.addEventListener('load', applyHeaderH);
  }

  // 検索パネルの開閉（アクセシビリティ含む）
  const open = () => {
    header.classList.add('is-search-open');
    toggle?.setAttribute('aria-expanded', 'true');
    if (input) setTimeout(() => input.focus(), 10);
  };
  const close = () => {
    header.classList.remove('is-search-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
  };

  toggle?.addEventListener('click', () => {
    header.classList.contains('is-search-open') ? close() : open();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-search-open')) close();
  });

  searchClose?.addEventListener('click', () => {
    header.classList.contains('is-search-open') ? close() : open();
  });
})();


// ===================== スクロール連動のヘッダー状態（is-scrolled） =====================
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const hero = document.querySelector('.mainVisual') || document.body;
  const nav = header.querySelector('nav');

  const H = () => (nav?.offsetHeight || 100);

  let io; // IntersectionObserverのハンドル

  const createObserver = () => {
    if (io) io.disconnect();

    io = new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, {
      root: null,
      rootMargin: `-${H()}px 0px 0px 0px`,
      threshold: 0
    });

    if (hero) io.observe(hero);
  };

  // 固定化フラグが付いていれば常時scrolled
  if (header.hasAttribute('data-lock-scrolled')) {
    header.classList.add('is-scrolled');
    return;
  }

  // 初期生成
  createObserver();

  // ページロード後に再評価（フォント/レイアウト確定後）
  window.addEventListener('load', createObserver);

  // ヘッダー高さが変わったらrootMarginを更新
  window.addEventListener('header:heightchange', createObserver);
})();


//ハンバーガーメニュー

(() => {
  const burger = document.querySelector('.burger');
  if (!burger) return;

  burger.addEventListener('click', () => {
    document.body.classList.toggle('is-nav-open');
    const expanded = document.body.classList.contains('is-nav-open');
    burger.setAttribute('aria-expanded', expanded);
  });
})();


// SPメニューの画像切り替えアニメーション（安定版：可視時だけ起動／非表示タブでは停止）
document.addEventListener("DOMContentLoaded", () => {
  const A = document.querySelector(".spPic--a");
  const B = document.querySelector(".spPic--b");
  if (!A || !B) return;

  // 画像リスト（必要に応じてaltを書き換え）
  const ver  = "20251106";
  const base = "https://cdn.jsdelivr.net/gh/pishkawebproduction-cloud/takamura-macaron@psi-tuning-20251106/images";
  const images = [
    { name: "cheeseCake", alt: "チーズケーキ" },
    { name: "chocoCake",  alt: "チョコケーキ"  },
    { name: "cupCake",    alt: "ミントカップケーキ" },
    { name: "fancyCake",  alt: "ファンシーケーキ" },
    { name: "tart",       alt: "タルト" }
  ];

  // 共通のsizes（必要ならページに合わせて調整）
  const sizes = "(max-width: 768px) 90vw, 500px";

  // `<picture>`に画像セットを適用する関数
  function applyToPicture(pictureEl, item, priority /* 'high' or 'low' */) {
    const source = pictureEl.querySelector("source[type='image/webp']");
    const img    = pictureEl.querySelector("img");

    const webp320 = `${base}/${item.name}-320.webp?v=${ver}`;
    const webp500 = `${base}/${item.name}-500.webp?v=${ver}`;
    const png500  = `${base}/${item.name}-500.png?v=${ver}`;

    // WebPのsrcset/sizesを更新
    if (source) {
      source.setAttribute("srcset", `${webp320} 320w, ${webp500} 500w`);
      source.setAttribute("sizes", sizes);
    }

    // フォールバックimgのsrc/srcset/sizes/alt
    if (img) {
      img.setAttribute("src", png500);
      img.setAttribute("srcset", `${png500} 500w`);
      img.setAttribute("sizes", sizes);
      img.setAttribute("alt", item.alt || "");
      img.setAttribute("fetchpriority", priority === "high" ? "high" : "low");
      // 安全のため
      img.setAttribute("decoding", "async");
      img.setAttribute("loading", "lazy");
    }
  }

  // 事前デコード用：<img>を取り出すヘルパ
  const getImg = (pictureEl) => pictureEl.querySelector("img");
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // 最初に表示するもの（Aに適用）
  let i = 0;
  applyToPicture(A, images[i], "high");

  let showA = true;

  // ===== 可視状態制御：非表示タブでは停止 =====
  let running   = !document.hidden;
  let looping   = false;   // ループ中フラグ
  let loopToken = 0;       // ループ世代（中断・再開の衝突防止）

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) startLoop(); // 復帰で再開
  });

  // ===== 画面に入ったら初めて起動（IntersectionObserver） =====
  const wrapper = document.querySelector('.spMenuPicWrap') || A.closest('.spMenuPicWrap') || A;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startLoop();
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(wrapper);
  } else {
    // 古環境は即開始
    startLoop();
  }

  // ===== 切り替えループ本体（可視時のみ回す。二重起動防止） =====
  async function startLoop() {
    if (looping) return;
    looping = true;
    const myToken = ++loopToken;

    while (running && myToken === loopToken) {
      await sleep(4000);
      i = (i + 1) % images.length;

      const front = showA ? A : B; // 現在表示中
      const back  = showA ? B : A; // 次に表示する側

      // 次画像を後ろ側pictureへセット（優先度は一時的にhigh）
      applyToPicture(back, images[i], "high");

      // 画像のデコード完了を待ってからフェード（チラつき防止＆CLSゼロ）
      const backImg = getImg(back);
      if (backImg?.decode) {
        try { await backImg.decode(); } catch {}
      } else if (backImg && !backImg.complete) {
        await new Promise(r => backImg.onload = r);
      }

      // 可視状態が変わっていたらここで抜ける
      if (!running || myToken !== loopToken) break;

      // フェード切替
      front.classList.remove("is-show");
      back.classList.add("is-show");
      showA = !showA;

      // 切り替え後は前面のfetchpriorityをlowに戻して帯域節約
      const frontImg = getImg(front);
      if (frontImg) frontImg.setAttribute("fetchpriority", "low");

      // 余韻（フェード時間と合わせる）
      await sleep(800);
    }

    looping = false;
  }
});



// ページトランジション
(() => {
  const topBar = document.querySelector('.barTop');
  const bottomBar = document.querySelector('.barBottom');
  if (!topBar || !bottomBar) return;

  window.addEventListener('load', () => {
    gsap.to(topBar, { duration: 0.9, yPercent: -100, ease: "power4.inOut" });
    gsap.to(bottomBar, { duration: 0.9, yPercent: 100, ease: "power4.inOut", delay: 0.05 });
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href') || '';

    const isHashOnly = href === '#' || href.startsWith('#');
    const isJSLink = href.startsWith('javascript:');
    const isBlank = href.trim() === '';
    const isExternal = a.origin && a.origin !== location.origin;
    const isNoTrans = a.hasAttribute('data-no-transition');
    const isDownload = a.hasAttribute('download');
    const isNewWindow = a.target === '_blank';

    if (isHashOnly || isJSLink || isBlank || isExternal || isNoTrans || isDownload || isNewWindow) {
      return;
    }
    // -----------------------------------------------

    e.preventDefault();
    gsap.to(topBar, { duration: 0.9, yPercent: 0, ease: "power4.inOut" });
    gsap.to(bottomBar, {
      duration: 0.9, yPercent: 0, ease: "power4.inOut", delay: 0.05,
      onComplete: () => { window.location.href = a.href; }
    });
  });
})();


//文字のアニメーション
// 文字のアニメーション（必要時だけDOM分割）
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const targets = document.querySelectorAll('.reveal-letters');
  if (!targets.length) return;

  const build = (el) => {
    if (el.dataset.built) return;
    el.dataset.built = '1';

    const raw = el.innerHTML;
    const lines = raw.split(/<br\s*\/?>/i);
    el.innerHTML = '';

    const chars = [];
    lines.forEach((line, i) => {
      const frag = document.createDocumentFragment();
      const clean = line.replace(/^\s+/, "");
      [...clean].forEach(ch => {
        if (ch === " ") frag.appendChild(document.createTextNode(" "));
        else {
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
      scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play reverse play reverse" },
      duration: 1.2,
      ease: "expo.out",
      opacity: 0,
      y: (i) => gsap.utils.mapRange(0, total - 1, 10, 40)(i),
      scaleY: (i) => gsap.utils.mapRange(0, total - 1, 0.8, 0.4)(i),
      delay: (i) => gsap.utils.mapRange(0, total - 1, 0.0, 0.35)(i),
      stagger: { amount: 0.12 }
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { build(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '200px' });
    targets.forEach(t => io.observe(t));
  } else {
    // 古環境は従来通り
    targets.forEach(build);
  }
})();


//画像のアニメーション
(() => {
  gsap.registerPlugin(ScrollTrigger);

  // 共通で使えるセレクタ配列
  const selectors = [".sectionWrap img", ".menuPic img"];

  // すべての対象画像にアニメーションを適用
  gsap.utils.toArray(selectors.join(",")).forEach(img => {
    gsap.from(img, {
      scrollTrigger: {
        trigger: img,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      duration: 1,
      opacity: 0,
      y: 100,
      ease: "power2.out",
      clearProps: "opacity,transform"
    });
  });
})();
