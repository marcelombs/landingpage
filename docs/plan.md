# Plan técnico --- Landing Page NUDO

## 1. Arquitectura propuesta

Se propone una arquitectura cliente-servidor sencilla, suficiente para
demostrar las competencias académicas sin sobredimensionar el proyecto.

``` text
┌──────────────────────────────────────────────┐
│ Navegador                                    │
│ HTML semántico + CSS responsive + JS Vanilla │
└──────────────────────┬───────────────────────┘
                       │ HTTP / JSON
                       ▼
┌──────────────────────────────────────────────┐
│ Backend PHP 8.2+ (puro, sin frameworks)      │
│ Rutas → Controlador → Validación → Servicio  │
│ → Repositorio                                │
└──────────────────────┬───────────────────────┘
                       │ PDO (pdo_pgsql)
                       ▼
┌──────────────────────────────────────────────┐
│ PostgreSQL                                   │
│ products / contact_messages                  │
└──────────────────────────────────────────────┘
```

El backend se implementa en PHP 8.2+ puro, organizado por capas, con PDO
sobre PostgreSQL. Esta opción permite evidenciar las consultas y la
comunicación HTTP sin la abstracción de un framework. Como consecuencia,
el enrutamiento, la validación, la carga de configuración y la
protección básica contra abuso se implementan manualmente con clases
propias.

## 2. Responsabilidades por capa

### Frontend

-   Presentar secciones y componentes visuales.
-   Gestionar menú móvil, filtros y estados de interfaz.
-   Solicitar datos mediante `fetch`.
-   Validar de forma preliminar el formulario.
-   Mostrar mensajes de éxito y error según la respuesta real de la API.
-   No conectarse directamente a la base de datos.

### API/backend

-   Exponer endpoints documentados.
-   Validar y normalizar solicitudes.
-   Aplicar reglas de negocio.
-   Consultar y persistir datos.
-   Devolver JSON y códigos HTTP correctos.
-   Registrar errores técnicos en logs sin exponerlos al visitante.

### Persistencia

-   Mantener el catálogo y las consultas.
-   Aplicar claves primarias, restricciones y tipos de datos adecuados.
-   Usar scripts SQL versionados para PostgreSQL (`database/schema.sql`
    y `database/seed.sql`).
-   Guardar credenciales fuera del repositorio.

## 3. Estructura de carpetas

``` text
nudo-landing/
├── public/
│   ├── index.html
│   ├── api.php                   # front controller: recibe /api/*
│   ├── router.php                # solo para el servidor integrado php -S
│   ├── .htaccess                 # solo si se usa Apache
│   └── assets/
│       ├── css/styles.css
│       ├── js/app.js
│       ├── js/catalog.js
│       ├── js/contact.js
│       └── images/
├── src/
│   ├── autoload.php              # spl_autoload_register (sin Composer)
│   ├── Config/
│   │   ├── Env.php               # lector de .env propio
│   │   └── Database.php          # conexión PDO a PostgreSQL
│   ├── Controllers/
│   │   ├── ProductController.php
│   │   └── ContactController.php
│   ├── Services/
│   │   └── ContactService.php
│   ├── Repositories/
│   │   ├── ProductRepository.php
│   │   └── ContactRepository.php
│   ├── Validators/
│   │   └── ContactValidator.php
│   └── Support/
│       ├── Router.php            # enrutador mínimo
│       └── JsonResponse.php
├── routes/
│   └── api.php
├── database/
│   ├── schema.sql
│   └── seed.sql
├── tests/
│   ├── api-products.http
│   └── acceptance-checklist.md
├── .env.example
├── .gitignore
└── README.md
```

El servidor web debe publicar únicamente la carpeta `public/`. No debe
permitir acceso HTTP directo a `src/`, `routes/`, `database/`, archivos
`.env` o scripts SQL. Las solicitudes a `/api/*` deben llegar a
`public/api.php` (reglas de `.htaccess` en Apache o `router.php` con
`php -S localhost:8000 -t public public/router.php`).

### Convenciones de PHP puro y PostgreSQL

-   **Extensiones PHP requeridas:** `pdo_pgsql`, `mbstring` (límites de
    longitud en UTF-8) y `json`.
-   **Conexión:** DSN `pgsql:host=...;port=5432;dbname=...`, con
    `PDO::ATTR_ERRMODE` en `ERRMODE_EXCEPTION` y
    `PDO::ATTR_EMULATE_PREPARES` en `false`.
-   **Variables de entorno (`.env.example`):** `DB_HOST`, `DB_PORT`
    (5432), `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `APP_ENV` y los destinos
    configurables de contacto (WhatsApp, redes). Sin valores reales.
-   **Precio:** PDO devuelve `NUMERIC` como cadena; el repositorio lo
    convierte a número antes de generar el JSON.
-   **Identificador generado:** usar `INSERT ... RETURNING id` en lugar de
    `lastInsertId()`.
-   **Booleanos:** filtrar con `is_active = TRUE`.
-   **`updated_at`:** PostgreSQL no tiene `ON UPDATE`; actualizarlo desde
    el repositorio o con un disparador.
-   **Limitación de frecuencia:** consultar `contact_messages` por
    `ip_hash` en una ventana de tiempo reciente.

## 4. Componentes de interfaz

  -----------------------------------------------------------------------
  Componente              Responsabilidad         Datos
  ----------------------- ----------------------- -----------------------
  `Header` / navegación   Marca y enlaces de      Configuración
                          sección                 

  `Hero`                  Mensaje principal y CTA Contenido editorial

  `PromotionSection`      Oferta y producto       Configuración o API
                          destacado               

  `ProductCatalog`        Listado y estados       `GET /api/products`

  `CategoryFilter`        Filtrar catálogo        Categorías disponibles

  `ProductCard`           Imagen, nombre, precio  Objeto producto
                          y acción                

  `BrandSection`          Propuesta de valor      Contenido editorial

  `Gallery`               Mosaico de imágenes     Configuración de
                                                  imágenes

  `LocationsSection`      Puntos de entrega       Configuración o API

  `ContactSection`        Formulario de consulta  `POST /api/contact`

  `Footer`                Contacto y redes        Configuración
  -----------------------------------------------------------------------

La implementación no requiere que cada componente sea un framework o una
clase. Con JavaScript Vanilla pueden ser funciones de renderizado y
módulos separados.

## 5. Sistema visual responsive

### Paleta aproximada de la referencia

-   Azul marino: `#111D43` (fondo oscuro y títulos).
-   Naranja coral: `#FF5738` (llamadas a la acción y promociones).
-   Crema: `#F5F1E8` (fondo principal).
-   Azul claro: `#DCEAF7` (tarjetas informativas).
-   Blanco: `#FFFFFF` (texto o superficies de contraste).

