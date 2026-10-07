# Page Objects

Page Object Model (POM) is a design pattern that separates page logic from the tests themselves. Each page of the application is represented by its own class that encapsulates selectors and actions.

## Purpose

- Prevents duplication — a selector is defined in one place.
- Tests are more readable; they work with user actions, not CSS selectors.
- When the UI changes, only the page object needs updating, not every test individually.

## Inheritance vs. Composition

Common classes (`Header`, `SiteBarMenu`, `OpenTask`, …) can be brought into a page object in two ways.

### Inheritance — full class chain

Use when a page object needs the majority (~80%) of the functionality from the common chain. The concrete page extends the deepest class it needs; the entire chain above it comes along automatically.

Current chain:

```
BasePage → Headline → ToTopButton → Header → SiteBarMenu → DashboardPage
```

Each class in the chain is a self-contained unit — it defines its own selectors and methods and passes `page` and `path` upward via `super()`. Pages that share the same UI structure (headings, header/app bar, sidebar menu) use this pattern. `OpenTask`, `Footer`, and API access (`support/helper/todo_api.ts`) are deliberately **not** in this chain — see the worked examples below and `api-helper.md`.

Note `Headline` and `Header` are not synonyms here, even though they sound similar: `Headline` is the h1/h2 heading class (what used to be confusingly called `Header`); `Header` is the real `<header>`/`getByRole('banner')` top bar (what used to be called `AppBar`) — see the third worked example below.

```ts
// DashboardPage needs the full stack — extend the deepest class required
export class DashboardPage extends SiteBarMenu {
  // ...
}
```

### Composition — single component

Use when a page object needs only **one** specific component from commons. Pulling in the full inheritance chain just to use one class is unnecessary coupling — instantiate that class as a property instead.

```ts
// Only Header (the top app bar) is needed — compose it as a property, do not extend the full chain
export class SpecialPage extends BasePage {
  private readonly header: Header

  constructor(page: Page) {
    super(page, '/special')
    this.header = new Header(page, '/special')
  }

  async clickLogout() {
    return this.header.clickLogout()
  }
}
```

> **Limitation:** methods on a composed object return that object's `this`, not the outer page's `this`. Fluent chaining does not flow across the boundary without wrapping each delegation method.

### Decision rule

| Situation                                                        | Approach                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Page uses most of the common UI (app bar, sidebar, task list, …) | **Inheritance** — extend the deepest class needed              |
| Page only needs one specific common component                    | **Composition** — instantiate that class as a private property |

### Signal to cut an existing chain

A class already sitting in the middle of the chain can stop belonging there once a new page joins that doesn't need it. If any page that otherwise fits the branch has to skip one of the chain's classes (extend a shallower ancestor instead of the deepest one), that class was never actually shared by every page in the branch — it only looked shared because nothing had challenged it yet. Pull it out into a standalone composed component instead of leaving it stranded mid-chain.

**Worked example:** `NewTaskPage` always had to `extend SiteBarMenu` directly, skipping `OpenTask`, because it has no task list. That asymmetry was the signal that `OpenTask` never belonged in the chain at all — it was only ever used by `DashboardPage`, and later `OpenTasksPage`. Both now hold it as `private readonly openTask: OpenTask` instead of extending it, exactly like `Pagination`. Compare `common/open_task.ts` (composition-ready: no `extends` at all, takes just `page: Page`, no `path`) against `dashboard_page.ts` (composes it, delegates its full public API through thin wrappers so the change is invisible to tests).

**Second worked example:** the old `ApiHelper` sat at the very root of the chain (`ApiHelper → BasePage → ...`), so every single page object inherited HTTP methods via `BasePage` — even `LoginPage`/`LogoutPage`/`NewTaskPage`/`OpenTasksPage`, which never made an API call. The same signal applied: not every page needed it, so it doesn't belong in the chain. It's now `support/helper/todo_api.ts` — plain functions imported directly by only the three places that actually call them (`DashboardPage`, `ClosedTasksPage`, `OpenTask`), per `api-helper.md`. Unlike `OpenTask`/`Pagination`, it isn't even a class — it carries no state tied to a `Page` instance, so a composed object would have been pure ceremony around functions that just need `fetch` and `process.env`.

**Third worked example — when the fix is deletion, not composition:** the old `Header` class (now `Headline`) also held `checkUrl()` and `checkFullPageSnapshot()`. Neither is about headings — they ended up there only because `BasePage` was declared to hold no assertions, so the first generic assertion needed somewhere to go. Checking usage showed `checkUrl` is called on only 4 of 6 page objects (`DashboardPage`, `NewTaskPage`, `LoginPage`, `LogoutPage` — never `OpenTasksPage`/`ClosedTasksPage`) and `checkFullPageSnapshot` on only 2 (`LoginPage`, `LogoutPage`). Unlike `OpenTask`/`todo_api.ts`, these weren't worth composing either — each is a single-line `expect(...)` wrapper, so the fix was to delete them from the shared class and define them directly on the concrete page objects that need them. Composition exists to avoid repeating real logic; a one-line wrapper used by a minority of pages is cheaper duplicated than abstracted.

This is a different call than `Headline`'s own `checkH1`/`checkH2`, which stayed shared: that's genuinely identical logic needed by (or structurally applicable to) every page, so 6 copies of the same few lines would be a real DRY violation, not a defensible one. (`checkH1` already asserts `toHaveCount(1)` as part of its soft-assertions, which is why a separate page-agnostic "exactly one h1" check isn't kept alongside it — every caller passes real text now, see `test-data.md`'s one-file-per-page convention.)

