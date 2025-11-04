//ヘッダー
(() => {
  const header = document.querySelector('.site-header');
  const nav = header.querySelector('nav');
  const toggle = header.querySelector('.search-toggle');
  const input = header.querySelector('input[type="search"]');
  const searchClose = header.querySelector('.searchClose');

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

// メインビジュアル
window.addEventListener("scroll", () => {
  const title = document.querySelector(".mainVisual h2");
  if (!title) return;

  const scrollY = window.scrollY;
  const offset = Math.min(scrollY * 0.4, 100); // 最大で100px移動
  title.style.transform = `translateY(-${offset}px)`;
});

// Indulge
// Indulge（PCだけ有効、hover領域は .indulgePic に限定）
(() => {
  const box   = document.querySelector('.indulge');
  if (!box) return;

  // ★ PC判定：hoverがありポインタが細かい環境のみアニメを有効化
  const isDesktop = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 要素
  const trigger = box.querySelector('.indulgePic') || box; // ← 画像があればそれだけをhover対象に
  const piece   = box.querySelector('.hoverImgParts');
  const def     = box.querySelector('.defaultImg');
  const hov     = box.querySelector('.hoverImg');

  // モバイル（=PC以外）はアニメ無効＆見た目リセットして即return
  if (!isDesktop) {
    if (piece) {
      piece.style.opacity   = 0;
      piece.style.transform = 'translate(0,0) rotate(0) scale(1)';
      piece.style.willChange = 'auto';
    }
    if (hov) hov.style.opacity = 0;
    if (def) def.style.opacity = 1;
    return;
  }

  if (!piece) return; // 念のため

  // ===== ここからPC用アニメ =====
  const TRAJECTORIES = [
    { name:'HighArc', v0:100, angleDeg:28, g:1700, spin:520, jitterX:(t)=>0, jitterY:(t)=>0, scaleStart:1.0, scaleEnd:0.65 },
    { name:'LowDart', v0:400, angleDeg:32, g:1800, spin:720, jitterX:(t)=>8*Math.sin(t*10), jitterY:(t)=>0, scaleStart:0.95, scaleEnd:0.6 },
    { name:'WindRight', v0:400, angleDeg:45, g:1600, spin:1080, jitterX:(t)=>40*t*t, jitterY:(t)=>0, scaleStart:1.0, scaleEnd:0.7 },
    { name:'Boogie', v0:200, angleDeg:90, g:1650, spin:()=> (Math.random()<.5?-1:1)*(360+Math.random()*360),
      jitterX:(t)=>12*Math.sin(t*14+0.7), jitterY:(t)=>-6*Math.sin(t*9), scaleStart:0.98, scaleEnd:0.58 },
    { name:'Legend', v0:800, angleDeg:80, g:1650, spin:()=> (Math.random()<.5?-1:1)*(360+Math.random()*360),
      jitterX:(t)=>12*Math.sin(t*14+0.7), jitterY:(t)=>-6*Math.sin(t*9), scaleStart:0.98, scaleEnd:0.58 },
    { name:'Canon', v0:800, angleDeg:80, g:1650, spin:()=> (Math.random()<.5?-1:1)*(360+Math.random()*360),
      jitterX:(t)=>12*Math.sin(t*14+0.7), jitterY:(t)=>-6*Math.sin(t*9), scaleStart:0.98, scaleEnd:0.58 },
    { name:'Choice', v0:400, angleDeg:10, g:650,  spin:()=> (Math.random()<.5?-1:1)*(360+Math.random()*360),
      jitterX:(t)=>12*Math.sin(t*14+0.7), jitterY:(t)=>-6*Math.sin(t*9), scaleStart:0.98, scaleEnd:0.58 },
  ];
  const pickTrajectory = () => TRAJECTORIES[Math.floor(Math.random()*TRAJECTORIES.length)];

  let rafId = null;

  function tossOnce() {
    if (hov) hov.style.opacity = 1;
    if (def) def.style.opacity = 0;

    const T = pickTrajectory();
    const angleRad   = (T.angleDeg*Math.PI)/180;
    const cos = Math.cos(angleRad), sin = Math.sin(angleRad);
    const spinPerSec = typeof T.spin === 'function' ? T.spin() : T.spin;

    cancelAnimationFrame(rafId);
    piece.style.opacity = 1;
    piece.style.willChange = 'transform, opacity';

    const t0 = performance.now();
    const loop = (now) => {
      const t = (now - t0) / 1000;
      let x = T.v0 * cos * t;
      let y = -T.v0 * sin * t + 0.5 * T.g * t * t;
      if (T.jitterX) x += T.jitterX(t);
      if (T.jitterY) y += T.jitterY(t);
      const rot = spinPerSec * t;
      const k = Math.min(1, t/1.0);
      const s = T.scaleStart + (T.scaleEnd - T.scaleStart) * k;

      piece.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`;

      const ground = box.clientHeight * 0.85;
      if (y < ground && t < 2.2) {
        rafId = requestAnimationFrame(loop);
      } else {
        piece.style.opacity = 0;
        piece.style.willChange = 'auto';
        piece.style.transform = `translate(0,0) rotate(0) scale(${T.scaleStart})`;
        if (hov) hov.style.opacity = 0;
        if (def) def.style.opacity = 1;
      }
    };
    rafId = requestAnimationFrame(loop);
  }

  // ★ hover対象を .indulgePic のみに
  trigger.addEventListener('mouseenter', tossOnce);
  trigger.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    piece.style.opacity = 0;
    piece.style.transform = 'translate(0,0) rotate(0) scale(1)';
    if (hov) hov.style.opacity = 0;
    if (def) def.style.opacity = 1;
  });

  // 動きを減らすユーザー配慮（PCでも尊重）
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    trigger.removeEventListener('mouseenter', tossOnce);
    if (piece) piece.style.opacity = 1;
  }
})();

//　ベストセラーセクション
(() => {
  const container = document.querySelector('.bestSeller .bg-text');
  if (!container) return;

  const LINES = 5;
  const PHRASE = 'BESTSELLER';
  const TARGET_WIDTH_FACTOR = 10;
  const SEP = ' ';

  const buildLine = (startOutlined = true, leftToRight = false) => {
    const line = document.createElement('div');
    line.className = 'line' + (leftToRight ? ' left-to-right' : '');
    container.appendChild(line);

    let outlined = startOutlined;
    let safety = 0;

    while (safety < 200) {
      const token = outlined ? `<span>${PHRASE}</span>${SEP}` : `${PHRASE}${SEP}`;
      line.insertAdjacentHTML('beforeend', token);
      outlined = !outlined;
      safety++;
      if (line.scrollWidth >= container.clientWidth * TARGET_WIDTH_FACTOR) break;
    }

    const oneWidth = Math.round(line.scrollWidth);

    const html = line.innerHTML;
    line.innerHTML = html + html;

    line.style.setProperty('--dist', oneWidth + 'px');

    return line;
  };

  const render = () => {
    container.innerHTML = '';
    for (let i = 0; i < LINES; i++) {
      const leftToRight = i % 2 === 0;
      const startOutlined = i % 2 === 0;
      buildLine(startOutlined, leftToRight);
    }
  };

  render();
  window.addEventListener('resize', () => {
    clearTimeout(render._t);
    render._t = setTimeout(render, 150);
  });
})();

(() => {
  const container = document.querySelector('.aboutHero .bg-text');
  if (!container) return;
  const LINES = 3, PHRASE = 'ABOUT', SEP = ' ';
  const build = (ltr) => {
    const line = document.createElement('div');
    line.className = 'line' + (ltr ? ' left-to-right' : '');
    let s = '';
    for (let i = 0; i < 30; i++) s += (i % 2 ? PHRASE : `<span>${PHRASE}</span>`) + SEP;
    line.innerHTML = s;
    container.appendChild(line);
  };
  container.innerHTML = '';
  for (let i = 0; i < LINES; i++) build(i % 2 === 0);
})();

//編集

//ギャラリー
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('imageWrap');
  if (!wrap) return;

  const waitImages = async (root) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    await Promise.all(imgs.map(img =>
      (img.decode ? img.decode().catch(() => { }) : Promise.resolve())
        .then(() => (img.complete ? undefined : new Promise(r => (img.onload = img.onerror = r))))
    ));
  };

  let revealed = false; // 画像が一度でも出現したかフラグ
  let tween = null;     // marquee の GSAP tween を保持

  const buildMarquee = async () => {
    if (tween) { tween.kill(); tween = null; }

    // 元の1セットを保存（初回のみ）
    const originals = Array.from(wrap.children).map(n => n.cloneNode(true));

    // 一旦初期セットに戻す
    wrap.replaceChildren(...originals.map(n => n.cloneNode(true)));
    await waitImages(wrap);

    // 1セットの正確な幅（margin/gap込み）を取得
    const laneWidth = wrap.scrollWidth;

    // コンテナ幅を埋めるのに必要なセット数を計算（+1で余裕）
    const containerWidth = wrap.parentElement.getBoundingClientRect().width;
    const minSets = Math.max(2, Math.ceil(containerWidth / laneWidth) + 1);

    // 必要セット数になるまで丸ごと複製して末尾に追加
    for (let i = 1; i < minSets; i++) {
      const clones = originals.map(n => {
        const c = n.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        return c;
      });
      wrap.append(...clones);
    }

    // すでに出現済みなら、全画像の is-init を外して即表示（opacity問題の根治）
    if (revealed) {
      wrap.querySelectorAll('img.is-init').forEach(img => img.classList.remove('is-init'));
    }

    // ===== 無停止ループ（Modifiersで折り返し）=====
    gsap.registerPlugin(ModifiersPlugin);
    const SPEED = 120;                 // px/s（好みで）
    const duration = laneWidth / SPEED;
    const wrapX = gsap.utils.wrap(-laneWidth, 0); // 1セットぶんでループ

    gsap.set(wrap, { x: 0 });
    tween = gsap.to(wrap, {
      x: "-=" + laneWidth,
      duration,
      ease: "none",
      repeat: -1,
      modifiers: { x: (v) => wrapX(parseFloat(v)) + "px" }
    });
  };

  (async () => {
    await buildMarquee();

    // ===== スクロールで画像を等倍・フェードイン =====
    gsap.registerPlugin(ScrollTrigger);
    const imgs = () => Array.from(document.querySelectorAll(".imageWrap img")); // 再構築後も拾えるよう関数に

    const playReveal = () => {
      gsap.to(imgs(), {
        scrollTrigger: {
          trigger: ".gallery",
          start: "top 85%",
          toggleActions: "play none none none",
          once: true
        },
        duration: 1,
        opacity: 1,
        scale: 1,
        ease: "power3.out",
        stagger: 0.08,
        onComplete: () => {
          // 全ての is-init を外して今後の再構築でも透明にならないように
          document.querySelectorAll(".imageWrap img.is-init")
            .forEach(img => img.classList.remove("is-init"));
          revealed = true;
        }
      });
    };
    playReveal();

    // リサイズ時は再構築（途切れ対策）。出現済みなら即表示のまま再開
    let rid = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(rid);
      rid = requestAnimationFrame(async () => {
        await buildMarquee();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    }, { passive: true });
  })();
});





// レビューセクション
(() => {
  const scroller = document.getElementById('review-scroller');
  const track = document.getElementById('review-track');

  const ensureWidth = () => {
    if (!scroller.querySelector('[data-clone="1"]')) {
      const c1 = track.cloneNode(true);
      c1.dataset.clone = "1";
      c1.setAttribute('aria-hidden', 'true');
      scroller.appendChild(c1);
    }

    const containerW = scroller.parentElement.getBoundingClientRect().width;
    const totalW = scroller.scrollWidth;
    let i = 2;
    while (scroller.scrollWidth < containerW * 2 && i < 10) {
      const cx = track.cloneNode(true);
      cx.dataset.clone = String(i++);
      cx.setAttribute('aria-hidden', 'true');
      scroller.appendChild(cx);
    }
  };

  const SPEED = 120;
  const setDuration = () => {
    const baseWidth = track.getBoundingClientRect().width;
    const durationSec = baseWidth / SPEED;
    scroller.style.setProperty('--duration', `${durationSec}s`);
    scroller.style.setProperty('--loop-distance', '-50%');
  };

  const refresh = () => { ensureWidth(); setDuration(); };

  refresh();
  addEventListener('resize', refresh);
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

//画像のアニメーション
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

// ページトランジション
(() => {
  const topBar = document.querySelector('.barTop');
  const bottomBar = document.querySelector('.barBottom');
  if (!topBar || !bottomBar) return; // 念のためガード

  // ページ読込時：開く（= 上は上へ、下は下へ退場）
  window.addEventListener('load', () => {
    gsap.to(topBar, { duration: 0.9, yPercent: -100, ease: "power4.inOut" });
    gsap.to(bottomBar, { duration: 0.9, yPercent: 100, ease: "power4.inOut", delay: 0.05 });
  });

  // クリックを1か所で拾う（イベント委譲）
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href') || '';

    // ---- 遷移させないリンクを除外（ここがキモ）----
    const isHashOnly = href === '#' || href.startsWith('#');   // ページ内リンク
    const isJSLink = href.startsWith('javascript:');         // javascript:void(0) など
    const isBlank = href.trim() === '';                     // 空href
    const isExternal = a.origin && a.origin !== location.origin; // 外部リンク
    const isNoTrans = a.hasAttribute('data-no-transition');   // 明示除外フラグ
    const isDownload = a.hasAttribute('download');             // ダウンロード
    const isNewWindow = a.target === '_blank';                  // 別タブ

    if (isHashOnly || isJSLink || isBlank || isExternal || isNoTrans || isDownload || isNewWindow) {
      // これらはトランジションを出さない
      return;
    }
    // -----------------------------------------------

    // ここから通常のページ遷移（トランジションあり）
    e.preventDefault();
    gsap.to(topBar, { duration: 0.9, yPercent: 0, ease: "power4.inOut" });
    gsap.to(bottomBar, {
      duration: 0.9, yPercent: 0, ease: "power4.inOut", delay: 0.05,
      onComplete: () => { window.location.href = a.href; }
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




// SPメニューの画像切り替えアニメーション
document.addEventListener("DOMContentLoaded", () => {
  const spMenuPic = document.querySelector(".spMenuPic");
  if (!spMenuPic) return;

  const images = [
    "../images/cheeseCake.jpg",
    "../images/chocoCake.jpg",
    "../images/cupCake.jpg",
    "../images/fancyCake.jpg",
    "../images/tart.jpg",
    "../images/cupCake.jpg"
  ];
  let index = 0;

  setInterval(() => {
    // 1) フェードアウト
    spMenuPic.style.opacity = 0;

    // 2) 少し待って画像を切り替え
    setTimeout(() => {
      index = (index + 1) % images.length;
      spMenuPic.src = images[index];

      // 3) フェードイン
      spMenuPic.style.opacity = 1;
    }, 800); // transitionと同じ時間にする
  }, 4000); // 4秒ごとに切り替え
});