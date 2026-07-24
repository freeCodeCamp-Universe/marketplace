---
name: astro
description: Guidelines for working on Astro projects. Use whenever you detect an Astro project e.g. the project contains one or more .astro files or has astro as a dependency.
---

# Astro Guidelines

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
