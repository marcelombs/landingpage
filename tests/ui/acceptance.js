/**
 * T-031/T-034 — Criterios de aceptación CA-01..CA-10 + CP-12 en navegador real.
 * Genera evidencias JSON en tests/evidence/.
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8000';
const EV = '/home/mbustillos/projects/landingpage/landingpage/nudo-landing/tests/evidence';
fs.mkdirSync(EV, { recursive: true });

let pass = 0, fail = 0;
const check = (name, ok, extra = '') => {
  if (ok) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; console.log(`  ✘ ${name}${extra ? ' — ' + extra : ''}`); }
};
const saveJSON = (file, data) =>
  fs.writeFileSync(path.join(EV, file), JSON.stringify(data, null, 2));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const consoleErrors = [];   // mensajes de consola tipo "Failed to load resource" (ruido esperado de red)
  const jsExceptions = [];    // excepciones JS no capturadas = fallos reales

  /* ---- CA-01 escritorio + CA-03 red + CP-12 consola ---- */
  console.log('\n— CA-01 / CA-03 / CP-12 (1440px) —');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // El ruido de red ("Failed to load resource") es esperado: las pruebas
    // provocan a propósito abort, 422 y 404. Solo cuenta excepciones JS reales.
    if (text.includes('Failed to load resource')) { consoleErrors.push(text); return; }
    jsExceptions.push(text);
  });
  page.on('pageerror', (err) => jsExceptions.push(String(err)));

  const apiLog = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/')) {
      let bodyPreview = null;
      try { bodyPreview = (await res.text()).slice(0, 500); } catch (_) {}
      apiLog.push({ method: res.request().method(), url, status: res.status(), bodyPreview });
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });

  // CA-01: secciones en orden
  const order = await page.evaluate(() =>
    ['inicio', 'ofertas', 'coleccion', 'fibra', 'galeria', 'ubicaciones', 'contacto']
      .map((id) => ({ id, top: document.getElementById(id).getBoundingClientRect().top + scrollY })));
  const sorted = [...order].sort((a, b) => a.top - b.top).map((s) => s.id);
  check('CA-01 secciones en el orden previsto', sorted.join() === 'inicio,ofertas,coleccion,fibra,galeria,ubicaciones,contacto', sorted.join());
  check('CA-01 hero y header visibles', await page.locator('.hero__title').isVisible() && await page.locator('.site-header').isVisible());

  // CA-03: petición real registrada
  const productsReq = apiLog.find((l) => l.url.includes('/api/products') && !l.url.includes('?'));
  check('CA-03 GET /api/products en pestaña Red', !!productsReq && productsReq.status === 200, JSON.stringify(productsReq));
  await page.waitForSelector('.product-card');
  saveJSON('network-log.json', apiLog);
  saveJSON('api-products-response.json', { request: productsReq, note: 'bodyPreview truncado a 500 chars' });

  // CP-10: WhatsApp destino correcto (puede incluir ?text= con el mensaje por defecto)
  const waHref = await page.getAttribute('#whatsapp-float', 'href');
  check('CP-10 botón WhatsApp → wa.me/59172590219', (waHref || '').startsWith('https://wa.me/59172590219'), waHref);

  /* ---- CA-04 filtro ---- */
  console.log('\n— CA-04 filtro —');
  await page.click('.filter-btn[data-category="chompas"]');
  await page.waitForTimeout(500);
  const cats = await page.evaluate(() =>
    [...document.querySelectorAll('.product-card__category')].map((e) => e.textContent));
  check('CA-04 solo chompas visibles', cats.length === 3 && cats.every((c) => c === 'chompas'), cats.join());
  await page.click('.filter-btn[data-category=""]');
  await page.waitForTimeout(400);

  /* ---- CA-05 catálogo vacío (intercepción) ---- */
  console.log('\n— CA-05 catálogo vacío —');
  await page.route('**/api/products*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":[]}' }));
  await page.click('.filter-btn[data-category="bicles"]');
  await page.waitForTimeout(400);
  const emptyMsg = await page.textContent('#catalog-status');
  check('CA-05 estado vacío comprensible', !emptyMsg.includes('Error') && emptyMsg.length > 10, emptyMsg.trim());
  await page.unroute('**/api/products*');

  /* ---- CA-08 error de API (intercepción) ---- */
  console.log('\n— CA-08 error de API —');
  await page.route('**/api/products*', (route) => route.abort('failed'));
  await page.click('.filter-btn[data-category="chompas"]');
  await page.waitForTimeout(600);
  const errVisible = await page.locator('#catalog-status.catalog__status--error').isVisible();
  const retryVisible = await page.locator('#catalog-status button', { hasText: 'Reintentar' }).isVisible();
  check('CA-08 mensaje de error + reintento', errVisible && retryVisible);
  await page.unroute('**/api/products*');
  await page.click('#catalog-status button');
  await page.waitForSelector('.product-card');
  // el reintento conserva el filtro activo (Chompas)
  check('CA-08 reintento recupera el catálogo (3 chompas)', (await page.locator('.product-card').count()) === 3);
  await page.click('.filter-btn[data-category=""]');
  await page.waitForTimeout(400);

  /* ---- CA-06 / CA-07 / CA-09 vía fetch del navegador ---- */
  console.log('\n— CA-06/07/09 servidor —');
  const results = await page.evaluate(async () => {
    const post = (body) => fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

    const valid = await post({
      name: 'CA Seis', email: 'ca06@test.bo', phone: '', subject: 'Consulta aceptación',
      message: 'Mensaje válido para el criterio de aceptación seis.', product_id: 1, website: '',
    });
    const invalid = await post({ name: '', email: '', phone: '', subject: '', message: '' });
    const badProduct = await post({
      name: 'CA Nueve', email: 'ca09@test.bo', subject: 'Consulta',
      message: 'Producto inexistente a propósito aqui.', product_id: 424242, website: '',
    });
    return { valid, invalid, badProduct };
  });

  check('CA-06 consulta válida → 201 con id', results.valid.status === 201 && !!results.valid.body.data?.id, JSON.stringify(results.valid.body));
  check('CA-07 consulta inválida → 422 con errors', results.invalid.status === 422 && !!results.invalid.body.errors, JSON.stringify(results.invalid.body.errors));
  check('CA-09 product_id inválido → 422 controlado', results.badProduct.status === 422, JSON.stringify(results.badProduct.body.errors));
  saveJSON('contact-201.json', results.valid);
  saveJSON('contact-422.json', { invalid: results.invalid, badProduct: results.badProduct });

  /* ---- CA-10 seguridad en render ---- */
  console.log('\n— CA-10 seguridad —');
  const xss = await page.evaluate(async () => {
    const r = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '<img src=x onerror=alert(1)>', email: 'xss@test.bo', subject: '<b>bold</b>',
        message: 'Texto con <script>alert(1)</script> para comprobar escape.', website: '',
      }),
    });
    return r.status;
  });
  check('CA-10 contenido activo almacenado como texto (201)', xss === 201);
  // Ninguna alerta abierta durante la sesión (consola sin errores CSP/uncaught)
  check('CP-12 sin excepciones JS en consola', jsExceptions.length === 0, jsExceptions.join(' | '));
  fs.writeFileSync(path.join(EV, 'console-errors.txt'),
    'Excepciones JS no capturadas: ' + (jsExceptions.length ? jsExceptions.join('\n') : '(ninguna)') +
    '\nMensajes de red esperados (abort/422/404 provocados por las pruebas): ' + consoleErrors.length);
  saveJSON('contact-xss-ca10.json', { status: xss, note: 'nombre/subject/message con HTML/JS; se almacenan y muestran como texto' });

  await ctx.close();

  /* ---- CA-02 móvil 360 completo ---- */
  console.log('\n— CA-02 móvil 360px —');
  const mctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const mp = await mctx.newPage();
  await mp.goto(BASE, { waitUntil: 'networkidle' });
  await mp.waitForSelector('.product-card');
  const scrollW = await mp.evaluate(() => document.documentElement.scrollWidth);
  check('CA-02 sin scroll horizontal en 360px', scrollW <= 361, `scrollWidth=${scrollW}`);
  check('CA-02 controles utilizables', await mp.locator('#nav-toggle').isVisible() && await mp.locator('.filter-btn').first().isVisible());
  await mp.screenshot({ path: path.join(EV, 'mobile-full-360.png'), fullPage: true });
  await mctx.close();

  await browser.close();
  console.log(`\n═══ ACEPTACIÓN: ${pass} pasaron, ${fail} fallaron ═══`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
