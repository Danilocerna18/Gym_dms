# sprint_plan.md — Calendario alineado al curso

Supuesto de fecha de inicio: **lunes 27 de julio de 2026** (última semana de julio). Si tu semestre empezó otro día exacto, ajusta las fechas — la estructura de sprints no cambia.

## Dónde estamos hoy (20 de agosto)

| Semana | Fechas aprox. | Sprint | Módulo | Fase |
|---|---|---|---|---|
| 1 | 27 jul – 2 ago | Sprint 0 | M1 | Planning |
| 2 | 3 – 9 ago | Sprint 0 | M1 | Review/Retro → **Release 0** |
| 3 | 10 – 16 ago | Sprint 1 | M2 | Planning |
| **4** | **17 – 23 ago** | **Sprint 1** | **M2** | **Review/Retro → Release 1 ← HOY** |
| 5 | 24 – 30 ago | Sprint 2 | M3 | Planning |
| 6 | 31 ago – 6 sep | Sprint 2 | M3 | Review/Retro → Release 2 |
| 7 | 7 – 13 sep | Sprint 3 | M3 | Planning |
| 8 | 14 – 20 sep | Sprint 3 | M3 | Review/Retro → Release 3 |
| 9 | 21 – 27 sep | Sprint 4 | M4 | Planning |
| 10 | 28 sep – 4 oct | Sprint 4 | M4 | Review/Retro → Release 4 |
| 11 | 5 – 11 oct | Sprint 5 | M5 | Planning |
| 12 | 12 – 18 oct | Sprint 5 | M5 | Review/Retro → Release 5 |
| 13 | 19 – 25 oct | Sprint 6 | M6 | Planning |
| 14 | 26 oct – 1 nov | Sprint 6 | M6 | Review/Retro → Release 6 |
| 15 | 2 – 8 nov | Sprint 7 | Cierre | Planning (hardening) |
| 16 | 9 – 15 nov | Sprint 7 | Cierre | Demo Day + Retro global |

**Estás cerrando Sprint 1 justo ahora.** Tiene sentido: Release 1 pide stack elegido y justificado, documento de arquitectura, repo, tablero y mockups, que es exactamente lo que resolvimos (backend en Node/Express, frontend en React). Ya tienes el `design guide.md` con los mockups conceptuales y el `PRD.md` y `CLAUDE.md` actualizados con el stack definitivo, así que Release 1 queda completo.

## Qué construye cada sprint (con tus 18 user stories, 56 puntos)

Sprint 0 y Sprint 1 **no llevan historias de tu backlog de features** — son de negocio (Release 0, ya lo hiciste con el backlog+PERT) y de arquitectura (Release 1, en proceso). Las historias reales empiezan a construirse en Sprint 2.

### Sprint 2 (sem. 5-6) — Release 2: esqueleto del MVP
| Historia | Puntos |
|---|---|
| US-01 Registro con correo/contraseña | 2 |
| US-03 Login seguro | 2 |
| US-05 Consultar estado de membresía | 1 |
| US-11 Admin: CRUD de clientes | 3 |
| US-12 Admin: asignar plan a cliente | 2 |
| US-14 Admin: generar QR para máquina | 2 |
| **Total** | **12** |

Objetivo del sprint: que exista un flujo de punta a punta aunque sea básico — alguien se registra, entra, el admin puede crear un cliente y asignarle un plan.

### Sprint 3 (sem. 7-8) — Release 3: funcionalidades principales
| Historia | Puntos |
|---|---|
| US-02 Google Sign-In | 3 |
| US-04 Ver membresía digital QR | 4 |
| US-07 Aviso antes de vencimiento | 3 |
| US-08 Pago vía Recurrente | 6 |
| US-09 Bloqueo de acceso vencido | 3 |
| US-10 Escaneo QR de máquina | 3 |
| US-10b Detección automática de tipo de QR | 2 |
| US-13 Subir video y asociarlo a máquina | 4 |
| US-18 Seguridad de sesión y pagos | 2 |
| **Total** | **30** |

