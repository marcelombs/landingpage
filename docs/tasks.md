# Backlog de implementación --- NUDO

Las tareas se ejecutan en orden. Una tarea puede marcarse como terminada
cuando cumple sus criterios de verificación. Actualizar este archivo si
la especificación cambia.

## Fase 0 --- Aprobación y preparación

-   [x] **T-001. Confirmar alcance y stack** *(completada 2026-10-09)*
    -   Revisar `constitution.md`, `spec.md` y `plan.md`.
    -   Registrar las decisiones confirmadas: PHP 8.2+ puro (sin
        frameworks), PostgreSQL y entorno local con las extensiones
        `pdo_pgsql` y `mbstring`.
    -   **Verificación del entorno (2026-10-09):** PHP 8.3.6 con
        `pdo_pgsql`, `mbstring`, `json` y `openssl`; PostgreSQL 16.15
        activo; Git 2.43.0. Conexión PDO probada con rol de aplicación
        `nudo_app` sobre la base `nudo_landing`.
    -   **Terminado cuando:** las decisiones técnicas están registradas
        y no hay dudas bloqueantes.
-   [x] **T-002. Validar contenido comercial** *(completada 2026-10-09)*
    -   Confirmar nombres, precios, promoción, puntos de entrega,
        teléfono y redes.
    -   Marcar claramente como demostración cualquier dato ficticio.
    -   **Decisión del responsable (2026-10-09):** el contenido del
        diseño de referencia (nombres, precios Bs 119/89/139/95/139/99,
        promoción -20%, puntos de entrega) queda aprobado como
        **contenido de demostración académica**.
    -   **Teléfono de prueba WhatsApp:** `+591 72590219`
        (`WHATSAPP_NUMBER=59172590219`, `WHATSAPP_ENABLED=true` en
        `.env`). Es un número de prueba: verificar antes de publicar
        como real.
    -   **Redes sociales:** sin perfiles confirmados → no se muestran
        enlaces en el pie de página (RF-05/constitución: no publicar
        destinos ficticios).
    -   **Terminado cuando:** existe un conjunto de contenido autorizado
        para la versión académica.
-   [x] **T-003. Preparar repositorio** *(completada 2026-10-09)*
    -   Crear repositorio Git, `.gitignore`, README y `.env.example`.
    -   Verificado: `.env` está en `.gitignore` con permisos `600` y no
        se versiona; el proyecto se clona sin exponer secretos.
    -   **Terminado cuando:** el proyecto se puede clonar sin exponer
        secretos.

## Fase 1 --- Base de datos y backend

-   [x] **T-004. Crear esquema de datos**
    -   *(completada 2026-10-09)*
    -   Verificación: `schema.sql` aplicado a `nudo_landing` con `psql -v ON_ERROR_STOP=1`; tablas, índices y trigger `updated_at` creados.
    -   Crear `products` y `contact_messages`.
    -   Definir tipos, claves, restricciones y marcas de tiempo.
    -   **Verificación:** se puede crear la base de datos en PostgreSQL
        desde `database/schema.sql` (por ejemplo, con `psql -f`).
-   [x] **T-005. Cargar datos iniciales**
    -   *(completada 2026-10-09)*
    -   Verificación: 6 productos activos (Chompas: Siena/Terracota/Paramo; Bicles: Nube/Linea/Moka) + 1 inactivo de prueba; consulta SQL devuelve el catálogo esperado.
    -   Insertar productos de demostración, categorías, precios e
        imágenes válidas.
    -   **Verificación:** la consulta SQL devuelve los productos activos
        esperados.
