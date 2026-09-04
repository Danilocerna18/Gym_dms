# data model.md

## 1. Resumen de Entidades

El modelo cubre 7 entidades. Es intencionalmente plano (single-tenant, sin tablas de aislamiento multi-gimnasio) para mantenerlo simple, pero cada entidad está diseñada para poder extenderse sin romper el esquema:

1. **User** — miembros y administradores (un solo modelo, diferenciado por rol).
2. **MembershipPlan** — catálogo de planes (mensual, anual).
3. **Membership** — la suscripción activa/histórica de un usuario a un plan.
4. **Payment** — cada cobro procesado vía Recurrente, ligado a una membresía.
5. **Machine** — equipo del gimnasio, cada uno con su QR.
6. **InstructionVideo** — video instructivo, asociado 1 a 1 (o 1 a muchos) con una máquina.
7. **AccessLog** — cada evento de escaneo de entrada/salida, fuente de verdad para el aforo en tiempo real.

## 2. Relaciones (descripción)

```
User (1) ───── (N) Membership ───── (N) Payment
                     │
                     └── (N) : (1) MembershipPlan

Machine (1) ───── (1..N) InstructionVideo

User (1) ───── (N) AccessLog
Machine (1) ───── (N) AccessLog   [solo para eventos tipo "machine_scan"]
```

- Un `User` puede tener múltiples `Membership` a lo largo del tiempo (histórico), pero solo una con estado `active` a la vez — regla de negocio validada en aplicación, no solo en base de datos.
- Un `Payment` siempre pertenece a una `Membership` (nunca a un `User` directamente), para mantener trazabilidad de qué pago corresponde a qué periodo.
- `AccessLog` es genérico: registra tanto escaneos de acceso (membresía) como escaneos de máquina, diferenciados por el campo `type`. Esto evita duplicar lógica de escaneo y es la tabla que alimenta el conteo de aforo en tiempo real (se calcula como `entries - exits` sobre los logs del día).

## 3. Definición de Entidades

### User
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| name | String | |
| email | String, único | |
| password_hash | String, nullable | null si el usuario solo usa Google Sign-In |
| google_id | String, nullable, único | |
| role | Enum: `admin`, `member` | el rol `admin` cubre también recepción |
| qr_code | String, único | token del QR de membresía digital, regenerable |
| created_at | Timestamp | |

### MembershipPlan
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| name | String | ej. "Mensual", "Anual" |
| duration_days | Integer | 30 o 365, evita hardcodear lógica de fechas |
| price | Decimal | |
| active | Boolean | permite desactivar un plan sin borrar histórico |

### Membership
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → User) | |
| plan_id | UUID (FK → MembershipPlan) | |
| status | Enum: `active`, `expired`, `cancelled` | |
| start_date | Date | |
| end_date | Date | calculada al crear/renovar según `duration_days` |
| notified_before_expiration | Boolean | evita reenviar el aviso de los 5 días |
| created_at | Timestamp | |

### Payment
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| membership_id | UUID (FK → Membership) | |
| amount | Decimal | |
| status | Enum: `pending`, `completed`, `failed` | |
| recurrente_payment_id | String | referencia externa del procesador |
| paid_at | Timestamp, nullable | |
| created_at | Timestamp | |

### Machine
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| name | String | ej. "Press de banca 1" |
| qr_code | String, único | token del QR físico de la máquina |
| created_at | Timestamp | |

### InstructionVideo
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| machine_id | UUID (FK → Machine) | |
| youtube_url | String | URL del video privado |
| title | String | |
| created_at | Timestamp | |

### AccessLog
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → User) | |
| type | Enum: `entry`, `exit`, `machine_scan` | |
| machine_id | UUID (FK → Machine), nullable | solo aplica si `type = machine_scan` |
| result | Enum: `granted`, `denied_expired`, `denied_duplicate`, `denied_offline` | soporta las reglas de negocio del PRD (bloqueo por vencimiento, QR duplicado, sin conexión) |
| created_at | Timestamp | |

## 4. Índices Recomendados

