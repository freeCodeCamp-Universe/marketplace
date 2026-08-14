# Verification

## Automated checks

Run project-native commands first:

- format check
- lint
- typecheck
- unit/integration tests
- production build

Add focused tests for the following areas.

### Adapter

- discovery includes expected files and excludes unrelated files
- document IDs cannot become filesystem paths
- no-op round trip preserves semantics and opaque regions
- parser parity: a fixture using every dialect feature produces the same node types and paths as the app pipeline
- every top-level block type reports source and is editable, including formatted paragraphs, tables, lists, and code fences
- a block edit preserves formatting inside the block and changes nothing outside it
- block source rejects components, expressions, and ESM
- block source is rejected for component nodes and nested nodes
- a meta mutation preserves visible source
- insert/move/remove produces parseable valid source
- an unsupported construct remains unchanged and is reported opaque
- malformed source returns a line/column diagnostic
- stale revision returns conflict
- failed validation leaves disk unchanged
- atomic write leaves no temporary file after success or failure

### Server security

- missing or wrong capability token rejected
- cross-origin request rejected
- oversized body rejected
- unknown document ID rejected
- `..`, absolute path, encoded traversal, and symlink escape rejected
- raw browser path ignored
- non-write method cannot mutate
- parse/format failure cannot truncate the target

### Client

- a normal app URL outside dev has no widget, drawer, markers, or API calls
- reconnect restores canonical revision
- IME composition emits one committed mutation
- paste cannot inject unsupported markup
- Escape cancels the active edit
- a failed save stays visible and retryable
- a conflict stops autosave

### Component mutations

- palette lists renderer-supported types only
- drop changes model and source, not only DOM
- keyboard insertion reaches the same result as a pointer drop
- reorder persists after repaint
- unknown metadata survives every mutation

## Production isolation

After a production build:

1. Search output for the studio endpoint prefix, client strings, marker attributes, and widget labels.
2. Search generated source maps.
3. Confirm no Node filesystem or path imports in browser chunks.
4. Request guessed writer endpoints from the production preview and confirm absence, not merely `403`.
5. Confirm production headers were not loosened.
6. Compare the route manifest before and after. Only intended changes allowed, usually none.

```bash
rg -n "__studio|curriculum-studio|data-studio|studio-drawer|node:fs" dist
```

Expected result: no match. Inspect each match.

## Browser verification

Hydration timing, layout shift, caret placement, and drag gestures cannot be verified by reading code, fetching HTML, or running unit tests. Every bug class listed under "Regression checks" below was invisible to all three and only appeared in a real browser.

**Check for an available browser before concluding there is none.** `which chromium` and the project's `node_modules` are the wrong places to look. Check, in order:

```bash
ls ~/.cache/ms-playwright        # Playwright browsers, often already downloaded
ls ~/.cache/puppeteer            # Puppeteer's Chrome
ls "/mnt/c/Program Files/Google/Chrome/Application"   # on WSL
command -v chromium chromium-browser google-chrome firefox
```

A cached Chromium is enough. It can be driven with no project dependency at all: launch it with `--remote-debugging-port` and `--headless=new`, read `webSocketDebuggerUrl` from `/json/version`, and speak CDP over the runtime's built-in WebSocket. `Runtime.evaluate` inspects state, `Input.dispatchMouseEvent` and `Input.dispatchKeyEvent` drive real gestures, and `Runtime.consoleAPICalled` plus `Runtime.exceptionThrown` capture the console.

Two cautions when scripting gestures:

- Measure the target's rectangle again between the two clicks of a double click. If the rectangle moved, studio chrome is reflowing the page and the gesture is landing somewhere else. That is a product bug, not a test bug.
- Restore any curriculum fixture the run mutated. A leftover inserted component shifts node IDs and makes the next run fail for reasons unrelated to the change under test.

### Regression checks

Run each against a clean fixture and assert zero console errors.

| Check                                                                                                       | Failure it catches                                              |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Count markers after load, then after 5 s idle                                                               | markers written before hydration and discarded by the framework |
| Console clean of hydration warnings                                                                         | render-time nondeterminism, or markers applied too early        |
| Marker count for text hidden until an effect runs                                                           | `innerText` returning nothing for unrendered content            |
| Rectangle unchanged between the two clicks of a double click                                                | selection chrome inserted into the layout flow                  |
| Double click text inside a button, assert an editing surface appears and receives focus                     | `contenteditable` inside an interactive control                 |
| Type, commit, then assert markers and drawer still present                                                  | framework reload triggered by the studio's own write            |
| Drag a palette card to a drop zone, assert ghost and active zone mid-drag, then content count after release | HTML5 drag and drop failing to deliver a drop                   |
| Marker count after a structural edit repaints the region                                                    | islands not re-hydrating after a region swap                    |

### Existing app unchanged

- Start the normal dev command. Visit curriculum routes.
- Compare content, layout, links, forms, responsive behavior, theme, and HMR.
- Build and preview production. Confirm no widget, drawer, markers, API calls, console errors, or studio routes.

### In-place editing

- Edit the title, a plain paragraph, a paragraph containing bold and a link, a list, a table, a code fence, and component text.
- The page updates immediately; source matches after the save cadence for that field.
- Keep typing for at least 10 seconds. Focus and caret remain stable and the page never reloads.
- Repaint and confirm the change survives.
- Trigger a parse error. The last good page remains, the diagnostic appears, disk is not corrupted.
- Test IME input, multiline paste, Escape, blur flush, and page-hide flush.

### Drawer

- Move the widget with pointer and keyboard; reload and confirm position.
- Open and close by pointer and keyboard; check Escape close and focus return.
- Confirm the drawer contains no field that is visible on the page.
- Edit hidden metadata and confirm unknown keys survive.
- Confirm the drawer pushes content aside rather than covering it, and that nav and sidebars stay reachable at every breakpoint.

### Insertion and structure

- Insert each registered component by drag and by keyboard, at the start, between blocks, and at the end.
- Confirm drag works with mouse and touch.
- Reorder and remove.
- Repaint and confirm the production renderer output matches.

### Conflict and external edits

- Edit source externally with no dirty draft. The page updates.
- Make a draft, then edit the same source externally. A conflict appears and no silent overwrite occurs.
- Test reload source, copy draft, and explicit retry.

### Accessibility

- Traverse all studio controls by keyboard, including insertion.
- Confirm visible focus, names, roles, status announcements, reduced motion, and contrast.
- Zoom to 200%.
- Screen reader announces selection, save state, validation errors, and insertion result.

## Performance targets

Measure rather than assume:

- inline visual feedback: next animation frame
- common source write: under 500 ms after idle on a local filesystem
- structural edit visible through the renderer: under 1 s
- no full-page reload from any studio-originated write
- no long task above 50 ms during ordinary text input
- no increasing listeners, observers, or detached nodes after repeated repaint cycles

## Final report template

```text
Architecture: single dev server on <origin>, dev-only integration at <api prefix>
Source: <format, roots, schema, adapter, parser extensions>
Editable in place: <block types and component fields>
Drawer: <palette, hidden fields, recovery>
Autosave: <per-field cadence, flush points, revision/conflict behavior>
Reload policy: <suppression window and repaint strategy, measured>
Production isolation: <build scan and endpoint result>
Verification: <commands, browser driver, regression checks>
Limitations: <opaque/read-only syntax and known constraints>
```
