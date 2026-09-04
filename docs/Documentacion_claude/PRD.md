# PRD.md

## 1. Resumen Ejecutivo

**Problema**
Los gimnasios administran membresías, pagos y control de acceso de forma manual o con herramientas desorganizadas, lo que dificulta verificar el estado de un cliente en tiempo real. Adicionalmente, los usuarios nuevos no saben usar correctamente las máquinas por falta de guía inmediata, y los administradores no tienen visibilidad del aforo en tiempo real.

**Propuesta de valor**
Plataforma web mobile-first que digitaliza la gestión de un gimnasio individual (single-tenant): control de membresías y pagos, acceso mediante QR, video-instrucciones por máquina vía QR, y visibilidad de aforo en tiempo real para el administrador.

## 2. Objetivos

**Negocio**
- Digitalizar la operación de un gimnasio bajo un modelo de licencia de cuota fija.
- Reducir la dependencia de personal para resolver dudas de uso de equipo.
- Dar visibilidad de ocupación y tendencias de ingresos al administrador.

**Técnicos**
- Control de acceso confiable basado en estado de membresía en tiempo real.
- Arquitectura single-tenant simple, sin lógica de aislamiento multi-cliente.
- Procesamiento de pagos recurrentes automatizado (mensual / anual).

## 3. Alcance

**Módulos principales (v1.0)**
1. Gestión de membresías y clientes (alta, edición, estado, historial de pagos).
2. Control de acceso por QR (membresía, operado por recepción/admin) y aforo en tiempo real.
3. Biblioteca de video-instrucciones por máquina, accesible vía QR.
4. Panel administrativo (ocupación, ingresos, gestión de contenido y accesos, alertas y comunicación con miembros).

**Panel administrativo**
El administrador (rol único, incluye funciones de recepción) gestiona clientes, sube y asocia videos a máquinas, genera códigos QR para equipo nuevo, opera el escaneo de acceso físico, visualiza aforo en tiempo real, consulta tendencias de ingresos y vencimientos, atiende alertas de pago/vencimiento, envía comunicados a miembros y puede reintentar cobros fallidos manualmente.

**Fuera de v1.0**
- Reporte de máquinas dañadas vía QR (incluye estados de mantenimiento o deshabilitación de QR por máquina).
- Analítica de progreso individual del usuario (entrenamientos, calorías, rachas, metas).
- Sistema de rutinas personalizadas.
- Notificaciones push nativas (las comunicaciones v1.0 son por correo).
- Soporte multi-gimnasio (multi-tenant) y categorización de máquinas por zona.
- Roles adicionales a "administrador" y "miembro".
- Autenticación por SSO corporativo o credenciales de administrador distintas a correo/contraseña.

## 4. User Stories

