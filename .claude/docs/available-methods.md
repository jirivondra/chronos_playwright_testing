# Available Methods Reference

Complete reference of all page objects, their public locators, and public methods. Use this to know what is callable in tests without reading the source files.

## Inheritance chains

Two chains exist in this project:

```
BasePage → Headline → ToTopButton → Header → SiteBarMenu → DashboardPage
                                                             ├─ NewTaskPage
                                                             ├─ OpenTasksPage
                                                             └─ ClosedTasksPage

BasePage → Headline → ToTopButton → LoginPage
                                    └─ LogoutPage
```

`Headline` and `Header` are not synonyms: `Headline` holds the `h1`/`h2` heading locators and checks (used to be called `Header`, renamed because it had nothing to do with the HTML `<header>` element). `Header` is the real `<header>`/`getByRole('banner')` top bar (used to be called `AppBar`, renamed to match what it actually wraps).

`DashboardPage`, `NewTaskPage`, `OpenTasksPage`, and `ClosedTasksPage` all extend `SiteBarMenu` directly — every method from `BasePage` through `SiteBarMenu` is available on all four.
`LoginPage` and `LogoutPage` skip `Header` and `SiteBarMenu`.

`ActionTask` and `Footer` are **not** in this chain — both are composed components (see their own sections below). `DashboardPage` and `OpenTasksPage` each hold a private `ActionTask` instance and expose its methods through thin delegation wrappers; `NewTaskPage` and `ClosedTasksPage` don't need it and don't compose it. `LoginPage` holds a private `Footer` instance the same way — the app renders `<footer>` only on `login.html`/`logout.html`, but only `login_page.spec.ts` actually tests it today, so `LogoutPage` doesn't compose `Footer` yet (add it there the same way once a test needs it). This is the same composition pattern as `Pagination`: each of these is only relevant to the pages that actually exercise that piece of UI — unlike `Headline`/`ToTopButton`/`Header`/`SiteBarMenu`, which every page needs (or, for `Header`/`SiteBarMenu`, at least the 4 main ones).

API access is likewise **not** in the chain — see `support/helper/todo_api.ts` and `api-helper.md` below. `DashboardPage`, `ClosedTasksPage`, and `ActionTask` import its functions directly; `LoginPage`, `LogoutPage`, `NewTaskPage`, and `OpenTasksPage` never call it.

`checkUrl()` and `checkFullPageSnapshot()` are **not** in the chain either, for a different reason than `ActionTask`/API access: both are single-line wrappers (`expect(this.page).toHaveURL(...)`, `expect(this.page).toHaveScreenshot(...)`) used by only some pages (`checkUrl`: `DashboardPage`, `NewTaskPage`, `LoginPage`, `LogoutPage`; `checkFullPageSnapshot`: `LoginPage`, `LogoutPage` only) — too thin to be worth composing, so each is defined directly on the concrete page object that needs it. See `page-objects.md`'s third worked example.

---

## BasePage

Adds browser `page` instance and navigation. No assertion or interaction methods — those belong in subclasses.

| Method           | Signature                           | Description                                                 |
| ---------------- | ----------------------------------- | ----------------------------------------------------------- |
| `goto`           | `(params?: string) → Promise<this>` | Navigates to the page's path (optionally with query params) |
| `injectTheme`    | `(value: ThemeValue) → Promise<this>` | Sets `localStorage.theme` via `page.addInitScript`, before the page's own scripts run — called by every fixture in `auth-fixtures.ts` before `goto()` |
| `clearCache`     | `() → Promise<this>`                | Clears cookies, localStorage, sessionStorage                |
| `scrollToBottom` | `() → Promise<this>`                | Scrolls to bottom of page                                   |

`injectTheme` lives here rather than in a composed component because every single fixture needs it (`loginPage`, `dashboardPage`, `openTasksPage`, `closedTasksPage`, `logoutPage` — no exceptions), unlike `ActionTask`/`Footer`/`Pagination`, which only some pages need. It used to be an identical `page.addInitScript(...)` block duplicated in every fixture — that duplication is what let the `openTasksPage` fixture silently typo its auth-token storage key once, undetected, since every fixture had its own copy to get wrong independently.

---

## Headline

First class in the chain that adds assertion methods. Adds `h1`/`h2` locators and heading checks — nothing to do with the HTML `<header>` element (see `Header` below for that).

**Public locators** (usable directly with `expect()` in tests):

| Locator | Type      | Description          |
| ------- | --------- | -------------------- |
| `h1`    | `Locator` | First-level heading  |
| `h2`    | `Locator` | Second-level heading |

**Methods:**

| Method    | Signature                        | Description                                   |
| --------- | -------------------------------- | --------------------------------------------- |
| `checkH1` | `(text: string) → Promise<this>` | Soft-asserts h1 is visible, count=1, has text |
| `checkH2` | `(text: string) → Promise<this>` | Soft-asserts h2 is visible and has text       |

