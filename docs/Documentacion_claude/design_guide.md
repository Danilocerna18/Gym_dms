# design guide.md

## 1. Dirección de diseño

**Tesis:** GymSync se usa de pie, con un vistazo rápido antes de tocar una máquina o cruzar un torniquete. El diseño toma el lenguaje de un club deportivo clásico: papel crema, azul marino profundo y un verde de cancha, con números en bloque que se leen a distancia. Legible, táctil y sin decoración que estorbe.

**Concepto: "Club deportivo" (Crema y marino).** La paleta evoca el uniforme y la señalética de un club de toda la vida: fondo crema mate, tinta azul marino y un solo verde funcional. La personalidad viene de la tipografía: letras en bloque (Graduate) para el wordmark, títulos y números, contra una sans geométrica (Montserrat) para todo lo funcional. Se evita el "negro + neón" y el rojo de alerta como acento decorativo; el rojo queda reservado para errores y accesos denegados.

**Nombre de la plataforma:** GymSync (sin cambios). El wordmark se compone en Graduate, en mayúsculas (ver §3).

## 2. Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `cream` | `#F1EBD6` | Fondo base de la app (miembro/admin) y tarjetas |
| `cream-dark` | `#DDD5BF` | Bordes, separadores, fondos de campos |
| `ink` | `#1B345C` | Texto principal; fondo de pantallas de escaneo/acceso |
| `accent` | `#1B345C` | Acento único: botón primario, navegación activa, enlaces |
| `ink-soft` | `#4A5878` | Texto secundario, iconografía inactiva, metadatos |
| `track-green` | `#075D36` | Solo funcional: "membresía activa", "acceso concedido" |
| `alert-red` | `#B3261E` | Solo error y "acceso denegado" |

Valores tomados de la referencia: Club Navy `#1B345C`, Heritage Green `#075D36`, Club Cream `#F1EBD6`. Los ratios de §9 están calculados con la fórmula WCAG 2.x.

Se elimina `steel-500` (azul de datos): `accent` y `ink` cubren el panel de administrador.

**Reglas de uso**
- `accent` solo en botones primarios y navegación activa. Nunca como decoración.
- Los datos del panel (gráficas, tablas) usan `ink` y `ink-soft`; `accent` no se mezcla con datos en la misma gráfica.
- `track-green` y `alert-red` son informativos: aparecen solo cuando comunican un estado real.
- `accent` e `ink` son el mismo valor (`#1B345C`, contraste 1:1). **Nunca poner `accent` sobre fondo `ink`.** En pantallas oscuras el botón primario es `cream` con texto `ink`.

## 3. Tipografía

- **Display** — *Graduate* (bloque, estilo universitario): títulos de pantalla y números grandes (aforo en tiempo real, días de membresía). Es una fuente de un solo peso; no se simula negrita.
  - **Wordmark:** el logotipo "GymSync" se compone en Graduate, en mayúsculas visuales (`text-transform: uppercase`; el texto fuente sigue siendo "GymSync"), `letter-spacing` 0.04em, `line-height` 1, un solo peso. Tamaño: 24px en headers (admin, miembro, escáneres) y 36px en pantallas de acceso (login y registro).
- **Body** — *Montserrat* (sans geométrica): todo el contenido funcional (listas, descripciones, formularios, botones).
- **Utility/Mono** — *IBM Plex Mono*: exclusivamente datos técnicos: timestamps de `AccessLog`, IDs de pago, códigos de referencia de Recurrente.

Carga (Google Fonts): `Graduate`, `Montserrat:wght@400;500;600;700`, `IBM+Plex+Mono:wght@400;500`, con `display=swap`.

Escala tipográfica (base 16px, mobile-first):

| Nivel | Tamaño / interlineado | Fuente | Uso |
|---|---|---|---|
| `display-xl` | 40px / 44px | Graduate | Contador de aforo |
| `display-lg` | 28px / 32px | Graduate | Títulos de pantalla |
| `body-md` | 16px / 24px | Montserrat | Contenido |
| `body-sm` | 14px / 20px | Montserrat | Metadatos |
| `mono-sm` | 13px / 18px | IBM Plex Mono | Timestamps / IDs |

