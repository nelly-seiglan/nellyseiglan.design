/* Nelly Seiglan — portfolio interactions (hand-written, no runtime)
   style-hover applier + reveals, counters, streams, cursor, dropdown, progress */
document.addEventListener('DOMContentLoaded', function () {
  // apply [style-hover] inline hover styles (was support.js's job)
  document.querySelectorAll('[style-hover]').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      el.setAttribute('data-sh-base', el.getAttribute('style') || '');
      el.setAttribute('style', (el.getAttribute('style') || '') + ';' + el.getAttribute('style-hover'));
    });
    el.addEventListener('mouseleave', function () {
      el.setAttribute('style', el.getAttribute('data-sh-base') || '');
    });
  });


    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    $$('video').forEach(v => { v.muted = true; v.loop = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); });

    setTimeout(() => {
      $$('[data-line]').forEach(el => {
        const d = +el.dataset.lineDelay || 0;
        setTimeout(() => { el.style.transform = 'translateY(0)'; }, d);
      });
    }, 150);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target, d = +el.dataset.revealDelay || 0;
          setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, d);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    $$('[data-reveal]').forEach(el => io.observe(el));

    const animate = (el) => {
      const to = +el.dataset.to, dec = +el.dataset.dec || 0, suf = el.dataset.suffix || '';
      const dur = 1500; let start = null;
      const step = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(el => cio.observe(el));

    const amt = $('[data-mil-amount]'), segs = $$('[data-mil-seg]');
    if (amt) {
      const to = 9000000, dur = 1600, w = ['34%', '38%', '28%'];
      const run = () => {
        let s = null;
        const step = (t) => {
          if (!s) s = t;
          const p = Math.min((t - s) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          amt.textContent = Math.round(to * eased).toLocaleString('fr-FR') + ',00 €';
          if (p < 1) requestAnimationFrame(step);
          else setTimeout(reset, 2000);
        };
        segs.forEach((sg, i) => { sg.style.width = w[i]; });
        requestAnimationFrame(step);
      };
      const reset = () => {
        amt.textContent = '0,00 €';
        segs.forEach(sg => { sg.style.width = '0'; });
        setTimeout(run, 700);
      };
      const gio = new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) { run(); gio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      gio.observe(amt);
    }

    // streaming interviewer question (Verso)
    const ivStream = $('[data-iv-stream]');
    if (ivStream) {
      const Q = 'You mentioned that the seat looks super comfortable and that the backpack looks good. Is there anything in particular about its design or feature that stands out to you, either positively or negatively?';
      let running = false;
      const play = () => {
        if (running) return; running = true;
        let i = 0;
        const type = () => {
          ivStream.textContent = Q.slice(0, i);
          i++;
          if (i <= Q.length) setTimeout(type, 28);
          else setTimeout(() => { ivStream.textContent = ''; i = 0; running = false; setTimeout(play, 600); }, 2600);
        };
        type();
      };
      const qio = new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) play(); });
      }, { threshold: 0.4 });
      qio.observe(ivStream);
    }

    // slide-in-from-right (Milleis screens)
    const sio = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target, d = +el.dataset.revealDelay || 0;
          setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, d);
          sio.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    $$('[data-slide]').forEach(el => sio.observe(el));

    // zoom modal
    const modal = $('[data-zoom-modal]'), modalImg = $('[data-zoom-img]'), modalClose = $('[data-zoom-close]');
    if (modal) {
      const open = (src, big) => {
        modalImg.src = src;
        if (big) {
          modalImg.style.maxWidth = 'none'; modalImg.style.maxHeight = 'none';
          modalImg.style.width = 'min(2054px, 180vw)'; modalImg.style.cursor = 'grab';
        } else {
          modalImg.style.maxWidth = 'min(1100px,92vw)'; modalImg.style.maxHeight = '88vh';
          modalImg.style.width = 'auto'; modalImg.style.cursor = 'default';
        }
        modal.style.opacity = '1'; modal.style.visibility = 'visible';
        requestAnimationFrame(() => { modalImg.style.transform = 'scale(1)'; });
        document.body.style.overflow = 'hidden';
      };
      const close = () => {
        modal.style.opacity = '0'; modal.style.visibility = 'hidden';
        modalImg.style.transform = 'scale(.92)';
        document.body.style.overflow = '';
      };
      $$('[data-zoom]').forEach(el => el.addEventListener('click', () => open(el.dataset.zoom, el.dataset.zoomBig)));
      modalClose.addEventListener('click', close);
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    $$('[data-magnet]').forEach(el => {
      el.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1), background .25s ease';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.08}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });

    // soft custom cursor
    const ring = $('[data-cursor]');
    if (ring && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      document.documentElement.style.cursor = 'none';
      let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
      window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
      const loop = () => {
        rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      };
      loop();
      $$('[data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => {
          const l = el.dataset.label || '';
          ring.style.width = l ? '58px' : '30px';
          ring.style.height = l ? '58px' : '30px';
          ring.style.background = 'transparent';
          ring.style.boxShadow = 'inset 0 0 0 1.5px rgba(26,26,26,.55)';
          ring.textContent = l;
        });
        el.addEventListener('mouseleave', () => {
          ring.style.width = '9px'; ring.style.height = '9px';
          ring.style.background = 'var(--ink)'; ring.style.boxShadow = 'none';
          ring.textContent = '';
        });
      });
    }

    // cycling skill highlight
    const chips = $$('[data-skill]');
    if (chips.length) {
      let ci = 0;
      const cycle = () => {
        chips.forEach((c, j) => {
          const on = j === ci;
          c.style.background = on ? 'var(--lime)' : 'var(--white)';
          c.style.borderColor = on ? 'transparent' : 'var(--hair)';
          c.style.color = on ? 'var(--ink)' : 'var(--ink2)';
        });
        ci = (ci + 1) % chips.length;
      };
      setTimeout(() => { cycle(); setInterval(cycle, 1300); }, 1400);
    }

    const prog = $('[data-progress]');
    const nav = $('[data-nav]');
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (prog) prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      if (nav) nav.style.boxShadow = window.scrollY > 30 ? '0 14px 34px -24px rgba(26,26,26,.35)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const dd = $('[data-dd]');
    if (dd) {
      const menu = $('[data-dd-menu]', dd), chev = $('[data-chev]', dd);
      const open = () => { menu.style.opacity = '1'; menu.style.visibility = 'visible'; menu.style.pointerEvents = 'auto'; menu.style.transform = 'translateX(-50%) translateY(0)'; if (chev) chev.style.transform = 'rotate(180deg)'; };
      const close = () => { menu.style.opacity = '0'; menu.style.visibility = 'hidden'; menu.style.pointerEvents = 'none'; menu.style.transform = 'translateX(-50%) translateY(-6px)'; if (chev) chev.style.transform = 'rotate(0)'; };
      dd.addEventListener('mouseenter', open);
      dd.addEventListener('mouseleave', close);
    }
});
