---
name: coder
description: Implements the game code based on the approved plan. Called by create-game — or invoked directly.
---

# coder

## Purpose

Implement the game based on the approved plan, one section at a time.

## Invocation

Called by `create-game` as part of the pipeline.

---

## Inputs

- `<game-name>` — passed in via Task call
- `<known-game>` — passed in via Task call (may be same as game name)

Plan files are in: `<game-name>/context/`
Game code is in: `<game-name>/`

## Important

Use `<game-name>` for all variable names, file names, and code references — never `<known-game>`. The known game is only used for rules and game knowledge.

Only read files explicitly listed in the plan or mentioned in inputs. Do not explore the project structure or search for files.

Do not read boilerplate component or hook files (Header, Modal, ConfirmModal, GameOverModal, SegmentedControl, useTheme, useStorage, or their CSS) — their interfaces are documented above. Only read files you are actively modifying.

---

## Step 1 — Read the plan

Read `<game-name>/context/PLAN.md` fully before writing any code.

---

## Step 2 — Implement the next incomplete section

Identify the first section in `<game-name>/context/PLAN.md` with unchecked items and implement all of the items in that section. Before writing any CSS or UI, read `.claude/skills/create-game/UI.md` first.

The boilerplate includes pre-built components and hooks — use them, do not reimplement:

- `src/components/Header.tsx` — use on every screen with the correct `variant` prop (`"home"` or `"game"`) and required props
- `src/components/Modal.tsx` — base modal used by ConfirmModal, HelpModal, and GameOverModal
- `src/components/ConfirmModal.tsx` — use for all destructive action confirmations
- `src/components/HelpModal.tsx` — edit game rules content directly inside the file; does not take children
- `src/components/GameOverModal.tsx` — pre-wired in GameScreen; fill in result, resultType, note, and stats placeholder
- `src/components/SegmentedControl.tsx` — multi-option toggle; use in HomeOptions for opponent/mode selects
- `src/components/StatsRow.tsx` — label + value stat display
- `src/hooks/useTheme.ts` — use in `App` for theme state; pass `theme` and `onThemeToggle` down to screens
- `src/hooks/useStorage.ts` — use `createStorage('<game-name>_state')` for save/load/clear

These files are pre-wired but must be modified:

- `App.tsx` — replace `<game-name>` (×2), define `GameState` type, fill in `startGame`
- `HomeOptions.tsx` — update title, subtitle, `GameOptions` type, `DEFAULT_OPTIONS`, wins; adjust or remove opponent/mode selects
- `HelpModal.tsx` — replace placeholder with game rules
- `useGame.ts` — implement all game logic; return state and actions
- `GameBoard.tsx` — build board UI; add props from `useGame`
- `GameScreen.tsx` — destructure from `useGame`; pass to `GameBoard`; update header status text; wire `showGameOver`; fill in `GameOverModal` props

Only implement the next section - do not implement more than one section at a time. Only implement what is in the plan. Do not add abstractions, files, or dependencies not listed. Follow all conventions in `CLAUDE.md`.

---

## Step 3 — Check off completed items

Mark every implemented item as done in `<game-name>/context/PLAN.md`.

---

## Step 4 — Update user on progress and continue or stop

If all items in the plan are completed and checked off, stop and inform the user with the text:

> "The <game-name> game has been completed and checked off."

If more sections remain incomplete and unchecked, inform the user with the text:

> "The <section> has been completed and checked off. Shall I continue to the <next-section> section?"

If user says "yes", return to Step 2 and do the next section.

If user says "no", stop and wait for further instructions.
