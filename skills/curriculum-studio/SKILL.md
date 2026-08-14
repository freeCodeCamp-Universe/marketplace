---
name: curriculum-studio
description: Add a dev-only, in-place curriculum authoring studio to a Vite or Astro web app whose curriculum is stored in Markdown, MDX, or JSON. Use when users want visual curriculum editing on the real learner page, source-backed autosave, hidden metadata forms, or draggable curriculum components. The studio runs inside the existing dev server, never a second one.
---

# Curriculum Studio

Build a dev-only authoring layer inside the existing app. Keep shipped app and canonical curriculum format intact. Read these files before implementation:

- `references/ARCHITECTURE.md`
- `references/SOURCE_ADAPTERS.md`
- `references/VERIFICATION.md`

Treat repository curriculum source as sole source of truth. Ignore external curriculum editors, importers, exporters, CMS projections, and generated mirrors unless user explicitly includes them.

## Required outcome

- Existing dev and production app still work, render, and route as before. No new command, no second port, no iframe.
- Studio is one dev-only integration on the app dev server. It adds a source read/write API under a reserved path prefix and injects an in-page client. `build` registers none of it.
- The learner page is the editing surface. Studio mode never hides, covers, or replaces app UI.
- **Everything the learner can see is edited where it renders.** Blocks, headings, lists, tables, code, component text. Nothing visible is edited through a side panel.
- The drawer holds only what the page cannot show: the component palette, hidden metadata, save state, and draft recovery. Never put a visible field in it.
- Studio mode enables only explicitly mapped curriculum nodes. Do not use unrestricted `document.designMode`.
- Every accepted edit updates the page immediately and writes canonical source. Latest source matches latest accepted edit.
- Movable widget defaults bottom-left and opens a keyboard-accessible drawer.
- Components are inserted by dragging from the drawer palette onto on-page drop zones, and by an equivalent keyboard menu. Drag/drop mutates the content model, never the DOM alone.
- Editing is never interrupted by a reload. Studio-originated writes must not trigger the framework's page reload.
- External source edits and studio edits converge without stale overwrite.

## Workflow

### 1. Discover before designing

Inspect:

- package manager, framework, build tool, dev command, default port, routing, rendering boundaries, hydration model, HMR behavior
- all curriculum roots and formats
- loader, schema, validation, ordering, slug, route, and production rendering code
- visible fields, hidden fields, component types, tests, background code, and unknown extension fields
- **exact markdown extension set used by the production pipeline** (GFM, directives, custom remark plugins)
- existing UI primitives, tokens, drawer/dialog patterns, and accessibility conventions

Trace one curriculum item from source file to generated route to rendered DOM. Record exact transformation points. Do not infer format from file extension alone.

Ask user only for blockers that repository cannot answer. Prefer these defaults:

- API prefix: a reserved dev-only path such as `/__studio/api`
- save: 300 ms idle debounce for single-line values, commit-on-exit for block source, immediate flush for structural edits
- widget: bottom-left, position persisted in local storage
- mode persistence: session storage, so mode survives navigation and reload

### 2. Define content contract

Classify every curriculum field:

- `visible`: rendered and edited in place
- `meta`: source-backed but never rendered; belongs in the drawer
- `structural`: controls order, route, nesting, or component type
- `derived`: computed and never directly written
- `opaque`: unsupported syntax preserved byte-for-byte and exposed read-only

Two editing surfaces cover the visible set:

- **Block source.** Every top-level block gets its raw markdown. Editing swaps the rendered block for its source in place. This is what makes formatted text, links, inline code, tables, and lists editable without a rich-text model.
- **Component props.** The renderer tags each rendered string with the prop path it came from. The studio maps DOM back to the prop and writes the whole component.

Define the component registry from types the app already renders. Each entry needs type, label, default value factory, field schema, and renderer mapping.

Use stable source identities. Prefer existing content IDs. Otherwise derive identity from canonical document ID plus AST path and refresh identities after each parse. Never identify nodes by displayed text.

### 3. Implement source adapter first

Build one adapter around the actual format, following `references/SOURCE_ADAPTERS.md`. Adapter must discover documents, parse, expose a normalized authoring document, apply typed mutations, serialize, validate, and write atomically.

Parse with the same extensions as the production pipeline. A parser without the app's GFM or directive plugins produces a different tree, and node paths silently drift between adapter and renderer.

Write round-trip and mutation tests before UI:

- parse then serialize causes no unrelated semantic change
- one block edit changes intended block only, and preserves formatting inside it
- one meta edit preserves visible content
- every top-level block type is editable and reports its source
- block source rejects components and expressions
- insert, move, and remove preserve valid source
- malformed or unsupported source fails safely
- stale revision cannot overwrite newer source

Do not edit Markdown, MDX, frontmatter, or JSON with regular expressions. Do not convert rendered `innerHTML` back into curriculum source.

### 4. Add the dev-only integration

Keep existing `dev` script unchanged and add nothing beside it. Register one integration/plugin that is active only for the dev command.

It owns two things:

- **Source API** on the dev server under a reserved prefix. Requirements: same-origin enforcement, a per-run capability token injected into dev pages, bounded request bodies, server-side document ID to path mapping, path containment and symlink checks, optimistic revision check, parse and schema validation before write, atomic temp-file plus rename write, structured errors naming document and field, no raw path accepted from browser.
- **Client injection**, dev command only, so the production bundler never sees it.

Same origin removes the companion server, the iframe, the cross-document protocol, and the session handshake. Do not reintroduce them.

### 5. Instrument the renderer

Instrumentation must happen where source fields become UI nodes, emitted only in dev:

```tsx
<h1 data-studio-meta={import.meta.env.DEV ? 'title' : undefined}>{lesson.title}</h1>
<span {...studioProp(`options.${index}.text`)}>{option.text}</span>
```

Helper returns nothing outside dev so production markup is unchanged. Map block nodes through parser source positions, not by querying heading order or matching text.

Interactive production controls inside editable regions need a mode policy. Keep learner controls inert in studio mode, select on click, edit on Enter or double click.

### 6. Respect the hydration boundary

This is where an in-place studio actually breaks. All of the following are required, not optional:

- **Bind after hydration, never before.** A client framework discards DOM attributes it did not render. Markers written before hydration are both wiped and reported as a hydration mismatch. Waiting for the island to drop its SSR marker is not enough, because the framework commits afterwards. Wait for the framework's own committed-instance evidence.
- **Rebind after every re-render.** Observe the subtree and rebind when non-studio nodes change. Filter studio chrome out of the observation or the observer feeds itself. Suppress rebinding while an edit is open or the markers are stripped out from under the caret.
- **Fix render-time nondeterminism in the app.** A component that shuffles or randomizes during render produces a server/client mismatch and the framework regenerates the whole island, destroying markers. Move it into an effect. This is an app bug the studio merely exposes.
- **Compare with `textContent`, not `innerText`.** `innerText` returns nothing for content that is not currently rendered, and curriculum components routinely hide rows until an effect runs.

### 7. Implement editing semantics

Use `contenteditable="plaintext-only"` for single-line values, and a plain source editor element for block markdown. Preserve headings, lists, links, formatting marks, and component boundaries as model structure.

Platform limits that dictate the design:

- **`contenteditable` inside a `button` is never an editing host.** Text inside interactive controls must be edited through a field anchored over it, not by making the span editable.
- **Studio chrome must never take part in layout.** A toolbar inserted into the flow on selection pushes content down between the first and second click of a double click, so the edit gesture lands on the toolbar. Anchor selection chrome as an overlay and reposition it on scroll and resize.

Handle composition, paste, Escape cancellation, and focus movement. Do not persist intermediate IME composition. Sanitize pasted rich content to the supported model.

Save pipeline:

1. User action produces typed mutation.
2. Apply mutation to normalized draft.
3. Patch the page in the same frame.
4. Queue write against known revision.
5. Parse, validate, and atomically write source.
6. Publish new revision and save state.

Debounce single-line values. **Commit block source on exit rather than per keystroke**: re-parsing mid-keystroke moves node identities under the caret. Flush structural edits immediately. Never acknowledge success before the disk write succeeds. Keep failed drafts in memory, show the error, and offer retry or copy.

### 8. Add widget, drawer, and insertion

Widget: fixed bottom-left initial position, pointer drag with viewport clamping, keyboard move, persisted position, visible focus state, accessible name.

Drawer: dialog/sheet semantics, labelled title, Escape close, focus management, focus return. It contains the component palette, schema-driven forms for hidden metadata only, save state, and draft recovery. Unknown metadata is preserved and shown read-only. It pushes page content aside instead of covering it, so nav and sidebars stay usable.

Insertion:

- **Use pointer-based dragging, not HTML5 drag and drop.** Native `draggable` does not start reliably from a button, gives nothing on touch, and its drop target dies whenever the studio rebuilds its own chrome mid-gesture. Track pointer movement, show a ghost, hit-test drop zones, and drop on release.
- Suppress chrome rebuilds while a drag is in flight.
- Always provide the keyboard equivalent: select an insertion point, choose a component, activate.
- Drop emits `insert`, `move`, or `remove` with source node IDs and relative position. DOM movement alone is a bug.

### 9. Keep the edit flow alive

Measure before changing reload behavior. Inline draft patch should appear within one animation frame.

Content-aware frameworks answer every curriculum write with a full page reload. That is correct for an edit made in an editor and destructive when the studio is the writer: it discards caret, task state, scroll, and focus. Suppress the reload that a studio write provoked, and repaint from the studio instead. Suppress narrowly, by write window or origin, so unrelated reloads still reach the browser.

Repaint by re-fetching the current route and replacing only the content region. Scroll position, studio mode, drawer state, and focus outside the region survive, and islands re-hydrate on connect. Fall back to a full reload if the region cannot be swapped or fails to hydrate.

External editor change rules:

- no local dirty draft: refresh the region
- conflict: stop writes and show source-versus-draft choice; never last-write-wins silently

### 10. Verify and report

Run repository format, lint, typecheck, unit tests, production build, and checks in `references/VERIFICATION.md`. Inspect output for studio endpoint strings, client code, and Node filesystem imports.

Verify in a real browser. Hydration timing, layout shift, caret behavior, and drag gestures cannot be verified by reading code or by fetching HTML.

Report architecture, source adapter and opaque constructs, files changed, autosave and conflict behavior, production isolation proof, test/build results, and known format limitations.

## Hard guardrails

- No second dev server, no second port, no iframe, no cross-document protocol.
- No duplicate curriculum store. No duplicate production renderer.
- No visible field edited from the drawer.
- No studio markers written before the framework has hydrated.
- No studio chrome in the layout flow.
- No `contenteditable` inside an interactive control.
- No HTML5 drag and drop for insertion.
- No framework page reload caused by a studio write.
- No unrestricted `designMode`. No `innerHTML` to Markdown/MDX conversion. No regex source mutation.
- No browser-supplied filesystem paths. No silent overwrite on revision mismatch.
- No studio code or write capability in production output.
- No replacement of the existing app dev workflow. The studio is additive and dev-only.