---

## ToTopButton

Adds back-to-top button assertions and interaction. The button fades via CSS `opacity`
alone — Playwright's `toBeVisible()` doesn't key off `opacity` (only an empty bounding box
or `visibility:hidden`), so both checks currently use the same `toBeVisible()` logic and
can't yet reliably tell the fade states apart. The two "ToTop Button Full Flow" tests
(`login_page.spec.ts`, `logout_page.spec.ts`) are `test.fixme()`'d until the app also
toggles the `hidden` attribute once the fade-out finishes.

| Method                       | Signature            | Description                       |
| ---------------------------- | -------------------- | --------------------------------- |
| `checkToTopButtonVisible`    | `() → Promise<this>` | Asserts the button is visible     |
| `checkToTopButtonNotVisible` | `() → Promise<this>` | Asserts the button is not visible |
| `clickToTopButton`           | `() → Promise<this>` | Clicks the back-to-top button     |

---

## Header

The real `<header>`/`getByRole('banner')` top bar (used to be called `AppBar`). Adds top navigation bar with logout action.

| Method                   | Signature                        | Description                                                                                                                                                                                     |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickLogout`            | `() → Promise<LogoutPage>`       | Clicks logout link — returns `LogoutPage` (chain ends)                                                                                                                                          |
| `checkTopHeaderSnapshot` | `(name: string) → Promise<this>` | Scoped screenshot of the top `<header>` (`getByRole('banner')`), masking `.mech-clock` (live, updates every second) and `#theme-toggle` (its icon reflects the current theme/system preference) |

The app also has a real interactive theme-toggle widget (`#theme-toggle`: trigger button + panel with light/dark/system buttons identified by `data-theme-choice`) — currently only referenced above as a mask target. It exists on exactly the same pages that have `Header` at all (confirmed against the real markup: present on every page with a `<header>`, absent on `login.html`/`logout.html`), with no asymmetry — so unlike `ActionTask`/`Footer`/`Pagination` (which exist because only *some* pages need them), this one has no "signal to cut" and belongs directly on `Header` once a test needs to interact with it, not as a separate composed class. (The pre-load `injectTheme` on `BasePage` is a different concern — it sets the *initial* theme before any script runs, including on `LoginPage`/`LogoutPage`, which have no `Header` at all.)

---

## SiteBarMenu

Adds sidebar menu with logo, navigation links, and app version. The sidebar itself is `page.getByRole('complementary')` — the `<aside id="sidebar">` element carries that role implicitly, no CSS/ID fallback needed. All logo/nav locators are scoped to it — necessary because `OpenTasksPage`/`ClosedTasksPage` render a breadcrumb with its own "Dashboard"-named link, which would otherwise collide with `navDashboardLink` if left unscoped to the whole page.

The sidebar logo ("Chronos") used to be rendered as an `<h1>`, duplicating a page's own content heading — the app fixed this by demoting the logo to a `<p>` (not by changing the page's own heading), so `logoTitle` now matches it by text instead of by heading role. `Headline.checkH1` would otherwise fail its `toHaveCount(1)` assertion.

| Method                          | Signature                        | Description                                                                                                                                                                                                                                                                                      |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `checkMenuExpandedOnLoad`       | `() → Promise<this>`             | Asserts menu is in expanded state on load: open button visible, logo and nav labels visible                                                                                                                                                                                                      |
| `checkVisibilityForOpenMenu`    | `() → Promise<this>`             | Asserts open-menu button is visible                                                                                                                                                                                                                                                              |
| `checkVisibilityForCloseMenu`   | `() → Promise<this>`             | Asserts open-menu button is not visible                                                                                                                                                                                                                                                          |
| `clickMenuButton`               | `() → Promise<this>`             | Clicks the open-menu button, toggling expanded/collapsed state                                                                                                                                                                                                                                   |
| `checkOpenAndCloseSiteMenu`     | `() → Promise<this>`             | Full open/close cycle: checks expanded state, collapses, checks collapsed state, expands again                                                                                                                                                                                                   |
| `checkVersionTitle`             | `() → Promise<this>`             | Soft-asserts "App version" label is visible with correct text                                                                                                                                                                                                                                    |
| `checkVersionOfAppIsVisible`    | `() → Promise<this>`             | Asserts app version element is visible                                                                                                                                                                                                                                                           |
| `checkVersionOfAppIsNotVisible` | `() → Promise<this>`             | Asserts app version element is not visible                                                                                                                                                                                                                                                       |
| `checkLogoImageVisible`         | `() → Promise<this>`             | Asserts sidebar logo image is visible                                                                                                                                                                                                                                                            |
| `checkLogoExpandedVisible`      | `() → Promise<this>`             | Soft-asserts logo title ("Chronos") and subtitle ("Personal Space") are visible with correct text                                                                                                                                                                                                |
| `checkLogoCollapsedHidden`      | `() → Promise<this>`             | Soft-asserts logo title and subtitle are not visible                                                                                                                                                                                                                                             |
| `checkNavExpandedVisible`       | `() → Promise<this>`             | Soft-asserts all 4 nav icons and labels are visible (Dashboard, Open Tasks, Closed Tasks, Calendar)                                                                                                                                                                                              |
| `checkNavCollapsedVisible`      | `() → Promise<this>`             | Soft-asserts all 4 nav icons visible but labels not visible                                                                                                                                                                                                                                      |
| `checkSidebarSnapshot`          | `(name: string) → Promise<this>` | Scoped screenshot of `#sidebar`, masking `#app-version` (changes per app release). Available on every page via inheritance; baseline also captures which nav link is highlighted active for the current page, so give each page its own snapshot name (e.g. `closed-tasks-sidebar-${theme}.png`) |

