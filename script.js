// TrendSpotter Labs front-end interactions

document.addEventListener('DOMContentLoaded', () => {
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // Mobile nav toggle
  const navToggle = qs('#nav-toggle');
  const navLinks = qs('#nav-links');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Smooth scrolling for nav links and CTAs
  const scrollLinks = qsa('a[data-target]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Set current year
  const yearEl = qs('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hero entrance animation
  anime.timeline({ easing: 'easeOutExpo', duration: 700 })
    .add({ targets: '.eyebrow', translateY: [20, 0], opacity: [0, 1], delay: 120 })
    .add({ targets: '.hero-title', translateY: [30, 0], opacity: [0, 1], offset: '-=350' })
    .add({ targets: '.hero-sub', translateY: [24, 0], opacity: [0, 1], offset: '-=280' })
    .add({ targets: '.hero-ctas .btn, .hero-note', translateY: [12, 0], opacity: [0, 1], delay: anime.stagger(80), offset: '-=250' });

  // Floating shapes in hero (loop)
  anime({
    targets: '.chart .dot',
    translateY: [0, -12],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    delay: anime.stagger(180),
    duration: 2400
  });
  anime({
    targets: '.chart .bar',
    scaleY: [0.92, 1],
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine',
    duration: 2600,
    delay: anime.stagger(180)
  });
  anime({
    targets: '.floating-card',
    translateY: [0, -8],
    opacity: [0.7, 1],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad',
    duration: 3200
  });

  // Nav background animate when scrolling past hero
  const nav = qs('#site-nav');
  const hero = qs('#home');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        nav.classList.add('scrolled');
        anime({ targets: nav, opacity: [0.92, 1], translateY: [-10, 0], duration: 420, easing: 'easeOutQuad' });
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }, { root: null, threshold: 0, rootMargin: '-80px 0px 0px 0px' });
  if (hero) navObserver.observe(hero);

  // Scroll reveal helper
  function revealOnScroll(selector, animeProps) {
    const elems = qsa(selector);
    const io = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime(Object.assign({ targets: entry.target }, animeProps));
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elems.forEach(el => io.observe(el));
  }

  revealOnScroll('#service-cards .card', {
    translateY: [20, 0], opacity: [0, 1], duration: 700, delay: anime.stagger(120), easing: 'easeOutQuart'
  });

  revealOnScroll('#tools-grid .tool', {
    scale: [0.92, 1], opacity: [0, 1], duration: 650, delay: anime.stagger(80), easing: 'easeOutBack'
  });

  revealOnScroll('#outcomes-grid .outcome', {
    translateX: [-24, 0], opacity: [0, 1], duration: 700, delay: anime.stagger(140), easing: 'easeOutQuad'
  });

  revealOnScroll('#process-steps li', {
    translateY: [26, 0], opacity: [0, 1], duration: 700, delay: anime.stagger(180), easing: 'easeOutExpo'
  });

  revealOnScroll('#contact .section-title, #contact .section-sub, #contact form', {
    translateY: [20, 0], opacity: [0, 1], duration: 650, delay: anime.stagger(120), easing: 'easeOutCubic'
  });

  // Form validation and submission simulation
  const form = qs('#contact-form');
  const errName = qs('#err-name');
  const errEmail = qs('#err-email');
  const errMessage = qs('#err-message');
  const feedback = qs('#form-feedback');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errName.textContent = '';
    errEmail.textContent = '';
    errMessage.textContent = '';
    feedback.textContent = '';

    const name = qs('#name').value.trim();
    const email = qs('#email').value.trim();
    const message = qs('#message').value.trim();
    const phone = qs('#phone').value.trim(); 
    const company = qs('#company').value.trim();
    let valid = true;

    if (!name) { errName.textContent = 'Please enter your name.'; valid = false; }
    if (!email || !validateEmail(email)) { errEmail.textContent = 'Please enter a valid email.'; valid = false; }
    if (!message) { errMessage.textContent = 'Please add a short message describing your needs.'; valid = false; }

    if (!valid) {
        anime({ targets: '#contact-form', translateX: [-6, 6, -4, 4, 0], duration: 420, easing: 'easeInOutSine' });
        return;
    }

    feedback.textContent = 'Sending…';
    const submitValues = { name, email, message, phone, company };

    fetch('submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(submitValues)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            feedback.textContent = "Thank you! We'll review your requirements and get back to you soon.";
            form.reset();
            anime({ targets: '#form-feedback', opacity: [0, 1], translateY: [-6, 0], duration: 500, easing: 'easeOutCubic' });
        } else {
            feedback.textContent = "Error: " + (data.error || "Something went wrong.");
        }
    })
    .catch(err => {
        feedback.textContent = "Error: Could not submit form.";
        console.error(err);
    });
});

});
