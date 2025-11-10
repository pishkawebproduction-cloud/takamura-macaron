/*! core.optimized.js — Takamura Macaron
 *  Goals: shrink main-thread work, reduce layout thrash, respect RUM/PSI.
 *  Tactics:
 *   - Use ResizeObserver (fallback to resize) to sync header height.
 *   - Passive listeners where appropriate (scroll/touch/wheel).
 *   - Defer non-critical GSAP work to idle and only run if GSAP is present.
 *   - Guard animations with prefers-reduced-motion.
 *   - Pause SP image loop when tab is hidden to save CPU/bandwidth.
 */

/* ---------- small utilities ---------- */
const onIdle = (cb) => {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(cb, { timeout: 1500 });
  } else {
    setTimeout(cb, 300);
  }
};
const runIfGSAP = (cb) => {
  if (window.gsap) cb();
  else window.addEventListener("load", () => window.gsap && onIdle(cb), { once: true });
};
const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

/* ---------- Header search toggle & height sync ---------- */
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const nav = header.querySelector("nav");
  const toggle = header.querySelector(".search-toggle");
  const input = header.querySelector('input[type="search"]');
  const searchClose = header.querySelector(".searchClose");

  const setHeaderH = (h) => header.style.setProperty("--header-h", h + "px");
  const updateHeaderH = () => setHeaderH((nav?.offsetHeight) || 0);

  // Use ResizeObserver to avoid window resize polling
  if (nav && "ResizeObserver" in window) {
    const ro = new ResizeObserver(() => updateHeaderH());
    ro.observe(nav);
    updateHeaderH();
  } else {
    updateHeaderH();
    window.addEventListener("resize", updateHeaderH, { passive: true });
  }

  const open = () => {
    header.classList.add("is-search-open");
    toggle?.setAttribute("aria-expanded", "true");
    setTimeout(() => input && input.focus(), 10);
  };
  const close = () => {
    header.classList.remove("is-search-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.focus();
  };

  toggle?.addEventListener("click", () => {
    header.classList.contains("is-search-open") ? close() : open();
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("is-search-open")) close();
  });

  searchClose?.addEventListener("click", () => {
    header.classList.contains("is-search-open") ? close() : open();
  }, { passive: true });
})();

/* ---------- Header scrolled state via IO ---------- */
(() => {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".mainVisual") || document.body;
  if (!header || !hero) return;
  const H = () => header.querySelector("nav")?.offsetHeight || 100;

  if (header.hasAttribute("data-lock-scrolled")) {
    header.classList.add("is-scrolled");
    return;
  }

  const createIO = () =>
    new IntersectionObserver(([e]) => {
      header.classList.toggle("is-scrolled", !e.isIntersecting);
    }, { root: null, rootMargin: `-${H()}px 0px 0px 0px`, threshold: 0 });

  let io = createIO();
  io.observe(hero);

  window.addEventListener("load", () => {
    io.disconnect();
    io = createIO();
    io.observe(hero);
  }, { once: true });
})();

/* ---------- Burger ---------- */
(() => {
  const burger = document.querySelector(".burger");
  if (!burger) return;
  burger.addEventListener("click", () => {
    document.body.classList.toggle("is-nav-open");
    burger.setAttribute("aria-expanded", String(document.body.classList.contains("is-nav-open")));
  });
})();