| ID | Historia | Criterios de aceptación |
|---|---|---|
| US-01 | Como visitante, quiero registrarme con correo y contraseña para crear mi cuenta de miembro. | El sistema valida formato de correo, exige contraseña segura y confirma el registro por correo. |
| US-02 | Como visitante, quiero registrarme/iniciar sesión con Google para acceder más rápido. | El flujo de Google Sign-In crea o vincula la cuenta sin duplicar registros por el mismo correo. |
| US-03 | Como miembro, quiero iniciar sesión de forma segura para acceder a mi perfil. | Las contraseñas se almacenan hasheadas; las sesiones expiran tras un periodo de inactividad definido. |
| US-04 | Como miembro, quiero ver mi membresía digital con código QR para usarla como método de acceso. | El QR es único por usuario, se regenera si se reporta comprometido, y es escaneable desde el lector de recepción. |
| US-05 | Como miembro, quiero consultar el estado de mi membresía (activa/vencida) y mi plan actual. | La pantalla de perfil refleja el estado real en tiempo real, sin caché desactualizado. |
| US-06 | Como miembro, quiero ver mi historial de pagos y próxima fecha de vencimiento. | Se listan los pagos procesados con fecha, monto y plan; la fecha de vencimiento es visible de forma destacada. |
| US-07 | Como miembro, quiero recibir un aviso antes de que venza mi membresía para poder renovarla a tiempo. | El sistema notifica in-app y por correo (vía Resend) 5 días antes del vencimiento, y un segundo aviso el día del vencimiento. |
| US-08 | Como miembro, quiero pagar mi membresía mensual o anual dentro de la plataforma. | El pago se procesa vía Recurrente; el sistema confirma el pago y actualiza el estado de la membresía automáticamente. |
| US-09 | Como miembro con membresía vencida, quiero que se me niegue el acceso hasta renovar. | Al escanear el QR con membresía vencida, el sistema bloquea el acceso y muestra el motivo en la pantalla de recepción. |
| US-10 | Como miembro, quiero escanear el QR de una máquina para ver su video instructivo. | El escaneo abre directamente el video asociado a esa máquina sin pasos intermedios. |
| US-10b | Como miembro, quiero usar un único escáner dentro de la app para ver los videos de las máquinas. | La app detecta el QR de máquina desde una sola pantalla de escaneo y dirige al video correspondiente. |
| US-11 | Como administrador, quiero registrar y editar clientes manualmente. | Puedo crear, editar y dar de baja un cliente, y el cambio se refleja de inmediato en su estado de acceso. |
| US-12 | Como administrador, quiero asignar un plan (mensual/anual) a cada cliente. | El sistema calcula automáticamente la fecha de vencimiento según el plan asignado. |
| US-13 | Como administrador, quiero subir videos instructivos y asociarlos a una máquina específica. | El video sube a un canal privado de YouTube y queda vinculado al QR de esa máquina. |
| US-14 | Como administrador, quiero generar un código QR nuevo para una máquina recién adquirida. | El sistema genera un QR único, descargable/imprimible, vinculado al registro de esa máquina. |
| US-15 | Como administrador, quiero ver el aforo actual del gimnasio en tiempo real. | El conteo se actualiza automáticamente con cada escaneo de entrada/salida, sin necesidad de refrescar manualmente. |
| US-16 | Como administrador, quiero ver un resumen de ingresos y tendencias de pagos. | El panel muestra ingresos por periodo y cantidad de membresías activas/vencidas. |
| US-17 | Como administrador, quiero que el sistema bloquee automáticamente el acceso de un cliente al vencer su membresía. | Sin intervención manual, el estado cambia a "vencido" en la fecha correspondiente y el acceso QR se deniega. |
| US-18 | Como miembro, quiero que mi sesión y mis datos de pago estén protegidos. | Toda comunicación usa HTTPS, los datos sensibles de pago no se almacenan directamente (se delega a Recurrente vía tokenización). |
| US-19 | Como administrador, quiero ver alertas de pagos vencidos/fallidos y membresías por vencer en el panel, para poder actuar sin revisar cliente por cliente. | El panel muestra una lista de alertas generadas por reglas automáticas (pago fallido, pago vencido, membresía por vencer en los próximos N días); cada alerta indica el cliente y el motivo. |
| US-20 | Como administrador, quiero enviar anuncios por correo a todos los miembros o a un subconjunto filtrado por estado de membresía y/o plan, para comunicar información relevante. | El admin redacta asunto y cuerpo, elige destinatarios (todos, o filtrado por estado activo/vencido y/o plan), el sistema envía el correo vía Resend a quienes cumplen el filtro, y queda registro del anuncio (fecha, filtro usado, cantidad de destinatarios). |
| US-21 | Como administrador, quiero ejecutar manualmente un cobro para un miembro con pago vencido o fallido, para resolver casos que no se cobran solos. | El admin selecciona un miembro con `Payment.status = failed` o membresía `expired`; se dispara un nuevo intento de cobro vía Recurrente por el monto del plan asignado; si es exitoso, se crea un `Payment` completado y la membresía se reactiva/extiende automáticamente; si falla, queda registrado como nuevo intento fallido. |

## 5. Arquitectura Técnica

**Stack aplicado**
- Frontend: Angular (SPA, mobile-first, navegación inferior de 4 pestañas: Inicio, Miembros, Videos, Perfil).
- Backend: Node.js con Express.
- Runtime: Node.js 20 LTS.
- Autenticación: sesión propia (correo/contraseña) + Google Sign-In. Un solo mecanismo de login para member y admin, diferenciados por `role`.
- Pagos: Recurrente (procesador recurrente para cobros mensuales/anuales, incluye reintentos manuales).
- Video: YouTube privado (embebido, no alojado en infraestructura propia).
- Correo transaccional y comunicados: Resend.
- Idioma: interfaz 100% en español.

