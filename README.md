# Pulse

A **mobile-friendly, offline-first Progressive Web App (PWA)** that lets you create structured exercise plans and follow them with guided demonstrations, automatic timers, and audio cues. Supports multiple workout types: HIIT, strength, and yoga.

## Features

- 📋 **Plan Management** — Create, edit, reorder, duplicate, and delete exercise plans
- 🎬 **Media Demonstrations** — Attach a photo or video to each exercise stage (stored locally, offline)
- ⏱️ **Automatic Timers** — Countdown timers run per stage with rest periods between them
- 🔔 **Audio Cues** — Bell/chime sounds for stage changes, rest periods, and session completion
- 📊 **Session History** — Log completed sessions and review past workouts
- 📴 **Offline-First** — All data stored locally in IndexedDB; no network required
- 🧩 **Data Sharing** — Import/export plans as portable files

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Language | TypeScript |
| Storage | IndexedDB (Dexie) |
| State | Zustand (UI state) |
| Styling | Tailwind CSS |
| PWA | vite-plugin-pwa |
| Audio | Web Audio API |

## Architecture

The app follows a clean layered architecture:

```
Pages  →  Containers  →  Components
              ↓
           Services
              ↓
         Repositories  →  IndexedDB
```

- **Components** — pure presentation (props in, callbacks out)
- **Containers** — fetch data and orchestrate components
- **Services** — business logic, data transformation
- **Repositories** — data access, extend a `BaseRepository`

See `docs/` for full specifications:
- [`docs/PRD.md`](docs/PRD.md) — Product requirements
- [`docs/Architecture.md`](docs/Architecture.md) — Technical architecture
- [`docs/UI_UX.md`](docs/UI_UX.md) — UI/UX specification

## Project Structure

```
src/
├── app/            # App entry, router
├── pages/          # Route-level page compositions
├── containers/     # Data orchestration layer
├── components/     # Pure presentation components
├── services/       # Business logic layer
├── repositories/   # Data access layer
├── models/         # TypeScript types
├── hooks/          # Shared custom hooks
├── stores/         # Zustand stores
└── lib/            # Database & audio config
public/
├── audio/          # Generated sound effect assets
├── favicon.svg     # Browser tab icon
└── *.svg           # PWA icons (192x192, 512x512)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or your preferred package manager)
- Access to a configured package registry (see note below)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build for production

```bash
pnpm build
pnpm preview
```

### Run tests

```bash
pnpm test        # Unit tests (Vitest)
pnpm test:e2e    # E2E tests (Playwright)
```

> **Note on network access:** The package registry (npm) must be reachable to install dependencies. If `pnpm install` fails, verify your registry mirror / VPN configuration for [npmjs.org](https://registry.npmjs.org).

## PWA & Offline

The app is installable as a PWA (add-to-home-screen on mobile). The Service Worker caches the app shell and audio assets for instant offline load. All user data persists locally and works without any network connection.

## License

Private project — © 2026
