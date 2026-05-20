// --- Immediate inits (elements in index.html shell) ---
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });

const scrollBtn = document.getElementById('scrollTop');
let scrollTimer;
window.addEventListener('scroll', () => {
  if (scrollY > 300) scrollBtn.classList.add('visible');
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => scrollBtn.classList.remove('visible'), 2000);
}, { passive: true });
scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const burger = document.getElementById('burger');
const nav = document.getElementById('primaryNav');
const closeMenu = () => { nav.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
});

// --- Section loader ---
async function loadSections() {
  const map = [
    ['sec-hero', 'sections/hero.html'],
    ['sec-leistungen', 'sections/leistungen.html'],
    ['sec-stats', 'sections/stats.html'],
    ['sec-rezensionen', 'sections/rezensionen.html'],
    ['sec-ueber-uns', 'sections/ueber-uns.html'],
    ['sec-faq', 'sections/faq.html'],
    ['sec-kontakt', 'sections/kontakt.html'],
  ];
  await Promise.all(map.map(async ([id, url]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.outerHTML = await (await fetch(url)).text();
  }));
}

// --- Counter animation ---
function runCounter(el) {
  const target = +el.dataset.target, steps = 60, inc = target / steps;
  let n = 0;
  const t = setInterval(() => {
    n = Math.min(n + inc, target);
    el.textContent = Math.floor(n);
    if (n >= target) { el.textContent = target; clearInterval(t); }
  }, 1800 / steps);
}

// --- Leistung gallery (reusable) ---
function initLeistungGallery(galleryId, trackId, dotsId) {
  const wrap = document.getElementById(galleryId);
  if (!wrap) return;
  const track = document.getElementById(trackId);
  const dotsEl = document.getElementById(dotsId);
  const imgs = track.querySelectorAll('img');
  let cur = 0;
  imgs.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'lgallery-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Bild ' + (i + 1));
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
  });
  function go(n) {
    cur = (n + imgs.length) % imgs.length;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dotsEl.querySelectorAll('.lgallery-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
  }
  wrap.querySelector('.lgallery-btn--prev').addEventListener('click', () => go(cur - 1));
  wrap.querySelector('.lgallery-btn--next').addEventListener('click', () => go(cur + 1));
  let txStart = 0, txCur = 0, drag = false;
  track.addEventListener('touchstart', e => { txStart = e.touches[0].clientX; txCur = txStart; drag = true; }, { passive: true });
  track.addEventListener('touchmove', e => { if (drag) txCur = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', () => { if (drag && Math.abs(txCur - txStart) > 40) go(txCur < txStart ? cur + 1 : cur - 1); drag = false; });
}

// --- All section-dependent inits ---
function initAll() {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.count').forEach(runCounter);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  const statsEl = document.getElementById('stats');
  if (statsEl) {
    const statsObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.count').forEach(runCounter);
        statsObs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    statsObs.observe(statsEl);
  }

  const sliderWrap = document.querySelector('.slider-wrap');
  if (sliderWrap) {
    const cards = document.querySelectorAll('.rcard');
    const dotsEl = document.getElementById('dots');
    const prevBtn = document.getElementById('revPrev');
    const nextBtn = document.getElementById('revNext');
    let active = 0;
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Bewertung ' + (i + 1));
      d.addEventListener('click', () => show(i));
      dotsEl.appendChild(d);
    });
    function show(n) {
      cards[active].classList.remove('active');
      dotsEl.children[active].classList.remove('active');
      active = (n + cards.length) % cards.length;
      cards[active].classList.add('active');
      dotsEl.children[active].classList.add('active');
    }
    prevBtn.addEventListener('click', () => show(active - 1));
    nextBtn.addEventListener('click', () => show(active + 1));
    let txStart = 0, txCur = 0, drag = false;
    const slider = document.getElementById('slider');
    slider.addEventListener('touchstart', e => { txStart = e.touches[0].clientX; txCur = txStart; drag = true; }, { passive: true });
    slider.addEventListener('touchmove', e => { if (drag) txCur = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', () => { if (drag && Math.abs(txCur - txStart) > 44) show(txCur < txStart ? active + 1 : active - 1); drag = false; });
  }

  const heroSlider = document.getElementById('heroSlider');
  if (heroSlider) {
    const track = document.getElementById('heroTrack');
    const dotsEl = document.getElementById('heroDots');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const slides = track.querySelectorAll('.hero-slide');
    let cur = 0;
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'hero-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Bild ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });
    function goTo(n) {
      cur = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      dotsEl.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
    }
    prevBtn.addEventListener('click', () => goTo(cur - 1));
    nextBtn.addEventListener('click', () => goTo(cur + 1));
    let txStart = 0, txCur = 0, dragging = false;
    track.addEventListener('touchstart', e => { txStart = e.touches[0].clientX; txCur = txStart; dragging = true; }, { passive: true });
    track.addEventListener('touchmove', e => { if (dragging) txCur = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', () => { if (dragging && Math.abs(txCur - txStart) > 44) goTo(txCur < txStart ? cur + 1 : cur - 1); dragging = false; });
    let autoH = setInterval(() => goTo(cur + 1), 4500);
    const pause = () => clearInterval(autoH);
    heroSlider.addEventListener('touchstart', pause, { passive: true });
    prevBtn.addEventListener('click', pause);
    nextBtn.addEventListener('click', pause);
  }

  const leistungTabs = document.getElementById('leistungTabs');
  const leistungenList = document.getElementById('leistungenList');
  if (leistungTabs && leistungenList) {
    leistungTabs.querySelectorAll('.leistung-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        leistungTabs.querySelectorAll('.leistung-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        leistungenList.dataset.active = btn.dataset.tab;
      });
    });
  }

  initLeistungGallery('sanierungGallery', 'sanierungTrack', 'sanierungDots');
  initLeistungGallery('renovierungGallery', 'renovierungTrack', 'renovierungDots');
  initLeistungGallery('pflasterGallery', 'pflasterTrack', 'pflasterDots');
  initLeistungGallery('fensterGallery', 'fensterTrack', 'fensterDots');
  initLeistungGallery('abrissGallery', 'abrissTrack', 'abrissDots');

  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = msg => { clearTimeout(toastTimer); toast.textContent = msg; toast.classList.add('show'); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); };
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const email = link.href.replace('mailto:', '');
      navigator.clipboard ? navigator.clipboard.writeText(email).then(() => showToast('E-Mail kopiert: ' + email)).catch(() => showToast(email)) : showToast(email);
    });
  });
}

loadSections().then(initAll);