---

## ActionTask

**Not part of the inheritance chain** — a standalone component (`support/page-objects/common/action_task.ts`), constructed with only `(page: Page)`, not extending anything. Adds open task list, expand button, and API-based task utilities (via `getTodos`/`deleteTodo` imported from `support/helper/todo_api.ts`). Used via **composition**: `DashboardPage` and `OpenTasksPage` each hold `private readonly actionTask: ActionTask` and re-expose its methods through delegation wrappers that return their own `this` — see `page-objects.md` for the pattern.

**Public locators:**

| Locator                | Type      | Description                                          |
| ---------------------- | --------- | ---------------------------------------------------- |
| `openListEmptyMessage` | `Locator` | "No open tasks. Create one with + New Task." message |
| `expandOpenListButton` | `Locator` | "Show all" expand button in the open list            |

**Methods:**

| Method                                       | Signature                            | Description                                                                                             |
| -------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `clickExpandButton`                          | `() → Promise<this>`                 | Clicks the expand open list button                                                                      |
| `countOpenTasks`                             | `() → Promise<number>`               | Fetches `/todos` via API and returns count of non-completed tasks                                       |
| `checkExpandButtonVisible`                   | `() → Promise<this>`                 | Asserts expand button is visible                                                                        |
| `checkExpandButtonNotVisible`                | `() → Promise<this>`                 | Asserts expand button is not visible                                                                    |
| `checkEmptyOpenSection`                      | `() → Promise<this>`                 | Soft-asserts empty message is visible with correct text                                                 |
| `deleteTaskByTitle`                          | `(title: string) → Promise<void>`    | Deletes all tasks with matching title via API — used for teardown                                       |
| `checkTaskInOpenSection`                     | `(taskName: string) → Promise<this>` | Asserts task heading is visible in open list                                                            |
| `checkTaskHasEditAndDeleteButtons`           | `(taskName: string) → Promise<this>` | Soft-asserts edit and delete buttons are visible for the task                                           |
| `checkAllTasksInOpenSectionMarkedIncomplete` | `() → Promise<this>`                 | Soft-asserts every visible task in the open list has an unchecked checkbox and non-struck-through title |
| `checkItemCountOnPage`                       | `(expected: number) → Promise<this>` | Asserts the open list currently renders exactly `expected` task cards                                   |

---

## Pagination

**Not part of either inheritance chain** — a standalone component (`support/page-objects/common/pagination.ts`), constructed with only `(page: Page)`, no `path`. It carries no `BasePage` behaviour (no `goto`, no API calls) because it never navigates anywhere on its own — it only operates on the `#pagination` control already present within whichever page embeds it. Use it via **composition**: instantiate it as a private property on a page object (see `page-objects.md`), not by extending it.

Composed into `OpenTasksPage` and `ClosedTasksPage` — the only two pages that render `#pagination` (`open-tasks.html` and `finished-tasks.html`).

