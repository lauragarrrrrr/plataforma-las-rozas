# Identidad visual y de textos · Las Rozas 2040

La plataforma copia la identidad de la web de metodología ([`docs/metodologia.html`](metodologia.html)). Las dos ramas, `Lau` y `Marina`, siguen estas mismas reglas.

> ⚠️ **Los colores y las tipografías viven en un solo sitio: [`src/styles/tokens.css`](../src/styles/tokens.css).**
> No inventéis colores ni fuentes nuevas. Si hace falta algo, se habla entre las dos y se añade ahí.
> Las piezas comunes (tarjetas, botones, etiquetas…) están en [`src/styles/base.css`](../src/styles/base.css).

---

## Colores

| Variable | Color | Uso |
|---|---|---|
| `--c-green-dark` | `#307373` | **Texto principal**, sobre blanco |
| `--c-ink` | `#000` | Titulares |
| `--c-white` | `#fff` | Fondo general |
| `--c-innova` | `#00b5a8` | **Acento:** botones y estados activos |
| `--c-innova-dark` | `#17929e` | Banda de logos, etiquetas pequeñas, enlaces |
| `--c-blue` | `#0a4780` | Final del degradado del «2040» |
| `--c-green-light` | `#dff9f4` | Fondo de bloques claros |
| `--c-green-mid` | `#8ce2d6` | Detalles y bordes |
| `--c-green-deep` | `#1d5e5f` | Final del degradado oscuro |
| `--c-gris-10` | `#e6e6e6` | Líneas finas |
| `--c-paper` / `--c-paper-line` | `#fffefa` / `#cfd8d4` | Papel y líneas del periódico |
| `--c-rubi` | `#d81e5b` | **Solo alertas y avisos** |

**Degradados:** `--gradient-dark` para bloques oscuros con texto blanco, `--gradient-verde` para detalles y `--gradient-anio` para el «2040» de la portada.

## Tipografía

- **Poppins** (300-700, desde Google Fonts) para todo.
- **Georgia** (`--font-paper`) **solo** para lo que imita el periódico: titulares de *Las Rozas Times 2040*, la portada y los expedientes.
- **Etiquetas pequeñas («kickers»):** MAYÚSCULAS, 0.75rem y letra muy espaciada. Clase `.kicker`.

## Formas

- Tarjetas con esquinas de `--radius-card` (1.75rem), **sin sombras duras**.
- Fondos de bloque: `--c-green-light`, o `--gradient-dark` con texto blanco.
- Botones y etiquetas en forma de píldora, totalmente redondeados.

## Logos y pie

- En `public/logos/`, en blanco para ir sobre fondos oscuros: `las-rozas-innova.png`, `ayuntamiento-las-rozas.png` y `avantis.png`.
- Todas las páginas llevan el pie **«Powered by Avantis»** (componente `SiteFooter.vue`).

## Textos

- **Español de España**, frases cortas y tono cercano. A los equipos se les habla de **«vosotros»**.
- Comillas latinas **« »** y apóstrofo tipográfico **’** en los textos que se leen. Comillas rectas solo en el código.
- Vocabulario del proyecto: **«equipo facilitador»**, **«post-its»**, **«futuros»** en plural y **«Las Rozas Times 2040»**.
- **Nada de política ni de personas reales** en ejemplos ni en datos de prueba. Hay elecciones municipales el 29/11/2026.

## Tamaños que tienen que verse bien

| Dispositivo | Tamaño |
|---|---|
| Móvil, para subir fotos y votar | 390 px de ancho, sin scroll horizontal |
| Ordenador del equipo | 1280 px |
| Pantalla de sala | 1920 × 1080, legible desde el fondo |
