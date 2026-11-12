# plataforma-las-rozas

Plataforma de apoyo al hackathon **Las Rozas 2040** (sábado 21/11/2026), de Las Rozas Innova con Avantis.

- 📋 **Brief del proyecto:** [CLAUDE.md](CLAUDE.md)
- 🎨 **Identidad visual y textos:** [docs/IDENTIDAD.md](docs/IDENTIDAD.md)
- 📖 **Metodología (fuente de verdad):** [docs/metodologia.html](docs/metodologia.html)
- 🌍 **Web publicada (`main`):** https://plataforma-las-rozas.vercel.app/

## Tecnología

Vue 3 + Vite + TypeScript. Vercel compila y publica `main` automáticamente (configurado en `vercel.json`).

## Ramas

| Rama | Uso |
|---|---|
| `main` | Producción: la web pública. Solo cambia mediante un pull request aprobado |
| `Lau` | Rama de trabajo de Laura |
| `Marina` | Rama de trabajo de Marina |

## Probarla en tu ordenador

Hace falta tener instalado [Node.js](https://nodejs.org/).

```bash
npm install
```

```bash
npm run dev
```

Abre la dirección que aparece (normalmente http://localhost:5173).

Para comprobar que compila igual que en Vercel:

```bash
npm run build
```

## Estructura

```
src/styles/tokens.css    ⚠️ Compartido · colores y tipografías
src/styles/base.css      ⚠️ Compartido · piezas comunes
src/components/          Cabecera y pie comunes
src/views/               Una vista por pantalla
public/logos/            Logos
docs/                    Identidad y metodología
```
