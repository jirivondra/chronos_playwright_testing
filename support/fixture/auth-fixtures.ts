import { test as base } from '@playwright/test'
import { LoginPage } from '../page-objects/login_page'
import { DashboardPage } from '../page-objects/dashboard_page'
import { NewTaskPage } from '../page-objects/new_task_page'
import { OpenTasksPage } from '../page-objects/open_tasks_page'
import { ClosedTasksPage } from '../page-objects/closed_tasks_page'
import { LogoutPage } from '../page-objects/logout_page'
import { Theme as ThemeComponent } from '../page-objects/common/theme'
import { loginCredentials } from '../test-data/login_page_data'
import { ThemeValue } from '../types/chronos/theme'

export interface AuthFixtures {
  theme: ThemeValue
  loginPage: LoginPage
  dashboardPage: DashboardPage
  newTaskPage: NewTaskPage
  openTasksPage: OpenTasksPage
  closedTasksPage: ClosedTasksPage
  logoutPage: LogoutPage
}

export const authFixtures = base.extend<AuthFixtures>({
  theme: ['light', { option: true }],

  loginPage: async ({ page, theme }, use) => {
    await new ThemeComponent(page).inject(theme)

    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await use(loginPage)

    await loginPage.clearCache()
  },
  dashboardPage: async ({ page, theme }, use) => {
    const token = Buffer.from(
      `${loginCredentials.validUser.username}:${loginCredentials.validUser.password}`
    ).toString('base64')

    await page.context().addInitScript((t) => {
      sessionStorage.setItem('auth', t)
    }, token)
    await new ThemeComponent(page).inject(theme)

    const dashboardPage = new DashboardPage(page)

    await dashboardPage.goto()
    await use(dashboardPage)

    await dashboardPage.clearCache()
  },
  newTaskPage: async ({ dashboardPage }, use) => {
    const newTaskPage = await dashboardPage.clickButtonNewTask()

    await use(newTaskPage)

    await dashboardPage.deleteTaskByTitle(newTaskPage.taskName)
  },
  openTasksPage: async ({ page, theme }, use) => {
    const token = Buffer.from(
      `${loginCredentials.validUser.username}:${loginCredentials.validUser.password}`
    ).toString('base64')

    await page.context().addInitScript((t) => {
      sessionStorage.setItem('auth', t)
    }, token)

    await new ThemeComponent(page).inject(theme)

    const openTasksPage = new OpenTasksPage(page)

    await openTasksPage.goto()
    await use(openTasksPage)

    await openTasksPage.clearCache()
  },
  closedTasksPage: async ({ page, theme }, use) => {
    const token = Buffer.from(
      `${loginCredentials.validUser.username}:${loginCredentials.validUser.password}`
    ).toString('base64')

    await page.context().addInitScript((t) => {
      sessionStorage.setItem('auth', t)
    }, token)
    await new ThemeComponent(page).inject(theme)

    const closedTasksPage = new ClosedTasksPage(page)

    await closedTasksPage.goto()
    await use(closedTasksPage)

    await closedTasksPage.clearCache()
  },
  logoutPage: async ({ page, theme }, use) => {
    await new ThemeComponent(page).inject(theme)

    const logoutPage = new LogoutPage(page)

    await logoutPage.goto()
    await use(logoutPage)

    await logoutPage.clearCache()
  },
})
