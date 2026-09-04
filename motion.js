// Motion enhances the readable, native invitation; content never depends on it.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const ease = 'cubic-bezier(.22,1,.36,1)';
  function animate(element, frames, options) {
    const animation = element.animate(frames, options);
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
    return animation;
  }
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reduced.matches) continue;
      animate(entry.target, [
        { opacity: .15, transform: 'perspective(1000px) translateY(28px) rotateX(4deg) scale(.98)' },
        { opacity: 1, transform: 'perspective(1000px) translateY(0) rotateX(0deg) scale(1)' }
      ], { duration: 950, delay: Math.min(order++ * 85, 255), easing: ease });
    }
  }, { threshold: .12 });
  document.querySelectorAll('.gift-item,.gift-taken,.account,.wedding-keepsake,.chapter-tab').forEach(el => observer.observe(el));

  const settlePanels = new Set();
  document.querySelectorAll('.gift-panel').forEach(panel => {
    const summary = panel.querySelector('summary');
    let transition;
    let targetOpen = panel.open;
    function settle() {
      transition?.cancel();
      transition = null;
      panel.open = targetOpen;
      panel.style.removeProperty('height');
      panel.style.removeProperty('overflow');
    }
    settlePanels.add(settle);
    summary.addEventListener('click', event => {
      if (reduced.matches) return;
      event.preventDefault();
      const start = panel.getBoundingClientRect().height;
      targetOpen = transition ? !targetOpen : !panel.open;
      transition?.cancel();
      panel.style.removeProperty('height');
      panel.open = true;
      const end = targetOpen ? panel.getBoundingClientRect().height : summary.getBoundingClientRect().height + 2;
      panel.style.overflow = 'hidden';
      transition = animate(panel, [{ height: start + 'px' }, { height: end + 'px' }], {
        duration: targetOpen ? 680 : 430, easing: ease
      });
      transition.onfinish = settle;
    });
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      settlePanels.forEach(settle => settle());
      active.forEach(animation => animation.cancel());
    }
  });
})();
