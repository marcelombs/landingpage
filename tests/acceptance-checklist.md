# Checklist de aceptación — NUDO Landing Page

Basado en los criterios CA-01 a CA-10 de `docs/spec.md` §11.
Completar durante la Fase 5 (T-031). Marcar `[x]` al verificar.

## CA-01 Visita en escritorio (1440 px)

- [ ] Hero, navegación y secciones en el orden del diseño de referencia
- [ ] Sin solapamientos ni contenido cortado

## CA-02 Visita en móvil (360 px)

- [ ] Contenido se reorganiza correctamente
- [ ] Controles utilizables (botones táctiles)
- [ ] Sin desplazamiento horizontal involuntario

## CA-03 Catálogo real

- [ ] Se observa la solicitud `GET /api/products` en la pestaña Red
- [ ] Las tarjetas muestran datos provenientes del servidor

## CA-04 Filtro por categoría

- [ ] Seleccionar "Chompas" muestra solo chompas
- [ ] "Todos" restaura el catálogo completo

## CA-05 Catálogo vacío

- [ ] Con la tabla vacía se muestra estado vacío comprensible (no un error técnico)

## CA-06 Consulta válida

- [ ] Formulario completo → `201 Created` y confirmación visible
- [ ] El registro existe en `contact_messages`

## CA-07 Consulta inválida

- [ ] Sin nombre / sin medio de contacto → `422` con errores de validación
- [ ] No se persiste el registro

## CA-08 Error de API

- [ ] Backend detenido → mensaje comprensible y opción de reintento

## CA-09 Integridad de datos

- [ ] `product_id` inexistente se rechaza de forma controlada

## CA-10 Seguridad básica

- [ ] Texto con `<script>` e SQL no se ejecuta ni rompe la consulta
- [ ] Sin secretos ni trazas en respuestas ni consola

## CP-11 Operación con teclado

- [ ] Foco visible en todos los controles interactivos
- [ ] Menú móvil, filtros y formulario operables con teclado

## CP-12 Consola y red

- [ ] Sin errores críticos de JavaScript
- [ ] Sin respuestas que expongan credenciales
