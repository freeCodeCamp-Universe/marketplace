# Architecture

## Core principle

Canonical source, normalized draft, and rendered page form one loop:

```text
Markdown / MDX / JSON
        |
        v
source adapter -> normalized authoring document -> existing app renderer
        ^                    |                         |
        |                    v                         v
atomic writer <- typed mutations <- studio client <- in-place editing / drawer
```

Studio is not a CMS and not a second app implementation. It is a dev-only control plane over source files and the existing renderer.

## Process topology

One process. One origin.

```text
app dev server  http://127.0.0.1:<port>

  normal app routes
  production renderer
  dev-only studio integration
    /__studio/api      source read/write API
    injected client    in-page authoring surface
  framework HMR
```

The studio client and the app share one document, so there is no iframe, no `postMessage` protocol, no session handshake, and no capability parameter in the URL. Do not reintroduce them: an iframe forces a second server, a second origin, a message schema, and a cross-document drag model, and buys nothing once the studio lives in the page.

Production is isolated by registration, not by runtime checks. The integration registers the API and the client injection only for the dev command, so the production bundler never sees either.

## Normalized model

Keep the normalized model narrow and loss-aware:

```ts
type AuthoringDocument = {
  id: string;
  route: string;
  revision: string;
  meta: Record<string, unknown>;
  unknownMeta: Record<string, unknown>;
  nodes: AuthoringNode[];
  diagnostics: SourceDiagnostic[];
};

type AuthoringNode = {
  id: string;
  type: string;
  label: string;
  rootIndex: number;
  editable: boolean;
  removable: boolean;
  movable: boolean;
  fields: Record<string, unknown>;
  children: AuthoringNode[];
  opaqueReason?: string;
};

type Mutation =
  | { kind: "set-markdown"; nodeId: string; value: string }
  | { kind: "set-meta"; path: string[]; value: string }
  | {
      kind: "insert";
      componentType: string;
      targetId: string | null;
      position: "before" | "after" | "end";
    }
  | { kind: "set-component"; nodeId: string; props: Record<string, unknown> }
  | { kind: "move"; nodeId: string; direction: -1 | 1 }
  | { kind: "remove"; nodeId: string };
```

Two field shapes carry everything visible:

- Non-component top-level nodes carry `fields.markdown`, the raw source of that block.
- Component nodes carry their validated props.

`set-markdown` replaces a whole block rather than a text leaf. A leaf-text mutation can only edit blocks whose entire content is one text node, which locks out every paragraph containing bold, a link, or inline code, plus every table, list, and code fence. Block source editing covers all of them with one mutation and no rich-text model.

`revision` is a content hash, not a timestamp.

## Source write API

```text
GET  /__studio/api/documents
GET  /__studio/api/documents/:id
POST /__studio/api/documents/:id/mutations
```

Request:

```json
{ "revision": "sha256:...", "mutations": [] }
```

Response:

```json
{ "revision": "sha256:...", "document": {}, "diagnostics": [] }
```

Use `409` for revision conflict, `422` for parse/schema failure, `403` for origin/token failure, `413` for size limit.

Same origin does not remove the need for access control. Dev servers are routinely bound to a LAN interface. Require both:

- **Origin check.** Compare the request `Origin` against the request `Host`; when `Origin` is absent, require same-site fetch metadata. This is what actually blocks a hostile page.
- **Capability token.** Generated per run, injected into dev pages, sent as a bearer header, compared in constant time. This raises the bar against non-browser clients on the same network.

## Filesystem security

Document discovery creates an immutable server-side map from document ID to path. For each write:

1. Resolve the mapped path against the configured curriculum root.
2. Resolve the parent real path and reject symlink escape.
3. Re-read current bytes.
4. Compare content hash revision.
5. Apply mutations in memory.
6. Serialize and parse again.
7. Run curriculum schema and domain validation.
8. Write a sibling temporary file with restrictive mode.
9. Rename over the target atomically.
10. Return the new hash and normalized document.

Never run MDX module code to inspect content. Parsing syntax is acceptable; evaluation is not.

Serialize writes per document so concurrent edits cannot interleave.

## Renderer instrumentation

Instrumentation happens where source fields become UI nodes, and compiles away outside dev:

```tsx
<h1 data-studio-meta={import.meta.env.DEV ? 'title' : undefined}>{lesson.title}</h1>

<div className="question" {...studioProp('question')}>…</div>
<span {...studioProp(`options.${index}.text`)}>{option.text}</span>
```

```ts
export function studioProp(path: string): Record<string, string> {
  return import.meta.env.DEV && path ? { "data-studio-prop": path } : {};
}
```

Block nodes are tagged by a dev-only parser plugin using source positions. Component props are tagged by the component itself, because only the component knows which prop produced which rendered string.

Do not discover editable nodes by querying heading order or matching text. Duplicate strings and layout changes make that unsafe.

Nested markup carries node IDs too. Resolve a click upwards to the owning top-level block before editing.

## Hydration boundary

An in-place studio on a hydrating app fails in ways that look like unrelated bugs. Design for this explicitly.

**Frameworks discard attributes they did not render.** Writing studio markers into server-rendered DOM before hydration both loses the markers and reports a hydration mismatch. The framework may then regenerate the subtree, wiping anything else attached to it.

**Framework handoff is not framework commit.** An island wrapper clearing its SSR marker means the renderer was invoked, not that it finished. Wait for the framework's own committed-instance evidence on the rendered markup, with a bounded retry and a fallback so binding always eventually happens.

