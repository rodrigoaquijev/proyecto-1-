// One shared texture, a bounded set of particles, and compositor-only movement.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'floral-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'floral-control';
  control.textContent = 'Pausar pétalos';
  control.setAttribute('aria-label', 'Pausar animación de pétalos');
  document.body.append(control);
  let paused = false;
  try { paused = localStorage.getItem('cr-petals-paused') === '1'; } catch {}
  const animations = new Set();
  const random = (min, max) => min + Math.random() * (max - min);
  function petal(burst = false, index = 0) {
    const item = document.createElement('span');
    item.className = 'rose-particle' + (index % 2 ? ' rose-particle-blue' : '');
    const narrow = innerWidth < 700;
    const size = random(narrow ? 17 : 22, narrow ? 31 : 46);
    // Most petals drift around the edges, leaving the letter easy to read.
    const x = burst ? random(25, 75) : (index % 4 === 0 ? random(15, 85) : index % 2 ? random(0, 19) : random(81, 100));
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;
    item.style.left = `${x}%`;
    item.style.opacity = String(random(.4, .8));
    const drift = random(35, 100) * (index % 2 ? 1 : -1);
    const rotation = random(-100, 100);
    const height = innerHeight + 130;
    const frames = [0, .25, .5, .75, 1].map((fraction, frame) => ({
      transform: `translate3d(${Math.sin(fraction * Math.PI * 2) * drift}px, ${-80 + fraction * height}px, 0) rotate(${rotation + fraction * 330}deg) rotateY(${frame % 2 ? 55 : -30}deg)`,
    }));
    layer.append(item);
    const animation = item.animate(frames, {
      duration: burst ? random(6500, 10000) : random(18000, 31000),
      delay: burst ? random(0, 700) : -random(0, 30000),
      iterations: burst ? 1 : Infinity,
      easing: 'linear',
    });
    animations.add(animation);
    if (burst) animation.onfinish = () => { animations.delete(animation); item.remove(); };
  }
  function sync() {
    const disabled = paused || motion.matches;
    control.hidden = motion.matches;
    control.textContent = paused ? 'Activar pétalos' : 'Pausar pétalos';
    control.setAttribute('aria-label', paused ? 'Activar animación de pétalos' : 'Pausar animación de pétalos');
    layer.hidden = disabled;
    if (!disabled && !animations.size) {
      for (let i = 0; i < (innerWidth < 700 ? 12 : 20); i++) petal(false, i);
    }
    animations.forEach(animation => disabled || document.hidden ? animation.pause() : animation.play());
  }
  control.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('cr-petals-paused', paused ? '1' : '0'); } catch {}
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  document.addEventListener('wedding:opened', () => {
    if (paused || motion.matches || document.hidden) return;
    for (let i = 0; i < (innerWidth < 700 ? 10 : 18); i++) petal(true, i);
  });
  sync();
})();
