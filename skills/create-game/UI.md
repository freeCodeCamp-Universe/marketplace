# UI Design Guide

All games share the same visual language. Read this file before writing any CSS.

CSS variables (colors, spacing, typography, shadows, transitions, radius) are defined in `global.css` — use them, never hardcode values.

Every game should look polished and intentional — not like a default browser UI. If something looks flat, add depth. If something snaps and would be better with a transition, add a transition. If something feels generic, it probably is.

---

## Core Rules

- Always use semantic variables (`--color-bg`, `--color-accent`) — never raw ones (`--gray-90`)
- Always use spacing scale variables (`--space-4`, not `16px`)
- Use `--font-mono` for scores, timers, counters, and any number display
- Never mix more than two font sizes in the same UI region
- Never introduce new colors — all colors must come from the existing variables in `global.css`

---

## Spacing Guidelines

- Tight groupings (label + input, icon + text): `--space-1` or `--space-2`
- Component internal padding: `--space-3` or `--space-4`
- Between components: `--space-5` or `--space-6`
- Page-level padding: `--space-6` or `--space-7`

---

## Interactive States

- Replace browser focus outlines with a custom `box-shadow` focus ring
- Selected/active pieces glow with `--shadow-accent` — don't just recolor them

---

## Game-Specific Patterns

- Pieces use `--piece-blue` and `--piece-gold` for the two players — do not use arbitrary colors
- All interactive piece feedback - selection glow, hover highlights, move destination dots, etc — should use the moving player's piece color at reduced opacity.
- Status messages: win uses `--color-success`, loss uses `--color-danger`, neutral uses `--color-accent`
- Overlays and result screens: dark translucent background over the board, content panel with `--radius-lg` and `--shadow-lg`, animate in with fade + scale
- Headings use tight letter-spacing (`-0.02em`), uppercase labels use wide letter-spacing (`0.06em`)
- Use `--color-text-secondary` for body copy, reserve `--color-text-primary` for headings and emphasis

---

## Layout

- Games must be usable on mobile — use `max-width` on the game container

---

## Empty & Loading States

- Empty areas: dashed border + centered muted text — never leave blank unstyled regions
- Loading: pulsing opacity animation

---

## Checklist Before Submitting Any UI

- [ ] All colors use semantic variables
- [ ] All spacing uses scale variables
- [ ] Numbers/scores use `--font-mono`
- [ ] Game container has `max-width` and is centered
- [ ] Tested at mobile width (375px)
- [ ] Headings use tight letter-spacing, uppercase labels use wide letter-spacing
- [ ] Focus states are custom, not browser default
- [ ] Hoverable game squares have inset border feedback
- [ ] Selected pieces glow with `--shadow-accent`
- [ ] All state changes animate — nothing snaps
- [ ] Result/overlay screens animate in with fade + scale
- [ ] Empty states are explicitly styled
