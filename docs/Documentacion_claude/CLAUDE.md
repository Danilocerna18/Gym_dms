# CLAUDE.md

## Qué es este proyecto

Plataforma web mobile-first de gestión de gimnasios (single-tenant): membresías, control de acceso por QR, video-instrucciones de máquinas por QR, y aforo en tiempo real. Ver `/docs/PRD.md` para el detalle funcional completo — no lo dupliques aquí, consúltalo.

Documentos de referencia (léelos antes de implementar features nuevas):
- `/docs/PRD.md` — alcance, user stories, reglas de negocio
- `/docs/data model.md` — entidades, relaciones, schema Prisma de referencia
- `/docs/design guide.md` — tokens de color, tipografía, componentes, voz de la UI

## Comandos críticos

```bash
npm run dev        # servidor de desarrollo
npm run build       # build de producción
npm test            # tests
npm run lint:fix    # lint + autofix
npx prisma studio   # explorar la base de datos localmente
npx prisma migrate dev  # aplicar migraciones en desarrollo
```

## Stack (decidido, no lo cambies sin confirmarlo)

- Frontend: React
- Backend: Node.js 20 LTS + Express
- Base de datos: PostgreSQL + Prisma como ORM
- Pagos: Recurrente
- Video: YouTube privado (embebido, no alojamos video propio)
- Autenticación: sesión propia + Google Sign-In

## Arquitectura

- La verificación de estado de membresía ocurre **siempre en el backend**. Nunca confíes en el estado que muestra el frontend para decidir si se concede acceso.
- `AccessLog` es la fuente única de verdad para el aforo en tiempo real — no mantengas un contador separado que se pueda desincronizar.
- Los webhooks de Recurrente actualizan el estado de pago de forma asíncrona; el flujo de UI no debe asumir que el pago se confirma de inmediato.
- Sin conexión al momento de un escaneo → se deniega el acceso por defecto. Nunca se otorga acceso sin validación confirmada del backend.

## Estándares de código

- TypeScript en todo el backend.
- Nombres de archivo en `kebab-case`, componentes de React en `PascalCase` (un componente por archivo, mismo nombre que el export).
- Toda llamada async va con `try/catch`; los errores no se tragan silenciosamente.
- Los mensajes de error hacia el usuario siguen la voz definida en `/docs/design guide.md` (sección 7) — nunca mostrar errores técnicos crudos como "Error 500" al usuario final.
- Los estados de membresía/acceso se comunican con texto además de color (regla de accesibilidad del design guide).

## Workflow

- Antes de implementar una feature nueva, confirma que está en el alcance de `PRD.md` sección 3. Si no está, pregunta antes de construir.
- Commits con prefijo: `feat:`, `fix:`, `docs:`, `refactor:`.
- Explica brevemente los cambios hechos, no solo el código — este proyecto es parte de una entrega académica y Sofia necesita poder explicarlo.
- Si una decisión técnica no está cubierta por los documentos en `/docs`, dilo explícitamente en vez de asumir — se documenta como nueva decisión, no se resuelve en silencio.

## Fuera de alcance (v1.0)

No implementar salvo que se pida explícitamente: reporte de máquinas dañadas, analítica de progreso de usuario, notificaciones push, soporte multi-gimnasio, roles adicionales a `admin`/`member`.
