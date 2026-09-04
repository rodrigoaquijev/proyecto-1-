// Original, softly voiced piano miniature. Audio starts only on an explicit click.
(() => {
  const button = document.querySelector('#musicToggle');
  const label = document.querySelector('#musicLabel');
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) { button.hidden = true; return; }
  let context, master, timer, playing = false, busy = false, next = 0, bar = 0;
  const beat = 60 / 68;
  const chords = [[48,55,60,64],[43,55,59,62],[45,52,57,60],[41,53,57,60],[48,55,60,64],[40,52,55,59],[41,53,57,60],[43,55,59,62]];
  const melody = [[64,67,72,71],[69,67,62,67],[69,72,71,69],[65,69,67,65],[64,67,76,74],[71,67,64,62],[65,69,72,69],[67,62,64,67]];
  function note(midi, time, length, volume) {
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    [1, 2, 3].forEach((harmonic, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(volume / (harmonic ** 2), time + .015);
      envelope.gain.exponentialRampToValueAtTime(.0001, time + length / (1 + index * .25));
      oscillator.connect(envelope); envelope.connect(master);
      oscillator.start(time); oscillator.stop(time + length + .1);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
  }
  function schedule() {
    if (!playing || context.state !== 'running') return;
    if (next < context.currentTime) next = context.currentTime + .1;
    while (next < context.currentTime + .5) {
      const chord = chords[bar % chords.length];
      for (let i = 0; i < 8; i++) note(chord[[0,1,2,3,2,1,2,3][i]], next + i * beat / 2, beat * 2.4, .18);
      melody[bar % melody.length].forEach((pitch, i) => note(pitch, next + i * beat + .04, beat * 2.6, .23));
      next += beat * 4; bar++;
    }
  }
  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      if (!context) {
        context = new AudioEngine(); master = context.createGain();
        master.gain.value = .17;
        const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2800;
        master.connect(filter); filter.connect(context.destination);
        // Quiet echo adds room without masking the invitation's calm atmosphere.
        const delay = context.createDelay(); delay.delayTime.value = .24;
        const wet = context.createGain(); wet.gain.value = .12;
        filter.connect(delay); delay.connect(wet); wet.connect(context.destination);
      }
      if (playing) {
        await context.suspend(); clearInterval(timer); playing = false;
      } else {
        await context.resume(); playing = true; schedule(); timer = setInterval(schedule, 150);
      }
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Pausar melodía de piano' : 'Reproducir melodía romántica de piano');
      label.textContent = playing ? 'Pausar melodía' : 'Escuchar melodía';
    } catch {
      playing = false; clearInterval(timer); label.textContent = 'Reintentar música';
      button.setAttribute('aria-pressed', 'false');
    } finally { busy = false; }
  });
  document.addEventListener('visibilitychange', () => {
    if (!context || !playing || busy) return;
    if (document.hidden) context.suspend().catch(() => {});
    else context.resume().then(schedule).catch(() => {});
  });
  window.addEventListener('pagehide', () => { clearInterval(timer); if (context) context.suspend().catch(() => {}); });
  window.addEventListener('pageshow', event => {
    if (event.persisted && playing) { context.resume().then(schedule).catch(() => {}); timer = setInterval(schedule, 150); }
  });
})();