| Method             | Signature                              | Description                                                                                                                                                                                                                                    |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isVisible`        | `() → Promise<boolean>`                | Returns whether the pagination control is rendered — use for `test.skip()` conditions                                                                                                                                                          |
| `checkVisible`     | `() → Promise<this>`                   | Asserts the pagination control is visible                                                                                                                                                                                                      |
| `checkNotVisible`  | `() → Promise<this>`                   | Asserts the pagination control is not visible                                                                                                                                                                                                  |
| `hasNextPage`      | `() → Promise<boolean>`                | Returns whether a clickable "next" arrow is present (false on the last page)                                                                                                                                                                   |
| `hasPreviousPage`  | `() → Promise<boolean>`                | Returns whether a clickable "previous" arrow is present (false on the first page)                                                                                                                                                              |
| `getTotalPages`    | `() → Promise<number>`                 | Reads the highest page number currently rendered among the numbered page buttons                                                                                                                                                               |
| `getCurrentPage`   | `() → Promise<number>`                 | Reads the number of the currently active page button                                                                                                                                                                                           |
| `goToPage`         | `(pageNumber: number) → Promise<this>` | Walks to the given page by clicking "next"/"previous" repeatedly until it's current — the app only renders page-number buttons near the current and last page (ellipsis-compacted), so arbitrary page numbers are often not directly clickable |
| `goToNextPage`     | `() → Promise<this>`                   | Clicks the "next" arrow                                                                                                                                                                                                                        |
| `goToPreviousPage` | `() → Promise<this>`                   | Clicks the "previous" arrow                                                                                                                                                                                                                    |
| `checkCurrentPage` | `(pageNumber: number) → Promise<this>` | Asserts the active page button shows the given page number                                                                                                                                                                                     |

---

## todo_api (API helper)

**Not a class, not in any inheritance chain or composition** — plain exported functions in `support/helper/todo_api.ts`. No Playwright dependency. Imported directly by whichever page object needs them: `DashboardPage`, `ClosedTasksPage`, and the composed `ActionTask`. `LoginPage`, `LogoutPage`, `NewTaskPage`, and `OpenTasksPage` never import it. See `api-helper.md` for the full writeup.

| Function     | Signature                                                                               | Description          |
| ------------ | --------------------------------------------------------------------------------------- | -------------------- |
| `getTodos`   | `(order?: 'asc'\|'desc') → Promise<Response>`                                           | Fetches all todos    |
| `createTodo` | `(body: { title: string; due_date?: string; completed?: boolean }) → Promise<Response>` | Creates a todo       |
| `deleteTodo` | `(id: number) → Promise<Response>`                                                      | Deletes a todo by id |

All three return the native `fetch` `Response`; auth header and `Content-Type` are built from env vars inside the module on every call.

---

## Footer

**Not part of either inheritance chain** — a standalone component (`support/page-objects/common/footer.ts`), constructed with only `(page: Page)`, no `path`, no `extends`. The app renders a `<footer>` only on `login.html`/`logout.html`, nowhere else — but today only `LoginPage` composes it, since only `login_page.spec.ts` tests it; compose it into `LogoutPage` the same way if a test ever needs it there.

**Public locators:**

| Locator         | Type      | Description                          |
| --------------- | --------- | ------------------------------------ |
| `footerHeading` | `Locator` | "Connect with me" text in footer     |
| `contactIcons`  | `Locator` | All `<a aria-label>` links in footer |

**Methods:**

| Method                 | Signature                         | Description                                                    |
| ---------------------- | --------------------------------- | -------------------------------------------------------------- |
| `contactIconByLabel`   | `(label: string) → Locator`       | Returns the contact icon link matching a specific `aria-label` |
| `checkHeadingVisible`  | `() → Promise<this>`              | Asserts footer heading is visible                              |
| `checkContactIconLink` | `(label: string) → Promise<this>` | Asserts the contact icon with given `aria-label` is visible    |

---

## DashboardPage

**Fixture:** `dashboardPage` (authenticated), `unAuthDashboardPage` (no auth)
**Path:** `/dashboard.html`
**Extends:** `SiteBarMenu` — has all methods from `BasePage` through `SiteBarMenu`. **Composes:** `ActionTask` (see that section above) — `DashboardPage` re-exposes all of its methods and its two public locators directly, so calling them looks identical to inheritance.

**Public locators:**

| Locator                | Type      | Description                                  |
| ---------------------- | --------- | -------------------------------------------- |
| `newTaskButton`        | `Locator` | "New Task" button (`#new-task-btn`)          |
| `pulseHeading`         | `Locator` | "Today's Pulse" heading                      |
| `upcomingHeading`      | `Locator` | "Upcoming" heading                           |
| `openListEmptyMessage` | `Locator` | Delegated from `ActionTask` — see that section |
| `expandOpenListButton` | `Locator` | Delegated from `ActionTask` — see that section |

**Own methods:**