Los títulos en Graduate van en mayúsculas con `letter-spacing` de 0.02em a 0.04em.

## 4. Layout y estructura

Mobile-first, navegación inferior fija. La navegación del miembro tiene 4 pestañas (Inicio, Miembros, Videos, Perfil) según el PRD. Wireframes de referencia:

**Inicio (miembro): el "pulso" del gimnasio**
```
┌─────────────────────────┐
│  GYMSYNC                 │
│  HOLA, ANA               │
│                          │
│     ╭─────────╮         │
│     │  62%    │  ← anillo de aforo (signature)
│     │ OCUPADO │         │
│     ╰─────────╯         │
│                          │
│  Tu membresía: Activa    │
│  Vence en 12 días        │
│                          │
│  [ Ver mi QR ]  (accent) │
├─────────────────────────┤
│ Inicio Miembros Videos Perfil │
└─────────────────────────┘
```
Fondo `cream`, texto `ink`.

**Pantalla de escaneo de acceso (fondo `ink`, legible bajo luz dura)**
```
┌─────────────────────────┐
│                          │
│     [ visor cámara ]     │
│                          │
│   Escanea tu QR o el     │
│   de una máquina         │
│                          │
│  [ Ingreso manual ]      │  (cream sobre ink)
└─────────────────────────┘
```
Resultado como modal rápido, no pantalla nueva, para no romper el flujo de alguien parado frente a la máquina:
```
┌─────────────────────────┐
│   ✓  ACCESO CONCEDIDO    │   (track-green, 1.5s, auto-dismiss)
└─────────────────────────┘
```

**Panel administrativo (desktop-friendly, derivado del mismo sistema)**
```
┌───────────────────────────────────────┐
│ Aforo actual: 34/55   Por vencer: 6    │
│                                        │
│ [ Miembros ]  [ Videos ]  [ Máquinas ] │
│                                        │
│  tabla de clientes (ink / ink-soft     │
│  para datos, cream de fondo)           │
└───────────────────────────────────────┘
```

## 5. Elemento distintivo (signature)

**El anillo de aforo.** Anillo circular en Inicio que se llena según el % de ocupación actual del gimnasio (dato real de `AccessLog`). Color del trazo: `track-green` con espacio cómodo, `alert-red` cerca del límite; el pista (fondo del anillo) usa `cream-dark`. El número central va en Graduate (`display-xl`) y siempre acompañado de texto ("OCUPADO"). Es el mismo componente que ve el administrador, a mayor escala, lo que da coherencia entre las dos experiencias sin duplicar el sistema de diseño. Es el elemento más memorable porque es lo que el producto vende: visibilidad en tiempo real.

## 6. Componentes y patrones de UI

- **Botón primario:** fondo `accent`, texto `cream`, esquinas redondeadas 12px, texto en Montserrat 600. Área táctil mínima 48x48px. En pantallas sobre fondo `ink`: fondo `cream`, texto `ink`.
- **Botón secundario:** borde `cream-dark` (1px), fondo transparente, texto `ink`.
- **Estado de membresía:** siempre etiqueta de texto + color funcional (`track-green` = activa, `ink-soft` = vencida), nunca solo color.
- **Modal de resultado de escaneo:** auto-dismiss a los 2-3 segundos, con opción de cerrar manual. Nunca bloquea con un botón obligatorio "Aceptar".
- **Tarjeta de video instructivo:** thumbnail + nombre de la máquina + duración. Al tocar, reproduce embebido (YouTube), no redirige fuera de la app.
- **Campos de formulario:** fondo `cream`, borde `cream-dark`; en foco, borde `accent` de 2px.
- **Wordmark:** `accent` sobre fondo `cream`; `cream` sobre fondo `ink` (escáneres, tarjetas oscuras). Nunca `accent` sobre `ink`. Va solo, sin ícono que lo acompañe. Tamaño mínimo 16px.

