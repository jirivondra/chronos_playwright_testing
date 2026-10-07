# API Helper

API access is **not** part of the page object inheritance chain. It lives in `support/helper/` as plain exported functions, imported directly wherever a page object needs to set up or tear down server state via API without going through the UI.

This replaces the old `ApiHelper` base class that every page object used to inherit through `BasePage`, regardless of whether it ever made an API call. Only `DashboardPage`, `ClosedTasksPage`, and the composed `ActionTask` component actually need API access — `LoginPage`, `LogoutPage`, `NewTaskPage`, and `OpenTasksPage` never did, so forcing the HTTP client onto every page object via inheritance was unnecessary coupling (see `page-objects.md`'s "Signal to cut an existing chain").

## Current helper: `support/helper/todo_api.ts`

The app currently exposes a single resource, `/todos` (`support/constants/endpoints.ts`), so the helper is one file with one function per operation actually used by the tests — not a generic `get`/`post`/`put`/`delete` client:

| Function     | Signature                                                                               | Description          |
| ------------ | --------------------------------------------------------------------------------------- | -------------------- |
| `getTodos`   | `(order?: 'asc' \| 'desc') → Promise<Response>`                                         | Fetches all todos    |
| `createTodo` | `(body: { title: string; due_date?: string; completed?: boolean }) → Promise<Response>` | Creates a todo       |
| `deleteTodo` | `(id: number) → Promise<Response>`                                                      | Deletes a todo by id |

All three return the native `fetch` `Response`. Authentication (`Authorization: Basic ...`) and `Content-Type: application/json` are built from environment variables (`API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`) inside the module on every call — never hardcoded.

There is no generic `apiRequest`/`put` dispatcher. Both existed in the old `ApiHelper` but had zero call sites anywhere in the project — the app doesn't do PUT, and nothing ever needed to pick an HTTP verb at runtime. Don't reintroduce a generic dispatcher pre-emptively; add a new named function (e.g. `updateTodo`) only when a test actually needs it.

`HttpMethod` (`support/constants/http_method.ts`) is unrelated to this helper — it's used separately in page objects to assert the HTTP method of an intercepted network _request_ (e.g. `expect(request.method()).toBe(HttpMethod.Post)` in `dashboard_page.ts`/`new_task_page.ts`). `todo_api.ts` also uses it internally to avoid raw method strings, but that's incidental.

## How a page object uses it

Import the specific functions needed — no base class, no composition object, just function imports:

```ts
import { getTodos, createTodo } from '../helper/todo_api'

async countOpenTasks(): Promise<number> {
  const response = await getTodos()
  const todos = (await response.json()) as Todo[]
  return todos.filter((t) => !t.completed).length
}

async createTaskWithDueDate(title: string, dueDate: string, completed = false): Promise<this> {
  await createTodo({ title, due_date: dueDate, completed })
  await this.goto()
  return this
}
```

Page objects that never call these functions (`LoginPage`, `LogoutPage`, `NewTaskPage`, `OpenTasksPage`) simply don't import the module — nothing is forced on them anymore.

## Typing a JSON response

Don't redeclare an inline anonymous type every time a response is cast — reuse (or extend) the shared interface for that entity from `support/types/chronos/`:

```ts
// correct — shared type, single source of truth for the entity's shape
import { Todo } from '../../types/chronos/todo'

const response = await getTodos()
const todos = (await response.json()) as Todo[]

// incorrect — a fresh ad-hoc shape per call site, drifts out of sync with the real API
const todos = (await response.json()) as { completed: boolean }[]
```

If a method only needs a subset of fields, narrow the shared type instead of writing a new one — `Pick<Todo, 'id' | 'title'>` rather than `{ id: number; title: string }`.

## Adding a new resource

If the app grows a second resource beyond todos, add a sibling file in `support/helper/` (e.g. `support/helper/user_api.ts`) following the same shape — plain functions, one per operation actually needed, named after the entity singular (matching `support/types/chronos/todo.ts`'s own singular naming), not a generic reusable client class.

## Rules

- Never hardcode `API_BASE_URL`, credentials, or auth headers — they come from environment variables automatically.
- One function per operation actually used by a test, named after what it does (`getTodos`, not `get`) — not a generic verb-based dispatcher.
- Assert the response status or body in the test, not inside the page object method — page objects prepare data, tests verify outcomes.
- Type a JSON response with a shared interface from `support/types/chronos/` (adding one if it doesn't exist yet), not an inline anonymous type.
- Don't add a function, parameter, or generic dispatcher for a case no test currently exercises.
