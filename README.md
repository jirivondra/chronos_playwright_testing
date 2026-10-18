# Chronos Playwright Testing

Automated end-to-end tests for the Chronos application built with [Playwright](https://playwright.dev/).

## Requirements

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm

## Installation

```bash
npm install
npx playwright install
```

## Environment Variables

Loaded from a local `.env` file (not committed) via `dotenv` in `playwright.config.ts`:

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `BASE_URL`     | URL of the app frontend              |
| `API_BASE_URL` | URL of the backend API               |
| `API_USERNAME` | Username used for login and API auth |
| `API_PASSWORD` | Password used for login and API auth |

`playwright.config.ts` validates these at startup with [`envalid`](https://github.com/af/envalid) — if any are missing or malformed, the run fails immediately with a clear error instead of further downstream in a confusing test failure.

## Running Tests

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm test`            | Run all tests in headless mode               |
| `npm run test_headed` | Run tests with the browser open              |
| `npm run test_ui`     | Open Playwright UI for interactive debugging |
| `npm run test_report` | Show the HTML report from the last run       |

## Visual Testing

Visual regression tests live alongside the functional tests in `tests/regression/*.spec.ts`, under their own `Visual Tests For [Page]` describe block (e.g. `login_page.spec.ts`). They compare a full-page screenshot against a committed baseline PNG per browser, stored in `tests/regression/*.spec.ts-snapshots/`. They are **not** part of the regular CI pipeline (see CI/CD below) — deliberately local/manual-only, since baselines are OS-sensitive and CI only runs Linux.

Baselines are named `-linux.png` regardless of your host OS, so they're always generated to match a Linux environment — never with a bare `npx playwright test` on a non-Linux host, which would produce an unusable `-darwin.png`/`-win32.png` file instead.

To (re)generate them, run the **"Update Playwright Snapshots"** workflow from the repo's Actions tab (`workflow_dispatch` — no local setup needed). It starts the app, runs `--update-snapshots` on a real Linux runner, and opens a PR with whatever changed. Review the PR's image diffs there to confirm the change is intentional before merging — a missing baseline isn't a silent gap, it makes the test fail loudly for anyone else ("A snapshot doesn't exist"), so this is the one required step whenever a visual test is new or its baseline needs updating.

One-time setup: this repo's Settings → Actions → General → "Read and write permissions" + "Allow GitHub Actions to create and approve pull requests" must be enabled for the workflow to open the PR.

## Linting & Formatting

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run lint`         | Run ESLint on all files                 |
| `npm run lint-fix`     | Auto-fix ESLint issues                  |
| `npm run format`       | Format all files with Prettier          |
| `npm run format-check` | Check formatting without making changes |

Or using Taskfile:

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `task check`        | Run ESLint + Prettier check       |
| `task fix`          | Auto-fix with Prettier + ESLint   |
| `task format-check` | Check formatting with Prettier    |
| `task format-fix`   | Auto-fix formatting with Prettier |

## Browsers

Tests are configured to run on:

- **Chromium** (Desktop Chrome)
- **WebKit** (Desktop Safari)
- **Google Chrome**

## Scope

### Out of scope (planned for the future)

- **Mobile browsers** — testing on mobile viewports (e.g. Pixel 5, iPhone) is not currently covered. Mobile browser coverage is planned for a future iteration.

## Project Structure

```
.
├── support/
│   ├── page-objects/       # Page Object models
│   │   └── common/         # Shared components
│   └── test-data/          # Test data
├── tests/                  # Test files (*.spec.ts)
├── playwright.config.ts    # Playwright configuration
└── tsconfig.json
```

## CI/CD

`.github/workflows/playwright.yml` runs on every push/PR to `main`, as three jobs chained with `needs:` so a failure stops the rest of the pipeline early:

1. **`prettier-and-lint`** — `npm run format-check` + `npm run lint`.
2. **`api-tests`** (only if 1 passes) — checks out [Chronost_App](https://github.com/jirivondra/Chronost_App) and [mocha_api_soap_testing](https://github.com/jirivondra/mocha_api_soap_testing), starts the backend, and runs the Mocha REST regression suite (status-code checks across all `/todos` endpoints).
3. **`e2e-flow`** (only if 2 passes) — checks out `Chronost_App`, starts the full app, and runs `tests/e2e-flow` (the end-to-end "Full Application Flow" test).

Playwright's own CI-awareness (`playwright.config.ts`): `forbidOnly` (rejects a committed `test.only`) and 2 retries are enabled whenever `process.env.CI` is set.

Visual regression tests are excluded from all of the above — see [Visual Testing](#visual-testing).
