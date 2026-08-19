---
name: react-testing-library
description: Guidelines for how to test React components.  Use whenever reading, creating or updating tests for React components. E.g. .jsx or .tsx files.
---

# React testing

Use React testing library (@testing-library/react) when testing React components.

Supplement this with assertions from @testing-library/jest-dom

## Query priorities

Use queries in order of priority (highest to lowest)

Accessible queries

- getByRole (used for most things)
- getByLabelText (used for forms)
- getByPlaceholderText (only if it's impossible to use a label)
- getByText (only if it's impossible to find or add a role)
- getByDisplayValue (used when it's necessary to find a input, textarea or select element with a known value)
  Semantic Queries HTML5 and ARIA compliant selectors.
- getByAltText: (used if the element supports alt text: img, area, input, and any custom element)
- getByTitle: (generally to be avoided)
  Test IDs
- getByTestId: (the user cannot see (or hear) these, so this is only recommended for cases where you can't match by role or text or it doesn't make sense (e.g. the text is dynamic)).

Abridged version of https://testing-library.com/docs/queries/about/#priority

### How to apply query priorities

```tsx
getByRole("button", { name: /submit/i });
```

should be used instead of

```tsx
getByText(/submit/i);
```

since `getByRole` makes sure the element has the expected role and so appears properly in the accessibility tree.

- The same applies to `find` as to `get`. E.g. `findByRole` should be used instead of `findByText`.
- If writing tests first (TDD), write tests with the highest priority query you can. i.e. use `getByRole` if possible and only resort to others if it is not possible to use `getByRole`
- If refactoring existing tests, look for opportunities to replace lower priority tests with higher priority ones. E.g. `getByRole` to replace `getByTestId` if the element has (or can have) an appropriate role.

### Exceptions

If using accessible queries would result in brittle or overly complicated tests, use `getByTestId`.

## Assert on behaviour

Tests should assert that the page behaves correctly, rather than check implementation details. Assertions like `toHaveClass` should be the last resort and only used if there is no other change that can be tested for.

For example, if an action (e.g. click) both shows an element and modifies another element's class then it's enough to assert that the element is shown. In contrast, if the only change is the class modification then
it is fine to test that. In that case the class is a marker showing the button is doing something (i.e. did the button click go through? Yes, it changed a class)

## Assert outcomes, not processes

It's more important to check that the SUT ends up in the right state than it is to interrogate the way it happened. That process may change due to refactoring, but the tests should
not break for pure refactors.

## Use jest-dom matchers

If using a jest-dom matchers would simplify the test code, use them. For example, rather than spying on .focus calls, use `toHaveFocus` to confirm the correct element gets focus.
