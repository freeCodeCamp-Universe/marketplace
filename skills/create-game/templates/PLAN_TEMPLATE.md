# <game-name>

> Based on: <known-game>

## Game Design

**Rules:** ...

**Players:** ...

**Modes / variants:** ...

**Win / draw conditions:** ...

**Special rules / one-off mechanics:**

- ...

**UI flow:** _(screen-to-screen path; note sub-states for complex play screens)_

1. ...

**Edge cases:**

- ...

---

## Data Model

**Board / grid:** ...

**Piece / token types:** ...

**Game state shape:** ...

**State flags:** ...

**Turn structure:** ...

**Move validation approach:** ...

**Invalid move handling:** ...

---

## AI / Computer Player

_(Include only if the game has a computer player. Computer should be quite good but beatable.)_

**Strategy approach:** ...

**Difficulty levels:** ...

**Performance constraints:** ...

---

## Help & Strategy Guide

**Objective:** ...

**Rules summary:** ...

**Key strategies:**

- ...

**Common mistakes:**

- ...

**Tips for beginners:**

- ...

---

## Screens & Storage

**Home screen options:**
_(list selectors shown — opponent, side, mode, difficulty, etc.; note which are conditional)_

- ...

**Status text (play screen):**
_(list all status strings and when each appears)_

- ...

**Game over result / note:**
_(result strings per outcome; note strings)_

- ...

**Local storage keys:**

- `<game-name>_opts` — `GameOptions`; loaded on home screen
- `<game-name>_state` — full `GameState`; saved after every move; cleared on game over or quit; Resume shown only when this exists and `phase === 'playing'`
- _(add win/record keys as applicable)_

---

## Game Logic

- [ ] ...

---

## Components

Pre-built — do not reimplement:
`Header`, `Modal`, `ConfirmModal`, `GameOverModal`, `SegmentedControl`, `StatsRow`, `useTheme`, `useStorage`

Modify:

- [ ] `App.tsx` — replace `<game-name>` (×2), define `GameState`, fill in `startGame`
- [ ] `HomeOptions.tsx` — title, subtitle, `GameOptions` type, `DEFAULT_OPTIONS`, wins; adjust opponent/mode selects
- [ ] `HelpModal.tsx` — replace placeholder with game rules
- [ ] `GameScreen.tsx` — wire `useGame`, pass to `GameBoard`, update header status text, fill in `GameOverModal` props

Build:

- [ ] `useGame.ts` — game state shape, all logic, return state and actions
- [ ] `GameBoard.tsx` — board UI, props from `useGame`
- [ ] ...

---

## Styling

_(Board, pieces, and game-specific UI only — boilerplate handles colors, spacing, transitions, card layout, and game over overlay)_

- [ ] ...
