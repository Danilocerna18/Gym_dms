# Backlog — Story Points + PERT

Basado en las 21 user stories del `PRD.md` (18 originales + US-19, US-20, US-21 agregadas tras revisión de mockups de Figma). Escala usada: puntos del 1 al 10, midiendo tamaño/complejidad relativa entre historias (no horas exactas — solo "esta es más grande que esa").

## Backlog estimado

| ID | Historia | Story Points | Sprint |
|---|---|---|---|
| US-01 | Registro con correo y contraseña | 2 | Sprint 2 |
| US-02 | Registro/login con Google Sign-In | 3 | Sprint 3 |
| US-03 | Login seguro (sesión) | 2 | Sprint 2 |
| US-04 | Ver membresía digital con QR | 4 | Sprint 3 |
| US-05 | Consultar estado de membresía | 1 | Sprint 2 |
| US-06 | Ver historial de pagos | 2 | Sprint 4 |
| US-07 | Aviso antes de vencimiento | 3 | Sprint 3 |
| US-08 | Pagar membresía (mensual/anual) vía Recurrente | 6 | Sprint 3 |
| US-09 | Bloqueo de acceso si membresía vencida | 3 | Sprint 3 |
| US-10 | Escaneo de QR de máquina abre video | 3 | Sprint 3 |
| US-10b | Detección automática del tipo de QR de máquina | 2 | Sprint 3 |
| US-11 | Admin: CRUD de clientes | 3 | Sprint 2 |
| US-12 | Admin: asignar plan a cliente | 2 | Sprint 2 |
| US-13 | Admin: subir video y asociarlo a una máquina | 4 | Sprint 3 |
| US-14 | Admin: generar QR para máquina nueva | 2 | Sprint 2 |
| US-15 | Admin: ver aforo en tiempo real | 6 | Sprint 4 |
| US-16 | Admin: resumen de ingresos | 3 | Sprint 4 |
| US-17 | Bloqueo automático al vencer (job programado) | 3 | Sprint 4 |
| US-18 | Seguridad de sesión y datos de pago | 2 | Sprint 3 |
| US-19 | Admin: alertas de pagos vencidos/fallidos y membresías por vencer | 3 | Pendiente de asignar |
| US-20 | Admin: enviar anuncio por correo (masivo o segmentado) | 4 | Pendiente de asignar |
| US-21 | Admin: reintentar cobro manualmente vía Recurrente | 3 | Pendiente de asignar |

**Total: 66 puntos** (56 del backlog original + 10 de US-19/US-20/US-21)

US-19, US-20 y US-21 surgieron al revisar los mockups de Figma del panel administrativo — no estaban en las 18 historias originales. Quedan en el backlog sin sprint asignado por decisión del equipo, para no comprometer el alcance ya comprometido de Sprint 2. Se recomienda ubicarlas en Sprint 4 o posterior, junto a US-15/US-16 (mismo módulo de panel administrativo) — a decidir en el planning correspondiente.

Ninguna historia salió como la más grande de la escala, así que no fue necesario partir ninguna en historias más pequeñas.

## PERT — las 3 historias más grandes

Se seleccionaron US-08 y US-15 por ser las de mayor puntaje (6 pts), y US-13 como la tercera por depender de una integración externa (YouTube) con más incertidumbre que las demás historias de 4 puntos.

Las horas asumen nivel **junior, segundo año de CS**, sin experiencia previa integrando APIs de pago, websockets, ni APIs de video — por eso los rangos son considerablemente más amplios que los de un desarrollador con experiencia (tiempo de investigar documentación, prueba y error, y depurar errores no obvios).

Fórmula: **Tiempo esperado = (O + 4M + P) / 6** — Desviación estándar = (P − O) / 6

| Historia | Optimista (O) | Probable (M) | Pesimista (P) | Tiempo esperado | Desv. estándar |
|---|---|---|---|---|---|
| US-08 — Pago vía Recurrente | 10h | 20h | 40h | **21.7h** | 5.0h |
| US-15 — Aforo en tiempo real | 12h | 24h | 45h | **25.5h** | 5.5h |
| US-13 — Subir/asociar video a máquina | 8h | 15h | 30h | **16.3h** | 3.7h |

**Total estimado (PERT) para las 3 historias: ≈ 63.5 horas**

### Justificación de los rangos
- **US-08 (pagos):** para alguien que nunca ha integrado un procesador de pagos, el pesimista contempla tiempo perdido entendiendo la documentación de Recurrente, configurando el entorno de pruebas (sandbox), y depurando webhooks que no llegan como se espera — algo muy común la primera vez.
- **US-15 (aforo en tiempo real):** la mayor incertidumbre del grupo — websockets (o polling) es probablemente un concepto nuevo; el pesimista contempla tener que investigar el patrón desde cero antes de poder implementarlo.
- **US-13 (video de máquina):** incertidumbre moderada por la curva de aprendizaje de la API de YouTube (autenticación, cuotas, permisos de cuenta privada) sumada a la inexperiencia general con APIs externas.

Si en la práctica avanzan más rápido de lo esperado, es una buena señal — pero es mejor cotizar con margen realista que quedarse cortos a mitad de proyecto.

## Notas para la entrega

- Este backlog va al tablero del proyecto (ClickUp) con los puntos puestos en cada historia + el total sumado.
- El cálculo de PERT se entrega aparte, como comentario o documento — este archivo cumple esa función.
- US-19, US-20, US-21 aún no tienen tickets en ClickUp — quedan pendientes de crear cuando se les asigne sprint.
- Los puntos aquí son una primera propuesta para que la discutan como equipo; el ejercicio pide explícitamente comparar números individuales y resolver diferencias juntos antes de entregarlo.
