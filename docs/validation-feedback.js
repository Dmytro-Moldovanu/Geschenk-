(() => {
  'use strict';
  const attemptedForms = new WeakSet();
  const toastId = 'gift-form-validation-toast';

  function getFields(form) {
    return {
      age: form.querySelector('.form-section-basics input[type="number"]'),
      budget: form.querySelector('.form-section-basics .input-with-suffix input'),
      interests: form.querySelector('.interest-section'),
      checked: Array.from(form.querySelectorAll('.interest-chip input[type="checkbox"]:checked')),
    };
  }

  function validate(form) {
    const f = getFields(form);
    const errors = [];
    const ageValue = f.age ? f.age.value.trim() : '';
    const ageNumber = Number(ageValue);
    if (!ageValue) {
      errors.push({ field: 'age', text: 'Bitte gib das Alter des Kindes ein.' });
    } else if (!Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 17) {
      errors.push({ field: 'age', text: 'Bitte gib ein Alter von 1 bis 17 Jahren ein.' });
    }
    if (f.checked.length < 2 || f.checked.length > 5) {
      errors.push({ field: 'interests', text: 'Bitte wähle 2 bis 5 Interessen aus.' });
    }
    if (f.budget && f.budget.value.trim() !== '') {
      const budget = Number(f.budget.value);
      if (!Number.isFinite(budget) || budget <= 0) {
        errors.push({ field: 'budget', text: 'Bitte gib ein Budget über 0 € ein oder lass das Feld frei.' });
      }
    }
    return { errors, fields: f };
  }

  function dismissToast() {
    const toast = document.getElementById(toastId);
    if (toast) toast.remove();
  }

  function showToast(errors) {
    dismissToast();
    if (!errors.length) return;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'validation-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    const symbol = document.createElement('span');
    symbol.className = 'validation-toast-icon';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = '!';
    const content = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = 'Bitte prüfe deine Angaben';
    const description = document.createElement('p');
    description.textContent = errors[0].text + (errors.length === 2 ? ' Außerdem fehlt noch eine Angabe.' : errors.length > 2 ? ` Bitte prüfe ${errors.length - 1} weitere Angaben.` : '');
    content.append(title, description);
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Hinweis schließen');
    close.addEventListener('click', dismissToast);
    toast.append(symbol, content, close);
    document.body.append(toast);
  }

  function updateHighlights(form, errors) {
    const f = getFields(form);
    for (const key of ['age', 'budget']) {
      if (f[key]) f[key].setAttribute('aria-invalid', String(errors.some((error) => error.field === key)));
    }
    if (f.interests) f.interests.classList.toggle('has-validation-error', errors.some((error) => error.field === 'interests'));
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('.questionnaire') || form.dataset.nativeValidation === 'true') return;
    attemptedForms.add(form);
    const { errors, fields } = validate(form);
    updateHighlights(form, errors);
    showToast(errors);
    if (errors.length) {
      const invalid = fields[errors[0].field];
      requestAnimationFrame(() => {
        if (!invalid) return;
        if (errors[0].field === 'interests') invalid.setAttribute('tabindex', '-1');
        invalid.focus({ preventScroll: true });
        invalid.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      });
      // React prüft dieselben Werte und zeigt zusätzliche Hinweise direkt am Eingabefeld.
    }
  }, true);

  function updateAfterEdit(event) {
    const form = event.target instanceof Element ? event.target.closest('.questionnaire') : null;
    if (!form || !attemptedForms.has(form) || form.dataset.nativeValidation === 'true') return;
    const { errors } = validate(form);
    updateHighlights(form, errors);
    showToast(errors);
  }
  document.addEventListener('input', updateAfterEdit, true);
  document.addEventListener('change', updateAfterEdit, true);
  document.addEventListener('click', (event) => {
    const form = event.target instanceof Element ? event.target.closest('.questionnaire') : null;
    if (form && event.target.closest('button[type="button"]') && event.target.textContent.includes('zurücksetzen')) {
      attemptedForms.delete(form);
      dismissToast();
    }
  }, true);
})();