**Rebind after every re-render.** Any state change rebuilds markup and drops markers with it. Observe the content subtree and rebind on change. Two rules keep this stable:

- Filter studio-owned nodes out of the observation, or inserting chrome re-triggers the observer forever.
- Skip rebinding while an edit is open, or the binder compares typed text against unsaved source and strips the marker out from under the caret.

**Render-time nondeterminism is an app bug.** A component that shuffles or randomizes during render mismatches between server and client and the framework regenerates the island. Move it into an effect and render the server order until then. Fix it in the app rather than working around it in the studio.

**Use `textContent`, not `innerText`.** `innerText` reflects rendering, so it returns nothing for content hidden until an effect runs, which curriculum components do routinely. Reserve `innerText` for reading a multi-line source editor where line breaks matter.

## In-place editor

Do not make the whole document editable. Each supported field owns its editing lifecycle:

```text
idle -> selected -> editing -> pending-save -> saved
                            -> invalid
                            -> conflict
```

Three editing surfaces, chosen by what the platform allows:

| Value                                           | Surface                                              | Why                                                  |
| ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Block markdown                                  | source editor element swapped in place, block hidden | formatted text is edited as source, not as rich text |
| Single-line value in normal flow                | `contenteditable="plaintext-only"` in place          | preserves layout and wrapping                        |
| Single-line value inside an interactive control | field anchored over the text                         | see below                                            |

**`contenteditable` inside a `button` is never made an editing host.** Option labels, match pairs, and categorize items are commonly rendered inside buttons. Programmatic focus lands on the nearest focusable ancestor instead, so the edit silently does nothing. Anchor a field over the text and mirror typing back into the rendered span.

**Studio chrome must not participate in layout.** Selection chrome inserted into the flow shifts content between the first and second click of a double click, so the gesture that starts editing lands on the toolbar that selection just created. Anchor selection chrome as a positioned overlay outside the flow and reposition it on scroll and resize. Always-present chrome such as insertion markers may sit in the flow, because it does not appear or disappear during a gesture.

Important events: `beforeinput`, `compositionstart/end` to suppress writes during IME composition, `paste` to accept plain text, `keydown Escape` to revert, `blur` to flush, page hide to flush.

Prefer mutation history in the studio over native undo, which only replays DOM edits.

## Insertion and drag model

Registry is a model-level catalog:

```ts
type ComponentDefinition = {
  type: string;
  label: string;
  importPath: string;
  fields: { name: string; label: string; editor: "text" | "json" }[];
  create: () => Record<string, unknown>;
};
```

Drop zones sit between top-level blocks and at the end of the content region. Each maps to an insertion target and position. Dropping emits a mutation; the renderer produces the resulting DOM.

**Use pointer events, not HTML5 drag and drop.** Native `draggable` does not start reliably from a button, is unavailable on touch, and its drop target is destroyed whenever the studio rebuilds its own chrome mid-gesture, so the drop never arrives. Pointer dragging is a few lines more and works everywhere:

1. `pointerdown` records the origin. A press that never travels is a click.
2. Past a small threshold, capture the pointer, show a ghost, mark the drag active.
3. On move, hit-test with `elementFromPoint`, hiding the ghost for the test, and highlight the zone under the pointer.
4. On release, insert into the current zone. On cancel, drop nothing.

Suppress chrome rebuilds while a drag is active. Always provide the keyboard path: choose an insertion point, choose a component, activate.

## Autosave and reload

Two feedback channels:

- preview feedback: same-frame draft update
- persistence feedback: queued, saving, saved, invalid, conflict

Save cadence follows identity stability, not preference:

| Edit                                 | Cadence                         | Reason                                                                                   |
| ------------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------- |
| Metadata, component props            | debounce ~300 ms                | values change, node identities do not                                                    |
| Block markdown                       | commit on exit                  | re-parsing mid-keystroke moves node IDs under the caret and can split one block into two |
| Insert, move, remove, explicit apply | flush immediately, then repaint | structure changed; the real renderer must confirm                                        |

Coalesce rapid input into the latest write per target while retaining mutation order.

**Suppress the framework reload that a studio write causes.** Content-aware frameworks watch the curriculum directory and answer every write with a full page reload. Correct for an editor edit, destructive for a studio edit: it discards caret, in-progress task state, scroll, focus, and drawer state. Intercept the dev server's reload message and drop it inside a short window after a studio write, or filter by origin if the framework exposes one. Keep the suppression narrow so unrelated reloads still reach the browser.

**Repaint instead of reloading.** Re-fetch the current route, parse it, and replace only the content region. Scroll, studio mode, drawer state, and focus outside the region survive, and islands re-hydrate when the new markup is connected. Guard the swap: if the region is missing, the fetch fails, or the swapped-in islands never hydrate, fall back to a full reload rather than leaving dead components on the page.

Watch canonical revision on an interval. If it moved and no draft is pending, repaint. If a draft is pending, raise a conflict and stop writing.

## Production isolation

Use multiple layers:

- the integration registers the API and client injection only for the dev command
- writer imports Node modules only from the integration graph, never from a client module
- renderer instrumentation compiles to nothing outside dev
- production config does not expose frame or CORS allowances
- build scan finds no studio endpoint prefix, client strings, marker attributes, or filesystem modules

A runtime check alone is insufficient if the code remains in the production bundle.
