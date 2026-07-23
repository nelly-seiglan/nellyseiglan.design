/* ═══════════════════════════════════════════════════════════════════════
   NELLY SEIGLAN — PORTFOLIO v3 · interaction layer
   Cursor halo · refined water haze · reveals · counters · lightbox
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ───────── PAGE CURTAIN ───────── */
  function liftCurtain() {
    var c = document.getElementById('curtain');
    if (c && !c.classList.contains('lift')) {
      c.classList.add('lift');
      setTimeout(function () { c.style.display = 'none'; }, 800);
    }
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('in');
  }
  window.addEventListener('load', function () { setTimeout(liftCurtain, 200); });
  setTimeout(liftCurtain, 1200);

  // smooth transition-out when navigating to an internal page
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!/\.html(\#|$)/.test(href) || a.target) return;
    e.preventDefault();
    var c = document.getElementById('curtain');
    if (c) { c.style.display = ''; c.classList.remove('lift'); c.classList.add('wipe-in'); }
    setTimeout(function () { window.location.href = href; }, 480);
  });

  /* ───────── NAV ───────── */
  var nav = document.querySelector('.nav');
  function navState() { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 12); }
  navState();
  window.addEventListener('scroll', navState, { passive: true });

  var navLinks = document.querySelectorAll('.nav-links a');
  var sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var act = document.querySelector('.nav-links a[href="#' + en.target.id + '"]');
          if (act) act.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ───────── PROJECTS DROPDOWN ───────── */
  (function () {
    var dd = document.querySelector('.nav-dd');
    if (!dd) return;
    var trigger = dd.querySelector('.nav-dd-trigger');
    if (!trigger) return;
    function open() { dd.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
    function close() { dd.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    trigger.addEventListener('click', function (e) { e.stopPropagation(); if (dd.classList.contains('open')) close(); else open(); });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    dd.querySelectorAll('.nav-dd-menu a').forEach(function (a) { a.addEventListener('click', close); });
  })();

  /* ───────── HEADLINE WORD REVEAL ───────── */
  (function () {
    var h = document.querySelector('.hero-headline');
    if (!h || h.dataset.split) return;
    h.dataset.split = '1';
    var idx = 0;
    h.querySelectorAll('.reveal-line').forEach(function (line) {
      var tmp = document.createElement('span');
      tmp.innerHTML = line.innerHTML;
      var out = '';
      function wrap(node, accent) {
        if (node.nodeType === 3) {
          var parts = node.textContent.split(/(\s+)/);
          parts.forEach(function (tok) {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) { out += ' '; return; }
            var cls = 'reveal-word' + (accent ? ' accent' : '');
            out += '<span class="' + cls + '"><span style="transition-delay:' + (idx * 0.07) + 's">' + tok + '</span></span>';
            idx++;
          });
        } else if (node.nodeType === 1) {
          var isEm = node.tagName.toLowerCase() === 'em';
          var tag = isEm ? 'em' : node.tagName.toLowerCase();
          out += '<' + tag + '>';
          Array.prototype.forEach.call(node.childNodes, function (c) { wrap(c, accent || isEm); });
          out += '</' + tag + '>';
        }
      }
      Array.prototype.forEach.call(tmp.childNodes, function (c) { wrap(c, false); });
      line.innerHTML = out;
    });
  })();

  /* ───────── CURSOR HALO (follows mouse on desktop, drifts on mobile) ───────── */
  (function () {
    var halo = document.getElementById('page-halo');
    if (!halo) return;
    if (fine) {
      document.addEventListener('mousemove', function (e) {
        halo.style.setProperty('--halo-x', e.clientX + 'px');
        halo.style.setProperty('--halo-y', e.clientY + 'px');
        halo.style.opacity = '1';
      });
      document.addEventListener('mouseleave', function () { halo.style.opacity = '0'; });
    } else {
      halo.style.setProperty('--halo-x', (window.innerWidth * 0.5) + 'px');
      halo.style.setProperty('--halo-y', (window.innerHeight * 0.4) + 'px');
      halo.style.opacity = '0.8';
      if (reduce) return;
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var sy = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
          halo.style.setProperty('--halo-x', (vw * 0.5 + Math.sin(sy / 600) * vw * 0.08) + 'px');
          halo.style.setProperty('--halo-y', Math.max(vh * 0.15, vh * 0.4 - sy * 0.02) + 'px');
          ticking = false;
        });
      }, { passive: true });
    }
  })();

  /* ───────── WATER HAZE — refined, monochromatic, slow ───────── */
  (function () {
    var canvas = document.getElementById('haze-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, 1.5), scale = 0.3;
    function readHue() { return parseFloat(getComputedStyle(document.body).getPropertyValue('--accent-h')) || 233; }
    var hue = readHue();
    var blobs = [];
    function seed() {
      blobs = [];
      for (var i = 0; i < 5; i++) {
        blobs.push({ x: Math.random(), y: Math.random(), r: 0.26 + Math.random() * 0.30,
          sx: (Math.random() - 0.5) * 0.00012, sy: (Math.random() - 0.5) * 0.00012,
          ph: Math.random() * Math.PI * 2, pr: 0.4 + Math.random() * 0.5, tone: i % 2 });
      }
    }
    seed();
    function resize() { W = canvas.width = Math.round(window.innerWidth * scale * dpr); H = canvas.height = Math.round(window.innerHeight * scale * dpr); }
    resize();
    window.addEventListener('resize', function () { resize(); hue = readHue(); }, { passive: true });
    function col(l, a, hShift) { return 'hsla(' + (hue + (hShift || 0)) + ', 70%, ' + l + '%, ' + a + ')'; }
    var t = 0;
    function frame() {
      t += 1;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#09090b'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        b.x += b.sx; b.y += b.sy;
        var wobX = Math.sin(t * 0.0032 * b.pr + b.ph) * 0.045;
        var wobY = Math.cos(t * 0.0027 * b.pr + b.ph) * 0.045;
        if (b.x < -0.2) b.x = 1.2; if (b.x > 1.2) b.x = -0.2;
        if (b.y < -0.2) b.y = 1.2; if (b.y > 1.2) b.y = -0.2;
        var cx = (b.x + wobX) * W, cy = (b.y + wobY) * H;
        var rad = b.r * Math.min(W, H) * (1 + Math.sin(t * 0.004 + b.ph) * 0.07);
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        var L = b.tone === 0 ? 26 : 18;
        var hShift = b.tone === 1 ? 18 : 0;
        g.addColorStop(0, col(L, 0.34, hShift));
        g.addColorStop(0.5, col(L - 5, 0.13, hShift));
        g.addColorStop(1, col(L, 0, hShift));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      if (!reduce) requestAnimationFrame(frame);
    }
    canvas.style.filter = 'blur(46px)';
    canvas.classList.add('ready');
    frame();
    window.__hazeRefresh = function () { hue = readHue(); };
  })();

  /* ───────── SCROLL REVEAL ───────── */
  if (!reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.r').forEach(function (el) { ro.observe(el); });
  } else {
    document.querySelectorAll('.r').forEach(function (el) { el.classList.add('in'); });
  }

  /* ───────── ANIMATED COUNTERS ───────── */
  function animateCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '', suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (to * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = prefix + to.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-to]');
  if (counters.length) {
    if (reduce) {
      counters.forEach(function (el) { var dec = parseInt(el.getAttribute('data-dec') || '0', 10); el.textContent = (el.getAttribute('data-prefix') || '') + parseFloat(el.getAttribute('data-to')).toFixed(dec) + (el.getAttribute('data-suffix') || ''); });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ───────── VIDEO LIGHTBOX ───────── */
  (function () {
    var lb = document.getElementById('lightbox'), player = document.getElementById('lightbox-video'), close = document.getElementById('lightbox-close');
    if (!lb || !player) return;
    function open(src) { player.src = src; player.muted = false; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); player.play().catch(function () {}); }
    function shut() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); player.pause(); player.removeAttribute('src'); }
    document.querySelectorAll('[data-video]').forEach(function (m) { m.addEventListener('click', function () { open(m.getAttribute('data-video')); }); });
    if (close) close.addEventListener('click', shut);
    lb.addEventListener('click', function (e) { if (e.target === lb) shut(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  })();

  /* ───────── LAZY VIDEO PLAY/PAUSE (perf: only play what's on screen) ───────── */
  (function () {
    var vids = document.querySelectorAll('.project-media video, .case-frame video');
    if (!vids.length || !('IntersectionObserver' in window)) return;
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
        else { if (!v.paused) v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vo.observe(v); });
    // pause the water-haze canvas work when the tab is hidden
    document.addEventListener('visibilitychange', function () {
      vids.forEach(function (v) { if (document.hidden) v.pause(); });
    });
  })();

  /* ───────── WALKTHROUGH (auto-playing screen demo) ───────── */
  (function () {
    document.querySelectorAll('.walkthrough').forEach(function (wt) {
      var scr = [].slice.call(wt.querySelectorAll('.wt-screen'));
      if (scr.length < 2) return;
      var dots = [].slice.call(wt.querySelectorAll('.wt-dot'));
      var cap = wt.querySelector('.wt-cap');
      var i = 0, timer = null;
      function show(n) {
        scr[i].classList.remove('is-active'); if (dots[i]) dots[i].classList.remove('on');
        i = n;
        scr[i].classList.add('is-active'); if (dots[i]) dots[i].classList.add('on');
        if (cap) cap.textContent = scr[i].getAttribute('data-label') || '';
      }
      show(0);
      if (reduce) return; // static, first screen shown
      function start() { if (!timer) timer = setInterval(function () { show((i + 1) % scr.length); }, 2800); }
      function stop() { clearInterval(timer); timer = null; }
      wt.addEventListener('mouseenter', stop);
      wt.addEventListener('mouseleave', start);
      dots.forEach(function (d, idx) { d.addEventListener('click', function () { stop(); show(idx); start(); }); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.25 }).observe(wt);
      } else { start(); }
    });

    /* ───────── PROTO SHOWCASE (Rose): a floating glass window over a breathing
       accent halo. Live screens cross-dissolve with a slow cinematic settle, the
       address bar rewrites per screen, and the halo drifts a touch for parallax.
       Plays on its own, pauses on hover so you can click into the live app.
       Iframes lazy-boot on view, rendered at a fixed 1280px width, scaled to fill. */
    document.querySelectorAll('.proto-showcase').forEach(function (ps) {
      var viewport = ps.querySelector('.ps-viewport');
      var slides = [].slice.call(ps.querySelectorAll('.ps-slide'));
      var frames = [].slice.call(ps.querySelectorAll('.ps-screen'));
      var glow = ps.querySelector('.ps-glow');
      var urlEl = ps.querySelector('.wt-bar .u');
      var n = slides.length;
      if (!n) return;
      var idx = 0, dir = 1, timer = null, seen = false;
      var autoMs = parseInt(ps.getAttribute('data-auto'), 10) || 0;

      function boot(f) { if (f && f.dataset.src && !f.getAttribute('src')) f.setAttribute('src', f.dataset.src); }
      function fit() { var w = viewport.clientWidth; if (w) ps.style.setProperty('--ps-scale', (w / 1280).toFixed(4)); }
      function go(to) {
        idx = (to + n) % n;
        slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
        if (urlEl && frames[idx].dataset.url) urlEl.textContent = frames[idx].dataset.url;
        if (glow) glow.style.transform = 'translateX(' + ((idx - (n - 1) / 2) * 7) + '%)'; // subtle parallax
        if (seen) { boot(frames[idx]); boot(frames[(idx + 1) % n]); } // current + preload next
      }
      function start() { if (autoMs && !timer && !reduce) timer = setInterval(function () {
        if (idx >= n - 1) dir = -1; else if (idx <= 0) dir = 1; // ping-pong, no jarring rewind
        go(idx + dir);
      }, autoMs); }
      function stop() { clearInterval(timer); timer = null; }

      fit();
      if ('ResizeObserver' in window) { new ResizeObserver(fit).observe(viewport); }
      else { window.addEventListener('resize', fit, { passive: true }); }

      ps.addEventListener('mouseenter', stop);   // let people read / click into the live app
      ps.addEventListener('mouseleave', start);

      go(0);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { es.forEach(function (e) {
          if (e.isIntersecting) { if (!seen) { seen = true; boot(frames[0]); boot(frames[1]); } start(); }
          else stop();
        }); }, { threshold: 0.25 }).observe(ps);
      } else { seen = true; boot(frames[0]); boot(frames[1]); start(); }
    });
  })();
})();
