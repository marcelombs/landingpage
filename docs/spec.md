# Especificación del producto --- Landing Page NUDO

**Estado:** propuesta inicial para aprobación\
**Versión:** 1.0\
**Producto:** NUDO --- prendas tejidas\
**Tipo:** landing page comercial con catálogo dinámico y formulario
conectado al backend.

## 1. Visión del producto

NUDO presenta y promociona prendas tejidas ---chompas, bicles y otros
productos textiles--- mediante una experiencia visual editorial. La
página debe comunicar el estilo de la marca, destacar promociones,
permitir explorar productos y facilitar que una persona interesada
consulte por un artículo o se contacte con el emprendimiento.

La landing page debe superar una página estática: el catálogo se
consulta desde el servidor, los filtros modifican los resultados, y el
formulario de contacto envía información que se valida y guarda en una
base de datos.

## 2. Público objetivo

-   Personas que buscan prendas tejidas y ropa de estilo casual.
-   Visitantes que llegan desde redes sociales o enlaces compartidos.
-   Personas de El Alto y La Paz interesadas en consultar
    disponibilidad, precio, tallas, entrega o ubicación.

## 3. Objetivos medibles

1.  Comunicar en la primera pantalla qué ofrece NUDO y cuál es su
    propuesta de valor.
2.  Permitir descubrir productos y precios sin recargar innecesariamente
    la página.
3.  Permitir filtrar el catálogo por categoría.
4.  Permitir enviar una consulta de contacto con confirmación real del
    servidor.
5.  Proporcionar información de entrega y puntos de referencia.
6.  Mantener legibilidad y usabilidad en móvil y escritorio.

## 4. Alcance

### Incluido en la primera versión

-   Página de inicio responsive basada en los diseños proporcionados.
-   Navegación a secciones mediante enlaces internos.
-   Hero principal con llamado a la acción.
-   Sección de promoción.
-   Catálogo de productos cargado desde la API.
-   Filtros por categoría.
-   Sección de identidad de marca.
-   Galería visual.
-   Sección de puntos de entrega o ubicación.
-   Llamado a contacto.
-   Enlace de contacto por WhatsApp configurable.
-   Formulario de consulta procesado por backend.
-   Persistencia de productos y mensajes en base de datos.
-   Estados de carga, error y resultados vacíos.
-   Pruebas de aceptación y documentación de instalación.

### Fuera de alcance

-   Carrito de compras y checkout.
-   Pasarela de pago.
-   Control de inventario en tiempo real.
-   Autenticación de clientes.
-   Panel administrativo completo.
-   Envíos automatizados por WhatsApp desde un proveedor externo.
-   Integración real con mapas o geolocalización. En la primera versión,
    las ubicaciones pueden mostrarse como tarjetas con dirección y
    enlace externo.

## 5. Estructura visual y de contenido

### 5.1 Encabezado y navegación

-   Mostrar el logotipo textual **NUDO**.
-   En escritorio, mostrar enlaces a las secciones principales y un
    botón de acción destacado.
-   En móvil, usar navegación compacta y accesible.
-   Mantener el encabezado legible sobre el hero.
-   Los enlaces deben desplazarse a secciones existentes.

### 5.2 Hero principal

-   Usar una fotografía de una prenda tejida como imagen de fondo o
    composición principal.
-   Mostrar un mensaje principal equivalente a "Abriga tu ritmo".
-   Incluir texto breve que explique la propuesta de la marca.
-   Incluir un botón que lleve al catálogo.
-   Garantizar contraste suficiente entre texto y fotografía.

### 5.3 Promoción destacada

-   Mostrar una promoción vigente, por ejemplo "-20% en tu segunda
    prenda tejida".
-   La promoción debe poder cambiarse sin editar la estructura de la
    página, preferiblemente mediante configuración o datos.
-   Mostrar una tarjeta con producto destacado, precio y enlace para
    consultar.
-   Mostrar una tarjeta informativa sobre entrega gratuita, indicando
    las condiciones reales que se definan para la demostración.
-   No presentar una oferta como real si es solo ilustrativa:
    identificarla como dato de demostración en el entorno académico.

### 5.4 Catálogo de productos

-   Mostrar título de sección y una cuadrícula de tarjetas.
-   Cada tarjeta incluye imagen, nombre, categoría y precio en Bs.
-   Los productos se obtienen del endpoint del backend.
-   Incluir filtros: "Todos", "Chompas", "Bicles" y las categorías que
    existan en los datos.