| Method                                       | Signature                                                               | Description                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `checkUrl`                                   | `(url: string) → Promise<this>`                                         | Asserts current URL equals `url`. Own method, not inherited — see `page-objects.md`'s third worked example |
| `checkNewTaskButtonIsVisible`                | `() → Promise<this>`                                                    | Asserts new task button is visible                                                                         |
| `simulateBackendUnreachable`                 | `() → Promise<this>`                                                    | Aborts requests to `/todos` so the page behaves as if the backend were down                                |
| `checkBackendUnreachableScreen`              | `() → Promise<this>`                                                    | Soft-asserts the "518 Can't Reach the Server" screen (`#be-down`) and its retry button are visible         |
| `toggleTask`                                 | `(taskName: string) → Promise<this>`                                    | Clicks the task checkbox and waits for `/todos` API response                                               |
| `checkTaskInFinishSection`                   | `(taskName: string) → Promise<this>`                                    | Asserts task heading is visible in done list                                                               |
| `checkTaskMarkedComplete`                    | `(taskName: string) → Promise<this>`                                    | Soft-asserts the task's checkbox is checked and its title is struck through                                |
| `checkTaskMarkedIncomplete`                  | `(taskName: string) → Promise<this>`                                    | Soft-asserts the task's checkbox is unchecked and its title is not struck through                          |
| `checkAllTasksInFinishSectionMarkedComplete` | `() → Promise<this>`                                                    | Soft-asserts every visible task in the done list has a checked checkbox and struck-through title           |
| `clickButtonNewTask`                         | `() → Promise<NewTaskPage>`                                             | Clicks new task button — returns `NewTaskPage` (chain ends)                                                |
| `checkNewTaskNavigationRequest`              | `() → Promise<this>`                                                    | Asserts clicking new task button triggers GET request to `edit-task`                                       |
| `checkPulseTextsVisible`                     | `() → Promise<this>`                                                    | Soft-asserts "Today's Pulse" heading and subtitle are visible                                              |
| `checkPulseStats`                            | `() → Promise<this>`                                                    | Re-visits the page, fetches `/todos`, and soft-asserts the completion % and count text                     |
| `checkUpcomingHeadingVisible`                | `() → Promise<this>`                                                    | Asserts "Upcoming" heading is visible                                                                      |
| `countUpcomingTasks`                         | `() → Promise<number>`                                                  | Fetches `/todos` via API and returns count of non-completed tasks due within 7 days                        |
| `checkUpcomingEmpty`                         | `() → Promise<this>`                                                    | Soft-asserts the "Nothing due in the next 7 days." message is visible with correct text                    |
| `checkUpcomingEmptyMessageNotShown`          | `() → Promise<this>`                                                    | Asserts the empty message is not visible                                                                   |
| `createTaskWithDueDate`                      | `(title: string, dueDate: string, completed?: boolean) → Promise<this>` | Creates a task via API with the given due date, then re-visits the page to reflect it                      |
| `checkTaskDueToday`                          | `(taskName: string) → Promise<this>`                                    | Soft-asserts a task row is visible in Upcoming labeled "Today"                                             |
| `checkTaskDueTomorrow`                       | `(taskName: string) → Promise<this>`                                    | Soft-asserts a task row is visible in Upcoming labeled "Tomorrow"                                          |
| `checkTaskNotInUpcoming`                     | `(taskName: string) → Promise<this>`                                    | Asserts a task row is not present in Upcoming                                                              |
| `checkUpcomingTaskNavigation`                | `(taskName: string) → Promise<this>`                                    | Clicks a task row in Upcoming and waits for navigation to `task-detail.html`                               |
| `checkCalendarMonthLabel`                    | `() → Promise<this>`                                                    | Asserts the calendar month label matches the current month and year                                        |
| `checkCalendarDaysForCurrentMonth`           | `() → Promise<this>`                                                    | Soft-asserts the calendar shows the correct number of days for the current month, starting at 1            |
| `checkCalendarTodayHighlighted`              | `() → Promise<this>`                                                    | Asserts exactly one calendar day cell is highlighted and it matches today's date                           |
| `enterCalculatorNumber`                      | `(value: string) → Promise<this>`                                       | Clicks the calculator's digit buttons to type the given number                                             |
| `selectCalculatorAdd`                        | `() → Promise<this>`                                                    | Clicks the "+" operator button                                                                             |
| `selectCalculatorSubtract`                   | `() → Promise<this>`                                                    | Clicks the "−" operator button                                                                             |
| `selectCalculatorMultiply`                   | `() → Promise<this>`                                                    | Clicks the "×" operator button                                                                             |
| `selectCalculatorDivide`                     | `() → Promise<this>`                                                    | Clicks the "÷" operator button                                                                             |
| `clickCalculate`                             | `() → Promise<this>`                                                    | Clicks the calculator's "=" button                                                                         |
| `clickCalculatorClear`                       | `() → Promise<this>`                                                    | Clicks the calculator's "C" button                                                                         |
| `clickCalculatorBackspace`                   | `() → Promise<this>`                                                    | Clicks the calculator's backspace button                                                                   |
| `checkCalculatorDisplay`                     | `(expected: string) → Promise<this>`                                    | Asserts the calculator display shows the given text                                                        |
| `checkCalculatorHistory`                     | `(expected: string) → Promise<this>`                                    | Asserts the calculator history line shows the given text                                                   |
| `checkCalculatorErrorMessage`                | `(expected: string) → Promise<this>`                                    | Soft-asserts the calculator error banner is visible with the given message                                 |
| `checkCalculatorErrorHidden`                 | `() → Promise<this>`                                                    | Asserts the calculator error banner is not visible                                                         |

---

## NewTaskPage

**Fixture:** `newTaskPage` (authenticated, depends on `dashboardPage`), `unAuthNewTaskPage` (no auth)
**Path:** `/edit-task.html?from=dashboard`
**Extends:** `SiteBarMenu` — does NOT have `ActionTask` methods (no task list on this page).

**Public properties:**

