/**
 * NUDO — contact.js (T-023, RF-05, RF-09)
 * Envía el formulario de consulta a POST /api/contact y gestiona:
 * validación preliminar en cliente, estados de envío, errores 422 por
 * campo, rate limit 429, éxito 201 y fallo de red con reintento seguro
 * (sin doble envío silencioso).
 */
(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit');
  const statusEl = document.getElementById('contact-status');
  const productField = document.getElementById('f-product-id');

  const FIELDS = {
    name: { input: 'f-name', error: 'err-name' },
    subject: { input: 'f-subject', error: 'err-subject' },
    email: { input: 'f-email', error: 'err-email' },
    phone: { input: 'f-phone', error: 'err-phone' },
    message: { input: 'f-message', error: 'err-message' },
  };

  let sending = false; // guarda anti doble envío (CP-09)

  /* ------------------------------- Utilidades --------------------------- */

  function setSending(on) {
    sending = on;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Enviando…' : 'Enviar consulta';
  }

  function setStatus(message, kind) {
    statusEl.textContent = message || '';
    statusEl.className = 'contact-form__status' + (kind ? ' is-' + kind : '');
  }

  function clearErrors() {
    Object.values(FIELDS).forEach(({ input, error }) => {
      const inputEl = document.getElementById(input);
      const errorEl = document.getElementById(error);
      if (inputEl) inputEl.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }
    });
    const contactHint = document.getElementById('err-contact');
    if (contactHint) {
      contactHint.hidden = true;
      contactHint.textContent = '';
    }
  }

  function showFieldError(field, message) {
    if (field === 'contact') {
      const hint = document.getElementById('err-contact');
      if (hint) {
        hint.hidden = false;
        hint.textContent = message;
      }
      return;
    }

    const map = FIELDS[field];
    if (!map) return;

    const inputEl = document.getElementById(map.input);
    const errorEl = document.getElementById(map.error);

    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = message;
    }
  }

  function focusFirstInvalid() {
    const first = form.querySelector('[aria-invalid="true"]');
    if (first) first.focus();
  }

  /* --------------------------- Validación cliente ----------------------- */
  // La validación del navegador es preliminar (P-07: el servidor SIEMPRE
  // vuelve a validar).

  function validateClient() {
    clearErrors();
    const errors = {};

    const name = form.name.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    if (!name) errors.name = 'El nombre es obligatorio.';
    else if (name.length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.';

    if (!subject) errors.subject = 'El motivo de consulta es obligatorio.';

    if (!message) errors.message = 'El mensaje es obligatorio.';
    else if (message.length < 10) errors.message = 'El mensaje debe tener al menos 10 caracteres.';

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'El correo electrónico no tiene un formato válido.';
    }

    if (phone && !/^\+?[0-9\s\-().]{5,20}$/.test(phone)) {
      errors.phone = 'El teléfono solo puede contener dígitos y los símbolos + - ( ).';
    }

    if (!email && !phone) {
      errors.contact = 'Indica al menos un medio de contacto: correo electrónico o teléfono.';
    }

    Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));

    return Object.keys(errors).length === 0;
  }

  /* ------------------------------ Envío (T-023) ------------------------- */

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (sending) return; // CP-09: no duplicar envíos

    if (!validateClient()) {
      setStatus('Revisa los campos marcados.', 'error');
      focusFirstInvalid();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      // El id viaja; el precio y el nombre NUNCA los decide el cliente
      product_id: productField && productField.value ? Number(productField.value) : null,
      // honeypot (T-011): si un bot lo completa, el servidor lo descarta
      website: form.website ? form.website.value : '',
    };

    setSending(true);
    setStatus('Enviando tu consulta…');

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        let body = {};
        try {
          body = await response.json();
        } catch (_) {
          /* respuesta sin cuerpo JSON */
        }

        if (response.status === 201) {
          // RF-05: confirmar SOLO tras respuesta satisfactoria del servidor
          setStatus('¡Listo! ' + (body.message || 'Tu consulta fue registrada correctamente.'), 'success');
          form.reset();
          clearErrors();
          if (productField) productField.value = '';
          return;
        }

        if (response.status === 422 && body.errors) {
          Object.entries(body.errors).forEach(([field, msg]) => showFieldError(field, msg));
          setStatus('La solicitud contiene datos inválidos. Corrígelos e inténtalo de nuevo.', 'error');
          focusFirstInvalid();
          return;
        }

        if (response.status === 429) {
          setStatus(body.message || 'Demasiadas consultas en poco tiempo. Intenta más tarde.', 'error');
          return;
        }

        setStatus('El envío no pudo completarse. Inténtalo de nuevo.', 'error');
      })
      .catch(() => {
        // Fallo de red: se informa y se permite reintentar (no se reenvía solo)
        setStatus('No pudimos conectar con el servidor. Revisa tu conexión y reintenta.', 'error');
      })
      .finally(() => {
        setSending(false);
      });
  });

  /* ------------- Producto preseleccionado desde el catálogo ------------- */

  document.addEventListener('nudo:product-selected', (event) => {
    const name = event.detail && event.detail.name;
    if (name) {
      setStatus('Consulta sobre: ' + name, 'success');
    }
  });
})();
