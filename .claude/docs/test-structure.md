# Test structure (spec files)

## Template

```typescript
import { test, expect } from '../support/fixture'
import { dashboardPageData } from '../support/test-data/dashboard_page_data'

test.describe('Test Dashboard page', () => {
  test.describe('Atomic Tests For Header', () => {
    test('Check H1 On Page Dashboard', async ({ dashboardPage }) => {
      await dashboardPage.checkH1(dashboardPageData.h1)
    })

    test('Check Submit Button Visibility', async ({ dashboardPage }) => {
      await dashboardPage.checkSubmitButtonVisible()
    })
  })

  test.describe('E2E Test For Dashboard', () => {
    test('Full User Flow', async ({ dashboardPage }) => {
      await test.step('Step one description', async () => {
        await dashboardPage.doStep1()
      })

      await test.step('Step two description', async () => {
        await dashboardPage.doStep2()
        await dashboardPage.checkResult()
      })
    })
  })
})
```

## `test.step` in E2E tests

Use `test.step` in every E2E test that has more than one logical phase. Each step has a short label describing what happens in that phase — this label appears in the Playwright report and makes failures easy to locate.

```ts
test('Toggle Task Between Open And Finish Sections', async ({ dashboardPage }) => {
  await test.step('Task is in open section', async () => {
    await dashboardPage.checkTaskInOpenSection(taskName)
  })

  await test.step('Toggle to finished', async () => {
    await dashboardPage.toggleTask(taskName)
    await dashboardPage.checkTaskInFinishSection(taskName)
  })

  await test.step('Toggle back to open', async () => {
    await dashboardPage.toggleTask(taskName)
    await dashboardPage.checkTaskInOpenSection(taskName)
  })
})
```

When a step returns a page object that the next step needs, return the value from the `test.step` callback:

```ts
test('Full Application Flow', async ({ loginPage }) => {
  const dashboardPage = await test.step('Login', async () => {
    return loginPage.login(username, password)
  })

  await test.step('Verify dashboard', async () => {
    await dashboardPage.checkDashboardUrl()
  })

  const { taskName, dashboardAfterCreate } = await test.step('Create new task', async () => {
    const newTaskPage = await dashboardPage.clickButtonNewTask()
    await newTaskPage.fillTaskTitle()
    const dashboardAfterCreate = await newTaskPage.clickCreateTaskButton()
    return { taskName: newTaskPage.taskName, dashboardAfterCreate }
  })
})
```

Do not use `test.step` in atomic tests or in simple E2E tests that perform a single action and check a single result — one-liners don't need wrapping.

## Rules

- Always import from `'../support/fixture'`, never directly from `'@playwright/test'`.
- Import `expect` from `'../support/fixture'` as well.

### Describe block structure

| Level          | Format                         | Example                     |
| -------------- | ------------------------------ | --------------------------- |
| Outer          | `'Test [Name] page'`           | `'Test Login page'`         |
| Inner — atomic | `'Atomic Tests For [Section]'` | `'Atomic Tests For Footer'` |
| Inner — E2E    | `'E2E Test For [Page]'`        | `'E2E Test For Login Page'` |

There is exactly **one** outer `'Test [Name] page'` block per spec file. Everything else nests inside it.

**Inner blocks repeat, one per logical section or scenario** — a page with several distinct
sections (a form, a footer, a widget) gets one `'Atomic Tests For [Section]'` block per
section, not one block for the whole page. The same applies to E2E: a page with several
distinct flows (toggle a task, run the calculator, handle a backend outage) gets one
`'E2E Test For [Scenario]'` block per flow, not one catch-all block. See
`dashboard_page.spec.ts` for an example with many of each.

**Order, when more than one kind is present:** atomic blocks first, then E2E blocks, then
`'Visual Tests For [Page]'` last (see `data-driven-tests.md` — visual tests are themselves a
data-driven loop over theme cases). Not every page has visual tests yet; add the block when
the page gets its own `toHaveScreenshot` coverage, not before.

**Blocks that don't follow the `'Atomic...'`/`'E2E...'` naming** are also valid, for a
specific documented reason — they're not a third category of their own:

- A data-driven block wrapping a `.forEach()` loop, named after what it's looping over (e.g.
  `'Login Page - Negative Scenarios'`) — see `data-driven-tests.md`. This is the lighter of
  the two exceptions: the `.forEach()` generates the blocks for you, so it doesn't add real
  nesting depth to reason about.
- A `test.describe.serial(...)` wrapper grouping several `'Atomic Tests For...'` blocks that
  race against the same shared backend state (e.g. `'Serial Tests For Pulse And Upcoming
Widgets'`, itself containing multiple `'Atomic Tests For...'` blocks — three levels deep) —
  see `serial-execution.md`. This is the heavier exception: real, manually-written nesting,
  justified only by the specific race condition it prevents.

**Default to two levels of nesting** (outer page block + `'Atomic...'`/`'E2E...'`/`'Visual
Tests...'` blocks side by side). Reach for the `serial` exception only after you've actually
reproduced a race (see `serial-execution.md`'s rule on this) — don't nest pre-emptively. In
this project's current test suite, only one file (`dashboard_page.spec.ts`) goes three levels
deep, and only for that one justified reason.

**More than 3 `test(...)` calls in one logical section → wrap them in their own named
sub-describe**, nested inside that section's `'Atomic...'`/`'E2E...'`/scenario block. This
applies across every kind of block — atomic, E2E, and data-driven scenario groups alike — not
just one category. The point is purely visual separation and findability once a section grows
past a handful of tests; a `.forEach()`-generated group of tests counts the same as hand-written
ones for this threshold. Name each sub-describe after what it groups (e.g. `'Header'`, `'Form
Controls'`, `'Stays On Page'`, `'Shows Error Message'`, `'Error Recovery'`) — see
`login_page.spec.ts` for a worked example with three such splits. A section with 3 or fewer
tests stays flat; don't split pre-emptively.

**Hooks (`beforeEach`/`afterEach`) go inside whichever describe block actually needs them**,
as the first thing in that block, before any `test(...)` calls — not in the outermost block
by default. If every inner block in the file needs the same setup, put the hook directly
under the outer `'Test [Name] page'` block instead of repeating it in each inner block (see
`closed_tasks_page.spec.ts`); if only one inner block needs it, scope the hook to that block
alone (see the pagination-only `beforeEach` in `open_tasks_page.spec.ts`).

### Test naming

- Starts with a capital letter.
- Describes WHAT is being tested, not how.
- Examples: `'Check H1 On Page Login'`, `'Show And Hide Password'`, `'Login With Correct Credentials'`

### Direct `expect` in a spec file

Use `expect` directly in a spec file only when a page object method is not sufficient:

```typescript
// ok — count cannot be easily encapsulated
await expect(loginPage.contactIcons).toHaveCount(3)
```

All other assertions belong inside page object methods.