**Fourth worked example — a chain class with no DOM to back it:** `Footer` used to sit in the middle of the trunk (`Headline → Footer → ToTopButton`), so every page inherited it — including the 4 main pages, which have no `<footer>` in their markup at all (checked against the real app: `<footer>` renders only on `login.html`/`logout.html`, zero elsewhere). This is a stronger case than the usual "not every page calls this method" signal — it's not a coverage gap, the element itself doesn't exist, so calling `Footer`'s methods on `DashboardPage` would fail at runtime, not just go untested. Unlike `checkUrl`/`checkFullPageSnapshot`, `Footer`'s methods are real logic (several locators, two methods), not a one-line wrapper, so the fix was composition, not duplication: `Footer` became a standalone class (no `extends`, just `page: Page`, same shape as `OpenTask`). `ToTopButton` now extends `Headline` directly, skipping the gap `Footer` left behind.

Only `LoginPage` actually composes it (`private readonly footer: Footer`) — `logout.html` also renders a `<footer>`, but nothing in `logout_page.spec.ts` currently exercises it, so `LogoutPage` doesn't compose `Footer` either. This is the same judgment call as everywhere else in this file: compose where a test actually needs it, not where the DOM merely allows it. Add it to `LogoutPage` the same way the moment a test needs it.

This cuts both ways: when adding a **new** page, check whether it needs everything the deepest class in its branch offers before extending it (same check as the Decision rule above); when an **existing** chain grows a sibling that doesn't need one of its classes, that's the moment to revisit whether that class should still be there.

## How to create a new page object

1. Decide whether to use inheritance or composition (see above).
2. Define selectors as private/protected class properties.
3. Each public method corresponds to a single user action or assertion.
4. Page objects do not contain test logic (`test`, `expect` belong in tests).

## Constructor contents

A constructor cannot be `async`, so anything that touches the page or network cannot be awaited there — it would either throw or fire uncontrolled in the background, invisible to whoever reads the test. A constructor may only **assign values**, never **perform actions**.

**Allowed** — plain, synchronous assignment:

```ts
constructor(page: Page) {
  this.signInButton = page.getByRole('button', { name: 'Sign In' }) // locator
  this.visibleOpacity = '1'                                          // constant used later by an assertion
  this.taskName = `Test - ${dayjs().format('DD.MM.YYYY - HH:mm:ss.SSS')}` // computed value, still synchronous
}
```

This includes literals an assertion will compare against later (`expect(x).toHaveCount(0)`, `expect(y).toHaveText('Sign in')`) — a `0` or a piece of expected text is data, not an action. Name it as a constructor-assigned property the same way selectors are named (see `Rules` below), instead of leaving it as a magic literal inline inside the method.

**Not allowed** — anything that is really a setup step hiding where a test can't see it:

- Calling a method that performs a browser action (`goto`, `click`, `fill`) or an API request.
- Any `await`.

That kind of setup belongs in a fixture (see [fixtures.md](fixtures.md)), which runs visibly before the test body and tears down after it — not in the constructor of the page object it hands to the test.

## Assertions and interactions

Assertions and element interactions inside page objects use `expect` and `expect.soft` directly, imported from `@playwright/test`. See [custom-actions.md](custom-actions.md) for when to use each.

## Selectors: semantic locators first, CSS/ID as fallback

Prefer Playwright's built-in semantic locators — `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText` — over raw CSS/ID selectors. They target the same accessible role/name/label a user or assistive technology would use, so they read like the user action they represent and keep working across markup/class refactors:

```ts
// preferred — targets the accessible role + name, not an implementation detail
private readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign In' })
private readonly userName: Locator = this.page.getByLabel('Username')
```

Before falling back to CSS/ID, check whether the underlying HTML tag already carries an
implicit ARIA role — semantic HTML5 elements (`<aside>`, `<nav>`, `<main>`, `<header>`,
`<footer>`, `<form>`) get one for free, even with no explicit `role="..."` in the markup.
Check the real markup (sibling repo) rather than assuming — a container that looks like a
plain `<div>` may already be semantic:

```ts
// <aside id="sidebar"> is implicitly role="complementary" — no CSS/ID needed
private readonly sidebar: Locator = this.page.getByRole('complementary')
```

Fall back to a CSS/ID `Locator` only when the element genuinely has no accessible role, name, or label of its own (a plain `<div>`/`<span>` with no semantic tag) **and** it is not itself the target of a user action or assertion — typically a structural container used purely to scope a further semantic query:

```ts
// acceptable — #open-list is a plain <div>, no role; it only scopes the getByRole/getByText calls below it
private readonly openList: Locator = this.page.locator('#open-list')
```

A plain `string` selector property (instead of a resolved `Locator`) is only needed when a subclass must reference or override the raw selector itself; otherwise resolve straight to a `Locator` in the constructor. Use `protected` on such a `string` only when a subclass needs it. Default to `private readonly` for `Locator` properties — they are never inherited.

## Rules

- Selectors — and any other magic literal used inside an assertion (expected counts, text, CSS values) — are not scattered across methods; they are named class properties assigned in the constructor.
- One method = one user action or assertion.
- A new page object inherits from the closest existing class with shared functionality.
- Test logic does not belong in page objects.