- `User.email`, `User.google_id`, `User.qr_code` → únicos, búsqueda O(1) en login y escaneo.
- `Membership.user_id` + `Membership.status` (índice compuesto) → consulta rápida de "¿tiene membresía activa?" en cada escaneo, que es la operación más frecuente del sistema.
- `AccessLog.created_at` + `AccessLog.type` (índice compuesto) → cálculo eficiente de aforo en tiempo real (filtrar eventos del día actual).
- `Machine.qr_code` → único, resolución inmediata al escanear.

## 5. Reglas de Integridad

- Un `Membership` con `status = active` no puede coexistir con otro `active` del mismo `user_id` (constraint a nivel aplicación + verificación antes de crear uno nuevo).
- `Payment.membership_id` es obligatorio — no se permiten pagos huérfanos.
- Al vencer `Membership.end_date`, un job programado (cron) cambia `status` a `expired` automáticamente; no depende de que el usuario intente entrar.
- `AccessLog` nunca se edita ni se borra — es un log de auditoría append-only, útil también para detectar el caso de QR duplicado (buscar el último `entry` sin `exit` correspondiente antes de conceder uno nuevo).

## 6. Consideraciones de Escalabilidad

Aunque el alcance actual es single-tenant, el modelo permite crecer sin rediseño mayor:

- Si más adelante se vuelve multi-gimnasio, basta con agregar un campo `gym_id` a `User`, `Machine` y `Membership`, y un índice compuesto con ese campo — no rompe las relaciones existentes.
- `AccessLog` ya está preparado para alimentar la futura "analítica de progreso del usuario" (hoja de ruta) sin necesitar una tabla nueva.
- `InstructionVideo` admite relación 1 a N con `Machine` desde el diseño (una máquina puede tener varios videos: uso básico, mantenimiento, etc.) sin cambios de esquema.
- El campo `result` en `AccessLog` ya deja espacio para el futuro "reporte de máquina dañada" (agregar valor `denied_broken_machine` sin migración estructural).

## 7. Esquema Prisma (referencia de implementación)

```prisma
enum Role {
  admin
  member
}

enum MembershipStatus {
  active
  expired
  cancelled
}

enum PaymentStatus {
  pending
  completed
  failed
}

enum AccessType {
  entry
  exit
  machine_scan
}

enum AccessResult {
  granted
  denied_expired
  denied_duplicate
  denied_offline
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String?
  googleId     String?  @unique
  role         Role
  qrCode       String   @unique
  createdAt    DateTime @default(now())

  memberships  Membership[]
  accessLogs   AccessLog[]
}

model MembershipPlan {
  id           String   @id @default(uuid())
  name         String
  durationDays Int
  price        Decimal
  active       Boolean  @default(true)

  memberships  Membership[]
}

model Membership {
  id                        String            @id @default(uuid())
  userId                    String
  planId                    String
  status                    MembershipStatus
  startDate                 DateTime
  endDate                   DateTime
  notifiedBeforeExpiration  Boolean           @default(false)
  createdAt                 DateTime          @default(now())

  user     User            @relation(fields: [userId], references: [id])
  plan     MembershipPlan  @relation(fields: [planId], references: [id])
  payments Payment[]

  @@index([userId, status])
}

model Payment {
  id                   String        @id @default(uuid())
  membershipId         String
  amount               Decimal
  status               PaymentStatus
  recurrentePaymentId  String
  paidAt               DateTime?
  createdAt            DateTime      @default(now())

  membership Membership @relation(fields: [membershipId], references: [id])
}

model Machine {
  id        String   @id @default(uuid())
  name      String
  qrCode    String   @unique
  createdAt DateTime @default(now())

  videos     InstructionVideo[]
  accessLogs AccessLog[]
}

model InstructionVideo {
  id         String   @id @default(uuid())
  machineId  String
  youtubeUrl String
  title      String
  createdAt  DateTime @default(now())

  machine Machine @relation(fields: [machineId], references: [id])
}

model AccessLog {
  id        String       @id @default(uuid())
  userId    String
  type      AccessType
  machineId String?
  result    AccessResult
  createdAt DateTime     @default(now())

  user    User     @relation(fields: [userId], references: [id])
  machine Machine? @relation(fields: [machineId], references: [id])

  @@index([createdAt, type])
}
```
