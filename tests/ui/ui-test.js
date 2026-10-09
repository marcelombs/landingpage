/**
 * Suite de verificación de Fase 4 — NUDO
 * Ejecuta en Chrome headless contra http://localhost:8000
 * T-025 menú móvil · T-026 breakpoints · T-027 accesibilidad
 * T-028 imágenes · E2E catálogo/filtros/formulario
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8000';
const WIDTHS = [360, 390, 768, 1024, 1440];
const EVIDENCE = path.resolve('/home/mbustillos/projects/landingpage/landingpage/nudo-landing/tests/evidence');
fs.mkdirSync(EVIDENCE, { recursive: true });

let pass = 0, fail = 0;
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; console.log(`  ✘ ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  /* ================= T-026: breakpoints sin scroll horizontal ============ */
  console.log('\n— T-026: breakpoints —');
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    check(`${w}px sin scroll horizontal (scrollWidth=${scrollW})`, scrollW <= w + 1);
    await page.screenshot({
      path: path.join(EVIDENCE, `desktop-${w}.png`),
      fullPage: w >= 1024,
    });
    await ctx.close();
  }

  /* ================= T-025: menú móvil accesible ========================= */
  console.log('\n— T-025: menú móvil (390px) —');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const toggle = page.locator('#nav-toggle');
    check('toggle visible en móvil', await toggle.isVisible());
    check('aria-expanded=false inicial', (await toggle.getAttribute('aria-expanded')) === 'false');

    await toggle.click();
    await page.waitForTimeout(350);
    check('aria-expanded=true al abrir', (await toggle.getAttribute('aria-expanded')) === 'true');
    check('nav tiene clase is-open', await page.locator('#nav.is-open').isVisible());

    await page.keyboard.press('Escape');
    await page.waitForTimeout(350);
    check('Escape cierra el menú', (await toggle.getAttribute('aria-expanded')) === 'false');

    await toggle.click();
    await page.waitForTimeout(350);
    await page.click('#nav a[href="#coleccion"]');
    await page.waitForTimeout(350);
    check('elegir enlace cierra el menú', (await toggle.getAttribute('aria-expanded')) === 'false');

    await page.screenshot({ path: path.join(EVIDENCE, 'mobile-menu.png') });
    await ctx.close();
  }

  /* ================= E2E: catálogo, filtros, formulario =================== */
  console.log('\n— E2E catálogo (1440px) —');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/#coleccion', { waitUntil: 'networkidle' });

  await page.waitForSelector('.product-card', { timeout: 5000 });
  const totalCards = await page.locator('.product-card').count();
  check('catálogo renderiza 6 productos desde la API', totalCards === 6, `hay ${totalCards}`);

  await page.click('.filter-btn[data-category="chompas"]');
  await page.waitForTimeout(500);
  const chompas = await page.locator('.product-card').count();
  check('filtro Chompas muestra 3', chompas === 3, `hay ${chompas}`);
  check('aria-pressed en Chompas', (await page.getAttribute('.filter-btn[data-category="chompas"]', 'aria-pressed')) === 'true');

  await page.click('.filter-btn[data-category="bicles"]');
  await page.waitForTimeout(500);
  check('filtro Bicles muestra 3', (await page.locator('.product-card').count()) === 3);

  await page.click('.filter-btn[data-category=""]');
  await page.waitForTimeout(500);

  // T-022: consultar producto
  console.log('\n— T-022: consulta de producto —');
  await page.locator('.product-card').first().locator('.product-card__cta').click();
  await page.waitForTimeout(600);
  const pid = await page.inputValue('#f-product-id');
  const subject = await page.inputValue('#f-subject');
  check('product_id preseleccionado', pid === '1', `pid=${pid}`);
  check('asunto precargado con el producto', subject.includes('Chompa Siena'), subject);

  // T-023: envío inválido (cliente)
  console.log('\n— T-023: formulario —');
  await page.fill('#f-name', '');
  await page.fill('#f-message', '');
  await page.click('#contact-submit');
  await page.waitForTimeout(200);
  check('validación cliente marca nombre', await page.locator('#err-name').isVisible());
  check('validación cliente marca mensaje', await page.locator('#err-message').isVisible());

  // T-023: envío válido → 201
  await page.fill('#f-name', 'Ana Navegador');
  await page.fill('#f-email', 'ana.nav@test.bo');
  await page.fill('#f-message', '¿La Chompa Siena tiene tallas S y M con entrega en El Alto?');
  await page.click('#contact-submit');
  await page.waitForSelector('.contact-form__status.is-success', { timeout: 5000 });
  const statusText = await page.textContent('.contact-form__status.is-success');
  check('confirmación visible tras 201', statusText.includes('registrada'), statusText.trim());
  check('formulario se limpia tras éxito', (await page.inputValue('#f-name')) === '');

  await page.screenshot({ path: path.join(EVIDENCE, 'full-desktop.png'), fullPage: true });
  await ctx.close();

  /* ================= T-027: accesibilidad básica ========================== */
  console.log('\n— T-027: accesibilidad (360px) —');
  {
    const ctx2 = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE, { waitUntil: 'networkidle' });

    const imgsNoAlt = await p2.evaluate(() =>
      [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length);
    check('todas las imágenes tienen atributo alt', imgsNoAlt === 0, `${imgsNoAlt} sin alt`);

    const inputsNoLabel = await p2.evaluate(() =>
      [...document.querySelectorAll('input:not([type=hidden]), textarea, select')]
        .filter((el) => {
          if (el.closest('[aria-hidden="true"]')) return false;
          if (el.getAttribute('aria-label')) return false;
          return !(el.id && document.querySelector(`label[for="${el.id}"]`));
        }).length);
    check('todos los campos tienen etiqueta asociada', inputsNoLabel === 0, `${inputsNoLabel} sin label`);

    const liveRegions = await p2.evaluate(() => document.querySelectorAll('[aria-live]').length);
    check('regiones aria-live presentes (>=2)', liveRegions >= 2, `${liveRegions}`);

    // Foco visible en el primer enlace con teclado
    await p2.keyboard.press('Tab');
    const firstFocus = await p2.evaluate(() => {
      const el = document.activeElement;
      const style = getComputedStyle(el);
      return { tag: el.tagName, cls: el.className, outline: style.outlineStyle };
    });
    check('primer Tab enfoca skip-link con foco visible',
      firstFocus.cls.includes('skip-link') && firstFocus.outline !== 'none', JSON.stringify(firstFocus));

    // Sin scroll horizontal con menú abierto
    await p2.click('#nav-toggle');
    await p2.waitForTimeout(300);
    const scrollW = await p2.evaluate(() => document.documentElement.scrollWidth);
    check('sin scroll horizontal con menú abierto', scrollW <= 361, `scrollWidth=${scrollW}`);

    await ctx2.close();
  }

  /* ================= T-028: imágenes ===================================== */
  console.log('\n— T-028: optimización de imágenes —');
  {
    const ctx3 = await browser.newContext();
    const p3 = await ctx3.newPage();
    await p3.goto(BASE, { waitUntil: 'networkidle' });
    const stats = await p3.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      return {
        total: imgs.length,
        lazy: imgs.filter((i) => i.loading === 'lazy').length,
        withDims: imgs.filter((i) => i.getAttribute('width') && i.getAttribute('height')).length,
        heroEager: document.querySelector('.hero img')?.loading !== 'lazy',
      };
    });
    check('imágenes below-the-fold con loading=lazy', stats.lazy >= 8, `${stats.lazy}/${stats.total}`);
    check('imágenes declaran width/height', stats.withDims === stats.total, `${stats.withDims}/${stats.total}`);
    check('hero sin lazy (prioridad)', stats.heroEager);
    await ctx3.close();
  }

  await browser.close();
  console.log(`\n═══ RESULTADO: ${pass} pasaron, ${fail} fallaron ═══`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => { console.error('ERROR FATAL:', e); process.exit(1); });
