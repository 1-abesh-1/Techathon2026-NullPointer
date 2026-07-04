# Null Pointer — Frontend

A real-time IoT monitoring dashboard built with **React** and **Vite**. It visualizes device states (lights, fans) across multiple office rooms, displays live power consumption, and generates alerts based on usage patterns and office hours.

## Features

- **Office Layout Visualization** — SVG top-view of the office with devices rendered at their physical positions.
- **Live Power Meter** — Aggregates real-time wattage across all rooms, fetched from Firebase Realtime Database.
- **Device Panel** — Browse and filter devices by room and category (lights / fans).
- **Alerts Panel** — Shows warnings for devices left on past office hours or running continuously for too long.
- **Real-time Updates** — Polls Firebase every 2 seconds to keep the dashboard in sync.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Styling | CSS / plain CSS |
| Data Source | [Firebase Realtime Database](https://firebase.google.com/docs/database) (REST polling) |

## Project Structure

```
src/
├── App.jsx                  # Root component — state management & Firebase subscription
├── App.css                  # Global styles
├── main.jsx                 # Entry point
├── components/
│   ├── OfficeLayout.jsx     # SVG office floor plan with device markers
│   ├── PowerMeter.jsx       # Real-time power consumption display
│   ├── DevicePanel.jsx      # Room/device browser with toggle controls
│   └── AlertsPanel.jsx      # Warning list for anomalous device states
├── config/
│   └── deviceLayout.js      # Device positions, room layout, SVG viewBox mapping
├── services/
│   └── firebase.js          # Firebase REST polling (2 s interval)
└── utils/
    ├── alerts.js            # Alert computation logic (office hours, continuous-on detection)
    └── roomData.js          # Device iteration helpers & category definitions
```

## Prerequisites

- Node.js ≥ 18
- npm (or pnpm / yarn)

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure Firebase

The Firebase Realtime Database URL is hardcoded in `src/services/firebase.js`:

```js
const FIREBASE_URL = 'https://null-pointer-a3178-default-rtdb.firebaseio.com/.json';
```

Update this value if you deploy to a different Firebase project.

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

Output is written to `dist/`.

### 5. Preview the production build

```bash
npm run preview
```

### 6. Lint

```bash
npm run lint
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build the app for production |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run oxlint |

## Firebase Data Schema

The app expects the following JSON structure from the Firebase Realtime Database:

```json
{
  "rooms": {
    "Living Room": {
      "lights": {
        "Light 1": { "isSwitchedOn": true, "lastChanged": "2026-07-04 10:30:00", "watts": 15 },
        "Light 2": { "isSwitchedOn": false, "lastChanged": "2026-07-04 09:00:00", "watts": 15 }
      },
      "fans": {
        "Fan 1": { "isSwitchedOn": true, "lastChanged": "2026-07-04 11:00:00", "watts": 60 }
      }
    },
    "WorkRoom1": { /* same structure */ },
    "WorkRoom2": { /* same structure */ }
  }
}
```

Each device object contains:

| Field | Type | Description |
|-------|------|-------------|
| `isSwitchedOn` | boolean | Current power state |
| `lastChanged` | string | ISO-like timestamp of last state change |
| `watts` | number | Power consumption in watts |

## Architecture Notes

- **No WebSocket** — The app uses REST polling (every 2 seconds) against the Firebase Realtime Database REST endpoint rather than a real-time subscription, keeping the dependency footprint minimal.
- **SVG-based layout** — Device positions are defined in `config/deviceLayout.js` using absolute coordinates mapped to a `1000 × 550` SVG viewBox.
- **Office hours logic** — Alerts are computed client-side using a configurable office-hours window (09:00–17:00) and a continuous-on threshold (2 hours).