-   Al elegir una categoría, actualizar la lista sin recargar toda la
    página.
-   Si no existen productos, mostrar un mensaje de catálogo vacío.
-   Si la API falla, mostrar un mensaje de error y una opción para
    reintentar.
-   La selección de un producto debe permitir consultar sus datos o
    iniciar una consulta de contacto con el producto preseleccionado.

### 5.5 Sección de identidad de marca

-   Presentar una imagen textil de gran tamaño y un mensaje como "Se
    siente diferente".
-   Comunicar brevemente los materiales, estilo o propuesta de valor.
-   Cualquier afirmación sobre materiales, origen o sostenibilidad debe
    ser comprobable o tratarse como contenido ficticio claramente
    identificado.

### 5.6 Galería visual

-   Mostrar fotografías de prendas, texturas y estilo de vida.
-   En escritorio, usar una composición tipo mosaico.
-   En móvil, reorganizar las imágenes en una columna o cuadrícula
    compacta.
-   Las imágenes decorativas deben tener texto alternativo vacío
    (`alt=""`); las informativas, un texto alternativo descriptivo.
-   No depender exclusivamente de la galería para comunicar información
    esencial.

### 5.7 Ubicaciones y entrega

-   Mostrar tarjetas de puntos de entrega, por ejemplo Faro Murillo,
    Infocal El Alto, Cruce Villa Adela y Correos en La Paz, solo si esos
    lugares y condiciones son confirmados por el responsable del
    proyecto.
-   Cada tarjeta debe mostrar nombre, zona o dirección breve y una
    acción útil.
-   Si la información es ficticia, indicarlo como ejemplo académico.
-   La información de ubicaciones debe ser editable y no quedar
    duplicada en múltiples componentes.

### 5.8 Llamado a la acción y pie de página

-   Mostrar un bloque destacado equivalente a "Hablemos de tu próxima
    favorita".
-   Ofrecer acceso al formulario de contacto o al canal de WhatsApp
    configurado.
-   El pie de página debe mostrar marca, resumen, datos de contacto y
    enlaces a redes sociales que existan.
-   No publicar números, direcciones o perfiles ficticios como si fueran
    reales.

## 6. Requisitos funcionales

### RF-01. Navegación por secciones

**Descripción:** los enlaces del encabezado y los botones principales
deben llevar a la sección correspondiente.\
**Aceptación:** - Al activar "Colección" o el botón principal, se
muestra la sección de catálogo. - Los enlaces internos apuntan a
identificadores existentes. - En móvil, el menú puede abrirse, cerrarse
y utilizarse con teclado.

### RF-02. Consulta del catálogo desde el servidor

**Descripción:** la página debe solicitar productos al backend y
mostrarlos dinámicamente.\
**Aceptación:** - Al cargar el catálogo, el navegador solicita
`GET /api/products`. - El servidor obtiene los datos de PostgreSQL y
responde JSON. - Cada producto disponible se representa con nombre,
categoría, precio e imagen. - Si la base de datos no contiene productos,
la interfaz muestra un estado vacío comprensible. - No se usa una lista
fija en JavaScript como fuente definitiva de datos.

### RF-03. Filtrado por categoría

**Descripción:** el usuario puede filtrar los productos por categoría.\
**Aceptación:** - "Todos" muestra todos los productos activos. - Una
categoría muestra solo productos de esa categoría. - El filtro utiliza
`GET /api/products?category=chompas` o un mecanismo equivalente
documentado. - Los filtros funcionan en móvil y escritorio y muestran
visualmente la opción seleccionada.

### RF-04. Consulta de producto

**Descripción:** el usuario puede iniciar una consulta sobre un producto
específico.\
**Aceptación:** - Cada tarjeta ofrece una acción claramente
identificada. - La acción muestra los detalles disponibles o lleva al
formulario de contacto con el producto preseleccionado. - El
identificador del producto enviado al servidor se valida; no se confía
en el precio ni en el nombre enviados por el cliente.

### RF-05. Envío de formulario de contacto

