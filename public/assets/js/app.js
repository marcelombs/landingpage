/**
 * NUDO — app.js
 * Interacciones generales (Fase 2): menú móvil, barra promocional,
 * año del pie y configuración de WhatsApp desde GET /api/config.
 * El catálogo y el formulario se integran en la Fase 3.
 */
(function () {
  'use strict';

  /* ---------------- Menú móvil (T-025 se refina en Fase 4) --------------- */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('nav-open', open);
    };

    navToggle.addEventListener('click', () => {
      setMenu(!nav.classList.contains('is-open'));
    });

    // Cerrar al elegir un enlace o con Escape
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  /* ---------------- Barra promocional ---------------- */
  const promoBar = document.getElementById('promo-bar');
  const promoClose = document.getElementById('promo-bar-close');

  if (promoBar && promoClose) {
    if (sessionStorage.getItem('nudo-promo-closed') === '1') {
      promoBar.hidden = true;
    }
    promoClose.addEventListener('click', () => {
      promoBar.hidden = true;
      sessionStorage.setItem('nudo-promo-closed', '1');
    });
  }

  /* ---------------- Año del pie de página ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- WhatsApp desde configuración (RF-06) ---------------- */
  function applyWhatsApp(config) {
    const wa = config.whatsapp;
    const links = document.querySelectorAll('[data-whatsapp-link]');

    if (!wa || !wa.enabled || !wa.phone) {
      // Sin número configurado: no mostrar destinos engañosos (RF-06).
      // El botón flotante se queda oculto; el CTA apunta al formulario.
      return;
    }

    const url = 'https://wa.me/' + wa.phone +
      (wa.default_message ? '?text=' + encodeURIComponent(wa.default_message) : '');

    links.forEach((el) => {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    });

    const float = document.getElementById('whatsapp-float');
    if (float) float.hidden = false;

    const footer = document.getElementById('footer-whatsapp');
    if (footer) {
      const pretty = wa.phone.startsWith('591')
        ? '+591 ' + wa.phone.slice(3, 6) + ' ' + wa.phone.slice(6)
        : wa.phone;
      footer.textContent = pretty;
    }
  }

  fetch('/api/config')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('config'))))
    .then((body) => applyWhatsApp(body.data || {}))
    .catch(() => {
      /* sin configuración: el formulario sigue siendo el canal de contacto */
    });
})();
