/* =========================================================
   Lido Development — interaction layer
   Respond on pointer-down, animate from the current value,
   never block input, honour reduced motion.
   ========================================================= */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------------------------------------------------
     1. Theme — dark by default, remembered per visitor
     --------------------------------------------------------- */
  const root = document.documentElement;
  const stored = localStorage.getItem('lido-theme');
  if (stored) root.dataset.theme = stored;

  const themeBtn = $('#theme');
  const syncLabel = () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    themeBtn.setAttribute('aria-label', `Switch to ${next} theme`);
  };
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('lido-theme', root.dataset.theme);
    syncLabel();
  });
  syncLabel();

  /* ---------------------------------------------------------
     2. Text splitting — lines mask upward
     --------------------------------------------------------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    el.classList.add('split');
    const inner = document.createElement('span');
    inner.textContent = text;
    el.appendChild(inner);
  });

  /* ---------------------------------------------------------
     3. Reveal on enter — staggered within a group
     --------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
      const index = Math.min(siblings.indexOf(el), 5);
      if (index > 0) el.style.transitionDelay = `${index * 80}ms`;
      el.classList.add('is-in');
      obs.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  const splitObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('.split', entry.target).forEach((line, i) => {
        line.style.transitionDelay = `${i * 90}ms`;
        line.classList.add('is-in');
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  $$('.hero__title').forEach((el) => splitObserver.observe(el));

  /* ---------------------------------------------------------
     4. Nav — solidify once scrolled, hide on the way down
     --------------------------------------------------------- */
  const nav = $('#nav');
  const drawer = $('#drawer');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 30);
    nav.classList.toggle('is-hidden', y > 460 && y > lastY && !drawer.classList.contains('is-open'));
    lastY = y;
  };
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     5. Mobile drawer
     --------------------------------------------------------- */
  const burger = $('#burger');
  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    drawer.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  const closeBtn = $('.drawer__close');
  if (closeBtn) closeBtn.addEventListener('click', () => setDrawer(false));
  $$('a', drawer).forEach((a) => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  /* ---------------------------------------------------------
     6. Magnetic pills — 1:1 tracking, released on leave
     --------------------------------------------------------- */
  if (fine && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     7. Collage float — transform-only parallax
     --------------------------------------------------------- */
  if (!reduced) {
    const floats = $$('[data-float]');
    addEventListener('scroll', () => requestAnimationFrame(() => {
      const y = scrollY;
      if (y > innerHeight * 1.3) return;
      floats.forEach((el) => { el.style.setProperty('--fy', `${y * parseFloat(el.dataset.float) * -1}px`); el.style.translate = `0 ${y * parseFloat(el.dataset.float) * -1}px`; });
    }), { passive: true });
  }

  /* ---------------------------------------------------------
     8. Custom cursor — dot instant, ring lerps (no overshoot)
     --------------------------------------------------------- */
  if (fine && !reduced) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, live = false;

    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!live) { live = true; document.body.classList.add('has-cursor'); cursor.style.opacity = 1; }
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const hoverables = 'a, button, summary, .tile, .case, .stage';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(hoverables)) document.body.classList.add('is-hovering');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(hoverables) && !e.relatedTarget?.closest?.(hoverables)) document.body.classList.remove('is-hovering');
    });
  }

  /* ---------------------------------------------------------
     9. FAQ — one open at a time
     --------------------------------------------------------- */
  const items = $$('.qa');
  items.forEach((item) => item.addEventListener('toggle', () => {
    if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
  }));

  /* ---------------------------------------------------------
     10. Enquiry form — validate here, post wherever you like
     --------------------------------------------------------- */
  // Paste your collector here (Formspree "https://formspree.io/f/xxxx",
  // a Netlify function, or your own API). Left empty, the form validates
  // and shows the success state without sending anything.
  const ENDPOINT = '';

  const form = $('#enquiry');
  const done = $('#enquiry-done');

  if (form && done) {

  const rules = {
    name:    (v) => (v ? '' : 'Tell us who you are.'),
    email:   (v) => (!v ? 'We need an email to reply to.'
                        : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : "That email doesn't look right."),
    company: (v) => (v ? '' : 'Which company are you with?'),
    topic:   (v) => (v ? '' : 'Pick the closest topic.'),
    project: (v) => (v.length >= 10 ? '' : 'A sentence or two is plenty.'),
  };

  const setError = (control, message) => {
    const field = control.closest('.field');
    field.classList.toggle('is-invalid', Boolean(message));
    $('.field__err', field).textContent = message;
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  $$('input, select, textarea', form).forEach((control) => {
    const clear = () => { if (control.closest('.field').classList.contains('is-invalid')) setError(control, ''); };
    control.addEventListener('input', clear);
    control.addEventListener('change', clear);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    let firstBad = null;

    Object.entries(rules).forEach(([name, check]) => {
      const control = form.elements[name];
      const message = check(String(data.get(name) || '').trim());
      setError(control, message);
      if (message && !firstBad) firstBad = control;
    });

    if (firstBad) { firstBad.focus(); return; }

    const submit = $('button[type="submit"]', form);
    submit.disabled = true;

    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });
        if (!res.ok) throw new Error(res.status);
      }
      done.innerHTML = `<b>Thanks — that's landed.</b><span>We reply within one working day, usually sooner. If it's urgent, call +44 1234 567 890.</span>`;
      form.hidden = true;
      done.hidden = false;
      done.focus?.();
    } catch {
      submit.disabled = false;
      setError(form.elements.project, 'Something went wrong sending that. Email hello@lidodevelopment.com and we\'ll pick it up.');
    }
  });

  }

  /* ---------------------------------------------------------
     11. Floating form CTA — appears once the hero is behind you
     --------------------------------------------------------- */
  // Hidden over the hero (the CTA is right there) and over the form, where it
  // would sit on top of the textarea on narrow screens.
  const floatCta = $('.float-cta');
  if (floatCta) {
    const blockers = new Set();
    const floatObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) blockers.add(entry.target); else blockers.delete(entry.target);
      });
      floatCta.classList.toggle('is-in', blockers.size === 0);
    }, { threshold: 0.25 });
    const observed = [$('.hero'), $('#start')].filter(Boolean);
    if (observed.length) observed.forEach((el) => floatObs.observe(el));
    else floatCta.classList.add('is-in');
  }
})();
