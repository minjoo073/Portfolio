// @ds-adherence-ignore -- MathHub case study scroll/entry animations
/* GSAP entry + scroll-triggered reveals for the MathHub case study.
   Loaded after gsap.min.js and ScrollTrigger.min.js (CDN).
   Bails out cleanly when GSAP missing or reduced-motion is set. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const isMobile = () => window.innerWidth < 980;
  const defaultST = (trigger, start = 'top 85%') => ({
    trigger, start, toggleActions: 'play none none none',
  });

  // ─── HERO entry (on script run — above the fold) ────────────────────────
  const heroBar      = document.querySelector('.hero__bar');
  const heroWordmark = document.querySelector('.hero__wordmark');
  const heroTagline  = document.querySelector('.hero__tagline');
  const heroDevice   = document.querySelector('.hero__device');

  if (heroBar && heroWordmark && heroTagline && heroDevice) {
    gsap.set(heroBar,      { opacity: 0, y: -16 });
    gsap.set(heroWordmark, { opacity: 0, y: 32 });
    gsap.set(heroTagline,  { opacity: 0, y: 16 });
    gsap.set(heroDevice,   { opacity: 0, y: 40 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(heroBar,      { opacity: 1, y: 0, duration: 0.5 })
      .to(heroWordmark, { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
      .to(heroTagline,  { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to(heroDevice,   { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');
  }

  // ─── HERO INTRO (overview — scroll) ─────────────────────────────────────
  const heroIntro = document.querySelector('.hero__intro');
  if (heroIntro) {
    gsap.from('.hero__intro h2', {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST('.hero__intro', 'top 80%'),
    });
    gsap.from('.hero__intro p', {
      opacity: 0, y: 16, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2,
      scrollTrigger: defaultST('.hero__intro', 'top 80%'),
    });
    gsap.from('.hero__key', {
      opacity: 0, y: 28, stagger: 0.12, duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST('.hero__keys', 'top 85%'),
    });
  }

  // ─── Generic sec-head reveal (all .section sec-heads) ──────────────────
  gsap.utils.toArray('.section .sec-head').forEach((head) => {
    gsap.from(head, {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST(head, 'top 85%'),
    });
  });

  // ─── RESEARCH findings + charts ─────────────────────────────────────────
  document.querySelectorAll('.finding').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 24, duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST(el),
    });

    el.querySelectorAll('.bars .bar').forEach((bar) => {
      const finalHeight = bar.style.height;
      if (!finalHeight) return;
      gsap.set(bar, { height: '0%' });
      gsap.to(bar, {
        height: finalHeight, duration: 0.9, ease: 'power2.out', delay: 0.35,
        scrollTrigger: defaultST(el),
      });
    });

    el.querySelectorAll('.hbar .track i').forEach((bar) => {
      const finalWidth = bar.style.width;
      if (!finalWidth) return;
      gsap.set(bar, { width: '0%' });
      gsap.to(bar, {
        width: finalWidth, duration: 0.9, ease: 'power2.out', delay: 0.35,
        scrollTrigger: defaultST(el),
      });
    });
  });

  // ─── PROBLEM cards ──────────────────────────────────────────────────────
  if (document.querySelector('.problem__grid')) {
    gsap.from('.pcard', {
      opacity: 0, y: 28, stagger: 0.15, duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST('.problem__grid', 'top 80%'),
    });
  }

  // ─── GOAL section content + arrow pulse loop + divider line draw ───────
  if (document.querySelector('.goal__inner')) {
    gsap.from('.goal__lab, .goal__title, .goal__flow', {
      opacity: 0, y: 20, stagger: 0.12,
      duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST('.goal__inner', 'top 80%'),
    });
    const goalDivider = document.querySelector('.goal__divider');
    if (goalDivider) {
      gsap.from(goalDivider, {
        scaleX: 0, opacity: 0,
        duration: 0.5, ease: 'power2.out',
        transformOrigin: 'left center',
        delay: 0.35,
        scrollTrigger: defaultST('.goal__inner', 'top 80%'),
      });
    }
  }
  document.querySelectorAll('.goal__sep').forEach((sep) => {
    gsap.to(sep, {
      opacity: 0.6, repeat: -1, yoyo: true,
      duration: 0.9, ease: 'sine.inOut',
    });
  });

  // ─── SOLUTION AS-IS → TO-BE rows ────────────────────────────────────────
  document.querySelectorAll('.astobe__row').forEach((row) => {
    const as = row.querySelector('.as');
    const to = row.querySelector('.to');
    const arrow = row.querySelector('.astobe__arrow');

    const tl = gsap.timeline({ scrollTrigger: defaultST(row) });
    if (as) tl.from(as, { opacity: 0, x: -30, duration: 0.6, ease: 'power2.out' });
    if (to) tl.from(to, { opacity: 0, x: 30, duration: 0.6, ease: 'power2.out' }, '-=0.5');
    if (arrow) tl.from(arrow, { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.out' }, '-=0.3');
  });

  // ─── DESIGN SYSTEM panels + Typography rows + Color swatches + bars ────
  if (document.querySelector('.dsys__grid')) {
    gsap.from('.dpanel', {
      opacity: 0, scale: 0.97, stagger: 0.1,
      duration: 0.6, ease: 'power2.out', transformOrigin: 'top left',
      scrollTrigger: defaultST('.dsys__grid', 'top 80%'),
    });
    gsap.from('.dpanel.a-type .type-scale > div', {
      opacity: 0, x: 16, stagger: 0.08,
      duration: 0.4, ease: 'power2.out', delay: 0.3,
      scrollTrigger: defaultST('.dpanel.a-type', 'top 75%'),
    });
    gsap.from('.dpanel.a-color .swatch', {
      opacity: 0, x: 8, stagger: 0.07,
      duration: 0.4, ease: 'power2.out', delay: 0.25,
      scrollTrigger: defaultST('.dpanel.a-color', 'top 75%'),
    });

    // Spacing bars — token-weight demo, grow from 0% with stagger
    document.querySelectorAll('.dpanel.a-space .space-row .b').forEach((bar, i) => {
      const finalWidth = bar.style.width;
      if (!finalWidth) return;
      gsap.set(bar, { width: '0%' });
      gsap.to(bar, {
        width: finalWidth,
        duration: 0.7, ease: 'power2.out', delay: 0.25 + i * 0.06,
        scrollTrigger: defaultST('.dpanel.a-space', 'top 75%'),
      });
    });

    // Data bar fill — mirror Research bar grow pattern
    document.querySelectorAll('.dpanel.a-comps .databar__fill').forEach((fill, i) => {
      const finalWidth = fill.style.width;
      if (!finalWidth) return;
      gsap.set(fill, { width: '0%' });
      gsap.to(fill, {
        width: finalWidth,
        duration: 0.8, ease: 'power2.out', delay: 0.3 + i * 0.12,
        scrollTrigger: defaultST('.dpanel.a-comps', 'top 75%'),
      });
    });
  }

  // ─── MOCKUP INTRO image ─────────────────────────────────────────────────
  const mockup = document.querySelector('.mockup-intro__mockup');
  if (mockup) {
    gsap.from(mockup, {
      opacity: 0, y: 40, duration: 0.9, ease: 'power2.out',
      scrollTrigger: defaultST(mockup, 'top 85%'),
    });
  }

  // ─── KEY SCREENS columns ────────────────────────────────────────────────
  if (document.querySelector('.keyscreens__grid')) {
    gsap.from('.keyscreens__col', {
      opacity: 0, y: 28, stagger: 0.15,
      duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST('.keyscreens__grid', 'top 80%'),
    });
  }

  // ─── ANNOTATION lines (showcase sections — desktop only) ───────────────
  if (!isMobile()) {
    document.querySelectorAll('.shotwrap').forEach((wrap) => {
      const annos = wrap.querySelectorAll('.anno');
      annos.forEach((anno, i) => {
        const dot  = anno.querySelector('.anno__dot');
        const lead = anno.querySelector('.anno__lead');
        const pill = anno.querySelector('.anno__pill');
        const desc = anno.querySelector('.anno__desc');
        const isRight = anno.classList.contains('anno--right');

        if (dot)  gsap.set(dot,  { scale: 0, opacity: 0 });
        if (lead) gsap.set(lead, {
          clipPath: isRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
        });
        if (pill) gsap.set(pill, { opacity: 0, y: 8 });
        if (desc) gsap.set(desc, { opacity: 0, y: 8 });

        const tl = gsap.timeline({
          scrollTrigger: defaultST(anno, 'top 90%'),
          delay: i * 0.12,
        });
        if (dot)  tl.to(dot,  { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2)' });
        if (lead) tl.to(lead, { clipPath: 'inset(0 0 0 0)', duration: 0.45, ease: 'power2.inOut' }, '-=0.1');
        if (pill) tl.to(pill, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.2');
        if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
      });
    });
  } else {
    // mobile: simple fade for annos
    document.querySelectorAll('.anno').forEach((anno) => {
      gsap.from(anno, {
        opacity: 0, y: 12, duration: 0.5, ease: 'power2.out',
        scrollTrigger: defaultST(anno, 'top 90%'),
      });
    });
  }

  // ─── CODE section reveal ────────────────────────────────────────────────
  if (document.querySelector('.code__grid')) {
    gsap.from('.code__win', {
      opacity: 0, x: -30, duration: 0.8, ease: 'power2.out',
      scrollTrigger: defaultST('.code__grid', 'top 80%'),
    });
    gsap.from('.code__grid > div:last-child > *', {
      opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.2,
      scrollTrigger: defaultST('.code__grid', 'top 80%'),
    });
  }

  // ─── CHALLENGES rows ────────────────────────────────────────────────────
  document.querySelectorAll('.ch-row').forEach((row) => {
    const left  = row.querySelector('.ch-row__left');
    const right = row.querySelector('.ch-row__right');

    const tl = gsap.timeline({ scrollTrigger: defaultST(row) });
    if (left)  tl.from(left,  { opacity: 0, x: -20, duration: 0.6, ease: 'power2.out' });
    if (right) tl.from(right, { opacity: 0, x: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4');
  });

  // ─── OUTCOME content + device glow loop ─────────────────────────────────
  if (document.querySelector('.outcome')) {
    gsap.from('.outcome .eyebrow, .outcome__title, .outcome__sub, .outcome__close', {
      opacity: 0, y: 20, stagger: 0.15,
      duration: 0.7, ease: 'power2.out',
      scrollTrigger: defaultST('.outcome', 'top 80%'),
    });
    gsap.from('.outcome__device', {
      opacity: 0, scale: 0.95, duration: 0.9, ease: 'power2.out', delay: 0.5,
      scrollTrigger: defaultST('.outcome', 'top 80%'),
    });
    gsap.from('.outcome__foot', {
      opacity: 0, y: 20, duration: 0.5, ease: 'power2.out', delay: 0.9,
      scrollTrigger: defaultST('.outcome', 'top 80%'),
    });

    const outcomeDevice = document.querySelector('.outcome__device');
    if (outcomeDevice) {
      // pulse the glow only (not the whole shadow), so the device stays stable
      gsap.to(outcomeDevice, {
        boxShadow: '0 0 120px rgba(91,149,248,0.35), 0 30px 60px rgba(0,0,0,.4)',
        repeat: -1, yoyo: true, duration: 2.5, ease: 'sine.inOut',
      });
    }
  }
})();
