# Constitución del proyecto --- NUDO

## 1. Propósito

Establecer las reglas obligatorias para diseñar, desarrollar y validar
la landing page NUDO. Toda decisión técnica debe respetar esta
constitución y la especificación aprobada.

## 2. Principios

### P-01. Diseño basado en la referencia

La interfaz debe conservar la identidad visual del diseño compartido:
marca NUDO, estética editorial de moda, fondos crema, azul marino y
naranja coral, tipografía de alto impacto, fotografía de prendas tejidas
y composición diferenciada para escritorio y móvil.

### P-02. Diseño adaptable

La experiencia debe funcionar en móvil, tableta y escritorio. No se
acepta una versión móvil que sea simplemente una reducción de la versión
de escritorio.

### P-03. Funcionalidad real

Los controles visibles deben realizar una acción útil. No se aceptan
botones decorativos sin comportamiento, enlaces rotos ni formularios que
solo simulen un envío exitoso.

### P-04. Cliente-servidor verificable

El navegador debe solicitar información al backend mediante HTTP. El
backend debe validar entradas y consultar o guardar información en una
fuente de datos persistente.

### P-05. Separación de responsabilidades

La presentación, la lógica de interfaz, la lógica del servidor y el
acceso a datos deben mantenerse separados. No se deben incrustar
credenciales ni lógica de acceso a la base de datos en el navegador.

### P-06. Accesibilidad

Los elementos interactivos deben poder identificarse, operarse con
teclado cuando corresponda y mostrar estados comprensibles. Las imágenes
informativas deben tener texto alternativo.

### P-07. Seguridad desde el diseño

Validar en el servidor todos los datos recibidos, parametrizar
consultas, escapar contenido presentado y proteger los endpoints frente
a abuso básico. Nunca confiar únicamente en la validación del navegador.

### P-08. Verificabilidad

Cada requisito debe tener criterios de aceptación observables. Las
tareas se consideran terminadas solo cuando su comportamiento ha sido
probado.

## 3. Decisiones técnicas iniciales

-   **Frontend:** HTML semántico, CSS responsive y JavaScript Vanilla.
-   **Backend:** PHP 8.2 o superior, puro (sin frameworks como Laravel),
    con estructura por capas. Acceso a datos con PDO y la extensión
    `pdo_pgsql`.
-   **Base de datos:** PostgreSQL.
-   **Comunicación:** API HTTP que intercambia JSON.
-   **Control de versiones:** Git.
-   **Entorno local:** PHP 8.2+ (servidor integrado `php -S` o Apache) y
    PostgreSQL.
-   **Idioma de la interfaz:** español.
-   **Moneda de presentación:** bolivianos (Bs), configurable desde los
    datos del producto.
-   **Zona inicial de referencia comercial:** El Alto y La Paz, Bolivia;
    los textos deben poder modificarse si el caso académico cambia.

Estas decisiones están confirmadas por el responsable del proyecto: PHP
8.2+ puro y PostgreSQL. Si el docente exige un stack distinto, actualizar
este apartado, `spec.md` y `plan.md` antes de implementar.

## 4. Restricciones

1.  No introducir un framework frontend pesado ni un framework backend
    (por ejemplo, Laravel) sin una necesidad aprobada.
2.  No exponer credenciales, secretos ni errores internos al cliente.
3.  No almacenar mensajes del formulario únicamente en memoria.
4.  No usar datos de ejemplo como sustituto permanente de la API en la
    versión final.
5.  No declarar una función como implementada hasta verificarla
    manualmente o mediante pruebas.
6.  Los enlaces a WhatsApp, redes sociales y correo deben utilizar
    destinos configurables y reales en el entorno de entrega.

## 5. Definición de terminado

Una entrega está terminada cuando: - satisface los criterios de
aceptación asociados; - funciona en escritorio y móvil; - maneja estados
de carga, vacío y error en las solicitudes; - valida los datos en
cliente y servidor; - persiste correctamente los mensajes y consulta
productos desde la base de datos; - no presenta errores críticos en
consola ni endpoints rotos; - incluye instrucciones de instalación y
configuración sin secretos reales.
