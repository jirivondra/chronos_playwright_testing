import { Page, Locator, expect } from '@playwright/test'
import { SiteBarMenu } from './common/site_bar_menu'
import { HttpMethod } from '../constants/http_method'
import type { DashboardPage } from './dashboard_page'
import dayjs from 'dayjs'

export class NewTaskPage extends SiteBarMenu {
  private readonly taskNameInput: Locator
  readonly taskName: string
  readonly createTaskButton: Locator
  private readonly dashboardUrlPattern: string
  private readonly createTaskRequestUrlPattern: RegExp

  constructor(page: Page) {
    super(page, '/edit-task.html?from=dashboard')
    this.taskNameInput = page.getByLabel('Task Title')
    this.taskName = `Test - ${dayjs().format('DD.MM.YYYY - HH:mm:ss.SSS')}`
    this.createTaskButton = page.getByRole('button', { name: 'Create Task' })
    this.dashboardUrlPattern = '**/dashboard.html'
    this.createTaskRequestUrlPattern = /api\/tasks/
  }

  async fillTaskTitle(): Promise<this> {
    await this.taskNameInput.fill(this.taskName)
    return this
  }

  async checkCreateTaskButtonBehave(): Promise<this> {
    await expect.soft(this.createTaskButton).toBeDisabled()
    await this.fillTaskTitle()
    await expect.soft(this.createTaskButton).toBeEnabled()
    return this
  }

  async clickCreateTaskButton(): Promise<DashboardPage> {
    const { DashboardPage: DashboardPageCtor } = await import('./dashboard_page')
    await this.createTaskButton.click()
    await this.page.waitForURL(this.dashboardUrlPattern)
    return new DashboardPageCtor(this.page)
  }

  async checkCreateTaskPostRequest(): Promise<this> {
    const requestPromise = this.page.waitForRequest(this.createTaskRequestUrlPattern)
    await this.createTaskButton.click()
    const request = await requestPromise
    expect(request.method()).toBe(HttpMethod.Post)
    return this
  }
}
