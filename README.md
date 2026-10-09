# NUDO — Landing Page

Landing page comercial con catálogo dinámico y formulario de contacto
para **NUDO**, emprendimiento de prendas tejidas (El Alto / La Paz).
Proyecto académico desarrollado con la metodología **Spec-Driven
Development (SDD)**.

## Documentación SDD (`docs/`)

| Documento | Contenido |
|---|---|
| [`docs/constitution.md`](docs/constitution.md) | Principios y restricciones no negociables |
| [`docs/spec.md`](docs/spec.md) | Requisitos (RF/RNF), contrato de API, modelo de datos y criterios de aceptación |
| [`docs/plan.md`](docs/plan.md) | Arquitectura por capas, estructura de carpetas y estrategia de pruebas |
| [`docs/tasks.md`](docs/tasks.md) | Backlog de tareas (T-001…) y estado de avance |
| [`docs/design/`](docs/design/) | Referencias visuales de escritorio (`desktop.png`) y móvil (`movil.png`) |

## Stack

- **Backend:** PHP 8.2+ puro (sin frameworks), enrutamiento y validación propios.
- **Base de datos:** PostgreSQL con PDO (`pdo_pgsql`), consultas preparadas.
- **Frontend:** HTML semántico, CSS responsive con variables, JavaScript Vanilla.
- **Comunicación:** API HTTP/JSON (`/api/*`).

## Estructura

```text
nudo-landing/
├── public/               # Única carpeta publicada por el servidor web
│   ├── index.html
│   ├── api.php           # Front controller de la API (/api/*)
│   ├── router.php        # Router del servidor integrado php -S (+ cabeceras de seguridad)
│   └── assets/           # css, js, imágenes AVIF y favicon
├── src/                  # Código PHP (sin acceso HTTP directo)
│   ├── Config/           # Env.php, Database.php
│   ├── Controllers/      # Product, Contact, Config
│   ├── Services/
│   ├── Repositories/
│   ├── Validators/
│   └── Support/          # Router.php, JsonResponse.php, Logger.php
├── routes/api.php        # Definición de rutas
├── database/             # schema.sql y seed.sql
├── tests/                # Baterías, checklist y evidencias
├── docs/                 # Especificaciones SDD y diseño de referencia
├── .env.example          # Plantilla de configuración (sin secretos)
└── .env                  # Configuración local (no versionado)
```

## Requisitos

- PHP 8.2+ con extensiones `pdo_pgsql`, `mbstring`, `json`.
- PostgreSQL 14+ (probado con 16).
- Git.

## Instalación paso a paso

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/marcelombs/landingpage.git
   cd landingpage
   ```

2. **Crear el rol de aplicación y la base de datos** (como superuser de PostgreSQL):

   ```bash
   psql -U postgres
   ```

   ```sql
   CREATE ROLE nudo_app LOGIN PASSWORD 'una_contraseña_segura';
   CREATE DATABASE nudo_landing OWNER nudo_app;
   ```

3. **Variables de entorno:**

   ```bash
   cp .env.example .env
   # Editar .env: DB_HOST, DB_NAME=nudo_landing, DB_USER=nudo_app, DB_PASSWORD
   # y WHATSAPP_* / redes según corresponda
   ```

   `DB_HOST` acepta `127.0.0.1` (TCP + contraseña) o la ruta del socket
   Unix (`/var/run/postgresql`) si la autenticación local es `peer`.

4. **Esquema y datos de prueba** (desde cero), **o restaurar el backup** (ver más abajo):

   ```bash
   PGPASSWORD='...' psql -h 127.0.0.1 -U nudo_app -d nudo_landing -f database/schema.sql
   PGPASSWORD='...' psql -h 127.0.0.1 -U nudo_app -d nudo_landing -f database/seed.sql
   ```

### Restaurar el backup en otra computadora

El repositorio incluye un volcado completo (esquema + catálogo de
demostración) en [`database/backups/nudo_landing.sql`](database/backups/nudo_landing.sql).

1. Realizar los pasos 1–3 anteriores (clone, **crear el rol `nudo_app` y la
   BD `nudo_landing`**, y `.env`).
2. Restaurar como superuser de PostgreSQL (el dump re-crea la base y
   asigna los objetos al dueño `nudo_app`):

   ```bash
   psql -U postgres -d postgres -f database/backups/nudo_landing.sql
   ```

3. Verificar:

   ```bash
   psql -U nudo_app -d nudo_landing -c "SELECT count(*) FROM products WHERE is_active;"
   # → 6
   ```

> El backup contiene el esquema y los productos de demostración. Las
> consultas de usuarios (`contact_messages`) no se incluyen a propósito.
> Para regenerarlo:
>
> ```bash
> pg_dump -h 127.0.0.1 -U nudo_app -d nudo_landing \
>   --no-privileges --clean --if-exists --create \
>   -f database/backups/nudo_landing.sql
> ```

5. **Ejecutar el servidor:**

   ```bash
   php -S localhost:8000 -t public public/router.php
   ```

   - Sitio: `http://localhost:8000`
   - API: `http://localhost:8000/api/products`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Productos activos, filtro opcional `?category=chompas\|bicles` |
| GET | `/api/products/{id}` | Producto individual (`404` si no existe o está inactivo) |
| POST | `/api/contact` | Registra una consulta (`201`; `422` validación; `429` límite de frecuencia) |
| GET | `/api/config` | Configuración pública (WhatsApp, redes); nunca expone secretos |

El contrato completo está en [`docs/spec.md`](docs/spec.md) §8.

## Pruebas

```bash
# Batería de API (27 controles) → tests/evidence/api-tests.md
bash tests/api-tests.sh

# Interfaz y aceptación (requiere Chrome/Chromium y npm i playwright-core)
node tests/ui/ui-test.js        # T-025..T-028: responsive, menú, a11y, imágenes
node tests/ui/acceptance.js     # CA-01..CA-10 + CP-10/12 con evidencias
```

El checklist manual completo está en
[`tests/acceptance-checklist.md`](tests/acceptance-checklist.md) y las
evidencias (capturas, JSON de red, persistencia) en
[`tests/evidence/`](tests/evidence/).

## Contenido de demostración

Precios, promociones, ubicaciones y estadísticas de marca derivan del
diseño de referencia y están aprobados como **contenido de demostración
académica** (T-002). El número de WhatsApp (`+591 7259 0219`) es de
prueba: verificar antes de publicar como real. No se muestran redes
sociales porque no hay perfiles confirmados.

## Arquitectura en una mirada

```text
Navegador (HTML/CSS/JS) --fetch JSON--> public/api.php
    → routes/api.php → Controller → Validator/Service → Repository
    → PDO (consultas preparadas) → PostgreSQL
```

Los errores internos se registran en `logs/error.log` (fuera del alcance
web) y jamás se devuelven al cliente.
