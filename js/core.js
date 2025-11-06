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
	const hero = document.querySelector('.mainVisual') || document.body;
	const H = () => header.querySelector('nav')?.offsetHeight || 100;

	if (header.hasAttribute('data-lock-scrolled')) {
		header.classList.add('is-scrolled');
		return;
	}

	const io = new IntersectionObserver(([e]) => {
		header.classList.toggle('is-scrolled', !e.isIntersecting);
	}, {
		root: null,
		rootMargin: `-${H()}px 0px 0px 0px`,
		threshold: 0
	});

	io.observe(hero);

	addEventListener('load', () => {
		io.disconnect();
		new IntersectionObserver(([e]) => {
			header.classList.toggle('is-scrolled', !e.isIntersecting);
		}, { rootMargin: `-${H()}px 0px 0px 0px` }).observe(hero);
	});
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


// SPメニューの画像切り替えアニメーション
document.addEventListener("DOMContentLoaded", () => {
  const A = document.querySelector(".spPic--a");
  const B = document.querySelector(".spPic--b");
  if (!A || !B) return;

  const images = ["images/cheeseCake-320.webp", "images/chocoCake-320.webp", "images/cupCake-320.webp", "images/fancyCake-320.webp", "images/tart-320.webp"];
  images.forEach(s => { const im = new Image(); im.src = s; });

  let i = 0, showA = true;
  A.classList.add("is-show");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  (async function loop() {
    while (true) {
      await sleep(4000);
      i = (i + 1) % images.length;
      const next = images[i];
      const back = showA ? B : A;
      back.src = next;

      if (back.decode) { try { await back.decode(); } catch { } }
      else if (!back.complete) { await new Promise(r => back.onload = r); }

      (showA ? A : B).classList.remove("is-show");
      back.classList.add("is-show");
      showA = !showA;
      await sleep(800);
    }
  })();
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
