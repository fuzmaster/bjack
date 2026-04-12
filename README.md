# bjack

A modern single-page Blackjack game built with React, Vite, Tailwind CSS, and Framer Motion.

## Features

- Reducer-driven blackjack game flow
- Dealer draw stepper with cancel-safe state transitions
- Deterministic card IDs (stable React keys)
- Chunky neo-brutalist UI with dark atmospheric styling
- Responsive layout with sticky mobile action controls
- Sound effects for card/action feedback
- Accessibility-friendly status announcements (`aria-live`)

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Lucide React
- ESLint 9

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

### 5. Lint

```bash
npm run lint
```

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
```

## Game Flow

- `Deal` starts a new round with a freshly shuffled deck
- Player can `Hit` or `Stand`
- Dealer reveals and draws to 17+
- Round resolves into win/loss/push
- `Next` starts another round
- `Reset` returns to clean initial state

## Audio Assets

Expected files in `public/sfx/`:

- `card-deal.ogg`
- `card-flip.ogg`
- `chip-click.ogg`
- `win.wav`
- `lose.wav`
- `ui-click.wav`

## Screenshot

Add a screenshot at `docs/screenshot.png` and reference it here:

```md
![bjack screenshot](docs/screenshot.png)
```

## Deployment

### Vercel

1. Import this repository in Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.

### Netlify

1. Create a new site from this repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.

### Static Hosting (manual)

```bash
npm run build
```

Upload the contents of `dist/` to any static host.

## License

Private project.