-   [x] **T-006. Configurar estructura PHP y conexión segura**
    -   *(completada 2026-10-09)*
    -   Verificación: autoload `Nudo\` sin Composer; `.env` leído; PDO con `ERRMODE_EXCEPTION` y `EMULATE_PREPARES=false`; `/api/*` llega a `public/api.php` vía `router.php`; sin credenciales incrustadas.
    -   Crear el autoload, el lector de `.env`, el front controller
        (`public/api.php`) y el enrutador mínimo.
    -   Leer credenciales desde variables de entorno.
    -   Conectar con PDO (`pdo_pgsql`) y usar consultas preparadas.
    -   **Verificación:** la aplicación conecta a PostgreSQL, las rutas
        `/api/*` llegan al front controller y no hay credenciales
        incrustadas.
-   [x] **T-007. Implementar `GET /api/products`**
    -   *(completada 2026-10-09)*
    -   Verificación: `GET /api/products` → 200 con JSON `data[]`; `?category=chompas|bicles` filtra correctamente; categoría con caracteres raros → 400; lista vacía → `data: []`.
    -   Devolver productos activos en JSON.
    -   Aceptar filtro por categoría.
    -   **Verificación:** pruebas para lista completa, filtro y lista
        vacía.
-   [x] **T-008. Implementar `GET /api/products/{id}`**
    -   *(completada 2026-10-09)*
    -   Verificación: id válido → 200; id inexistente o inactivo → 404; id no numérico → 400.
    -   Consultar producto individual y manejar ID inexistente.
    -   **Verificación:** devuelve `200` o `404` según corresponda.
-   [x] **T-009. Implementar validación del contacto**
    -   *(completada 2026-10-09)*
    -   Verificación: sin medio de contacto → 422 (`errors.contact`); email inválido → 422; `product_id` inexistente → 422 (`errors.product_id`). Corregido bug: `product_id` llegaba como número JSON y se descartaba.
    -   Validar nombre, mensaje, longitud y al menos un medio de
        contacto.
    -   Validar el producto asociado cuando se proporcione.
    -   **Verificación:** entradas inválidas reciben `422` y no se
        persisten.
-   [x] **T-010. Implementar `POST /api/contact`**
    -   *(completada 2026-10-09)*
    -   Verificación: solicitud válida → `201 Created` con `data.id`; registro confirmado en `contact_messages` vía psql; errores 500 sin detalles internos (log en `logs/error.log`).
    -   Guardar consultas y devolver `201 Created`.
    -   Manejar errores sin revelar detalles internos.
    -   **Verificación:** el registro existe en la base de datos después
        de una solicitud válida.
-   [x] **T-011. Añadir protección básica contra abuso**
    -   *(completada 2026-10-09)*
    -   Verificación: honeypot `website` → 201 falso sin persistir; límite 3 envíos / 10 min por `ip_hash` (SHA-256) → 4º envío responde 429; SQLi/XSS en campos se almacenan como texto literal sin ejecutarse.
    -   Evitar doble envío en la interfaz y considerar honeypot o
        limitación de frecuencia en backend.
    -   **Verificación:** los envíos anómalos se rechazan o gestionan de
        forma controlada.

## Fase 2 --- Maquetación visual

-   [x] **T-012. Definir tokens visuales**
    -   *(completada 2026-10-09)*
    -   Verificación: `public/assets/css/styles.css` con tokens en `:root` (paleta navy/coral/crema/sky, escala fluida de tipografía, espaciado, radios, contenedores).
    -   Crear variables CSS para paleta, tipografía, espaciado, radios y
        contenedores.
    -   **Verificación:** colores y espacios principales se controlan
        desde una ubicación central.
-   [x] **T-013. Construir encabezado y hero**
    -   *(completada 2026-10-09)*
    -   Verificación: header sticky con logo NUDO, nav a secciones existentes (#ofertas…#contacto) y CTA 'Comprar ahora'; hero con imagen 2.avif, titular 'ABRIGA TU RITMO' y barra de beneficios; navegación y CTA apuntan a destinos válidos.
    -   Replicar la jerarquía visual de la referencia, logo, navegación
        y CTA.
    -   **Verificación:** navegación y CTA apuntan a destinos válidos.
-   [x] **T-014. Construir sección de promoción**
    -   *(completada 2026-10-09)*
    -   Verificación: tarjeta -20% con fondo textil, combo Bs 189 y tarjeta de entrega gratis en sky; nota 'dato de demostración académica' visible; CTAs enlazan al catálogo y a ubicaciones.
    -   Mostrar oferta, producto destacado y condiciones.
    -   **Verificación:** la promoción se lee correctamente y el CTA
        funciona.
-   [x] **T-015. Construir catálogo y tarjetas**
    -   *(completada 2026-10-09)*
    -   Verificación: cabecera con filtros Todos/Chompas/Bicles (aria-pressed), cuadrícula de 3 columnas (2 en tablet, 1 en móvil), estados de carga/vacío/error preparados (`aria-live`) y marcado de producto; el render con datos de la API es T-020/T-021.
    -   Crear estructura visual de tarjeta con imagen, nombre,
        categoría, precio y acción.
    -   **Verificación:** la cuadrícula se ajusta al ancho disponible.
-   [x] **T-016. Construir sección de identidad de marca**
    -   *(completada 2026-10-09)*
    -   Verificación: sección navy con textura 9.avif, badge '100% tejido con propósito', título 'SE SIENTE DIFERENTE' y stats 02/04/08 con jerarquía correcta en móvil y escritorio.
    -   Incorporar imagen textil, título y texto breve.
    -   **Verificación:** imagen y texto mantienen la jerarquía visual
        en móvil y escritorio.
-   [x] **T-017. Construir galería**
    -   *(completada 2026-10-09)*
    -   Verificación: mosaico de 5 imágenes (10, 2, 12, 1, 7) con columna alta en escritorio; en móvil se reorganiza sin deformar; alt descriptivo en todas (12 incluye El Alto).
    -   Implementar mosaico en escritorio y distribución adaptable en
        móvil.
    -   **Verificación:** las imágenes no se deforman y tienen
        tratamiento alternativo adecuado.
-   [x] **T-018. Construir sección de ubicaciones**
    -   *(completada 2026-10-09)*
    -   Verificación: 4 tarjetas (Faro Murillo, Infocal, Cruce Villa Adela, Correos LP) con zona y detalle; nota de demostración académica; datos centralizados en el HTML (sin duplicar en JS).
    -   Mostrar tarjetas de puntos de entrega configurados.
    -   **Verificación:** cada tarjeta presenta datos consistentes y
        acciones válidas.
-   [x] **T-019. Construir CTA final y pie de página**
    -   *(completada 2026-10-09)*
    -   Verificación: CTA coral 'HABLEMOS DE TU PRÓXIMA FAVORITA' + botón flotante WhatsApp que aparece solo si `/api/config` reporta número habilitado; footer navy con marca, contacto (teléfono desde configuración), navegación y año dinámico; sin enlaces a redes ficticias.
    -   Incorporar contacto, redes y enlaces de navegación.
    -   **Verificación:** ningún enlace queda vacío o roto.

## Fase 3 --- Integración frontend-backend

-   [x] **T-020. Integrar carga dinámica del catálogo**
    -   *(completada 2026-10-09)*
    -   Verificación: `catalog.js` solicita `GET /api/products` con `fetch` y renderiza tarjetas con `textContent` (sin innerHTML); modificar un producto en la BD cambia el catálogo mostrado; estados de carga/vacío/error implementados.
    -   Consumir `GET /api/products` con `fetch`.
    -   Renderizar datos del servidor.
    -   **Verificación:** modificar los datos de la base de datos cambia
        el catálogo mostrado.
-   [x] **T-021. Integrar filtros**
    -   *(completada 2026-10-09)*
    -   Verificación: clic en Chompas/Bicles envía `?category=` al servidor, actualiza `aria-pressed` y re-renderiza; peticiones anteriores se abortan con AbortController; 'Todos' restaura el catálogo completo.
    -   Conectar filtros con la API y representar categoría activa.
    -   **Verificación:** los resultados coinciden con la categoría
        seleccionada.
-   [x] **T-022. Integrar detalle/consulta de producto**
    -   *(completada 2026-10-09)*
    -   Verificación: 'Consultar →' en una tarjeta preselecciona `product_id` en el formulario, precarga asunto/mensaje, desplaza y enfoca; el id enviado se valida en backend (422 si no existe).
    -   Permitir ver información disponible o preseleccionar el producto
        en el formulario.
    -   **Verificación:** el producto asociado enviado a la API es
        válido y se verifica en backend.
-   [x] **T-023. Integrar formulario de contacto**
    -   *(completada 2026-10-09)*
    -   Verificación: validación cliente con errores por campo (`aria-invalid`); envío JSON a `POST /api/contact`; confirmación solo tras `201`; `422` pinta errores del servidor; `429` y fallo de red informan y permiten reintento; botón deshabilitado durante el envío (sin doble envío); honeypot incluido.
    -   Enviar JSON a `POST /api/contact`.
    -   Gestionar errores de validación, carga, éxito y error de red.
    -   **Verificación:** la confirmación aparece solo después del éxito
        del servidor.
-   [x] **T-024. Configurar WhatsApp y enlaces externos**
    -   *(completada 2026-10-09)*
    -   Verificación: destino WhatsApp centralizado en `.env` y servido por `GET /api/config` (RF-06); `app.js` actualiza botones y footer desde esa única fuente; sin números ficticios publicados.
    -   Centralizar destinos en configuración.
    -   **Verificación:** los botones abren los destinos correctos y no
        hay números ficticios publicados.

## Fase 4 --- Adaptabilidad, accesibilidad y calidad

-   [x] **T-025. Adaptar navegación móvil**
    -   *(completada 2026-10-09)*
    -   Verificación con Chrome headless (390px): menú abre/cierra, `aria-expanded` sincronizado, Escape cierra y devuelve el foco, elegir un enlace cierra; sin scroll horizontal con el menú abierto.
    -   Crear menú compacto operable y con estado accesible.
    -   **Verificación:** se abre, cierra y permite navegar por teclado
        y tacto.
-   [x] **T-026. Probar puntos de ruptura**
    -   *(completada 2026-10-09)*
    -   Verificación automatizada en 360/390/768/1024/1440 px: `scrollWidth == viewport` en todos (sin desplazamiento horizontal); capturas en `tests/evidence/`.
    -   Revisar 360, 390, 768, 1024 y 1440 px.
    -   **Verificación:** no hay desplazamiento horizontal involuntario
        ni contenido superpuesto.
-   [x] **T-027. Revisar accesibilidad**
    -   *(completada 2026-10-09)*
    -   Verificación automatizada: 100% de imágenes con `alt`, campos con etiqueta asociada, ≥2 regiones `aria-live`, primer Tab enfoca el skip-link con foco visible.
    -   Comprobar etiquetas, textos alternativos, foco, contraste y
        mensajes de estado.
    -   **Verificación:** las acciones principales se pueden completar
        con teclado.
-   [x] **T-028. Optimizar imágenes**
    -   *(completada 2026-10-09)*
    -   Verificación: AVIF (2.79 MB total para 14 imágenes), below-the-fold con `loading=lazy`, todas declaran `width/height` (sin CLS), hero con `fetchpriority=high` sin lazy.
    -   Comprimir imágenes, utilizar formatos modernos cuando sea
        posible y carga diferida.
    -   **Verificación:** imágenes nítidas, proporciones correctas y
        carga razonable.
-   [x] **T-029. Revisar seguridad**
    -   *(completada 2026-10-09)*
    -   Verificación: cabeceras `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` y CSP `default-src 'self'`; `/.env`, `/src/*`, `/database/*`, `/routes/*`, `/logs/*`, `/.git/*` responden 404; `/api/config` sin secretos; consultas parametrizadas y salida con `textContent` (E2E SQLi probado en Fase 1).
    -   Comprobar validación backend, consultas parametrizadas, salida
        escapada y ausencia de secretos.
    -   **Verificación:** las pruebas negativas no exponen errores
        internos ni generan consultas no previstas.

## Fase 5 --- Pruebas y entrega

-   [ ] **T-030. Ejecutar pruebas de API**
    -   Probar todos los endpoints y códigos HTTP documentados.
    -   **Verificación:** casos válidos e inválidos producen respuestas
        esperadas.
-   [ ] **T-031. Ejecutar pruebas de extremo a extremo**
    -   Recorrer navegación, catálogo, filtros, contacto y enlaces.
    -   **Verificación:** se cumplen los criterios CA-01 a CA-10 de
        `spec.md`.
-   [ ] **T-032. Verificar persistencia**
    -   Enviar un formulario y comprobar el registro en la base de
        datos.
    -   **Verificación:** existe evidencia de que el dato persistió
        realmente.
-   [ ] **T-033. Preparar documentación de instalación**
    -   Documentar requisitos (PHP 8.2+ con `pdo_pgsql` y PostgreSQL), variables de entorno, creación de base de
        datos, ejecución y pruebas.
    -   **Verificación:** otra persona puede ejecutar el proyecto
        siguiendo el README.
-   [ ] **T-034. Preparar evidencias académicas**
    -   Capturas de escritorio/móvil, solicitudes de red, JSON de API y
        registro persistido.
    -   **Verificación:** las evidencias demuestran diseño responsive,
        interacción y comunicación cliente-servidor.

## Orden de prioridad

1.  **Prioridad alta:** T-001 a T-010, T-012 a T-015, T-020, T-023,
    T-026, T-030 a T-033.
2.  **Prioridad media:** T-011, T-016 a T-019, T-021, T-022, T-025,
    T-027 a T-029.
3.  **Prioridad de cierre:** T-024 y T-034.

La prioridad no elimina requisitos; organiza el trabajo para asegurar
primero la base funcional y después el refinamiento visual.
