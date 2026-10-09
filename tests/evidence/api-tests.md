# Reporte de pruebas de API — NUDO (2026-10-09T15:13:02-04:00)

Servidor: `php -S localhost:8000 -t public public/router.php` · Base: `nudo_landing`

| # | Caso | Esperado | Obtenido | Resultado |
|---|------|----------|----------|-----------|
| - | GET /products con registros | 200 | 200 | ✔ PASS |
| - | Total de productos activos | 6 | 6 | ✔ PASS |
| - | GET /products?category=chompas | 200 | 200 | ✔ PASS |
| - | GET /products?category=bicles | 200 | 200 | ✔ PASS |
| - | GET /products?category=noexiste (lista vacía) | 200 | 200 | ✔ PASS |
| - | GET /products?category=ch;drop (inválida) | 400 | 400 | ✔ PASS |
| - | GET /products/1 | 200 | 200 | ✔ PASS |
| - | GET /products/7 (inactiva) | 404 | 404 | ✔ PASS |
| - | GET /products/999999 | 404 | 404 | ✔ PASS |
| - | GET /products/abc | 400 | 400 | ✔ PASS |
| - | POST /products (método no permitido) | 405 | 405 | ✔ PASS |
| - | GET /ruta-inexistente | 404 | 404 | ✔ PASS |
| - | GET /config (público, sin secretos) | 200 | 200 | ✔ PASS |
| - | POST /contact válido → 201 | 201 | 201 | ✔ PASS |
| - | POST /contact sin medio de contacto → 422 | 422 | 422 | ✔ PASS |
| - | POST /contact email inválido → 422 | 422 | 422 | ✔ PASS |
| - | POST /contact product_id inexistente → 422 | 422 | 422 | ✔ PASS |
| - | POST /contact body no JSON → 400 | 400 | 400 | ✔ PASS |
| - | POST /contact honeypot → 201 sin persistir | 201 | 201 | ✔ PASS |
| - | POST /contact 4to en ventana → 429 | 429 | 429 | ✔ PASS |
| - | GET /.env vía web → 404 | 404 | 404 | ✔ PASS |
| - | GET /src/autoload.php → 404 | 404 | 404 | ✔ PASS |
| - | GET /database/schema.sql → 404 | 404 | 404 | ✔ PASS |
| - | POST /contact con SQLi en nombre → 201 (texto literal) | 201 | 201 | ✔ PASS |

## Resumen

**27 pasaron · 0 fallaron** — BATERÍA COMPLETA OK

### Ejemplo de respuesta GET /api/products (primer elemento)

```json
{
    "data": [
        {
            "id": 1,
            "name": "Chompa Siena",
            "category": "chompas",
            "price": 119,
            "currency": "BOB",
            "image_url": "/assets/images/3.avif",
            "short_description": "Chompa tejida de corte cruzado, ideal para el fr\u00edo del altiplano."
        }
    ]
}
```

### Ejemplo de respuesta 201 POST /api/contact

```json
{
    "message": "Tu consulta fue registrada correctamente.",
    "data": {
        "id": 1
    }
}
```

### Ejemplo de respuesta 422

```json
{"message":"La solicitud contiene datos inválidos.","errors":{"name":"El nombre es obligatorio.","subject":"El motivo de consulta es obligatorio.","message":"El mensaje es obligatorio.","contact":"Indica al menos un medio de contacto: correo electrónico o teléfono."}}
```