## 7. Voz de la interfaz (copy)

Tono: directo, como una instrucción de entrenador, no como una app de oficina. Sin disculpas innecesarias, sin tecnicismos del sistema.

| Situación | Copy recomendado | Evitar |
|---|---|---|
| Acceso concedido | "Acceso concedido" | "¡Bienvenido de nuevo, campeón!" |
| Acceso denegado por vencimiento | "Tu membresía venció. Renuévala para entrar." | "Error: membership_status = expired" |
| QR duplicado detectado | "Este código ya registró entrada. Contacta a recepción." | "QR inválido" |
| Sin conexión | "Sin conexión. Intenta de nuevo." | "Error de red 500" |
| Estado vacío (sin videos aún) | "Aún no hay videos para esta máquina." | "No data available" |
| Botón de pago | "Pagar membresía" | "Procesar transacción" |

## 8. Motion

Uso mínimo y funcional, no decorativo:
- El anillo de aforo se anima al actualizar (300ms ease-out).
- El modal de resultado de escaneo entra con fade + slide-up corto (200ms).
- Se respeta `prefers-reduced-motion`: el anillo y los modales cambian de estado sin transición.

## 9. Accesibilidad y restricciones técnicas

Contraste calculado con la fórmula WCAG 2.x (mínimo AA: 4.5:1 en texto normal, 3:1 en texto grande y componentes de UI).

| Combinación (texto / fondo) | Ratio | Uso permitido |
|---|---|---|
| `ink` / `cream` | 10.40:1 | Texto principal |
| `cream` / `ink` | 10.40:1 | Texto en pantallas de escaneo |
| `cream` / `accent` | 10.40:1 | Botón primario |
| `ink` / `cream-dark` | 8.48:1 | Texto sobre bordes/campos |
| `cream-dark` / `ink` | 8.48:1 | Texto secundario en pantallas de escaneo |
| `ink-soft` / `cream` | 5.95:1 | Texto secundario |
| `ink-soft` / `cream-dark` | 4.85:1 | Texto secundario sobre campos (cumple AA con poco margen) |
| `track-green` / `cream` | 6.69:1 | Estado activo / concedido (texto) |
| `cream` / `track-green` | 6.69:1 | Texto sobre modal verde |
| `alert-red` / `cream` | 5.48:1 | Error / denegado (texto) |
| `cream` / `alert-red` | 5.48:1 | Texto sobre modal rojo |
| `accent` / `ink` | **1.00:1** | **Prohibido** |

Reglas:
- Todos los estados de acceso/membresía se comunican con texto, no solo color.
- Diseño responsive mobile-first; el panel de administrador puede asumir viewport más ancho pero reutiliza los mismos tokens.
- Foco de teclado visible en todos los controles interactivos (contorno `accent` de 2px con offset de 2px; sobre `ink`, contorno `cream`).
- Graduate no debe usarse por debajo de 16px; el texto pequeño va siempre en Montserrat o IBM Plex Mono.

## 10. Aplicación por rol

- **Miembro:** `ink` en momentos de acción (escaneo) y `cream` en momentos de consulta (perfil, videos). El cambio de fondo distingue "estoy a punto de actuar" de "estoy consultando información".
- **Administrador:** misma paleta; datos y tablas en `ink` / `ink-soft` sobre `cream`. El escáner del administrador mantiene fondo `ink`.

## 11. Tokens para implementación (referencia)

Nombres semánticos para el `@theme` de Tailwind v4 (`Frontend/src/styles.css`):

```css
@theme {
  --color-cream: #F1EBD6;
  --color-cream-dark: #DDD5BF;
  --color-ink: #1B345C;
  --color-accent: #1B345C;
  --color-ink-soft: #4A5878;
  --color-track-green: #075D36;
  --color-alert-red: #B3261E;

  --font-display: "Graduate", serif;
  --font-body: "Montserrat", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

La migración de los tokens anteriores (`iron-*`, `chalk-*`, `signal-red`, `steel-500`) en el código se hace en un commit aparte y coordinado con el equipo.
