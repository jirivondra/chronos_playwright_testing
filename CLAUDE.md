# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests (headless)
npm test

# Run a single test file
npx playwright test tests/login_page.spec.ts

# Run a single test by name
npx playwright test --grep "Check H1 On Page Login"

# Run with browser visible
npm run test_headed

# Open Playwright UI (interactive test runner)
npm run test_ui

# Show HTML report from last run
npm run test_report

# Lint + format check (both at once)
task check

# Auto-fix lint and formatting
task fix
```

Environment variables are loaded from `.env` via `dotenv` in `playwright.config.ts`. Required vars: `BASE_URL`, `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`.

## Architecture

### Page Object inheritance chain

Two chains exist. `DashboardPage`/`NewTaskPage`/`OpenTasksPage`/`ClosedTasksPage` use the full chain; `LoginPage` and `LogoutPage` branch off at `ToTopButton`:

```
BasePage → Headline → ToTopButton → Header → SiteBarMenu → DashboardPage
                                                             ├─ NewTaskPage
                                                             ├─ OpenTasksPage
                                                             └─ ClosedTasksPage
                                    └─ LoginPage
                                    └─ LogoutPage
```

- **BasePage** — adds `Page` instance. Provides `goto()`, `clearCache()`, `scrollToBottom()`. No assertion or interaction methods.
- **Headline** — first class with assertion methods. Adds public `h1`/`h2` locators, `checkH1()`, `checkH2()`.
- **ToTopButton** — adds back-to-top button locators and assertions.
- **Header** — the real `<header>`/`getByRole('banner')` top bar. Adds `clickLogout()` which returns `LogoutPage`, and `checkTopHeaderSnapshot()`.
- **SiteBarMenu** — adds sidebar logo, navigation links, and app version assertions.
- **Concrete pages** (e.g. `DashboardPage`) — define page-specific selectors and expose user-action methods. `checkUrl()` and (on `LoginPage`/`LogoutPage`) `checkFullPageSnapshot()` live here too, not in the shared chain — each is a single-line wrapper used by a minority of pages, cheaper duplicated than abstracted (see `page-objects.md`'s third worked example).

API access and the task-list/pagination/footer behaviour are **not** in this chain — only some pages need them, so they're composed instead of inherited (see `.claude/docs/page-objects.md`'s "Signal to cut an existing chain"):

- **`support/helper/todo_api.ts`** — plain functions (`getTodos`, `createTodo`, `deleteTodo`), no class. Imported directly by `DashboardPage`, `ClosedTasksPage`, and `OpenTask`.
- **`OpenTask`** (`support/page-objects/common/open_task.ts`) — open task list, expand button, `countOpenTasks()`, `deleteTaskByTitle()`. Composed by `DashboardPage` and `OpenTasksPage`.
- **`Footer`** (`support/page-objects/common/footer.ts`) — footer heading and contact icon locators/assertions. The app renders a `<footer>` on `login.html`/`logout.html`, but today only `LoginPage` composes it — `LogoutPage` doesn't test it yet.
- **`Pagination`** (`support/page-objects/common/pagination.ts`) — composed by `OpenTasksPage` and `ClosedTasksPage`.

### Fixtures

`support/fixture/` extends Playwright's `test` with page object fixtures. Each fixture instantiates the page object, calls `goto()` before the test, and `clearCache()` after. Tests import `test` from `support/fixture` (not from `@playwright/test` directly).

### Test data

`support/test-data/` contains plain TypeScript objects with test data (no logic). Imported directly into test files. Use `faker` for dynamic/unique values and `dayjs` for date generation — both called inside factory functions, never at module level.

### Documentation

@.claude/docs/available-methods.md
@.claude/docs/page-objects.md
@.claude/docs/fluent-api.md
@.claude/docs/custom-actions.md
@.claude/docs/api-helper.md
@.claude/docs/fixtures.md
@.claude/docs/test-structure.md
@.claude/docs/test-data.md
@.claude/docs/data-driven-tests.md
@.claude/docs/conditional-skip.md
@.claude/docs/multiple-elements.md
@.claude/docs/serial-execution.md