**Descripción:** el visitante puede enviar una consulta.\
**Campos mínimos:** nombre, correo electrónico o teléfono, motivo de
consulta y mensaje. El proyecto puede exigir uno de los dos medios de
contacto, no necesariamente ambos.\
**Aceptación:** - El navegador valida campos obligatorios y formato
básico. - El servidor vuelve a validar los datos. - El servidor guarda
el mensaje en la base de datos. - El servidor responde con un código
HTTP adecuado y un mensaje de resultado. - La interfaz solo confirma el
envío después de recibir una respuesta satisfactoria del servidor. -
Ante errores de validación, se muestran mensajes junto a los campos
pertinentes. - Ante un error de red o del servidor, se informa que el
envío no pudo completarse y se permite reintentar sin duplicar
silenciosamente el envío.

### RF-06. Acceso a WhatsApp

**Descripción:** los botones de contacto abren el enlace configurable de
WhatsApp.\
**Aceptación:** - El destino se define mediante configuración, no se
repite en varios archivos. - El mensaje inicial puede incluir el
producto seleccionado si corresponde. - Si no existe un número real
configurado, el entorno de demostración lo indica claramente y no
muestra un destino engañoso.

### RF-07. Visualización de promoción

**Descripción:** se muestra una promoción destacada.\
**Aceptación:** - Se ve el porcentaje o texto promocional y su llamada a
la acción. - La acción lleva al catálogo o a una consulta relacionada. -
La promoción puede desactivarse o editarse mediante
datos/configuración. - Las condiciones de la oferta son claras.

### RF-08. Presentación de ubicaciones

**Descripción:** se muestran puntos de entrega configurados.\
**Aceptación:** - Cada tarjeta muestra un nombre y detalle de
ubicación. - Los datos provienen de una configuración central o
endpoint, no de copias inconsistentes. - Los enlaces externos, si
existen, funcionan y se abren de forma segura.

### RF-09. Estados de interfaz

**Descripción:** las operaciones asíncronas deben comunicar su estado.\
**Aceptación:** - El catálogo muestra carga mientras espera respuesta. -
Se diferencia entre catálogo vacío y error de conexión. - El formulario
muestra envío en curso y evita envíos repetidos mientras procesa. - Los
mensajes de resultado son accesibles mediante tecnologías de asistencia,
por ejemplo `aria-live`.

## 7. Requisitos no funcionales

### RNF-01. Responsividad

-   Diseñar desde móvil hacia escritorio o verificar ambos extremos de
    forma explícita.
-   Probar como mínimo a 360 px, 768 px, 1024 px y 1440 px de ancho.
-   No debe existir desplazamiento horizontal involuntario.
-   Las tarjetas, botones y texto deben mantener una jerarquía visual
    clara.

### RNF-02. Rendimiento

-   Usar imágenes optimizadas y tamaños apropiados.
-   Aplicar carga diferida a imágenes fuera de la primera pantalla
    cuando corresponda.
-   Evitar solicitudes repetidas innecesarias a la API.
-   Como objetivo inicial, procurar que la página sea usable en una
    conexión móvil corriente; registrar mediciones durante las pruebas.

### RNF-03. Accesibilidad

-   Usar HTML semántico, etiquetas asociadas a campos y estados de foco
    visibles.
-   Mantener contraste legible.
-   No comunicar categorías solo mediante color.
-   Todos los controles importantes deben ser operables con teclado.

### RNF-04. Seguridad

-   Usar consultas parametrizadas (PDO con sentencias preparadas).
-   Validar entradas en backend y escapar la salida.
-   No devolver trazas, consultas SQL ni secretos en las respuestas.
-   Aplicar protección contra spam básica al formulario (por ejemplo,
    campo honeypot y limitación de frecuencia si el entorno lo permite).
-   Usar HTTPS en despliegue.

### RNF-05. Mantenibilidad

-   Mantener estructura clara de archivos, configuración centralizada y
    nombres coherentes.
-   Documentar variables de entorno requeridas.
-   Separar datos, presentación y reglas de negocio.

### RNF-06. Compatibilidad

-   Probar en versiones actuales de Chrome y Firefox, además de un
    navegador móvil.
-   La interfaz debe seguir siendo legible si las imágenes no cargan.

## 8. Contrato de API

Los nombres son una propuesta inicial; si se modifican, actualizar el
documento y las pruebas.

### `GET /api/products`

Obtiene productos activos.

**Consulta opcional:** `?category=chompas`

**Respuesta `200 OK`:**

``` json
{
  "data": [
    {
      "id": 1,
      "name": "Chompa Siena",
      "category": "chompas",
      "price": 119.00,
      "currency": "BOB",
      "image_url": "/assets/products/chompa-siena.webp",
      "short_description": "Prenda tejida de estilo casual"
    }
  ]
}
```