**Flujo de datos paso a paso**
1. El cliente muestra su QR de membresía en recepción → el administrador lo escanea desde el panel de administración → la app valida el estado de membresía contra el backend → si está activa, registra entrada y suma al contador de aforo en tiempo real; si está vencida, deniega el acceso y muestra el motivo en la pantalla del admin. Si no hay conexión al momento del escaneo, la app rechaza el acceso por defecto y muestra "sin conexión, intenta de nuevo"; no se permite acceso offline "a ciegas".
2. El cliente escanea el QR de una máquina con su propio teléfono → la app resuelve el video asociado → reproduce el video embebido desde YouTube privado.
3. El pago se inicia desde el perfil del miembro (o es reintentado manualmente por el admin, US-21) → se procesa vía Recurrente → al confirmarse, el backend actualiza el estado de membresía y la fecha de vencimiento.
4. El administrador sube un video → lo asocia a una máquina → el sistema genera/actualiza el QR correspondiente.
5. Cada evento de entrada/salida actualiza el contador de aforo que ve el administrador en el panel, en tiempo real.
6. El sistema genera alertas automáticas (pago fallido, pago vencido, membresía por vencer) visibles en el panel administrativo (US-19). El administrador puede enviar comunicados por correo, masivos o segmentados (US-20).

**Interacción entre capas**
- El frontend Angular consume una API REST expuesta por Express.
- La verificación de membresía y aforo ocurre en el backend, nunca se confía en el estado mostrado en el cliente.
- Los webhooks de Recurrente actualizan el estado de pago de forma asíncrona respecto al flujo de UI.
- El envío de correos (avisos de vencimiento y anuncios) se realiza desde el backend vía Resend, nunca desde el cliente.

*(No se incluyen modelos de datos ni schemas — corresponden al documento `data model.md`.)*

## 6. Requerimientos No Funcionales

**Performance**
- El conteo de aforo debe reflejarse en el panel del administrador en tiempo real (latencia objetivo menor a 3 segundos por evento).
- La validación de membresía al escanear QR debe responder en menos de 1 segundo bajo condiciones normales de red.

**Seguridad**
- Contraseñas con hashing (bcrypt o equivalente), nunca texto plano.
- Sesiones seguras con expiración; sin mecanismos de sesión persistente indefinida ("recordarme") salvo que se defina explícitamente cómo convive con la expiración por inactividad.
- Datos de pago gestionados por Recurrente; la plataforma no almacena números de tarjeta.
- Rate limiting en endpoints de autenticación y validación de QR para prevenir abuso.
- Todo envío de correo masivo (US-20) queda auditado: quién lo envió, a quién y cuándo.

**Privacidad**
- Datos personales de clientes accesibles únicamente por el administrador de ese gimnasio.
- Videos alojados en canal privado de YouTube, no indexados públicamente.

**Accesibilidad**
- Interfaz completamente en español.
- Diseño mobile-first con controles táctiles de tamaño adecuado para uso en piso de gimnasio.

## 7. Diseño y UX

**Principios**
- Mobile-first, interacciones rápidas mediante escaneo QR y modales.
- Mínima fricción para el flujo de acceso (mostrar QR → escaneo por recepción → confirmar → entrar).

**User flows**
- Miembro: registro/login → perfil → membresía QR → mostrar QR en recepción → escaneo de máquina → video.
- Administrador: login → panel (aforo, ingresos, alertas) → escaneo de acceso de miembros → gestión de miembros → gestión de videos/QR de máquinas → envío de comunicados / reintento de cobros.

**Estructura de pantallas y outputs**
- Navegación inferior de 4 pestañas: Inicio, Miembros, Videos, Perfil (vista de miembro).
- Panel administrativo separado con vista de aforo, ingresos, alertas, gestión de clientes, gestión de contenido y escáner de acceso.
- Modales rápidos para resultado de escaneo (acceso concedido/denegado, video de máquina).

*(No se incluye línea gráfica ni branding — corresponde al documento `design guide.md`.)*

## 8. Reglas de Negocio

- Un cliente solo puede tener una membresía activa a la vez (modelo exclusivo, no multi-gimnasio).
- Los planes disponibles son mensual y anual; el vencimiento se calcula automáticamente según el plan.
- Se notifica al cliente antes del vencimiento; al llegar la fecha de vencimiento, el acceso se bloquea automáticamente sin intervención manual.
- El acceso físico (vía QR, escaneado por recepción/admin) solo se concede a membresías con estado "activa".
- El aforo en tiempo real se incrementa/decrementa únicamente a partir de eventos de escaneo válidos.
- Cada QR de membresía solo puede registrar una entrada activa a la vez: si se escanea para "entrada" y no se ha registrado la salida correspondiente, un segundo escaneo de "entrada" con el mismo QR se rechaza y se marca como intento sospechoso (posible QR compartido), visible para el administrador.
- El rol de administrador cubre también las funciones de recepción; no existen roles intermedios en v1.0.
- La licencia del sistema se cobra al gimnasio como cuota fija, independiente del número de miembros que administre.
- Las alertas administrativas (US-19) se generan por reglas del sistema, no se crean manualmente.
- Los comunicados (US-20) siempre se envían por correo; no existe canal push en v1.0.
- El reintento manual de cobro (US-21) solo aplica a membresías con pago `failed` o estado `expired`; no se puede forzar un cobro sobre una membresía activa y al día.