/* ---------- SP menu picture cross-fade (bandwidth-aware) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const A = document.querySelector(".spPic--a");
  const B = document.querySelector(".spPic--b");
  if (!A || !B) return;
  if (prefersReduced) {
    // Keep first frame only
    A.classList.add("is-show");
    B.classList.remove("is-show");
    return;
  }

  const ver = "20251106";
  const base = "https://cdn.jsdelivr.net/gh/pishkawebproduction-cloud/takamura-macaron@psi-tuning-20251106/images";
  const images = [
    { name: "cheeseCake", alt: "チーズケーキ" },
    { name: "chocoCake",  alt: "チョコケーキ" },
    { name: "cupCake",    alt: "ミントカップケーキ" },
    { name: "fancyCake",  alt: "ファンシーケーキ" },
    { name: "tart",       alt: "タルト" },
  ];
  const sizes = "(max-width: 768px) 90vw, 500px";
  const getImg = (pictureEl) => pictureEl.querySelector("img");

  function applyToPicture(pictureEl, item, priority) {
    const source = pictureEl.querySelector("source[type='image/webp']");
    const img = getImg(pictureEl);
    const webp320 = `${base}/${item.name}-320.webp?v=${ver}`;
    const webp500 = `${base}/${item.name}-500.webp?v=${ver}`;
    const png500  = `${base}/${item.name}-500.png?v=${ver}`;
    if (source) {
      source.setAttribute("srcset", `${webp320} 320w, ${webp500} 500w`);
      source.setAttribute("sizes", sizes);
    }
    if (img) {
      img.setAttribute("src", png500);
      img.setAttribute("srcset", `${png500} 500w`);
      img.setAttribute("sizes", sizes);
      img.setAttribute("alt", item.alt || "");
      img.setAttribute("fetchpriority", priority === "high" ? "high" : "low");
      img.decoding = "async";
    }
  }

  let i = 0;
  let showA = true;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  applyToPicture(A, images[i], "high");
  A.classList.add("is-show");

  let running = true;
  document.addEventListener("visibilitychange", () => { running = (document.visibilityState === "visible"); });

  (async function loop() {
    while (true) {
      await sleep(4000);
      if (!running) continue;
      i = (i + 1) % images.length;

      const front = showA ? A : B;
      const back  = showA ? B : A;

      applyToPicture(back, images[i], "high");

      const backImg = getImg(back);
      if (backImg?.decode) { try { await backImg.decode(); } catch {} }
      else if (backImg && !backImg.complete) {
        await new Promise(r => (backImg.onload = backImg.onerror = r));
      }

      front.classList.remove("is-show");
      back.classList.add("is-show");
      showA = !showA;
      const frontImg = getImg(front);
      frontImg && frontImg.setAttribute("fetchpriority", "low");

      await sleep(800);
    }
  })();
});

/* ---------- Page transition (GSAP) ---------- */
runIfGSAP(() => {
  const topBar = document.querySelector(".barTop");
  const bottomBar = document.querySelector(".barBottom");
  if (!topBar || !bottomBar) return;
  if (prefersReduced) return; // respect reduced motion

  window.addEventListener("load", () => {
    gsap.to(topBar,    { duration: 0.9, yPercent: -100, ease: "power4.inOut" });
    gsap.to(bottomBar, { duration: 0.9, yPercent:  100, ease: "power4.inOut", delay: 0.05 });
  }, { once: true });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const isHashOnly = href === "#" || href.startsWith("#");
    const isJSLink   = href.startsWith("javascript:");
    const isBlank    = href.trim() === "";
    const isExternal = a.origin && a.origin !== location.origin;
    const isNoTrans  = a.hasAttribute("data-no-transition");
    const isDownload = a.hasAttribute("download");
    const isNewWindow= a.target === "_blank";
    if (isHashOnly || isJSLink || isBlank || isExternal || isNoTrans || isDownload || isNewWindow) return;

    e.preventDefault();
    gsap.to(topBar,    { duration: 0.9, yPercent: 0, ease: "power4.inOut" });
    gsap.to(bottomBar, {
      duration: 0.9, yPercent: 0, ease: "power4.inOut", delay: 0.05,
      onComplete: () => { window.location.href = a.href; }
    });
  }, { passive: false });
});

/* ---------- Text reveal (GSAP) ---------- */
runIfGSAP(() => {
  onIdle(() => {
    gsap.registerPlugin(window.ScrollTrigger);
    const targets = document.querySelectorAll(".reveal-letters");
    if (!targets.length) return;

    targets.forEach(el => {
      const raw = el.innerHTML;
      const lines = raw.split(/<br\s*\/?>/i);
      el.innerHTML = "";
      const chars = [];
      const fragRoot = document.createDocumentFragment();

      lines.forEach((line, i) => {
        const frag = document.createDocumentFragment();
        const cleanLine = line.replace(/^\s+/, "");
        for (const ch of cleanLine) {
          if (ch === " ") frag.appendChild(document.createTextNode(" "));
          else {
            const wrap = document.createElement("span");
            wrap.className = "charWrap";
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = ch;
            wrap.appendChild(span);
            frag.appendChild(wrap);
            chars.push(span);
          }
        }
        fragRoot.appendChild(frag);
        if (i < lines.length - 1) {
          const br = document.createElement("span");
          br.className = "br";
          fragRoot.appendChild(br);
        }
      });
      el.appendChild(fragRoot);

      const total = chars.length;
      gsap.from(chars, {
        scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play reverse play reverse" },
        duration: 1.0,
        ease: "expo.out",
        opacity: 0,
        y: (i) => gsap.utils.mapRange(0, total - 1, 10, 40)(i),
        scaleY: (i) => gsap.utils.mapRange(0, total - 1, 0.8, 0.4)(i),
        delay: (i) => gsap.utils.mapRange(0, total - 1, 0.0, 0.28)(i),
        stagger: { amount: 0.10 }
      });
    });
  });
});

/* ---------- Image reveal (GSAP) ---------- */
runIfGSAP(() => {
  onIdle(() => {
    gsap.registerPlugin(window.ScrollTrigger);
    const selectors = [".sectionWrap img", ".menuPic img"];
    gsap.utils.toArray(selectors.join(",")).forEach((img) => {
      gsap.from(img, {
        scrollTrigger: { trigger: img, start: "top 85%", toggleActions: "play none none none" },
        duration: 0.8,
        opacity: 0,
        y: 80,
        ease: "power2.out",
        clearProps: "opacity,transform"
      });
    });
  });
});