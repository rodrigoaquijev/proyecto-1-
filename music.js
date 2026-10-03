// Joyful wedding-style arpeggios (D-A-Bm-F#m-G-D-G-A) with a bright melody. Start when browser policy permits; opening the envelope supplies a user gesture.
(() => {
  const button = document.querySelector('#musicToggle');
  const label = document.querySelector('#musicLabel');
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) { button.hidden = true; return; }
  let context, master, timer, playing = false, next = 0, bar = 0;
  const beat = 60 / 104;
  const chords = [[50,57,62,66],[45,52,57,61],[47,54,59,62],[42,49,54,57],[43,50,55,59],[50,57,62,66],[43,50,55,59],[45,52,57,61]];
  const melody = [[78,76,74,73],[71,69,71,73],[74,73,71,69],[69,66,69,73],[71,74,79,78],[76,74,78,81],[79,78,76,74],[73,76,69,73]];
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
      for (let i = 0; i < 8; i++) note(chord[[0,1,2,3,2,1,2,3][i]], next + i * beat / 2, beat * 1.6, .17);
      melody[bar % melody.length].forEach((pitch, i) => note(pitch, next + i * beat + .02, beat * 1.7, .26));
      next += beat * 4; bar++;
    }
  }
  let wanted = true;
  try { wanted = localStorage.getItem('cr-music-paused') !== '1'; } catch {}
  function syncAudio() {
    playing = wanted && context?.state === 'running';
    clearInterval(timer);
    if (playing) { schedule(); timer = setInterval(schedule, 200); }
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pausar melodía nupcial' : 'Reproducir melodía nupcial');
    label.textContent = playing ? 'Pausar melodía' : 'Escuchar melodía';
  }
  function startMusic() {
    if (!wanted || document.hidden || context?.state === "running") return;
    try {
      if (!context) {
        context = new AudioEngine(); master = context.createGain();
        master.gain.value = .17;
        const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 3600;
        master.connect(filter); filter.connect(context.destination);
        // Quiet echo adds room without masking the invitation's calm atmosphere.
        const delay = context.createDelay(); delay.delayTime.value = .24;
        const wet = context.createGain(); wet.gain.value = .12;
        filter.connect(delay); delay.connect(wet); wet.connect(context.destination);
      }
      context.onstatechange = syncAudio;
      context.resume().then(syncAudio).catch(syncAudio);
      syncAudio();
    } catch { syncAudio(); }
  }
  button.addEventListener('click', () => {
    wanted = !playing;
    try { localStorage.setItem('cr-music-paused', wanted ? '0' : '1'); } catch {}
    if (wanted) startMusic();
    else { context?.suspend().catch(() => {}); syncAudio(); }
  });
  document.addEventListener('pointerdown', event => {
    if (!button.contains(event.target)) startMusic();
  }, { passive: true });
  document.querySelector('#openInvitation').addEventListener('click', startMusic);
  if (!document.querySelector('#envelopeGate').open) startMusic();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearInterval(timer); context?.suspend().catch(() => {}); }
    else startMusic();
  });
  window.addEventListener('pagehide', () => { clearInterval(timer); context?.suspend().catch(() => {}); });
  window.addEventListener('pageshow', event => { if (event.persisted) startMusic(); });
})();
