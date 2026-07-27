/* ═══════════════════════════════════════════════════════════════════════
   NELLY SEIGLAN — REFONTE · interaction layer
   Nav · dropdown · hero reveal · scroll reveals · gallery · counters
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── NAV state on scroll ── */
  var nav = document.querySelector('.nav');
  function navState() { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 16); }
  navState();
  window.addEventListener('scroll', navState, { passive: true });

  /* ── active section link ── */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = document.querySelectorAll('section[id]');
  if (sections.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var a = document.querySelector('.nav-links a[href="#' + e.target.id + '"]');
          if (a) a.classList.add('active');
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ── PROJECTS dropdown ── */
  (function () {
    var dd = document.querySelector('.nav-dd');
    if (!dd) return;
    var trigger = dd.querySelector('.nav-dd-trigger');
    function open() { dd.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
    function close() { dd.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    trigger.addEventListener('click', function (e) { e.stopPropagation(); dd.classList.contains('open') ? close() : open(); });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    dd.querySelectorAll('.nav-dd-menu a').forEach(function (a) { a.addEventListener('click', close); });
  })();

  /* ── HERO reveal on load ── */
  function lift() { var h = document.querySelector('.hero'); if (h) h.classList.add('in'); }
  window.addEventListener('load', lift);
  setTimeout(lift, 400);

  /* ── scroll reveals (.r) and gallery plates (.plate) ── */
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.r, .plate').forEach(function (el) { ro.observe(el); });
  } else {
    document.querySelectorAll('.r, .plate').forEach(function (el) { el.classList.add('in'); });
  }

  /* ── animated counters ── */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var dec = parseInt(el.getAttribute('data-dec'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = to.toFixed(dec) + suffix; return; }
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('.num[data-to]').forEach(function (el) { co.observe(el); });
  }

  /* ── subtle parallax on gallery media (transform only) ── */
  if (!reduce && 'IntersectionObserver' in window) {
    var medias = [].slice.call(document.querySelectorAll('.plate-media'));
    var active = [];
    var pio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (active.indexOf(e.target) < 0) active.push(e.target); }
        else { active = active.filter(function (m) { return m !== e.target; }); }
      });
    }, { threshold: 0 });
    medias.forEach(function (m) { pio.observe(m); });
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        active.forEach(function (m) {
          var r = m.getBoundingClientRect();
          var prog = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 through viewport
          var inner = m.querySelector('video, img');
          if (inner && m.classList.contains('in')) inner.style.transform = 'scale(1.04) translateY(' + (prog * -18).toFixed(1) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── click media → native fullscreen play ── */
  document.querySelectorAll('.plate-media').forEach(function (m) {
    m.addEventListener('click', function () {
      var v = m.querySelector('video');
      if (!v) return;
      if (v.requestFullscreen) v.requestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
  });

  /* ── smooth internal-page transition-out could go here later ── */
})();
