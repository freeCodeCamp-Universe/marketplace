---
name: design
description: Add, update, or theme UI in a project using the freeCodeCamp UIKit copy-source registry. Use when creating or editing any UI - buttons, modals, forms, tabs, badges, toasts, icons, layout - or when touching design tokens, colors, spacing, typography, or dark/light theming.
---

# freeCodeCamp UIKit (copy-source registry)

Components are COPIED into this project's source, shadcn-style. Nothing installs from npm.

## Adding a component

1. `GET https://design.freecodecamp.org/registry/index.json` - every item, its raw file URLs, npm deps, registry deps, and the registry version.
2. Copy `registryDependencies` first (always `theme`; sometimes shared hooks).
3. Fetch each `files[].url` verbatim and write it to `files[].target` (default `src/ui/<slug>/`).
4. Import the component CSS once, globally.
5. Need props or usage? `https://design.freecodecamp.org/components/<slug>.md`.

## First-time setup in a project

Follow `https://design.freecodecamp.org/registry/starter.md` - theme install, self-hosted fonts, directory layout.

## Rules

- Keep CSS custom property (token) names intact - components reference them.
- Recolour by editing token VALUES in `src/ui/theme/tokens.css`. Never hard-code colors in component CSS.
- Dark is default; `class="light-palette"` on `<html>` for light.
- Copied source is this project's code - tailor it freely, but do not re-fetch to "update" without diffing local edits first.
