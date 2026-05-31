# KoinX – Tax-Loss Harvesting Tool

A front-end implementation of a **Tax-Loss Harvesting** dashboard built with **React 18** and **Vite**.  
Users can view their crypto holdings, select assets to harvest, and instantly see how the harvesting impacts their capital gains.

## Features

- **Pre & After Harvesting Cards** — side-by-side comparison of capital gains before and after selecting assets to harvest.
- **Interactive Holdings Table** — select/deselect individual assets or all at once; gains recalculate in real-time.
- **Dark Mode** — toggle between light and dark themes.
- **Responsive Design** — mobile-friendly layout with columns hidden on small screens.
- **Important Notes & Disclaimers** — collapsible accordion with regulatory disclaimers.

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| UI        | React 18 (JSX)          |
| Build     | Vite 5                  |
| Styling   | Vanilla CSS             |
| Icons     | Inline SVG              |
| Data      | Mock API (Promises)     |

## Folder Structure

```
koinx-final/
├── index.html              # HTML entry point
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx             # React DOM render
    ├── App.jsx              # All components & app logic
    ├── index.css            # Global styles (light + dark)
    ├── data/
    │   └── mockApi.js       # Simulated API responses
    └── public/
        └── koinx.webp       # KoinX logo
```

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 16
- **npm** ≥ 8

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173** (default Vite port).

### Production Build

```bash
npm run build
npm run preview
```