| Property           | Type      | Description                                                                         |
| ------------------ | --------- | ----------------------------------------------------------------------------------- |
| `taskName`         | `string`  | Auto-generated task title set on construction: `"Test - DD.MM.YYYY - HH:mm:ss.SSS"` |
| `createTaskButton` | `Locator` | "Create Task" button                                                                |

**Methods:**

| Method                        | Signature                       | Description                                                                                                |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `checkUrl`                    | `(url: string) → Promise<this>` | Asserts current URL equals `url`. Own method, not inherited — see `page-objects.md`'s third worked example |
| `fillTaskTitle`               | `() → Promise<this>`            | Fills the task title input with `this.taskName`                                                            |
| `checkCreateTaskButtonBehave` | `() → Promise<this>`            | Soft-asserts button disabled before fill, enabled after fill                                               |
| `clickCreateTaskButton`       | `() → Promise<DashboardPage>`   | Clicks create button, waits for redirect to dashboard — returns `DashboardPage` (chain ends)               |
| `checkCreateTaskPostRequest`  | `() → Promise<this>`            | Asserts clicking create button triggers POST request to `/api/tasks`                                       |

---

## OpenTasksPage

**Fixture:** `openTasksPage` (authenticated)
**Path:** `/open-tasks.html`
**Extends:** `SiteBarMenu`. **Composes:** `ActionTask` and `Pagination` — re-exposes every method of both through delegation wrappers, same as `DashboardPage` does for `ActionTask`.

**Public locators:**

| Locator                | Type      | Description                                  |
| ---------------------- | --------- | -------------------------------------------- |
| `openListEmptyMessage` | `Locator` | Delegated from `ActionTask` — see that section |
| `expandOpenListButton` | `Locator` | Delegated from `ActionTask` — see that section |

**Methods:** all `ActionTask` methods (see that section) plus all `Pagination` methods (see that section) — both delegated, nothing else of its own yet.

---

## ClosedTasksPage

**Fixture:** `closedTasksPage` (authenticated)
**Path:** `/finished-tasks.html`
**Extends:** `SiteBarMenu` (not `ActionTask` — a closed-tasks list is a different domain: tasks here are completed, not open). **Composes:** `Pagination` — re-exposes its methods through delegation wrappers.

**Own methods:**

