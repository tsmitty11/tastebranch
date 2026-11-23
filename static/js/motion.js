(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  let observer;
  const targets = [...document.querySelectorAll('.impact > div, .section-intro, .service-grid article, .cta-strip > *, .work-heading, .work-card, .big-statement, .testimonial h2, .final-cta > div, .faq-section > div:first-child, .faq-list details')];
  function reveal(element) {
    element.classList.remove('reveal-pending');
    observer?.unobserve(element);
  }
  function configure() {
    observer?.disconnect();
    targets.forEach(element => element.classList.remove('reveal-pending', 'scroll-reveal'));
    if (preference.matches) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    targets.forEach(element => {
      const staggered = element.matches('.service-grid article, .work-card, .impact > div');
      const index = staggered ? [...element.parentElement.children].indexOf(element) : 0;
      element.style.setProperty('--reveal-delay', `${index * 90}ms`);
      // Content already on screen stays visible; only upcoming sections reveal.
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add('scroll-reveal', 'reveal-pending');
        observer.observe(element);
      }
    });
  }
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.reveal-pending');
    if (target) reveal(target);
  });
  preference.addEventListener('change', configure);
  window.addEventListener('pageshow', configure);
  configure();
})();
