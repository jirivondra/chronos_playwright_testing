# Assertions in Page Objects

Page objects use Playwright's `expect` and `expect.soft` directly, imported from `@playwright/test`. Both are called inside page object methods — never on inline selectors.

## `expect.soft` — non-blocking assertions

`expect.soft` is used for groups of related assertions. All assertions in the group run even if one fails — the test is marked as failed at the end, not at the first failure.

Use `expect.soft` when checking multiple properties of the same element or component together:

```ts
async checkH1(text: string): Promise<this> {
  await expect.soft(this.h1).toBeVisible()
  await expect.soft(this.h1).toHaveCount(1)
  await expect.soft(this.h1).toHaveText(text)
  return this
}
```

```ts
async checkLogoExpandedVisible(): Promise<this> {
  await expect.soft(this.logoTitle).toBeVisible()
  await expect.soft(this.logoTitle).toHaveText(this.logoTitleText)
  await expect.soft(this.logoSubtitle).toBeVisible()
  await expect.soft(this.logoSubtitle).toHaveText(this.logoSubtitleText)
  return this
}
```

## `expect` — blocking assertions

`expect` is used for single, critical assertions where failure should stop the test immediately. Also used for network/request assertions.

```ts
async checkNewTaskButtonIsVisible(): Promise<this> {
  await expect(this.newTaskButton).toBeVisible()
  return this
}

async checkCreateTaskPostRequest(): Promise<this> {
  const requestPromise = this.page.waitForRequest(/api\/tasks/)
  await this.createTaskButton.click()
  const request = await requestPromise
  expect(request.method()).toBe('POST')
  return this
}
```

## Decision guide

| Situation                                                | Use                                         |
| -------------------------------------------------------- | ------------------------------------------- |
| Multiple properties of the same element or component     | `expect.soft` — report all failures at once |
| Single assertion, or a prerequisite before the next step | `expect` — stop immediately on failure      |
| Network request method or URL check                      | `expect` — single check                     |

## Composing methods: a hard `expect` inside one stops the whole composition

When a method calls other page-object methods in sequence, a hard `expect` failure inside
any of them throws immediately and aborts the rest of the sequence — including later calls
that only contain `expect.soft` assertions. The "see every failure at once" benefit of
`expect.soft` only holds for the composed method as a whole if nothing in the chain uses a
blocking `expect`.

```ts
// SiteBarMenu.checkOpenAndCloseSiteMenu — composes several smaller check methods
async checkOpenAndCloseSiteMenu(): Promise<this> {
  await this.checkVisibilityForOpenMenu()  // expect — genuine precondition, stop here if it fails
  await this.checkLogoExpandedVisible()    // expect.soft internally
  await this.checkVersionOfAppIsVisible()  // expect.soft internally — NOT a precondition
  await this.checkNavExpandedVisible()     // expect.soft internally
  ...
}
```

Before picking `expect` vs `expect.soft` inside a small method, check whether it's ever
called from a larger composed one:

- If the method is only ever called standalone (never composed) — follow the normal
  decision guide above. See `Header.checkOnlyOneH1`: single assertion, called directly from
  3 tests, never composed into another page-object method — correctly a blocking `expect`.
- If the method is composed into a larger flow alongside `expect.soft`-based methods, ask
  whether its failure is a genuine **prerequisite** for the rest of the flow to mean anything
  (`checkVisibilityForOpenMenu` — if the toggle button isn't there, nothing else about the
  menu is worth checking) — keep it blocking. If it's just one more property check at the
  same level as its soft neighbors (`checkVersionOfAppIsVisible` sitting next to
  `checkLogoExpandedVisible`/`checkNavExpandedVisible`), make it `expect.soft` too, so a
  failure there doesn't hide failures in the rest of the composed flow.

## `expect` in test files

Use `expect` directly in a test file only when a page object method is not sufficient — typically for count or attribute checks on a public locator:

```ts
// ok — count cannot be easily encapsulated
await expect(loginPage.contactIcons).toHaveCount(3)
```

All other assertions belong inside page object methods.
