# Gomendra Birta Model English School — Immersive 3D Website

A cutting-edge, spatial web experience built with React Three Fiber, MUI, and GSAP.

## Features

- **Immersive 3D Hero** — Interactive school emblem with floating particles and hotspots
- **Spatial Navigation** — Camera flies between sections when clicking nav links
- **3D Program Cards** — Hover-to-glow cards with click-to-expand dialogs
- **3D Stats Counters** — Animated floating numbers with intersection observer
- **3D Testimonials Carousel** — Auto-rotating spatial testimonial cards
- **3D Contact Zone** — Interactive desk with clickable contact icons
- **Performance Toggle** — Switch between High Quality and Performance mode
- **Responsive Mobile Menu** — Exact match to the provided design screenshot
- **Loading Manager** — MUI LinearProgress with smooth fade transitions
- **Post-Processing** — Bloom and FXAA for polished visual effects

## Tech Stack

- React 18 + Vite
- React Three Fiber + Drei + Postprocessing
- MUI v5 (Material UI)
- GSAP (camera animations)
- Framer Motion (UI animations)
- Zustand (state management)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  components/
    LoadingScreen.jsx      — Loading overlay with progress bar
    Header.jsx             — MUI AppBar with performance toggle
    MobileMenu.jsx         — Full-screen slide menu (matches image)
    Scene3D.jsx            — Main R3F Canvas
    SchoolEmblem3D.jsx     — 3D logo representation
    Programs3D.jsx         — 3D program cards
    Stats3D.jsx            — 3D animated counters
    Testimonials3D.jsx     — 3D carousel
    ContactZone3D.jsx      — 3D contact desk
    ContentSections.jsx    — 2D overlay content
    Footer.jsx             — Site footer
    CameraController.jsx   — GSAP camera animations
    Particles.jsx          — Floating particle system
  store.js                 — Zustand global state
  theme.js                 — MUI theme (green/white)
  App.jsx                  — Root component
```

## School Information

- **Name:** Gomendra Birta Model English School
- **Phone:** +977 9842624058
- **Email:** gbmsmartschool@gmail.com
- **Address:** Birtamode - 4, Jhapa, Nepal
- **Website:** gbm.edu.np

## License

All Rights Reserved © 2026 Gomendra Birtamodel English School
