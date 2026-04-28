/* =========================================================
   VIBLOOM — script.js
   ========================================================= */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─────────────────────────────────────────────────────
     1. STICKY NAVBAR — adds .scrolled class on scroll
  ───────────────────────────────────────────────────── */
  const navbar = $('#navbar');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  /* ─────────────────────────────────────────────────────
     2. ACTIVE NAV LINK — highlights current section
  ───────────────────────────────────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = navLinks.find(l => l.getAttribute('href') === `#${id}`);
        if (active) active.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ─────────────────────────────────────────────────────
     3. MOBILE HAMBURGER MENU
  ───────────────────────────────────────────────────── */
  const hamburger = $('#hamburger');
  const navLinksEl = $('#navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
    document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
  });

  // Close on nav-link click
  navLinksEl.addEventListener('click', e => {
    if (e.target.classList.contains('nav-link')) {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      navLinksEl.classList.contains('open') &&
      !navLinksEl.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ─────────────────────────────────────────────────────
     4. SMOOTH SCROLLING for all #hash links
  ───────────────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = $(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ─────────────────────────────────────────────────────
     5. SCROLL REVEAL ANIMATIONS
  ───────────────────────────────────────────────────── */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // staggered delay for sibling cards
          const siblings = [...entry.target.parentElement.children];
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 80}ms`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────────────────────────────
     6. TESTIMONIALS SLIDER
  ───────────────────────────────────────────────────── */
  const track   = $('#testiTrack');
  const dots    = $$('.td');
  const prevBtn = $('#testiPrev');
  const nextBtn = $('#testiNext');
  const cards   = $$('.testi-card');
  let current   = 0;
  let autoTimer;

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
    track.style.transform  = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.idx));
      startAuto();
    });
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }
  });

  // Pause auto on hover
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  startAuto();

  /* ─────────────────────────────────────────────────────
     7. CONTACT FORM VALIDATION + SUCCESS POPUP
  ───────────────────────────────────────────────────── */
  const form        = $('#contactForm');
  const popupOverlay = $('#popupOverlay');
  const popupClose  = $('#popupClose');

  function showError(fieldId, errId, msg) {
    const field = $('#' + fieldId);
    const err   = $('#' + errId);
    if (field) field.classList.add('error');
    if (err)   err.textContent = msg;
  }
  function clearError(fieldId, errId) {
    const field = $('#' + fieldId);
    const err   = $('#' + errId);
    if (field) field.classList.remove('error');
    if (err)   err.textContent = '';
  }

  // Live clear on input
  $('#fname').addEventListener('input', () => clearError('fname', 'nameErr'));
  $('#femail').addEventListener('input', () => clearError('femail', 'emailErr'));
  $('#fmsg').addEventListener('input', () => clearError('fmsg', 'msgErr'));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name  = $('#fname').value.trim();
    const email = $('#femail').value.trim();
    const msg   = $('#fmsg').value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    clearError('fname', 'nameErr');
    clearError('femail', 'emailErr');
    clearError('fmsg', 'msgErr');

    if (!name) {
      showError('fname', 'nameErr', 'Please enter your name.');
      valid = false;
    } else if (name.length < 2) {
      showError('fname', 'nameErr', 'Name must be at least 2 characters.');
      valid = false;
    }

    if (!email) {
      showError('femail', 'emailErr', 'Please enter your email address.');
      valid = false;
    } else if (!emailRx.test(email)) {
      showError('femail', 'emailErr', 'Please enter a valid email address.');
      valid = false;
    }

    if (!msg) {
      showError('fmsg', 'msgErr', 'Please write a message before sending.');
      valid = false;
    } else if (msg.length < 20) {
      showError('fmsg', 'msgErr', 'Message should be at least 20 characters.');
      valid = false;
    }

    if (valid) {
      // Simulate sending
      const submitBtn = form.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending… ⏳';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();
        popupOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }, 1200);
    }
  });

  // Close popup
  function closePopup() {
    popupOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }
  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', e => {
    if (e.target === popupOverlay) closePopup();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popupOverlay.classList.contains('visible')) closePopup();
  });

  /* ─────────────────────────────────────────────────────
     8. HERO CHART BARS — re-animate on scroll into view
  ───────────────────────────────────────────────────── */
  const heroSection = $('#home');
  let heroAnimated = false;

  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !heroAnimated) {
      heroAnimated = true;
      $$('.chart-bar').forEach((bar, i) => {
        bar.style.animationDelay = `${0.6 + i * 0.1}s`;
        bar.style.animationName = 'none';
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.animationName = ''; }, 10);
        });
      });
    }
  }, { threshold: 0.3 });

  if (heroSection) heroObserver.observe(heroSection);

  /* ─────────────────────────────────────────────────────
     9. PORTFOLIO CARDS — subtle tilt on mouse move
  ───────────────────────────────────────────────────── */
  $$('.port-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─────────────────────────────────────────────────────
     10. SERVICE CARDS — follow-mouse glow
  ───────────────────────────────────────────────────── */
  $$('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const glow = card.querySelector('.sc-glow');
      if (glow) {
        glow.style.transform = `translate(${x - 80}px, ${y - 80}px) scale(1.3)`;
        glow.style.opacity   = '1';
      }
    });
    card.addEventListener('mouseleave', () => {
      const glow = card.querySelector('.sc-glow');
      if (glow) {
        glow.style.transform = '';
        glow.style.opacity   = '';
      }
    });
  });

  /* ─────────────────────────────────────────────────────
     11. PRICING CARD — popular glow pulse
  ───────────────────────────────────────────────────── */
  // Already handled by CSS box-shadow animation, nothing needed

  /* ─────────────────────────────────────────────────────
     12. FOOTER LOGO scroll to top
  ───────────────────────────────────────────────────── */
  const footerLogo = $('.footer-logo');
  if (footerLogo) {
    footerLogo.style.cursor = 'pointer';
    footerLogo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────────────
     13. COUNTER ANIMATION for hero stats
  ───────────────────────────────────────────────────── */
  function animateCounter(el, target, suffix, duration = 1600) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(ease * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statNums = $$('.stat-num');
  const statTargets = [
    { target: 200, suffix: '+' },
    { target: 98,  suffix: '%' },
    { target: 5,   suffix: '×' },
  ];
  let countersStarted = false;

  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach((el, i) => {
        const { target, suffix } = statTargets[i];
        animateCounter(el, target, suffix);
      });
    }
  }, { threshold: 0.5 });

  if (statNums.length) statsObserver.observe(statNums[0].closest('.hero-stats') || heroSection);

  /* ─────────────────────────────────────────────────────
     14. KEYBOARD ACCESSIBILITY for pricing / service cards
  ───────────────────────────────────────────────────── */
  $$('.service-card, .price-card, .port-card, .why-card').forEach(card => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
  });

})();