**Reglas:** - Solo devolver productos activos. - Validar o normalizar el
filtro de categoría. - Ordenar de manera consistente, por ejemplo por
prioridad y nombre. - Responder `500` con un mensaje genérico si falla
el servidor; registrar el detalle internamente.

### `GET /api/products/{id}`

Obtiene un producto por identificador.

-   `200 OK`: producto encontrado.
-   `404 Not Found`: no existe o no está disponible.
-   `400 Bad Request`: identificador inválido, si aplica.

### `POST /api/contact`

Registra una consulta.

**Solicitud `application/json`:**

``` json
{
  "name": "Ana",
  "email": "ana@example.com",
  "phone": "",
  "subject": "Consulta sobre Chompa Siena",
  "message": "¿Qué tallas están disponibles?",
  "product_id": 1
}
```

**Respuesta `201 Created`:**

``` json
{
  "message": "Tu consulta fue registrada correctamente.",
  "data": {
    "id": 25
  }
}
```

**Errores esperados:** - `422 Unprocessable Entity`: campos faltantes o
inválidos. - `429 Too Many Requests`: exceso de envíos, si se implementa
limitación. - `500 Internal Server Error`: fallo inesperado, sin revelar
detalles internos.

## 9. Modelo de datos inicial

Motor: **PostgreSQL**. Los tipos indicados son una propuesta y se definen
en `database/schema.sql`.

### Tabla `products`

-   `id`: clave primaria (`BIGINT GENERATED ALWAYS AS IDENTITY`).
-   `name`: nombre del producto, obligatorio (`VARCHAR`).
-   `slug`: identificador legible único, opcional si no se utiliza en
    URL.
-   `category`: categoría normalizada en minúsculas (`VARCHAR`).
-   `short_description`: descripción breve.
-   `price`: `NUMERIC(10,2)` con restricción `CHECK (price > 0)`.
-   `currency`: código de moneda (`CHAR(3)`), inicialmente `BOB`.
-   `image_url`: ruta o URL de imagen.
-   `is_active`: `BOOLEAN`, indica si el producto aparece en el
    catálogo.
-   `sort_order`: `INTEGER`, orden de presentación.
-   `created_at`, `updated_at`: `TIMESTAMPTZ`. PostgreSQL no actualiza
    `updated_at` automáticamente; hacerlo desde el repositorio o con un
    disparador (trigger).

### Tabla `contact_messages`

-   `id`: clave primaria (`BIGINT GENERATED ALWAYS AS IDENTITY`).
-   `name`: nombre del remitente.
-   `email`: correo opcional si se proporciona teléfono.
-   `phone`: teléfono opcional si se proporciona correo.
-   `subject`: asunto o motivo.
-   `message`: contenido de la consulta.
-   `product_id`: relación opcional con `products`
    (`REFERENCES products(id) ON DELETE SET NULL`).
-   `status`: `VARCHAR` con `CHECK` para los valores `new`, `reviewed`,
    `closed`; valor inicial `new`.
-   `ip_hash`: opcional; huella (hash) de la IP del remitente, usada
    solo para la limitación de frecuencia. No almacenar la IP en claro.
-   `created_at`: `TIMESTAMPTZ` con valor por defecto `now()`.

**Regla de integridad:** debe proporcionarse al menos un medio de
contacto válido: correo o teléfono (`CHECK (email IS NOT NULL OR phone
IS NOT NULL)`). El backend convierte las cadenas vacías (por ejemplo
`"phone": ""`) en `NULL` antes de validar y guardar. Si se elimina un
producto, las consultas históricas no deben desaparecer; por eso la
relación es nullable con `ON DELETE SET NULL`.

## 10. Reglas de negocio

-   Solo productos activos aparecen en el catálogo público.
-   El precio se lee del servidor; el cliente no determina el precio
    oficial.
-   El formulario requiere nombre, mensaje y al menos un medio de
    contacto.
-   El mensaje tiene límites de longitud definidos en backend.
-   Los datos de promoción, ubicación y contacto deben ser editables sin
    rehacer toda la página.
-   Las ofertas, horarios, lugares y datos de contacto deben verificarse
    antes de publicarse como reales.

## 11. Criterios de aceptación de extremo a extremo

### CA-01. Visita en escritorio

