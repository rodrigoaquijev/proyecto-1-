'use strict';

// Opening is optional: the invitation remains readable if JavaScript fails.
(() => {
  const gate = document.querySelector('#envelopeGate');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rememberOpening = () => { try { localStorage.setItem('cr-letter-opened', '1'); } catch {} };
  let previouslyOpened = false;
  try { previouslyOpened = localStorage.getItem('cr-letter-opened') === '1'; } catch {}
  const closeGate = () => {
    rememberOpening();
    gate.close();
    if (typeof CustomEvent === 'function') document.dispatchEvent(new CustomEvent('wedding:opened'));
    document.querySelector('h1').focus({ preventScroll: true });
  };
  document.querySelector('#openInvitation').addEventListener('click', () => {
    if (gate.classList.contains('opening')) return;
    if (reducedMotion) return closeGate();
    gate.classList.add('opening', 'is-opening');
    window.setTimeout(closeGate, 1250);
  });
  gate.addEventListener('cancel', event => { event.preventDefault(); closeGate(); });
  if (!previouslyOpened && !location.hash && !reducedMotion && typeof gate.showModal === 'function') gate.showModal();
})();

function updateCountdown() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = type => today.find(item => item.type === type).value;
  const days = Math.round((Date.UTC(2026, 10, 21) - Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day')))) / 86400000);
  document.querySelector('#countdown').textContent = days > 0 ? `Falta${days === 1 ? '' : 'n'} ${days} día${days === 1 ? '' : 's'} para celebrar` : days === 0 ? 'Hoy celebramos juntos' : 'Gracias por ser parte de nuestra historia';
  const remaining = Math.max(0, new Date('2026-11-21T09:00:00-05:00').getTime() - Date.now());
  const values = { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60 };
  for (const [id, value] of Object.entries(values)) {
    const target = document.querySelector('#' + id);
    if (target) target.textContent = String(value).padStart(2, '0');
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy);
    const status = document.querySelector('#copyStatus');
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      status.textContent = 'Dato copiado. Ya puedes pegarlo en tu aplicación.';
      button.textContent = 'Copiado';
      setTimeout(() => { button.textContent = 'Copiar dato'; }, 2200);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(source);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Seleccionamos el dato para ti. Mantén pulsado o usa la opción Copiar de tu dispositivo.';
    }
  });
});

const form = document.querySelector('#rsvpForm');
const attendanceFields = document.querySelector('#attendingFields');
const dietField = document.querySelector('#dietField');
const moments = [...form.querySelectorAll('[name="Momentos"]')];
const errorBox = document.querySelector('#formError');
const submitButton = document.querySelector('#submitBtn');
let submitting = false;
function updateAttendance() {
  const attending = form.querySelector('[name="Asistencia"]:checked')?.value === 'Sí, asistiré';
  attendanceFields.hidden = !attending;
  attendanceFields.querySelectorAll('input').forEach(input => { input.disabled = !attending; });
  const lunch = attending && moments[2].checked;
  dietField.hidden = !lunch;
  document.querySelector('#diet').disabled = !lunch;
  moments[0].setCustomValidity(attending && !moments.some(input => input.checked) ? 'Selecciona al menos un momento al que asistirás.' : '');
  errorBox.hidden = true;
}
form.addEventListener('change', updateAttendance);
updateAttendance();
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting) return;
  const name = document.querySelector('#guestName');
  name.value = name.value.trim();
  if (!form.reportValidity()) return;
  if (form.elements._honey.value) return;
  const data = new FormData(form);
  const selectedMoments = data.getAll('Momentos');
  data.delete('Momentos');
  if (selectedMoments.length) data.set('Momentos', selectedMoments.join('; '));
  const attending = data.get('Asistencia') === 'Sí, asistiré';
  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando tu respuesta…';
  form.setAttribute('aria-busy', 'true');
  errorBox.hidden = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('https://formsubmit.co/ajax/rodrigoaquije45@gmail.com', { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal });
    const result = await response.json();
    if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('unconfirmed');
    form.hidden = true;
    const success = document.querySelector('#rsvpSuccess');
    success.hidden = false;
    document.querySelector('#successMessage').textContent = attending ? 'Recibimos tu confirmación. Nos hace mucha ilusión compartir este día contigo.' : 'Gracias por avisarnos. Te tendremos muy presente en este día tan especial.';
    document.querySelector('#responseSummary').textContent = `${data.get('Nombre_Invitado')} · ${data.get('Asistencia')}${attending ? '. ' + selectedMoments.join(' / ') : ''}`;
    document.querySelector('#successCalendar').hidden = !attending;
    success.focus();
  } catch {
    errorBox.textContent = 'No pudimos confirmar la recepción de tu respuesta. Tus datos siguen aquí. Puedes intentar de nuevo o escribirnos por WhatsApp para comprobar si llegó.';
    const fallback = document.createElement('a');
    fallback.href = 'https://wa.me/51935355020?text=' + encodeURIComponent('Hola Camila y Rodrigo, intenté responder a la invitación y quisiera comprobar si recibieron mi respuesta.');
    fallback.target = '_blank'; fallback.rel = 'noopener noreferrer'; fallback.textContent = ' Consultar por WhatsApp';
    errorBox.append(fallback);
    errorBox.hidden = false;
  } finally {
    clearTimeout(timeout);
    submitting = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar mi respuesta ↗';
    form.removeAttribute('aria-busy');
  }
});
