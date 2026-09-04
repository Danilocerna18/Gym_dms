# design guide.md

## 1. Dirección de diseño

**Tesis:** esta no es una app que se navega tranquilamente en un sofá — se usa de pie, sudando, con un vistazo rápido antes de tocar una máquina o cruzar un torniquete. El diseño tiene que funcionar como señalética de gimnasio digitalizada: legible a distancia, táctil, sin decoración que estorbe.

**Concepto: "Hierro y tiza" (Iron & Chalk).** La paleta y las formas toman referencia del propio gimnasio — el gris industrial del hierro fundido de las máquinas y el blanco mate de la tiza que se usa para el agarre — con un solo color de señal que marca esfuerzo/estado, igual que una pulsera de ritmo cardíaco. Se evita deliberadamente tanto el look "crema + terracota" como el "negro + neón ácido" que son el default genérico de apps generadas por IA — ninguno de los dos comunica gimnasio, comunican "landing page de SaaS".

## 2. Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `iron-950` | `#16181C` | Fondo de pantallas de escaneo/acceso (alto contraste, legible bajo luz de gimnasio) |
| `iron-700` | `#3A3F47` | Texto secundario, iconografía inactiva |
| `chalk-50` | `#F3F1EC` | Fondo base de la app (member/admin), tarjetas |
| `chalk-200` | `#E4E1D8` | Bordes, separadores |
| `signal-red` | `#E13438` | Color de acento único: CTA principales, estado "denegado", elemento distintivo del aforo |
| `steel-500` | `#3E6E8E` | Datos y elementos del panel de administrador (gráficas, tablas) — nunca se mezcla con `signal-red` en la misma pantalla |
| `track-green` | `#2F9E52` | Uso exclusivamente funcional: "membresía activa", "acceso concedido" — nunca decorativo |

Regla de uso: `signal-red` es el único color con permiso de ser "llamativo". `steel-500` y `track-green` son informativos, no decorativos — aparecen solo cuando comunican un estado real (dato administrativo o resultado de acceso).

## 3. Tipografía

- **Display** — *Oswald* (condensada, bold): para números grandes (aforo en tiempo real, contador de días de membresía) y títulos de pantalla. Su carácter angosto y de asta alta evoca señalética deportiva/de gimnasio sin caer en cliché "deportivo" con itálicas agresivas.
- **Body** — *Inter*: para todo el contenido funcional (listas de clientes, descripciones, formularios). Prioriza legibilidad en pantallas pequeñas sobre personalidad.
- **Utility/Mono** — *IBM Plex Mono*: exclusivamente para datos técnicos — timestamps de `AccessLog`, IDs de pago, códigos de referencia de Recurrente. Comunica visualmente "esto es un dato del sistema", distinto del contenido editorial.

Escala tipográfica (base 16px, mobile-first):
`display-xl` 40px/44px (contador de aforo) · `display-lg` 28px/32px (títulos de pantalla) · `body-md` 16px/24px (contenido) · `body-sm` 14px/20px (metadatos) · `mono-sm` 13px/18px (timestamps/IDs)

## 4. Layout y estructura

Mobile-first, navegación inferior fija de 4 pestañas (Inicio, Miembros, Videos, Perfil) según el PRD. Wireframes de referencia:

**Inicio (miembro) — el "pulso" del gimnasio**
```
┌─────────────────────────┐
│  Hola, Ana               │
│                          │
│     ╭─────────╮         │
│     │  62%    │  ← anillo de aforo (signature)
│     │ ocupado │         │
│     ╰─────────╯         │
│                          │
│  Tu membresía: Activa    │
│  Vence en 12 días        │
│                          │
│  [ Ver mi QR ]           │
├─────────────────────────┤
│ 🏠   👥   🎥   👤        │
└─────────────────────────┘
```

**Pantalla de escaneo de acceso (fondo `iron-950`, legible bajo luz dura)**
```
┌─────────────────────────┐
│                          │
│     [ visor cámara ]     │
│                          │
│   Escanea tu QR o el     │
│   de una máquina         │
│                          │
└─────────────────────────┘
```
Resultado como modal rápido, no pantalla nueva — evita romper el flujo de alguien parado frente a la máquina:
```
┌─────────────────────────┐
│   ✓  Acceso concedido    │   (track-green, 1.5s, auto-dismiss)
└─────────────────────────┘
```

**Panel administrativo (desktop-friendly pero derivado del mismo sistema)**
```
┌───────────────────────────────────────┐
│ Aforo actual: 34/55   Ingresos: Q12,400│
│                                        │
│ [ Miembros ]  [ Videos ]  [ Máquinas ] │
│                                        │
│  tabla de clientes (steel-500 para     │
│  datos, chalk-50 de fondo)             │
└───────────────────────────────────────┘
```

## 5. Elemento distintivo (signature)

**El anillo de aforo.** Un anillo circular en la pantalla de Inicio que se llena según el % de ocupación actual del gimnasio (dato real de `AccessLog`), con `signal-red` cuando está cerca del límite y `track-green` cuando hay espacio cómodo. Es el mismo componente visual que ve el administrador en su dashboard, solo que a mayor escala — esto crea coherencia entre las dos experiencias (miembro/admin) sin duplicar el sistema de diseño, y convierte un dato operativo (aforo) en el elemento más memorable de la app, que es exactamente lo que este producto vende: visibilidad en tiempo real.

## 6. Componentes y patrones de UI

- **Botón primario:** fondo `signal-red`, texto `chalk-50`, esquinas redondeadas 12px (no 0 — esta es una app táctil, no un editorial). Área táctil mínima 48x48px por ser de uso en piso de gimnasio, no en escritorio.
- **Estado de membresía:** siempre como etiqueta de texto + color funcional (`track-green` = activa, `iron-700` = vencida), nunca solo color — por accesibilidad para daltonismo.
- **Modal de resultado de escaneo:** auto-dismiss a los 2-3 segundos, con opción de cerrar manual. Nunca bloquea con un botón obligatorio "Aceptar" — la persona ya está en movimiento.
- **Tarjeta de video instructivo:** thumbnail + nombre de la máquina + duración. Al tocar, reproduce embebido, no redirige fuera de la app.

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
- El anillo de aforo se anima suavemente al actualizar (300ms ease-out) para que el cambio se perciba sin ser una animación llamativa.
- El modal de resultado de escaneo entra con un fade + slide-up corto (200ms) — comunica "esto acaba de pasar", nada más.
- Se respeta `prefers-reduced-motion`: en ese caso, el anillo y los modales cambian de estado sin transición.

## 9. Accesibilidad y restricciones técnicas

- Contraste mínimo AA en todos los textos sobre `iron-950` y `chalk-50`.
- Todos los estados de acceso/membresía se comunican con texto, no solo color.
- Diseño responsive mobile-first; el panel de administrador puede asumir viewport más ancho pero reutiliza los mismos tokens.
- Foco de teclado visible en todos los controles interactivos del panel administrativo (uso probable con mouse/teclado en oficina).

## 10. Aplicación por rol

- **Miembro:** experiencia dominada por `iron-950` en momentos de acción (escaneo) y `chalk-50` en momentos de consulta (perfil, videos) — el contraste de fondo ayuda a distinguir "estoy a punto de actuar" de "estoy consultando información".
- **Administrador:** misma paleta, pero con más presencia de `steel-500` para datos y gráficas — comunica que este rol trabaja con información, no con acceso físico.
