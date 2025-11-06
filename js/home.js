// メインビジュアル
window.addEventListener("scroll", () => {
  const title = document.querySelector(".mainVisual h2");
  if (!title) return;

  const scrollY = window.scrollY;
  const offset = Math.min(scrollY * 0.4, 100);
  title.style.transform = `translateY(-${offset}px)`;
});


// Indulge(PC限定)
(() => {
  const box = document.querySelector('.indulge');
  if (!box) return;

  const isDesktop = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const trigger = box.querySelector('.indulgePic') || box;
  const piece = box.querySelector('.hoverImgParts');
  const def = box.querySelector('.defaultImg');
  const hov = box.querySelector('.hoverImg');

  if (!isDesktop) {
    if (piece) {
      piece.style.opacity = 0;
      piece.style.transform = 'translate(0,0) rotate(0) scale(1)';
      piece.style.willChange = 'auto';
    }
    if (hov) hov.style.opacity = 0;
    if (def) def.style.opacity = 1;
    return;
  }

  if (!piece) return;

  // PC用アニメ
  const TRAJECTORIES = [
    { name: 'HighArc', v0: 100, angleDeg: 28, g: 1700, spin: 520, jitterX: (t) => 0, jitterY: (t) => 0, scaleStart: 1.0, scaleEnd: 0.65 },
    { name: 'LowDart', v0: 400, angleDeg: 32, g: 1800, spin: 720, jitterX: (t) => 8 * Math.sin(t * 10), jitterY: (t) => 0, scaleStart: 0.95, scaleEnd: 0.6 },
    { name: 'WindRight', v0: 400, angleDeg: 45, g: 1600, spin: 1080, jitterX: (t) => 40 * t * t, jitterY: (t) => 0, scaleStart: 1.0, scaleEnd: 0.7 },
    {
      name: 'Boogie', v0: 200, angleDeg: 90, g: 1650, spin: () => (Math.random() < .5 ? -1 : 1) * (360 + Math.random() * 360),
      jitterX: (t) => 12 * Math.sin(t * 14 + 0.7), jitterY: (t) => -6 * Math.sin(t * 9), scaleStart: 0.98, scaleEnd: 0.58
    },
    {
      name: 'Legend', v0: 800, angleDeg: 80, g: 1650, spin: () => (Math.random() < .5 ? -1 : 1) * (360 + Math.random() * 360),
      jitterX: (t) => 12 * Math.sin(t * 14 + 0.7), jitterY: (t) => -6 * Math.sin(t * 9), scaleStart: 0.98, scaleEnd: 0.58
    },
    {
      name: 'Canon', v0: 800, angleDeg: 80, g: 1650, spin: () => (Math.random() < .5 ? -1 : 1) * (360 + Math.random() * 360),
      jitterX: (t) => 12 * Math.sin(t * 14 + 0.7), jitterY: (t) => -6 * Math.sin(t * 9), scaleStart: 0.98, scaleEnd: 0.58
    },
    {
      name: 'Choice', v0: 400, angleDeg: 10, g: 650, spin: () => (Math.random() < .5 ? -1 : 1) * (360 + Math.random() * 360),
      jitterX: (t) => 12 * Math.sin(t * 14 + 0.7), jitterY: (t) => -6 * Math.sin(t * 9), scaleStart: 0.98, scaleEnd: 0.58
    },
  ];
  const pickTrajectory = () => TRAJECTORIES[Math.floor(Math.random() * TRAJECTORIES.length)];

  let rafId = null;

  function tossOnce() {
    if (hov) hov.style.opacity = 1;
    if (def) def.style.opacity = 0;

    const T = pickTrajectory();
    const angleRad = (T.angleDeg * Math.PI) / 180;
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
      const k = Math.min(1, t / 1.0);
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

  trigger.addEventListener('mouseenter', tossOnce);
  trigger.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    piece.style.opacity = 0;
    piece.style.transform = 'translate(0,0) rotate(0) scale(1)';
    if (hov) hov.style.opacity = 0;
    if (def) def.style.opacity = 1;
  });

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

const __IS_TOUCH__ = matchMedia('(hover: none) and (pointer: coarse)').matches;


//ギャラリー(SP時のアニメーションを停止)
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('imageWrap');
  if (!wrap) return;

  if (__IS_TOUCH__) {
    wrap.querySelectorAll('img.is-init').forEach(img => img.classList.remove('is-init'));
    return;
  }
});

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

  let revealed = false;
  let tween = null;

  const buildMarquee = async () => {
    if (tween) { tween.kill(); tween = null; }

    const originals = Array.from(wrap.children).map(n => n.cloneNode(true));

    wrap.replaceChildren(...originals.map(n => n.cloneNode(true)));
    await waitImages(wrap);

    const laneWidth = wrap.scrollWidth;

    const containerWidth = wrap.parentElement.getBoundingClientRect().width;
    const minSets = Math.max(2, Math.ceil(containerWidth / laneWidth) + 1);

    for (let i = 1; i < minSets; i++) {
      const clones = originals.map(n => {
        const c = n.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        return c;
      });
      wrap.append(...clones);
    }

    if (revealed) {
      wrap.querySelectorAll('img.is-init').forEach(img => img.classList.remove('is-init'));
    }

    gsap.registerPlugin(ModifiersPlugin);
    const SPEED = 120;
    const duration = laneWidth / SPEED;
    const wrapX = gsap.utils.wrap(-laneWidth, 0);

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

    gsap.registerPlugin(ScrollTrigger);
    const imgs = () => Array.from(document.querySelectorAll(".imageWrap img"));

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
          document.querySelectorAll(".imageWrap img.is-init")
            .forEach(img => img.classList.remove("is-init"));
          revealed = true;
        }
      });
    };
    playReveal();

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




