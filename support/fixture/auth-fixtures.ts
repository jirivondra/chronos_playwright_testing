import { test as base } from '@playwright/test'
import { LoginPage } from '../page-objects/login_page'
import { DashboardPage } from '../page-objects/dashboard_page'
import { NewTaskPage } from '../page-objects/new_task_page'
import { OpenTasksPage } from '../page-objects/open_tasks_page'
import { ClosedTasksPage } from '../page-objects/closed_tasks_page'
import { LogoutPage } from '../page-objects/logout_page'
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
    const loginPage = new LoginPage(page)
    await loginPage.injectTheme(theme)

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

    const dashboardPage = new DashboardPage(page)
    await dashboardPage.injectTheme(theme)

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

    const openTasksPage = new OpenTasksPage(page)
    await openTasksPage.injectTheme(theme)

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

    const closedTasksPage = new ClosedTasksPage(page)
    await closedTasksPage.injectTheme(theme)

    await closedTasksPage.goto()
    await use(closedTasksPage)

    await closedTasksPage.clearCache()
  },
  logoutPage: async ({ page, theme }, use) => {
    const logoutPage = new LogoutPage(page)
    await logoutPage.injectTheme(theme)

    await logoutPage.goto()
    await use(logoutPage)

    await logoutPage.clearCache()
  },
})
