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

-   [ ] **T-012. Definir tokens visuales**
    -   Crear variables CSS para paleta, tipografía, espaciado, radios y
        contenedores.
    -   **Verificación:** colores y espacios principales se controlan
        desde una ubicación central.
-   [ ] **T-013. Construir encabezado y hero**
    -   Replicar la jerarquía visual de la referencia, logo, navegación
        y CTA.
    -   **Verificación:** navegación y CTA apuntan a destinos válidos.
-   [ ] **T-014. Construir sección de promoción**
    -   Mostrar oferta, producto destacado y condiciones.
    -   **Verificación:** la promoción se lee correctamente y el CTA
        funciona.
-   [ ] **T-015. Construir catálogo y tarjetas**
    -   Crear estructura visual de tarjeta con imagen, nombre,
        categoría, precio y acción.
    -   **Verificación:** la cuadrícula se ajusta al ancho disponible.
-   [ ] **T-016. Construir sección de identidad de marca**
    -   Incorporar imagen textil, título y texto breve.
    -   **Verificación:** imagen y texto mantienen la jerarquía visual
        en móvil y escritorio.
-   [ ] **T-017. Construir galería**
    -   Implementar mosaico en escritorio y distribución adaptable en
        móvil.
    -   **Verificación:** las imágenes no se deforman y tienen
        tratamiento alternativo adecuado.
-   [ ] **T-018. Construir sección de ubicaciones**
    -   Mostrar tarjetas de puntos de entrega configurados.
    -   **Verificación:** cada tarjeta presenta datos consistentes y
        acciones válidas.
-   [ ] **T-019. Construir CTA final y pie de página**
    -   Incorporar contacto, redes y enlaces de navegación.
    -   **Verificación:** ningún enlace queda vacío o roto.

## Fase 3 --- Integración frontend-backend

-   [ ] **T-020. Integrar carga dinámica del catálogo**
    -   Consumir `GET /api/products` con `fetch`.
    -   Renderizar datos del servidor.
    -   **Verificación:** modificar los datos de la base de datos cambia
        el catálogo mostrado.
-   [ ] **T-021. Integrar filtros**
    -   Conectar filtros con la API y representar categoría activa.
    -   **Verificación:** los resultados coinciden con la categoría
        seleccionada.
-   [ ] **T-022. Integrar detalle/consulta de producto**
    -   Permitir ver información disponible o preseleccionar el producto
        en el formulario.
    -   **Verificación:** el producto asociado enviado a la API es
        válido y se verifica en backend.
-   [ ] **T-023. Integrar formulario de contacto**
    -   Enviar JSON a `POST /api/contact`.
    -   Gestionar errores de validación, carga, éxito y error de red.
    -   **Verificación:** la confirmación aparece solo después del éxito
        del servidor.
-   [ ] **T-024. Configurar WhatsApp y enlaces externos**
    -   Centralizar destinos en configuración.
    -   **Verificación:** los botones abren los destinos correctos y no
        hay números ficticios publicados.

## Fase 4 --- Adaptabilidad, accesibilidad y calidad

-   [ ] **T-025. Adaptar navegación móvil**
    -   Crear menú compacto operable y con estado accesible.
    -   **Verificación:** se abre, cierra y permite navegar por teclado
        y tacto.
-   [ ] **T-026. Probar puntos de ruptura**
    -   Revisar 360, 390, 768, 1024 y 1440 px.
    -   **Verificación:** no hay desplazamiento horizontal involuntario
        ni contenido superpuesto.
-   [ ] **T-027. Revisar accesibilidad**
    -   Comprobar etiquetas, textos alternativos, foco, contraste y
        mensajes de estado.
    -   **Verificación:** las acciones principales se pueden completar
        con teclado.
-   [ ] **T-028. Optimizar imágenes**
    -   Comprimir imágenes, utilizar formatos modernos cuando sea
        posible y carga diferida.
    -   **Verificación:** imágenes nítidas, proporciones correctas y
        carga razonable.
-   [ ] **T-029. Revisar seguridad**
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
