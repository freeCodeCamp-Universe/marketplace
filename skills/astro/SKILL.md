---
name: astro
description: Guidelines for working on Astro projects. Use whenever you detect an Astro project e.g. the project contains one or more .astro files or has astro as a dependency. Use whenever adding a feature using Astro or .astro files. Use whenever you are refactoring .astro files.
---

# Astro Guidelines

## Terminology

### .astro files

Everything at the top of the file, between `---` markers, is the Component Script. Everything else is the Component Template.

Everything in the Component Script is computed on the server and does not leave it unless it is referenced by the Component Template. Everything in the Component Template is computed
on the server, with the exception that `<script>` elements are evaluated client-side. `{}` blocks are evaluated on the server and used to render the template.

## Minimal props

Components should specify a minimal `Props` interface that contains just the data a component needs. Do not anticipate future needs, if the component does not currently use a property it should not be in the `Props`.

Any data passed into the component should not include properties that are not specified in the `Props`. Extra fields should be stripped out, otherwise they will end up in the production html.

### Example

If a `Button` component has

```ts
interface Props {
  user: { name: string };
}
```

and the parent has the following data

```ts
const aUser = {
  name: "Any Thing",
  id: "123abc",
};
```

strip the 'id' in the component script first, so you have

```ts
const propUser = {
  name: "Any Thing",
};
```

and only use `propUser` in the template

```astro
---
import Button from './Button.astro';
const propUser = {
  name: 'Any Thing',
}
---
<Button user={propUser} />
```

## Avoid null returns

If using both @astro/react and @astro/mdx, components rendered with client:\* directive should not return `null`. If they do, they will trigger a spurious "Invalid hook call." warning.
To avoid this, return `<></>` (i.e. an empty fragment) instead of `null`.

## Fonts

Do not use `@import url(...)` or `@font-face{}` to add fonts to style sheets. Instead use Astro's `fontProviders` which will optimize font loading. [Guide](https://docs.astro.build/en/guides/fonts/#applying-custom-fonts).

## Prefer .astro components

Even if the application supports other UI frameworks (React, Vue etc.), use them sparingly. If a component does not need interactivity, use a .astro component instead.
This makes it clear that hydration is not possible and gives access to powerful .astro specific features like script directives and build time javascript execution.

When creating new components, only use a UI framework component if either of the following is true. The component is inherently interactive or it needs to be imported by a
UI framework component. If the static component can be passed into the UI component via a `<slot>`, then the static component should come from a .astro file.

## Compute data on the server

`<script>` elements inside the Component Template should only contain code that cannot be evaluated in the server (for example, if code needs access to localStorage). If some data
can be computed on the server, it should be. Look at what data is available to the server, look at how it is used in the Template and separate out data that can be derived purely from
data that's on the server.

Example, BAD:

```astro
---
const bookData = ...

const { author } = Astro.props;
---
<script>
  const authorsBooks = bookData.find(b => b.author == author)
  // reads localStorage and does something with authorsBooks
</script>

```

there's no reason to make the client find this author's books, that should be computed by the server.

GOOD:

```astro
---
const bookData = ...

const { author } = Astro.props;
authorsBooks = bookData.find(b => b.author == author)
---

<script>
  // reads localStorage and does something with authorsBooks
</script>
```

_NOTE_ any JavaScript or TypeScript that is outside of a script tag is already being computed on the server and does not need to be pulled into the Component Script. It can be done
if it improves the code, but is not necessary from a performance perspective. For example

GOOD:

```astro
---
const bookData = ...

const { author } = Astro.props;
---
{ authorsBooks = bookData.find(b => b.author == author);
  // does something with authorsBooks
}
```

is perfectly fine, since no JS will reach the client.

### Gotchas

- scripts may seem not to be using server data if they're querying the DOM. However, the DOM may be a function of the server data so it is important to trace the logic through to see how the server data was used.