**Casos especiales**
- Escaneo con membresía vencida → acceso denegado + mensaje con motivo y opción de renovar.
- Pago rechazado por Recurrente → la membresía no se activa/renueva y el cliente recibe notificación del fallo; queda disponible para reintento manual del admin (US-21).

## 9. Integraciones
- **Recurrente**: procesamiento de pagos recurrentes (mensual/anual), webhooks de confirmación y reintentos manuales de cobro.
- **PostgreSQL**: base de datos relacional recomendada dado el volumen de relaciones entre clientes, membresías, pagos y máquinas (ver Decisiones Pendientes).
- **Vercel**: hosting y despliegue de la aplicación.
- **Google Sign-In**: autenticación alternativa para miembros.
- **YouTube (privado)**: alojamiento y reproducción de videos instructivos.
- **Resend**: envío de correo transaccional (avisos de vencimiento, US-07) y comunicados masivos/segmentados (US-20).
- **Generador de QR**: se recomienda la librería `qrcode` (Node.js) para generación server-side de códigos QR de membresías y máquinas, por ser ligera, ampliamente usada y sin costo.

## 10. Métricas de Éxito

**Producto**
- % de accesos válidos procesados sin error en el punto de entrada.
- % de miembros que renuevan antes de la fecha de vencimiento tras recibir el aviso.
- Reducción de consultas al personal sobre uso de máquinas (indicador indirecto vía uso de videos QR).
- % de cobros fallidos resueltos mediante reintento manual (US-21).

**Técnicas**
- Tiempo de respuesta de validación de QR (objetivo < 1s).
- Disponibilidad del sistema (uptime objetivo ≥ 99%).
- Tasa de error en webhooks de pago procesados correctamente.

## 11. Fases de Desarrollo

1. **Setup y arquitectura base** — repositorio, entorno, CI básico. (1 semana)
2. **Autenticación y gestión de clientes** — login, Google Sign-In, CRUD de clientes y planes. (2 semanas) — depende de Fase 1.
3. **Membresías, QR y control de acceso** — generación de QR, escaneo de acceso operado por admin, aforo en tiempo real. (2 semanas) — depende de Fase 2.
4. **Pagos** — integración con Recurrente, webhooks, actualización automática de estado, reintento manual (US-21). (2 semanas) — depende de Fase 2.
5. **Videos instructivos** — carga de videos, asociación a QR de máquina, reproducción. (1.5 semanas) — depende de Fase 3.
6. **Panel administrativo** — dashboard de aforo, ingresos, alertas y comunicados (US-19, US-20), gestión centralizada. (2 semanas) — depende de Fases 3 y 4.
7. **QA, hardening y despliegue** — pruebas funcionales, seguridad, performance, deployment a producción. (1.5 semanas) — depende de todas las fases anteriores.

## 12. Decisiones Tomadas (con recomendación técnica)

1. **Base de datos: PostgreSQL.** Relación clara entre clientes, membresías, pagos y máquinas; soporte robusto de transacciones para evitar inconsistencias en cobros.
2. **Runtime: Node.js 20 LTS** en lugar de Bun, por estabilidad y compatibilidad probada con Express y librerías de pago/QR.
3. **Aviso de vencimiento: 5 días antes**, más un segundo aviso el día del vencimiento.
4. **Comportamiento offline:** sin conexión, el acceso se deniega por defecto; no se abre el acceso sin validación confirmada del backend.
5. **QR duplicado/compartido:** se bloquea el segundo escaneo de "entrada" mientras no exista salida registrada, y se marca como intento sospechoso visible al administrador.
6. **Flujo de escaneo:** el miembro usa el escáner de la app únicamente para QR de máquinas (video instructivo). El QR de acceso físico lo escanea el administrador/recepción desde el panel, no el propio miembro.
7. **Librería de generación de QR:** `qrcode` (Node.js), gratuita y ampliamente usada.
8. **Proveedor de correo: Resend**, para avisos de vencimiento (US-07) y comunicados administrativos (US-20).
9. **Límite de YouTube privado:** pendiente de validar cuota de subida y restricciones de embebido antes de depender de él como única fuente de video — este punto queda abierto porque depende de una cuenta real de YouTube que aún no existe, no de una decisión de diseño.
