/**
 * NUDO — catalog.js (T-020, T-021, T-022)
 * Carga el catálogo desde GET /api/products, lo renderiza en la cuadrícula
 * y conecta los filtros de categoría con la API.
 * El DOM se construye con textContent (nunca innerHTML) para escapar
 * cualquier contenido (plan.md §7).
 */
(function () {
  'use strict';

  const grid = document.getElementById('catalog-grid');
  const status = document.getElementById('catalog-status');
  const filters = document.getElementById('catalog-filters');

  if (!grid || !status || !filters) return;

  let controller = null; // aborta peticiones anteriores
  let activeCategory = '';

  /* ------------------------- Estados de interfaz (RF-09) ---------------- */

  function setStatus(message, kind) {
    if (!message) {
      status.hidden = true;
      status.textContent = '';
      status.className = 'catalog__status';
      return;
    }
    status.hidden = false;
    status.textContent = message;
    status.className = 'catalog__status' + (kind ? ' catalog__status--' + kind : '');
  }

  function setBusy(busy) {
    grid.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function showError(message) {
    grid.replaceChildren();
    setStatus(message, 'error');

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Reintentar';
    retry.addEventListener('click', () => load(activeCategory));
    status.append(' ', retry);
  }

  /* ------------------------------ Render (T-020) ------------------------ */

  function productCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const media = document.createElement('div');
    media.className = 'product-card__media';

    const img = document.createElement('img');
    img.src = product.image_url || '';
    img.alt = product.name + ' — ' + (product.short_description || 'prenda tejida NUDO');
    img.loading = 'lazy';
    img.width = 900;
    img.height = 1125;
    if (!product.image_url) img.hidden = true;
    media.append(img);

    const body = document.createElement('div');
    body.className = 'product-card__body';

    const category = document.createElement('p');
    category.className = 'product-card__category';
    category.textContent = product.category;

    const name = document.createElement('h3');
    name.className = 'product-card__name';
    name.textContent = product.name;

    body.append(category, name);

    if (product.short_description) {
      const desc = document.createElement('p');
      desc.className = 'product-card__desc';
      desc.textContent = product.short_description;
      body.append(desc);
    }

    const foot = document.createElement('div');
    foot.className = 'product-card__foot';

    const price = document.createElement('p');
    price.className = 'product-card__price';
    // El precio SIEMPRE viene del servidor (regla de negocio spec.md §10)
    price.textContent = 'Bs ' + Number(product.price).toFixed(0);

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'product-card__cta';
    cta.textContent = 'Consultar →';
    cta.setAttribute('aria-label', 'Consultar por ' + product.name);
    cta.addEventListener('click', () => consultProduct(product));

    foot.append(price, cta);
    body.append(foot);
    card.append(media, body);

    return card;
  }

  /* ------------------- Consulta de producto (T-022) --------------------- */

  function consultProduct(product) {
    // Preseleccionar el producto en el formulario de contacto (RF-04)
    const idField = document.getElementById('f-product-id');
    const subjectField = document.getElementById('f-subject');
    const messageField = document.getElementById('f-message');

    if (idField) idField.value = String(product.id);

    if (subjectField && !subjectField.value.trim()) {
      subjectField.value = 'Consulta sobre ' + product.name;
    }

    if (messageField && !messageField.value.trim()) {
      messageField.value = 'Hola, quisiera conocer disponibilidad, tallas y entrega de la ' + product.name + '.';
    }

    const form = document.getElementById('formulario');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameField = document.getElementById('f-name');
      if (nameField) nameField.focus({ preventScroll: true });
    }

    // Avisar al formulario que hay un producto asociado (contact.js)
    document.dispatchEvent(new CustomEvent('nudo:product-selected', {
      detail: { id: product.id, name: product.name },
    }));
  }

  /* --------------------------- Carga desde la API ----------------------- */

  function load(category) {
    if (controller) controller.abort();
    controller = new AbortController();

    activeCategory = category || '';
    setBusy(true);
    setStatus('');
    grid.replaceChildren();

    const url = activeCategory
      ? '/api/products?category=' + encodeURIComponent(activeCategory)
      : '/api/products';

    fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then((body) => {
        const items = Array.isArray(body.data) ? body.data : [];
        setBusy(false);

        if (items.length === 0) {
          setStatus('Todavía no hay prendas en esta categoría. Escríbenos y te avisamos.', 'empty');
          return;
        }

        const fragment = document.createDocumentFragment();
        items.forEach((product) => fragment.append(productCard(product)));
        grid.append(fragment);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // sustituida por otra petición
        setBusy(false);
        showError('No pudimos cargar la colección. Revisa tu conexión e inténtalo de nuevo.');
      });
  }

  /* ------------------------------ Filtros (T-021) ----------------------- */

  filters.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    filters.querySelectorAll('.filter-btn').forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });

    load(btn.dataset.category || '');
  });

  /* -------------------------------- Arranque ---------------------------- */
  load('');
})();
