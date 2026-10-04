import { test as base } from '@playwright/test'
import { DashboardPage } from '../page-objects/dashboard_page'
import { NewTaskPage } from '../page-objects/new_task_page'

export interface NoAuthFixtures {
  unAuthDashboardPage: DashboardPage
  unAuthNewTaskPage: NewTaskPage
}

export const noAuthFixtures = base.extend<NoAuthFixtures>({
  unAuthDashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page)
    await dashboardPage.goto()
    await use(dashboardPage)
    await dashboardPage.clearCache()
  },
  unAuthNewTaskPage: async ({ page }, use) => {
    const newTaskPage = new NewTaskPage(page)
    await newTaskPage.goto()
    await use(newTaskPage)
    await newTaskPage.clearCache()
  },
})
