# Checklist de aceptación — NUDO Landing Page

Basado en los criterios CA-01 a CA-10 de `docs/spec.md` §11.
Verificado el **2026-10-09** con Chrome headless (`tests/ui/acceptance.js`)
y la batería de API (`tests/api-tests.sh`).
Evidencias en [`tests/evidence/`](evidence/).

## CA-01 Visita en escritorio (1440 px) ✔

- [x] Hero, navegación y secciones en el orden del diseño de referencia *(verificado en DOM: inicio→ofertas→coleccion→fibra→galeria→ubicaciones→contacto; captura `desktop-1440.png`)*
- [x] Sin solapamientos ni contenido cortado

## CA-02 Visita en móvil (360 px) ✔

- [x] Contenido se reorganiza correctamente *(captura `mobile-full-360.png`)*
- [x] Controles utilizables (botones táctiles)
- [x] Sin desplazamiento horizontal involuntario *(scrollWidth=360)*

## CA-03 Catálogo real ✔

- [x] Se observa la solicitud `GET /api/products` en la pestaña Red *(log en `network-log.json`)*
- [x] Las tarjetas muestran datos provenientes del servidor (6 tarjetas desde la API)

## CA-04 Filtro por categoría ✔

- [x] Seleccionar "Chompas" muestra solo chompas *(3 tarjetas, todas `chompas`)*
- [x] "Todos" restaura el catálogo completo

## CA-05 Catálogo vacío ✔

- [x] Con la tabla vacía se muestra estado vacío comprensible (no un error técnico) *(intercepción de red con `data: []`)*

## CA-06 Consulta válida ✔

- [x] Formulario completo → `201 Created` y confirmación visible *(JSON en `contact-201.json`)*
- [x] El registro existe en `contact_messages` *(evidencia `persistence.txt`: "CA Seis" → producto "Chompa Siena")*

## CA-07 Consulta inválida ✔

- [x] Sin nombre / sin medio de contacto → `422` con errores de validación *(`contact-422.json`)*
- [x] No se persiste el registro

## CA-08 Error de API ✔

- [x] Backend inaccesible → mensaje comprensible y opción de reintento *(intercepción abort; al reintentar se recuperan las 3 chompas del filtro activo)*

## CA-09 Integridad de datos ✔

- [x] `product_id` inexistente (424242) se rechaza con `422` controlado *(no se ejecuta SQL ni se rompe)*

## CA-10 Seguridad básica ✔

- [x] Texto con `<script>`, `<img onerror>` e inyección SQL no se ejecuta ni rompe la consulta *(fila XSS almacenada como texto literal en `persistence.txt`; SQLi verificado en `api-tests.md`)*
- [x] Sin secretos ni trazas en respuestas ni consola *(`/api/config` limpio; cabeceras CSP/nosniff activas)*

## CP-10 Enlaces de contacto ✔

- [x] Botón WhatsApp abre `https://wa.me/59172590219` (número de prueba desde `.env`)

## CP-11 Operación con teclado ✔

- [x] Foco visible en todos los controles interactivos *(primer Tab → skip-link con outline)*
- [x] Menú móvil operable con teclado (Escape cierra); filtros y formulario son botones/inputs nativos

## CP-12 Consola y red ✔

- [x] Sin excepciones JavaScript no capturadas *(`console-errors.txt`)*
- [x] Sin respuestas que expongan credenciales

## CP-09 Sin doble envío ✔

- [x] Botón deshabilitado durante el envío; envíos repetidos bloqueados en cliente y rate-limited en servidor (429)
