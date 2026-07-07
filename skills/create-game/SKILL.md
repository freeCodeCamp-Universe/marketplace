---
name: create-game
description: Scaffolds and builds a known game from scratch. Only invoked explicitly as /create-game <game-name> — do not trigger from natural language.
---

# create-game

## Purpose

Scaffold, plan, and fully build a new known game from scratch.

## Invocation

```
/create-game checkers
/create-game five-dice (yahtzee)
```

The first argument is the game name to use for folders and files. If a name is provided in parentheses, that is the well-known game to base it on if it exists. Otherwise use the game name as the known game.

Do not run this skill unless explicitly invoked with the `/create-game` command.

---

## Step 1 — Parse invocation

- `<game-name>` — folder name and project name
- `<known-game>` — the well-known game to base it on (parentheses value if provided, otherwise same as game name)

Use `<known-game>` for all rules and game knowledge.
Use `<game-name>` for all file and folder naming.

---

## Step 2 — Ask upfront questions

Before touching any files, introduce what you're about to build and ask focused questions. Keep it conversational — only ask what you genuinely need answered.

**Always ask:**

1. Any rules variants? _(name the most common version you'll use as the default so the user knows what to expect)_
2. Any mode overrides? _(state the default modes you're planning based on the game type, ask if they want anything different)_

**Ask only if genuinely unclear:**

- Anything about the game's rules that has common variations you can't resolve yourself
- Computer player requirements if the game type is ambiguous

**Ask if the game has a complex or non-obvious UI** (multiple panels, multiple player areas, non-grid layouts):

- "This game has a complex UI — want an HTML mockup to review before coding starts?"

Format it like:

> "I'm going to build **[known-game]** as **[game-name]**.
>
> 1. ...
> 2. ...
>    ...
>    Any additional features or custom behaviour?
>
> Defaults: [list what you're planning]. Just say go if that works."

Wait for the user's response before doing anything else.

---

## Step 3 — Bootstrap the project

1. Run `cp -R .claude/skills/create-game/boilerplate <game-name>` from the repo root to copy the boilerplate
2. In `<game-name>/index.html`, replace the placeholder title with a capitalized human-friendly version of the game name
3. In `<game-name>/platform.yaml`, replace the placeholder site name with the game name (lowercase, hyphenated if multiple words) — this is used for deployment and preview links
4. Run `npm install` inside `<game-name>/`.

The boilerplate includes pre-built components and hooks — use them, do not reimplement:

- `src/components/Header.tsx` — home and game screen header with all icon buttons
- `src/components/Modal.tsx` — overlay, focus trap, animate in
- `src/components/ConfirmModal.tsx` — confirmation dialog
- `src/components/HelpModal.tsx` — help/rules modal; edit content directly inside the file
- `src/components/GameOverModal.tsx` — game over overlay; result, note, stats placeholder, Play Again + Home buttons
- `src/components/SegmentedControl.tsx` — multi-option toggle; accepts any options array
- `src/components/StatsRow.tsx` — label + value stat display
- `src/hooks/useTheme.ts` — theme state, body class, localStorage
- `src/hooks/useStorage.ts` — save/load/clear game state by key

The following files are pre-wired but must be modified for each game:

**Always modify:**

- `App.tsx` — replace `<game-name>` (×2), define `GameState` type, fill in `startGame` to build initial state from options
- `HomeOptions.tsx` — update game title and subtitle; update `GameOptions` type and `DEFAULT_OPTIONS`; load wins from storage
- `HelpModal.tsx` — replace placeholder content with actual game rules
- `useGame.ts` — define `GameState`, implement all game logic, return state and actions
- `GameBoard.tsx` — build the board UI; add props matching what `useGame` returns
- `GameScreen.tsx` — destructure state/actions from `useGame`; pass to `GameBoard`; update header `center` text; wire `showGameOver` to actual game over condition; fill in `GameOverModal` props and stats placeholder

**Modify if applicable:**

- `HomeOptions.tsx` — remove opponent select for solo games; remove mode select if no modes, or update its options array; remove `value.opponent === 'computer'` conditions if modes/wins apply to both opponent types

---

## Step 4 — Plan the game

## Step 4a — Create the plan file

1. Create a `context` directory in <game-name> - so you have `<game-name>/context/`.
2. Copy `.claude/skills/create-game/templates/PLAN_TEMPLATE.md` to `<game-name>/context/PLAN.md`. In the new file...
3. Replace all `<game-name>` placeholders with the actual game name
4. Replace all `<known-game>` placeholders with the known game name

## Step 4b — Fill out the plan

The template covers all required sections. Fill out every section completely — no placeholders, no `...`, no generic content. The template is a minimum structure, not a ceiling — add sections or checklist items whenever the game warrants it.

Be sure to include all of the user's decisions from step 2.

Only document what is game-specific. Do not re-document boilerplate behavior — the coder knows how Header, Modal, card containers, colors, spacing, and transitions work. Focus the plan on: game rules, data model, AI strategy, help content, game-specific status/result text, storage keys, game logic functions, board UI specifics, and game-specific styling.

Before writing, think through the non-obvious mechanics of this specific game:

- What surprises first-time implementers?
- What state changes are easy to forget or get wrong?
- What happens at edge transitions — deck exhausted, board full, turn wrap-around?
- Does any piece or card have dual state (e.g. face-up/face-down)?
- Are there cascading effects or resets that don't preserve order?

Be explicit and concise — no vague items like `- [ ] handle moves`. Break them down into specific function names, state flags, or checklist items unique to this game. For well-known games, use canonical rules and name them explicitly. Every non-obvious mechanic must appear in the plan with a corresponding test case.

Only include the AI / Computer Player section if the game has a computer opponent.

Write the completed plan to `<game-name>/context/PLAN.md`.

---

## Step 5 — Self-review

Read the completed plan and check:

- Is it specific enough to code from without any questions?
- Are all user decisions from step 2 included?
- All checklist items specific enough to code from — no vague items like `- [ ] handle moves`?
- Non-obvious mechanics covered with corresponding test cases?
- Any canonical systems named explicitly?

**Critical Fixes:**

- Any `...` placeholders remain
- Any section is blank without a justified N/A
- Win / draw conditions are vague or incomplete
- Data model is missing state shape, piece types, or turn structure
- Move validation approach is not specified
- Game Logic items are generic rather than specific function names
- Components are listed without specific responsibilities
- Testing has no specific test cases (if applicable)
- Edge cases section is empty
- Styling section is empty — it should list game-specific board, piece, and animation items

**Meaningful improvement:**

- Special rules exist but state flags are missing from the data model
- Computer player mentioned but AI strategy is vague
- Edge cases feel thin given the complexity of the game
- Help & Strategy Guide content feels generic rather than game-specific
- Styling items don't call out specific variables, states, or transitions

Fix any gaps using the rules from step 4, then write the final plan to `<game-name>/context/PLAN.md`.

---

## Step 6 — Get user approval

Show the user:

> "The <game-name> plan is ready for your review. Respond with 'plan approved' to start coding, or provide feedback for changes."

Wait for explicit approval before proceeding. If the user requests changes, update the plan and ask again.

Only proceed if the user replies with "plan approved". Any other response is treated as a change request — update the plan and ask again.

---

## Step 6b — HTML mockup (opt-in only)

Skip this step unless the user requested mockups in step 2.

Read `.claude/skills/create-game/examples/` for visual reference — the mockup should match the established layout and style. Generate `<game-name>/context/mockup.html` — a single static HTML file showing each screen (home, play, game over, etc) as a rough visual layout. Use inline CSS. Show the right panels, elements, and proportions. No interactivity or game logic needed — layout only.

Tell the user:

> "Mockup saved to `<game-name>/context/mockup.html`. Open it in a browser and let me know if the layout looks right, or provide feedback. Respond with 'mockup approved' to start coding."

Wait for explicit approval. If the user requests changes, update the mockup and ask again. Only proceed on "mockup approved".

---

## Step 7 — Launch coder

Read `.claude/skills/create-game/GAME_CODER.md` and apply its instructions directly, continuing in this same response.
Game name: <game-name>
Known game: <known-game>

---

## Step 8 — Done

Tell the user:

> "<game-name> complete."

If any checklist items remain unchecked, note them for the user.
