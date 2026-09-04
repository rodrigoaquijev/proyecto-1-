const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

// Exercise the real controller without sending email or storing guest data.
function setup(fetchResponse) {
  const elements = new Map();
  const element = key => {
    if (!elements.has(key)) elements.set(key, {
      hidden: false, disabled: false, checked: false, value: '', textContent: '', validity: '',
      addEventListener(type, callback) { this[type] = callback; },
      setCustomValidity(message) { this.validity = message; },
      setAttribute() {}, removeAttribute() {}, focus() {},
      append(node) { this.textContent += node.textContent; },
      classList: { contains: () => false, add() {} },
    });
    return elements.get(key);
  };
  const moments = ['civil', 'ceremonia', 'almuerzo'].map(element);
  const form = element('#rsvpForm');
  const diet = element('#diet'), song = element('#song');
  const selection = element('selection');
  form.querySelectorAll = () => moments;
  form.querySelector = () => selection;
  form.elements = { _honey: { value: '' } };
  form.reportValidity = () => Boolean(element('#guestName').value) && !moments.some(x => !x.disabled && x.validity);
  element('#attendingFields').querySelectorAll = () => [...moments, diet, song];
  let submitted;
  class Data {
    constructor() {
      this.values = new Map([['Nombre_Invitado', [element('#guestName').value]], ['Asistencia', [selection.value]], ['Momentos', moments.filter(x => !x.disabled && x.checked).map(x => x.value)]]);
      if (!diet.disabled) this.values.set('Restricciones_Alimentarias', [diet.value]);
    }
    get(key) { return this.values.get(key)?.[0]; }
    getAll(key) { return this.values.get(key) || []; }
    delete(key) { this.values.delete(key); }
    set(key, value) { this.values.set(key, [value]); }
  }
  const context = {
    document: { querySelector: element, querySelectorAll: () => [], createElement: () => ({}) },
    window: { matchMedia: () => ({ matches: true }) },
    localStorage: { getItem: () => '1' }, location: { hash: '' },
    Intl, Date, FormData: Data, AbortController,
    setInterval() {}, setTimeout() { return 1; }, clearTimeout() {},
    fetch: async (url, options) => { submitted = options.body; return fetchResponse(); },
  };
  vm.runInNewContext(fs.readFileSync('app.js', 'utf8'), context);
  return { element, form, moments, diet, selection, submitted: () => submitted,
    submit: () => form.submit({ preventDefault() {} }), change: () => form.change() };
}

test('Declining hides and excludes meal information; attendance requires a moment', () => {
  const s = setup(() => {});
  s.selection.value = 'Sí, asistiré'; s.change();
  assert.equal(s.element('#attendingFields').hidden, false);
  assert.ok(s.moments[0].validity);
  s.moments[2].checked = true; s.change();
  assert.equal(s.element('#dietField').hidden, false);
  assert.equal(s.diet.disabled, false);
  assert.equal(s.moments[0].validity, '');
  s.selection.value = 'No podré asistir'; s.change();
  assert.equal(s.element('#attendingFields').hidden, true);
  assert.equal(s.diet.disabled, true);
  assert.ok(s.moments.every(x => x.disabled));
});
test('Successful attendance combines moments and confirms only a positive service result', async () => {
  const s = setup(() => ({ ok: true, json: async () => ({ success: 'true' }) }));
  s.element('#guestName').value = '  Invitado de prueba  ';
  s.selection.value = 'Sí, asistiré';
  s.moments[0].value = 'Civil'; s.moments[0].checked = true;
  s.moments[2].value = 'Almuerzo'; s.moments[2].checked = true;
  s.change(); await s.submit();
  assert.equal(s.submitted().get('Nombre_Invitado'), 'Invitado de prueba');
  assert.equal(s.submitted().get('Momentos'), 'Civil; Almuerzo');
  assert.equal(s.form.hidden, true);
  assert.match(s.element('#successMessage').textContent, /confirmación/);
  assert.equal(s.element('#successCalendar').hidden, false);
});
test('Declined attendance gets its own acknowledgement and excludes previous diet input', async () => {
  const s = setup(() => ({ ok: true, json: async () => ({ success: true }) }));
  s.element('#guestName').value = 'Invitado de prueba';
  s.diet.value = 'Previous dietary answer';
  s.selection.value = 'No podré asistir'; s.change(); await s.submit();
  assert.equal(s.submitted().get('Restricciones_Alimentarias'), undefined);
  assert.match(s.element('#successMessage').textContent, /avisarnos/);
  assert.equal(s.element('#successCalendar').hidden, true);
});
for (const [label, response] of [
  ['service rejection', () => ({ ok: true, json: async () => ({ success: false }) })],
  ['HTTP error', () => ({ ok: false, json: async () => ({ success: true }) })],
  ['network failure', () => { throw new Error('offline'); }],
]) test(`${label} preserves the form and allows retry`, async () => {
  const s = setup(response);
  s.element('#guestName').value = 'Invitado de prueba';
  s.selection.value = 'No podré asistir'; s.change(); await s.submit();
  assert.equal(s.form.hidden, false);
  assert.equal(s.element('#guestName').value, 'Invitado de prueba');
  assert.equal(s.element('#formError').hidden, false);
  assert.equal(s.element('#submitBtn').disabled, false);
});