Este es el sprint más pesado (incluye pagos, la historia de mayor riesgo junto con el aforo). Si ven que no va a alcanzar, prioricen QR + acceso + pagos antes que videos — son el corazón del producto.

### Sprint 4 (sem. 9-10) — Release 4: base de datos modelada y desplegada
| Historia | Puntos |
|---|---|
| US-06 Ver historial de pagos | 2 |
| US-15 Admin: ver aforo en tiempo real | 6 |
| US-16 Admin: resumen de ingresos | 3 |
| US-17 Bloqueo automático al vencer (cron) | 3 |
| **Total** | **14** |

Se dejaron para este sprint a propósito: son las historias que más dependen de tener la base de datos ya desplegada en la nube (no en local) para mostrarse de forma confiable — datos históricos, agregaciones y jobs programados.

> **Prerequisito (no es ticket de sprint):** antes de que empiece Sprint 5, cada integrante debe tener su cuenta de AWS con créditos activados (GitHub Student Pack / AWS Educate). Es un trámite administrativo, no trabajo del proyecto — no lleva story points ni cuenta como entrega.

### Sprint 5 (sem. 11-12) — Release 5: cloud + pipeline + presupuesto AWS
| Ticket | Descripción | Criterios de aceptación | Puntos |
|---|---|---|---|
| INFRA-01 | Desplegar la aplicación completa (frontend + backend) en AWS mediante un pipeline de CI/CD | El Dockerfile construye sin errores; GitHub Actions despliega automáticamente al hacer merge a `main`; la app responde en una URL pública de AWS | 8 |
| INFRA-02 | Configurar presupuesto y alertas de AWS Budgets | Existe un AWS Budget con límite mensual definido; hay alertas configuradas al 50%, 80% y 100% del gasto; el equipo revisa Cost Explorer semanalmente | 2 |

Este es el sprint donde AWS deja de ser "cuenta registrada" (Sprint 4) y pasa a ser parte funcional del producto: el despliegue en sí es la feature.

### Sprint 6 (sem. 13-14) — Release 6: QA y testing automatizado
| Ticket | Descripción | Criterios de aceptación | Puntos |
|---|---|---|---|
| QA-01 | Escribir pruebas unitarias para la lógica de negocio crítica (vencimiento de membresía, validación de acceso, cálculo de aforo) | Cobertura mínima acordada en clase; las pruebas corren con `npm test` sin errores | 3 |
| QA-02 | Pruebas de integración para el flujo de pagos (webhook de Recurrente) | Se simula un webhook exitoso y uno fallido; el estado de la membresía se actualiza correctamente en ambos casos | 3 |
| QA-03 | Prueba end-to-end del flujo completo de escaneo (QR → validación → acceso concedido/denegado) | La prueba e2e (Playwright/Cypress) cubre al menos: acceso concedido, acceso denegado por vencimiento, y escaneo de máquina abriendo el video | 5 |
| QA-04 | Integrar las pruebas al pipeline como quality gate | Un Pull Request con pruebas en rojo no puede hacer merge a `main` | 2 |

Aunque estos tickets no vienen del backlog de producto original, son parte explícita del Definition of Done de tu curso a partir del Módulo 6 — sin esto, ninguna historia cuenta como "terminada" según tu syllabus.

### Sprint 7 (sem. 15-16) — Hardening + Demo Day
Sin tickets nuevos de feature ni QA: es cierre — corregir bugs encontrados, pulir detalles y preparar la presentación del Demo Day.

## Aviso honesto sobre el ritmo

Ya calculamos que solo 3 historias (pagos, aforo, videos) toman ≈63.5 horas combinadas para un equipo junior. Con 3 personas dedicando ~6-8h/semana cada una, eso es ~36-48h de capacidad por sprint de 2 semanas — el Sprint 3 en particular (30 puntos, incluye pagos) va a sentirse apretado. Si se atrasan, es más sano recortar alcance (ej. mover videos a Sprint 4) que sacrificar calidad de código, porque el Definition of Done de tu curso exige PR revisado y funcionando, no solo "que compile".