**Dado** que un visitante abre la landing page en escritorio, **cuando**
carga la página, **entonces** ve el hero, la navegación y las secciones
en el orden previsto, sin solapamientos ni contenido cortado.

### CA-02. Visita en móvil

**Dado** que un visitante abre la página en un dispositivo de 360 px de
ancho, **cuando** recorre las secciones, **entonces** el contenido se
reorganiza, los controles son utilizables y no aparece desplazamiento
horizontal involuntario.

### CA-03. Catálogo real

**Dado** que existen productos activos en la base de datos, **cuando**
se abre el catálogo, **entonces** el navegador consulta la API y muestra
los productos recibidos del servidor.

### CA-04. Filtro

**Dado** que existen productos de varias categorías, **cuando** el
visitante selecciona "Chompas", **entonces** solo se muestran productos
de esa categoría.

### CA-05. Catálogo vacío

**Dado** que la API devuelve una lista vacía, **cuando** se muestra el
catálogo, **entonces** se informa que todavía no hay productos
disponibles, sin presentar un error técnico.

### CA-06. Consulta válida

**Dado** que el visitante completa correctamente el formulario,
**cuando** lo envía, **entonces** el backend valida y guarda el mensaje
y la interfaz muestra confirmación después de recibir `201 Created`.

### CA-07. Consulta inválida

**Dado** que faltan campos obligatorios o no existe un medio de contacto
válido, **cuando** se envía el formulario, **entonces** el servidor
rechaza la solicitud con errores de validación y no guarda un mensaje
inválido.

### CA-08. Error de API

**Dado** que el servidor no responde, **cuando** el catálogo intenta
cargar, **entonces** se muestra un mensaje comprensible y una opción de
reintento.

### CA-09. Integridad de datos

**Dado** que una consulta hace referencia a un producto, **cuando** el
backend la persiste, **entonces** la referencia corresponde a un
producto válido o se rechaza de forma controlada.

### CA-10. Seguridad básica

**Dado** que un usuario envía texto con caracteres especiales o
contenido inesperado, **cuando** el backend procesa la solicitud,
**entonces** no se ejecuta como SQL ni se interpreta como HTML activo al
mostrarse.

## 12. Casos de prueba mínimos

  -----------------------------------------------------------------------
  ID                      Escenario               Resultado esperado
  ----------------------- ----------------------- -----------------------
  CP-01                   Abrir página en 1440 px Secciones y hero se
                                                  muestran correctamente

  CP-02                   Abrir página en 360 px  Diseño adaptable, sin
                                                  scroll horizontal

  CP-03                   API con productos       Se muestran tarjetas
                          activos                 con datos de API

  CP-04                   API sin productos       Se muestra estado vacío

  CP-05                   Filtrar por categoría   Solo aparecen productos
                                                  coincidentes

  CP-06                   API no disponible       Se muestra error y
                                                  opción de reintento

  CP-07                   Enviar formulario       Registro persistido y
                          válido                  confirmación del
                                                  servidor

  CP-08                   Enviar formulario       Se muestran errores y
                          inválido                no se guarda

  CP-09                   Enviar formulario       Se evita el doble envío
                          repetidamente           accidental

  CP-10                   Abrir enlaces de        Destinos configurados y
                          contacto                funcionales

  CP-11                   Navegar solo con        Foco visible y
                          teclado                 controles operables

  CP-12                   Revisar consola y red   Sin errores críticos ni
                                                  respuestas con secretos
  -----------------------------------------------------------------------

## 13. Decisiones confirmadas, supuestos y preguntas pendientes

**Decisiones técnicas confirmadas:**

-   Backend en PHP 8.2+ puro, sin Laravel ni otros frameworks.
-   Base de datos PostgreSQL.

**Deben confirmarse antes de publicar:**

-   ¿Los nombres, precios y promociones de la referencia son definitivos
    o ilustrativos?
-   ¿Qué número de WhatsApp y perfiles sociales se utilizarán?
-   ¿Las ubicaciones de entrega son reales y están autorizadas?
-   ¿El despliegue será local, en hosting institucional o en un servidor
    público? (El hosting debe ofrecer PHP 8.2+ con `pdo_pgsql` y
    PostgreSQL.)
-   ¿Se requiere una herramienta de administración de productos? Está
    fuera del alcance inicial.

Hasta confirmar esos datos, utilizar contenido de demostración
claramente identificado.
