# Source adapters

## Contract

Adapt the exact curriculum model rather than forcing one universal schema.

```ts
type ParsedDocument = {
  document: AuthoringDocument;
  source: string;
  revision: string;
  references: Map<string, NodeReference>;
  newline: "\n" | "\r\n";
};

type SourceAdapter = {
  discover(): Promise<DocumentSummary[]>;
  read(id: string): Promise<ParsedDocument>;
  apply(current: ParsedDocument, mutations: Mutation[]): ParsedDocument;
  write(id: string, expectedRevision: string, mutations: Mutation[]): Promise<MutationResponse>;
};
```

The adapter owns the mapping between source and authoring model. The client never knows filesystem paths or source offsets.

`apply` is pure and reparses after every mutation, so `write` is a read, compare revision, apply, validate, atomic replace.

## Parser parity

**Parse with the same extension set as the production pipeline.** A parser missing the app's GFM, directive, or custom remark plugins builds a different tree: a GFM table parses as one paragraph instead of a table, footnotes and autolinks differ, and child indices diverge. Node paths then silently disagree between the adapter and the renderer, so edits land on the wrong node.

Read the app's markdown configuration and mirror it in the adapter. Assert parity with a fixture containing every dialect feature the curriculum uses.

## General rules

- Read project schema and renderer before selecting a parser.
- Check latest compatible parser/formatter versions before installation.
- Preserve newline style and final newline.
- Preserve unsupported constructs.
- Prefer narrow source-span replacement over whole-document reserialization.
- Reparse after every applied mutation. Never continue using stale offsets.
- Use AST/data mutations for insert, remove, move, and type changes.
- Run the existing project formatter only when it does not create unrelated content churn.
- Surface parse line/column and keep the last good page.
- Never evaluate content or execute imported MDX modules in the writer.

## Block source as the visible-edit primitive

Expose every top-level non-component block as its raw source:

```ts
for (const [rootIndex, node] of nodes.entries()) {
  if (isComponent(node)) continue;
  node.fields = {
    markdown: source.slice(startOffset(roots[rootIndex]), endOffset(roots[rootIndex])),
  };
  node.editable = true;
}
```

`set-markdown` then replaces that span and reparses. One mutation covers paragraphs, headings, lists, tables, blockquotes, code fences, and formatted text of any complexity.

Reject a leaf-text mutation as the primitive. Editing "the single text child of a block" only reaches blocks with no inline formatting, so a paragraph containing bold or a link becomes uneditable, which is the opposite of the required outcome.

Constrain what block source may contain:

- reject nodes that are components, expressions, or ESM in the replacement, so a markdown block cannot smuggle in executable syntax
- reject the mutation for component nodes; components have their own typed mutation
- reject it for nested nodes; only top-level blocks own a replaceable span

Accept that a block edit can change block count. Typing a blank line splits one paragraph into two. Reparse handles it, node IDs shift, and the page must repaint afterwards. This is why block source commits on exit rather than per keystroke.

## Component props

Components are edited as whole prop objects, validated against the curriculum schema, and reserialized canonically:

- read props by evaluating only static literal expressions
- treat spread, computed, shorthand, imported, and call expressions as opaque and read-only
- validate with the same schema the production loader uses
- serialize through the registry so output matches project conventions
- add the component import through an AST transform when missing, and refuse when the local name already belongs to another import

A component whose props fail to parse or validate stays visible, is marked opaque with the reason, and is not editable, movable, or removable.

## JSON

Best case: curriculum is strict data already.

1. Find the JSON schema, TypeScript type, runtime validator, or equivalent.
2. Preserve object key order expected by the repository.
3. Preserve indentation and newline style.
4. If comments or trailing commas exist, classify as JSONC and use a JSONC-aware editor.
5. Validate the full document after mutation.
6. Keep unknown properties unless the schema explicitly rejects them.

Do not stringify a subset built from known UI fields. That drops metadata.

For one-file-many-lessons stores, revision applies to the whole file. Serialize writes through a per-file queue so edits to different lessons do not race.

## Markdown

Determine content shape: one document per file or many records, frontmatter parser and schema, dialect and plugins, raw HTML policy, custom directives, route slug derivation.

Use a position-aware AST matching the production dialect. Mutation strategy:

- frontmatter scalar: format-aware edit, never regex
- visible block: replace the block's source span with new markdown, then reparse
- block insert/move/remove: mutate the document AST or splice whole block spans

Round-trip fixtures must cover tables, code fences, links, escaped punctuation, raw HTML, directives, comments, and frontmatter.

If the parser cannot preserve the project dialect, mark those nodes read-only rather than corrupting source.

## MDX

MDX is Markdown plus executable syntax. Treat executable regions as opaque unless the repository schema constrains them.

Parse with an MDX-aware AST stack compatible with the project version. Do not import or evaluate the file to get exports.

Safe edits:

- markdown blocks, through block source
- known component attributes with literal values
- known component children
- frontmatter metadata

Read-only by default: spread attributes, expressions, imported values, function calls, dynamic children, arbitrary ESM exports.

Only generate constructs the production renderer already supports. Preserve import order and add imports through an AST transform.

Do not run a full MDX formatter if it rewrites unrelated expressions or comments.

## Frontmatter and hidden metadata

Frontmatter usually holds the drawer fields. Use a format-aware parser that preserves comments and unknown keys.

Distinguish missing from empty and `null`. Respect repository conventions for omitted defaults. Deleting a value should remove the key rather than write an empty string, when that is the project convention.

```yaml
---
id: arrays-1
title: Arrays
description: Hidden summary
tests:
  - text: should create an array
    testString: assert(...)
---
```

Preserve literal and folded scalar style where practical. Validate tests and background code as data; never execute them in the writer.

Note that a field can be both frontmatter and visible. The lesson title is written to frontmatter but rendered on the page, so it is edited on the page and must not also appear in the drawer.

## Source identity

Preferred identity order:

1. explicit canonical content ID
2. schema ID or slug unique in document
3. persistent authoring ID stored in source if the project accepts it
4. document ID plus AST path for the current revision

Source positions are mapping metadata, not durable IDs. They shift after edits.

If adding IDs to source would affect production semantics, keep revision-scoped IDs and remap after each parse. The client must tolerate ID replacement after a canonical update, and must not hold an ID across a structural edit without repainting.

The renderer-side plugin that tags DOM nodes must compute identical paths to the adapter, including how it filters text nodes and where document content begins. Any divergence maps edits onto the wrong node.

## Serialization safety tests

Use real fixtures, including the hardest documents. Assert:

```text
parse(original)
serialize(no mutations)
parse(serialized)
normalized semantics equal
opaque regions equal
```

When the repository requires byte stability, assert bytes equal. Otherwise snapshot diff and require no unrelated changes.

Mutation matrix:

| Operation        | JSON          | Markdown           | MDX                         |
| ---------------- | ------------- | ------------------ | --------------------------- |
| visible block    | property edit | block source edit  | block source edit           |
| component props  | property edit | n/a                | known JSX attribute rewrite |
| meta scalar      | property edit | frontmatter edit   | frontmatter edit            |
| insert component | array insert  | AST block insert   | known JSX AST insert        |
| reorder          | array move    | block span swap    | block span swap             |
| unknown syntax   | preserve key  | preserve node/span | opaque/read-only            |

## Validation layers

Run all available layers in this order:

1. syntax parse
2. source schema
3. domain invariants such as unique IDs and required tests
4. route/slug collision checks
5. existing curriculum tests
6. production build parsing/rendering

Fast layers run per write. Slow layers run on demand or after idle, with status shown in the drawer.
