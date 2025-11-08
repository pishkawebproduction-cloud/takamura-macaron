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

	// 画像リスト（必要に応じてaltを書き換え）
	const ver = "20251106";
	const base = "https://cdn.jsdelivr.net/gh/pishkawebproduction-cloud/takamura-macaron@psi-tuning-20251106/images";
	const images = [
		{ name: "cheeseCake", alt: "チーズケーキ" },
		{ name: "chocoCake", alt: "チョコケーキ" },
		{ name: "cupCake", alt: "ミントカップケーキ" },
		{ name: "fancyCake", alt: "ファンシーケーキ" },
		{ name: "tart", alt: "タルト" },
	];

	// 共通のsizes（必要ならページに合わせて調整）
	const sizes = "(max-width: 768px) 90vw, 500px";

	// `<picture>`に画像セットを適用する関数
	function applyToPicture(pictureEl, item, priority /* 'high' or 'low' */) {
		const source = pictureEl.querySelector("source[type='image/webp']");
		const img = pictureEl.querySelector("img");

		const webp320 = `${base}/${item.name}-320.webp?v=${ver}`;
		const webp500 = `${base}/${item.name}-500.webp?v=${ver}`;
		const png500 = `${base}/${item.name}-500.png?v=${ver}`;

		// WebPのsrcset/sizesを更新
		source.setAttribute("srcset", `${webp320} 320w, ${webp500} 500w`);
		source.setAttribute("sizes", sizes);

		// フォールバックimgのsrc/srcset/sizes/alt
		img.setAttribute("src", png500);
		// フォールバック側にもsrcset付けるとより最適化される（古ブラウザ向けにOK）
		img.setAttribute("srcset", `${png500} 500w`);
		img.setAttribute("sizes", sizes);
		img.setAttribute("alt", item.alt || "");

		// fetchpriorityは見せる直前だけhighにできる
		img.setAttribute("fetchpriority", priority === "high" ? "high" : "low");
	}

	// 最初に表示するもの（Aに適用）
	let i = 0;
	applyToPicture(A, images[i], "high");

	// 事前デコード用：<img>を取り出すヘルパ
	const getImg = (pictureEl) => pictureEl.querySelector("img");

	// 事前プリロードはJSではやりすぎると帯域圧迫するので控えめに（必要分だけ）
	// // 例：次に出す予定の1枚だけ軽く解決しておく（ブラウザに委ねる）
	// const hint = new Image();
	// hint.src = `${base}/${images[(i+1)%images.length].name}-500.png?v=${ver}`;

	let showA = true;
	const sleep = (ms) => new Promise(r => setTimeout(r, ms));

	(async function loop() {
		while (true) {
			await sleep(4000);
			i = (i + 1) % images.length;

			const front = showA ? A : B; // 現在表示中
			const back = showA ? B : A; // 次に表示する側

			// 次画像を後ろ側pictureへセット（優先度は一時的にhigh）
			applyToPicture(back, images[i], "high");

			// 画像のデコード完了を待ってからフェード（チラつき防止＆CLSゼロ）
			const backImg = getImg(back);
			if (backImg.decode) {
				try { await backImg.decode(); } catch { }
			} else if (!backImg.complete) {
				await new Promise(r => backImg.onload = r);
			}

			// フェード切替
			front.classList.remove("is-show");
			back.classList.add("is-show");
			showA = !showA;

			// 切り替え後は前面のfetchpriorityをlowに戻して帯域節約
			getImg(front).setAttribute("fetchpriority", "low");

			// 余韻（フェード時間と合わせる）
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