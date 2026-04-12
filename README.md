# bjack

[![React](https://img.shields.io/badge/React-19-20232a?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)](https://tailwindcss.com/)
[![Lint](https://img.shields.io/badge/Lint-ESLint_9-4b32c3?logo=eslint)](https://eslint.org/)

A production-ready, single-page Blackjack game built with React + Vite, styled with a bold neo-brutalist interface and a dark atmospheric game backdrop.

This project focuses on three goals:

1. Clean gameplay architecture with predictable state transitions.
2. Strong visual identity without sacrificing readability.
3. Mobile-first interaction quality with desktop parity.

## Table of Contents

1. Overview
2. Highlights
3. Tech Stack
4. Quick Start
5. Available Scripts
6. Architecture
7. Gameplay Rules and Flow
8. Accessibility
9. Performance Notes
10. Why This Architecture
11. Audio System
12. Screenshot
13. Deployment
14. Project Structure
15. Roadmap
16. License

## Overview

`bjack` is a simplified Blackjack experience with clear game states (`ready`, `player-turn`, `dealer-turn`, `round-over`), a deterministic deck model, and reducer-driven state updates.

The UI keeps a chunky slab-button identity and high-contrast card readability while staying responsive across phone and desktop layouts.

## Highlights

- Reducer-based game state machine (predictable updates, easier debugging).
- Dealer turn handled as a step-driven state effect (no brittle long async loop in handlers).
- Deterministic card IDs for stable React keys.
- Shared responsive controls system (no wasteful duplicated hidden DOM trees).
- Accessibility-friendly status announcements using live regions.
- Lightweight atmospheric background effects tuned for readability/perf balance.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Lucide React
- ESLint 9

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev`: starts Vite dev server
- `npm run build`: creates production bundle in `dist/`
- `npm run preview`: previews the production bundle locally
- `npm run lint`: runs ESLint across the project

## Architecture

The project is separated by responsibility:

- `src/game/blackjack.js`
Pure Blackjack/domain functions:
- deck generation and shuffling
- hand evaluation
- round resolution
- constants for chip values and defaults

- `src/game/reducer.js`
Reducer and initial state for all game transitions.

- `src/hooks/useGameAudio.js`
SFX preload and playback wrapper with safer error handling.

- `src/components/*`
Presentational components for UI pieces (cards, controls, stats, panels).

- `src/App.jsx`
Orchestration layer that wires reducer state, effects, handlers, and layout.

## Gameplay Rules and Flow

### Round Start

- `Deal` creates a fresh shuffled deck.
- Two cards to player, two to dealer.
- Dealer second card remains hidden until reveal.

### Player Phase

- `Hit`: draws one card and immediately evaluates bust.
- `Stand`: transitions to dealer phase.

### Dealer Phase

- Dealer reveals hidden card.
- Dealer draws one card per timed step until total is at least 17.
- Round result resolves as win/loss/push.

### Round End

- Bankroll updates according to result delta.
- `Next` starts another round.
- `Reset` restores full initial state.

## Accessibility

- Live status announcements in the message slab via `role="status"` and `aria-live="polite"`.
- Meaningful control labels on key action and bet adjustment buttons.
- Large mobile touch targets (56px+ baseline) and sticky bottom action ergonomics.

## Performance Notes

- Background visuals intentionally simplified to reduce paint/compositing cost.
- Card IDs are deterministic to avoid unnecessary remounts caused by unstable keys.
- Dealer progression is state-driven and cancel-safe to avoid stale async updates.

## Why This Architecture

This structure is designed to keep game behavior predictable and UI changes safe:

- The reducer acts as a single source of truth for all game state transitions.
- Core blackjack math/rules are isolated in pure functions (`src/game/blackjack.js`), making them easier to test and reason about.
- UI components remain mostly presentational, so visual iterations do not accidentally rewrite game logic.
- Dealer progression is modeled as state + effect steps instead of a fragile long async loop.
- Audio concerns are isolated in a hook so playback behavior can evolve independently.

The result is a codebase that is easier to extend (animations, themes, accessibility, tests) without breaking core gameplay.

## Audio System

Audio files are expected in `public/sfx/`:

- `card-deal.ogg`
- `card-flip.ogg`
- `chip-click.ogg`
- `win.wav`
- `lose.wav`
- `ui-click.wav`

Audio playback failures are handled safely and logged for debugging without crashing gameplay.

## Screenshot

Place a screenshot at `docs/screenshot.png` and it will render here:

```md
![bjack gameplay screenshot](docs/screenshot.png)
```

Suggested capture:

- Desktop view showing dealer + player hands, current bet slab, and right-side controls.
- One mobile screenshot showing sticky action controls.

## Deployment

### Vercel

1. Import the repository in Vercel.
2. Select framework preset `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.

### Netlify

1. Create a new site from the repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.

### Static Host (manual)

```bash
npm run build
```

Upload the contents of `dist/` to your host.

## Project Structure

```text
src/
	App.jsx
	index.css
	main.jsx
	components/
		ActionPanel.jsx
		BetControls.jsx
		CardFace.jsx
		Chip.jsx
		HandZone.jsx
		StatBlock.jsx
		TopBar.jsx
		UIButton.jsx
	game/
		blackjack.js
		reducer.js
	hooks/
		useGameAudio.js
public/
	sfx/
		card-deal.ogg
		card-flip.ogg
		chip-click.ogg
		win.wav
		lose.wav
		ui-click.wav
```

## Roadmap

- Add test coverage for reducer and core game logic.
- Add keyboard-first interaction mode.
- Add optional difficulty/rules presets.
- Add visual settings toggle for reduced motion and high-contrast mode.

## License

Private project.