| Method                          | Signature                                     | Description                                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkItemCountOnPage`          | `(expected: number) → Promise<this>`          | Asserts the done list (`#done-list`) currently renders exactly `expected` task cards                                                                                                            |
| `checkAllTasksMarkedComplete`   | `() → Promise<this>`                          | Soft-asserts every task currently rendered in the done list has a checked checkbox and struck-through title — works on whichever page is currently shown, including after pagination navigation |
| `checkHeaderSnapshot`           | `(name: string) → Promise<this>`              | Scoped screenshot of the static breadcrumb + h1 + subtitle block (the h1's own parent `<div>`) — not a full-page snapshot, so it isn't affected by the dynamic task list/pagination below it    |
| `checkSortOrderValue`           | `(value: string) → Promise<this>`             | Asserts the `#sort-order` select has the given value (`'asc'`/`'desc'`)                                                                                                                         |
| `checkSortOrderOptions`         | `(labels: string[]) → Promise<this>`          | Asserts `#sort-order`'s `<option>`s have exactly these texts, in order                                                                                                                          |
| `selectSortOrder`               | `(value: string) → Promise<this>`             | Selects an option on `#sort-order`                                                                                                                                                              |
| `isPageSizeSelectorVisible`     | `() → Promise<boolean>`                       | Returns whether `#page-size` is visible — the app shows it only when total completed tasks > 10, same threshold as pagination                                                                   |
| `checkPageSizeValue`            | `(value: number) → Promise<this>`             | Asserts the `#page-size` select has the given value                                                                                                                                             |
| `checkPageSizeOptions`          | `(values: number[]) → Promise<this>`          | Asserts `#page-size`'s `<option>`s have exactly these values, in order                                                                                                                          |
| `selectPageSize`                | `(value: number) → Promise<this>`             | Selects an option on `#page-size`                                                                                                                                                               |
| `getCompletedTaskTitles`        | `(order?: 'asc'\|'desc') → Promise<string[]>` | Fetches `GET /todos?order=...` directly and returns completed tasks' titles in that order — the API sorts by `id`, and `id` isn't rendered in the UI, so this is how sort order gets verified   |
| `checkDisplayedTaskTitlesOrder` | `(expectedTitles: string[]) → Promise<this>`  | Asserts the done list's task headings currently match `expectedTitles`, in order                                                                                                                |

**Also has:** all `Pagination` methods (see that section).

---

## LoginPage

**Fixture:** `loginPage` (no auth injection — tests the login form itself)
**Path:** `/login.html`
**Extends:** `ToTopButton` — has BasePage, Headline, ToTopButton methods. No Header/SiteBarMenu. **Composes:** `Footer` (see that section above) — re-exposes its two public locators and both its methods directly.

**Methods:**

| Method                          | Signature                                                       | Description                                                                                                      |
| ------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `checkUrl`                      | `(url: string) → Promise<this>`                                 | Asserts current URL equals `url`. Own method, not inherited — see `page-objects.md`'s third worked example       |
| `checkFullPageSnapshot`         | `(name: string) → Promise<this>`                                | Full-page `toHaveScreenshot`. Own method, not inherited                                                          |
| `fillUserName`                  | `(userName: string) → Promise<this>`                            | Fills username input                                                                                             |
| `fillPassword`                  | `(password: string) → Promise<this>`                            | Fills password input                                                                                             |
| `checkSignInButtonVisible`      | `() → Promise<this>`                                            | Asserts sign-in button is visible                                                                                |
| `checkCreateAccountVisible`     | `() → Promise<this>`                                            | Asserts "Create Account" link is visible                                                                         |
| `checkForgotAccessVisible`      | `() → Promise<this>`                                            | Asserts "Forgot Access?" link is visible                                                                         |
| `checkPasswordIsHidden`         | `() → Promise<this>`                                            | Asserts password input has `type="password"`                                                                     |
| `checkPasswordIsVisible`        | `() → Promise<this>`                                            | Asserts password input has `type="text"`                                                                         |
| `clickPasswordToggle`           | `() → Promise<this>`                                            | Clicks the password visibility toggle                                                                            |
| `clickSubmit`                   | `() → Promise<this>`                                            | Clicks the sign-in button                                                                                        |
| `checkLoginErrorMessage`        | `(text: string) → Promise<this>`                                | Soft-asserts the `#error-msg` banner is visible with the given text (invalid credentials or backend unreachable) |
| `checkLoginErrorHidden`         | `() → Promise<this>`                                            | Asserts the `#error-msg` banner is not visible                                                                   |
| `checkUsernameFieldError`       | `(text: string) → Promise<this>`                                | Soft-asserts the `#username-error` inline validation message is visible with the given text                      |
| `checkUsernameFieldErrorHidden` | `() → Promise<this>`                                            | Asserts the `#username-error` inline validation message is not visible                                           |
| `checkPasswordFieldError`       | `(text: string) → Promise<this>`                                | Soft-asserts the `#password-error` inline validation message is visible with the given text                      |
| `checkPasswordFieldErrorHidden` | `() → Promise<this>`                                            | Asserts the `#password-error` inline validation message is not visible                                           |
| `simulateBackendUnreachable`    | `() → Promise<this>`                                            | Aborts requests to `/todos` so login fails as if the backend were down                                           |
| `login`                         | `(userName: string, password: string) → Promise<DashboardPage>` | Fills credentials and submits — returns `DashboardPage` (chain ends)                                             |

---

## LogoutPage

**Fixture:** `logoutPage` (no auth injection)
**Path:** `/logout.html`
**Extends:** `ToTopButton` — has BasePage, Headline, ToTopButton methods. No Header/SiteBarMenu. Does **not** compose `Footer` — `logout.html` renders one, but no test exercises it yet (see `Footer` section above).

| Method                      | Signature                        | Description                                                             |
| --------------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| `checkUrl`                  | `(url: string) → Promise<this>`  | Asserts current URL equals `url`. Own method, not inherited             |
| `checkFullPageSnapshot`     | `(name: string) → Promise<this>` | Full-page `toHaveScreenshot`. Own method, not inherited                 |
| `checkReturnToLoginVisible` | `() → Promise<this>`             | Asserts "Return to Login" link is visible                               |
| `simulateLoggedInSession`   | `() → Promise<this>`             | Seeds `sessionStorage.auth` before a reload, to verify logout clears it |
| `checkSessionCleared`       | `() → Promise<this>`             | Asserts `sessionStorage.auth` is `null` after visiting the logout page  |
| `clickReturnToLogin`        | `() → Promise<LoginPage>`        | Clicks the link — returns `LoginPage` (chain ends)                      |

---

## Fixtures summary

| Fixture name          | Type            | Page object       | Auth                    | Notes                                                          |
| --------------------- | --------------- | ----------------- | ----------------------- | -------------------------------------------------------------- |
| `loginPage`           | auth-fixtures   | `LoginPage`       | none                    | Login form tests — no token injected                           |
| `dashboardPage`       | auth-fixtures   | `DashboardPage`   | token in sessionStorage | Standard authenticated tests                                   |
| `newTaskPage`         | auth-fixtures   | `NewTaskPage`     | via `dashboardPage`     | Depends on `dashboardPage`; teardown via `deleteTaskByTitle()` |
| `openTasksPage`       | auth-fixtures   | `OpenTasksPage`   | token in sessionStorage | Standard authenticated tests                                   |
| `closedTasksPage`     | auth-fixtures   | `ClosedTasksPage` | token in sessionStorage | Standard authenticated tests                                   |
| `logoutPage`          | auth-fixtures   | `LogoutPage`      | none                    | Logout page tests — no token injected                          |
| `unAuthDashboardPage` | noauth-fixtures | `DashboardPage`   | none                    | Redirect tests — no token                                      |
| `unAuthNewTaskPage`   | noauth-fixtures | `NewTaskPage`     | none                    | Redirect tests — no token                                      |

Every fixture in `auth-fixtures.ts` also calls the page object's own `injectTheme(theme)` (inherited from `BasePage`, see that section above) before `goto()` — omitted from the table above since it's the same for all of them, not a per-fixture detail.

---

## Test data

| File                        | Exports                     | Contents                                                                                                                                                                                                                                         |
| --------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `login_page_data.ts`        | `loginPageData`             | URLs, h1, h2 text                                                                                                                                                                                                                                |
| `login_page_data.ts`        | `loginCredentials`          | `validUser`, `invalidUser` (username/password)                                                                                                                                                                                                   |
| `login_page_data.ts`        | `negativeLoginCases`        | Array of `LoginTestCase` for data-driven negative login tests                                                                                                                                                                                    |
| `dashboard_page_data.ts`    | `dashboardPageData`         | `emptyListCount`, `taskPreviewLimit`, `emptyMessage`, `urlNewTaskPage`, `upcomingEmptyMessage`, `pulseSubtitle`, `pulseCountSuffix`, `upcomingLabelToday`, `upcomingLabelTomorrow`, `calculatorDivisionByZeroFault`, `calculatorOperatorSymbols` |
| `dashboard_page_data.ts`    | `calculatorTestData`        | Input/expected-result pairs for calculator atomic and E2E tests                                                                                                                                                                                  |
| `dashboard_page_data.ts`    | `generateUpcomingDueDates`  | Factory returning today/tomorrow/outsideWindow/overdue due-date strings for Upcoming widget tests                                                                                                                                                |
| `dashboard_page_data.ts`    | `generateUpcomingTaskTitle` | Factory returning a unique task title for Upcoming widget test teardown                                                                                                                                                                          |
| `general.ts`                | `contactMeInfo`             | Footer contact `{ label, href }` entries: `github`, `email`, `linkedIn`                                                                                                                                                                          |
| `logout_page_data.ts`       | `logoutPageData`            | h1 text                                                                                                                                                                                                                                          |
| `closed_tasks_page_data.ts` | `closedTasksPageData`       | h1 text                                                                                                                                                                                                                                          |
| `new_task_page_data.ts`     | `newTaskPageData`           | h1 text                                                                                                                                                                                                                                          |
| `list_controls_data.ts`     | `sortOrderCases`            | DDT cases for the "Sort by" dropdown — `{ description, value: 'asc'\|'desc', label }`                                                                                                                                                            |
| `list_controls_data.ts`     | `pageSizeCases`             | DDT cases for the "Items per page" dropdown — `{ description, value }`                                                                                                                                                                           |
| `list_controls_data.ts`     | `listControlsData`          | Defaults: `defaultSortOrder` (`sortOrderCases[0].value`), `defaultPageSize` (`pageSizeCases[0].value`)                                                                                                                                           |
| `pagination_data.ts`        | `paginationData`            | `pageSize` (10) — the app's `PAGE_SIZE` constant, used to assert items-per-page                                                                                                                                                                  |
| `pagination_data.ts`        | `generateRandomPageNumber`  | Factory (faker) returning a random page number in `[1, totalPages]`                                                                                                                                                                              |
| `pagination_data.ts`        | `generateNonLastPageNumber` | Factory (faker) returning a random page number in `[1, totalPages - 1]` — guaranteed not the last (possibly partial) page                                                                                                                        |

## Constants

Shared runtime values that are neither a compile-time-only type (`support/types/`) nor
app-content test data (`support/test-data/`) — e.g. a protocol-level enum used by more
than one file. Unlike `type`/`interface`, these produce real code at runtime.

| File                               | Exports         | Description                                                                                                                                                                   |
| ---------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `support/constants/http_method.ts` | `HttpMethod`    | Enum of HTTP verbs (`Get`, `Post`, `Put`, `Delete`), used internally by `support/helper/todo_api.ts` and directly in page objects to assert a network request's method        |
| `support/constants/endpoints.ts`   | `todosEndpoint` | The `/todos` API path. Used by `support/helper/todo_api.ts`, and directly by `DashboardPage`/`LoginPage` for `page.route`/response-URL matching (unrelated to the API helper) |

## Types

| File                                              | Exports                      | Description                                                                                                                                                                                                                  |
| ------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `support/types/chronos/form-fields/login_form.ts` | `LoginForm`, `LoginTestCase` | Types for login form fields and data-driven test cases                                                                                                                                                                       |
| `support/types/chronos/todo.ts`                   | `Todo`                       | Shape of a todo/task as returned by the `/todos` API — `id`, `title`, `description?`, `completed`, `due_date?`. Use it (or a `Pick<Todo, ...>`) instead of redeclaring an inline anonymous type when casting an API response |
