# Chronos

A premium B2B time-tracking web app — a calm, "warm light glassmorphism" interface
for logging time, tracking projects, and managing a team. Built as a React SPA and
packaged with Electron for desktop distribution.

> **Status:** front-end prototype. All data is mock data (`src/data/mockData.js`);
> there is no backend yet. See `../ARCHITECTURE.md` for exactly what's built.

## Tech stack

- React 18 + Vite 5 + React Router v6
- Tailwind CSS 3 with CSS custom-property design tokens
- `lucide-react` icons
- Electron desktop wrapper

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (web)
npm run build    # production build
npm run lint     # ESLint
npm run electron:dev   # run the Electron desktop shell
```

Requires Node 20.x.

## Project structure

```
src/
  App.jsx              route definitions
  components/
    layout/            AppShell, Sidebar, Topbar, CommandPalette
    ui/                reusable primitives (frozen design — see DESIGN.md)
    team/  invoices/   domain components
  pages/               Dashboard, MyTime, Tasks, Team, Projects, Reports, Invoices, Settings
  data/mockData.js     all sample data
  index.css            design tokens + glass utilities
electron/main.cjs      Electron entry point
```

## Documentation

Project docs live in the parent workspace folder:

- `../CLAUDE.md` — working rules and conventions
- `../ARCHITECTURE.md` — verified current state of the code
- `../DESIGN.md` — design system and tokens
- `../PRODUCT.md` — product vision
