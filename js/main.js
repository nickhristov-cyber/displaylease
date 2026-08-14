/* =====================================================
   DisplayLease Malta — Main JavaScript
   ===================================================== */

(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────
  const header     = document.getElementById('header');
  const navToggle  = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');
  const backToTop  = document.getElementById('backToTop');
  const yearEl     = document.getElementById('year');

  // ── Year in footer ────────────────────────────────
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Sticky header ────────────────────────────────
  function onScroll() {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
    updateActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile nav toggle ────────────────────────────
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Active nav highlight ──────────────────────────
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const scrollPos = window.scrollY + 100;
    let current = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ── Back to top ───────────────────────────────────
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Scroll-triggered animations ──────────────────
  function initAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('animated'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
  }

  initAnimations();

  // ── Conditional sub-dropdowns (Section A) ─────────────
  const inquiryType   = document.getElementById('inquiryType');
  const subHost       = document.getElementById('sub-host');
  const subAdvertiser = document.getElementById('sub-advertiser');
  const subTechnical  = document.getElementById('sub-technical');

  function updateSubDropdowns() {
    if (!inquiryType) return;
    const val = inquiryType.value;
    [subHost, subAdvertiser, subTechnical].forEach(el => {
      if (el) el.style.display = 'none';
    });
    if (val === 'host'       && subHost)        subHost.style.display = 'block';
    if (val === 'advertiser' && subAdvertiser)  subAdvertiser.style.display = 'block';
    if (val === 'technical'  && subTechnical)   subTechnical.style.display = 'block';
  }

  if (inquiryType) {
    inquiryType.addEventListener('change', updateSubDropdowns);
    updateSubDropdowns();
  }

  // ── Character counter (Section E) ─────────────────────
  const descField = document.getElementById('description');
  const charCount = document.getElementById('charCount');

  if (descField && charCount) {
    descField.addEventListener('input', () => {
      const len = descField.value.length;
      charCount.textContent = len;
      charCount.style.color = len > 900 ? 'var(--accent)' : 'var(--text-muted)';
    });
  }

  // ── Contact form ──────────────────────────────────
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      // Only intercept if using Formspree (default); let native submit handle others
      const action = form.getAttribute('action') || '';
      if (!action.includes('formspree.io')) return; // let native submit go through

      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

      try {
        const data = new FormData(form);
        const response = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.reset();
          if (formSuccess) {
            formSuccess.style.display = 'flex';
            setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
          }
        } else {
          alert('Something went wrong. Please email us directly at info@displaylease.com or call +356 9968 5978.');
        }
      } catch {
        alert('Unable to send. Please email us at info@displaylease.com or call +356 9968 5978.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // ── Smooth scroll for anchor links ───────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Hero grid parallax (subtle) ───────────────────
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGrid) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY * 0.2;
      heroGrid.style.transform = `translateY(${y}px)`;
    }, { passive: true });
  }

})();
