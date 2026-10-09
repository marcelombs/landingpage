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
│   ├── router.php        # Router del servidor integrado php -S
│   └── assets/           # css, js e imágenes
├── src/                  # Código PHP (sin acceso HTTP directo)
│   ├── Config/           # Env.php, Database.php
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Validators/
│   └── Support/          # Router.php, JsonResponse.php
├── routes/api.php        # Definición de rutas
├── database/             # schema.sql y seed.sql
├── tests/                # Pruebas de API y checklist de aceptación
├── docs/                 # Especificaciones SDD y diseño de referencia
├── .env.example          # Plantilla de configuración (sin secretos)
└── .env                  # Configuración local (no versionado)
```

## Requisitos

- PHP 8.2+ con extensiones `pdo_pgsql`, `mbstring`, `json`.
- PostgreSQL 14+ (probado con 16).
- Git.

## Configuración local

1. **Base de datos** (una sola vez):

   ```bash
   # Crear rol de aplicación y base de datos (como superuser de PostgreSQL)
   createuser nudo_app            # con contraseña
   createdb nudo_landing -O nudo_app
   ```

2. **Variables de entorno:**

   ```bash
   cp .env.example .env           # y completar DB_* y valores reales
   ```

3. **Esquema y datos de prueba** (Fase 1):

   ```bash
   psql -U nudo_app -d nudo_landing -f database/schema.sql
   psql -U nudo_app -d nudo_landing -f database/seed.sql
   ```

4. **Ejecutar:**

   ```bash
   php -S localhost:8000 -t public public/router.php
   ```

   La API queda disponible en `http://localhost:8000/api/products`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Productos activos, con filtro opcional `?category=` |
| GET | `/api/products/{id}` | Producto individual |
| POST | `/api/contact` | Registra una consulta (`201 Created`) |

El contrato completo está en [`docs/spec.md`](docs/spec.md) §8.

## Contenido de demostración

Precios, promociones, ubicaciones y datos de contacto en el seed son
**datos de demostración académica** hasta que el responsable confirme
contenido real (ver `docs/spec.md` §13).

## Estado del proyecto

Avance del backlog en [`docs/tasks.md`](docs/tasks.md).