Los valores son aproximados y deben ajustarse visualmente durante la
implementación.

### Reglas

-   Definir colores, tipografía, espacios, radios y anchos máximos como
    variables CSS.
-   Usar imágenes propias o con licencia adecuada.
-   Evitar texto largo superpuesto sobre fotografías de bajo contraste.
-   En escritorio, el catálogo puede usar tres columnas y las secciones
    editoriales composiciones de dos columnas.
-   En móvil, apilar las tarjetas, reducir márgenes, conservar el tamaño
    legible del texto y hacer que los botones sean fáciles de tocar.
-   No fijar alturas rígidas para secciones que contengan texto
    variable.
-   La captura móvil es una referencia de orden y estética; no se debe
    copiar literalmente el ancho extremadamente estrecho de la captura.

### Puntos de control responsive

-   360 px: móvil pequeño.
-   390--430 px: móvil común.
-   768 px: tableta vertical.
-   1024 px: portátil/tableta horizontal.
-   1440 px: escritorio.

## 6. Flujo de datos

### Catálogo

1.  El usuario abre la página.
2.  JavaScript solicita `GET /api/products`.
3.  El controlador valida los parámetros.
4.  El repositorio consulta productos activos.
5.  El backend devuelve JSON.
6.  El frontend representa las tarjetas.
7.  Si el usuario filtra una categoría, se solicita el filtro al
    servidor o se filtran los datos ya consultados. Para demostrar
    consulta al backend, es preferible usar el parámetro `category` en
    la API.
8.  La interfaz muestra carga, resultados, vacío o error.

### Formulario

1.  El usuario completa nombre, medio de contacto, asunto y mensaje.
2.  El frontend valida campos básicos y desactiva temporalmente el
    botón.
3.  JavaScript envía `POST /api/contact` con JSON.
4.  El backend valida de nuevo los campos.
5.  El servicio aplica reglas de negocio.
6.  El repositorio guarda la consulta.
7.  El backend devuelve `201 Created` o un error adecuado.
8.  El frontend muestra confirmación solo después del éxito del
    servidor.

## 7. Seguridad y configuración

-   Guardar credenciales de base de datos en variables de entorno.
-   Mantener `.env` fuera de Git; publicar solo `.env.example` sin
    secretos.
-   Usar PDO con consultas preparadas (`pdo_pgsql`).
-   Limitar longitud de entradas y validar correo/teléfono.
-   Escapar contenido al insertar texto en HTML.
-   No insertar directamente mensajes de usuario mediante `innerHTML`;
    usar `textContent` o plantillas con escape seguro.
-   Aplicar protección básica contra spam y envíos repetidos.
-   Configurar CORS solo si frontend y API están en orígenes distintos;
    evitar comodines innecesarios.
-   En producción, usar HTTPS y desactivar la visualización de errores
    internos.
-   Mantener imágenes y enlaces externos bajo control.

## 8. Estrategia de pruebas

### Pruebas de API

-   `GET /api/products` con registros existentes.
-   `GET /api/products` sin registros.
-   `GET /api/products?category=chompas`.
-   `GET /api/products/{id}` con ID válido e inexistente.
-   `POST /api/contact` con solicitud válida.
-   `POST /api/contact` sin nombre, sin mensaje o sin medio de contacto.
-   `POST /api/contact` con campos demasiado largos.
-   Comprobar códigos HTTP, estructura JSON y persistencia.

### Pruebas de interfaz

-   Escritorio y móvil en los anchos definidos.
-   Menú móvil abierto/cerrado.
-   Navegación por secciones.
-   Filtro de categoría y selección de producto.
-   Estado de carga, vacío y error.
-   Envío válido e inválido del formulario.
-   Operación con teclado y foco visible.
-   Enlaces de contacto y redes.

### Verificación de comunicación cliente-servidor

En las herramientas de desarrollador del navegador, pestaña
**Network/Red**: - comprobar que se produce la solicitud
`GET /api/products`; - inspeccionar el JSON recibido; - enviar el
formulario y comprobar `POST /api/contact`; - confirmar que el backend
devuelve `201` para una consulta válida; - consultar la base de datos
para verificar que el registro realmente se guardó.

## 9. Entrega

La entrega académica debe incluir: - código fuente; - `.env.example` sin
credenciales; - scripts SQL (`schema.sql` y `seed.sql`); - instrucciones para instalar
y ejecutar; - listado de endpoints; - evidencias de pruebas en
escritorio y móvil; - evidencia de una consulta exitosa y otra rechazada
por validación; - breve explicación de la arquitectura y del flujo
cliente-servidor.
