import { Page, Locator, expect } from '@playwright/test'
import { getTodos, deleteTodo } from '../../helper/todo_api'
import { dashboardPageData } from '../../test-data/dashboard_page_data'
import { todosEndpoint } from '../../constants/endpoints'
import { Todo } from '../../types/chronos/todo'

export class ActionTask {
  private readonly page: Page
  private readonly openList: Locator
  readonly taskGroup: Locator
  readonly openListEmptyMessage: Locator
  private readonly openListEmptyMessageText: string
  readonly expandOpenListButton: Locator
  private readonly editButtonLabel: string
  private readonly deleteButtonLabel: string
  private readonly infoButtonLabel: string
  private readonly deleteDialog: Locator
  private readonly deleteDialogCancelButton: Locator
  private readonly deleteDialogConfirmButton: Locator
  private readonly taskDetailUrlPattern: RegExp
  private readonly editTaskUrlPattern: RegExp
  readonly completedTaskClass: RegExp

  constructor(page: Page) {
    this.page = page
    this.openList = page.locator('#open-list')
    this.taskGroup = page.locator('.group')
    this.openListEmptyMessageText = dashboardPageData.emptyMessage
    this.openListEmptyMessage = this.openList.getByText(this.openListEmptyMessageText)
    this.expandOpenListButton = this.openList.getByRole('button', { name: /Zobrazit všechny/ })
    this.editButtonLabel = 'edit'
    this.deleteButtonLabel = 'delete'
    this.infoButtonLabel = 'info'
    this.deleteDialog = page.locator('#delete-dialog')
    this.deleteDialogCancelButton = page.getByRole('button', { name: 'Cancel', exact: true })
    this.deleteDialogConfirmButton = page.getByRole('button', { name: 'Delete', exact: true })
    this.taskDetailUrlPattern = /task-detail\.html\?id=\d+&from=\w+/
    this.editTaskUrlPattern = /edit-task\.html\?id=\d+&from=\w+/
    this.completedTaskClass = /line-through/
  }

  private taskInOpenSection(taskName: string): Locator {
    return this.openList.getByRole('heading', { name: taskName })
  }

  private taskEditButton(taskName: string): Locator {
    return this.taskGroup
      .filter({ hasText: taskName })
      .getByRole('button', { name: this.editButtonLabel, exact: true })
  }

  private taskDeleteButton(taskName: string): Locator {
    return this.taskGroup
      .filter({ hasText: taskName })
      .getByRole('button', { name: this.deleteButtonLabel, exact: true })
  }

  private taskInfoButton(taskName: string): Locator {
    return this.taskGroup
      .filter({ hasText: taskName })
      .getByRole('button', { name: this.infoButtonLabel, exact: true })
  }

  async clickExpandButton(): Promise<this> {
    await this.expandOpenListButton.click()
    return this
  }

  async countOpenTasks(): Promise<number> {
    const response = await getTodos()
    const todos = (await response.json()) as Todo[]
    return todos.filter((t) => !t.completed).length
  }

  async checkExpandButtonVisible(): Promise<this> {
    await expect(this.expandOpenListButton).toBeVisible()
    return this
  }

  async checkExpandButtonNotVisible(): Promise<this> {
    await expect(this.expandOpenListButton).not.toBeVisible()
    return this
  }

  async checkEmptyOpenSection(): Promise<this> {
    await expect.soft(this.openListEmptyMessage).toBeVisible()
    await expect.soft(this.openListEmptyMessage).toHaveText(this.openListEmptyMessageText)
    return this
  }

  async deleteTaskByTitle(title: string): Promise<void> {
    const response = await getTodos()
    const todos = (await response.json()) as Todo[]
    const ids = todos.filter((t) => t.title === title).map((t) => t.id)
    await Promise.all(ids.map((id) => deleteTodo(id)))
  }

  async checkTaskInOpenSection(taskName: string): Promise<this> {
    await expect(this.taskInOpenSection(taskName)).toBeVisible()
    return this
  }

  async checkTaskHasEditAndDeleteButtons(taskName: string): Promise<this> {
    await expect.soft(this.taskEditButton(taskName)).toBeVisible()
    await expect.soft(this.taskDeleteButton(taskName)).toBeVisible()
    return this
  }

  async clickDeleteButton(taskName: string): Promise<this> {
    await this.taskDeleteButton(taskName).click()
    return this
  }

  async checkDeleteDialogVisible(): Promise<this> {
    await expect(this.deleteDialog).toBeVisible()
    return this
  }

  async checkDeleteDialogNotVisible(): Promise<this> {
    await expect(this.deleteDialog).not.toBeVisible()
    return this
  }

  async cancelDeleteDialog(): Promise<this> {
    await this.deleteDialogCancelButton.click()
    return this
  }

  async confirmDeleteDialog(): Promise<this> {
    const response = this.page.waitForResponse(
      (res) => res.url().includes(todosEndpoint) && res.ok()
    )
    await this.deleteDialogConfirmButton.click()
    await response
    return this
  }

  async checkTaskDetailNavigation(taskName: string): Promise<this> {
    await this.taskInfoButton(taskName).click()
    await this.page.waitForURL(this.taskDetailUrlPattern)
    return this
  }

  async checkTaskEditNavigation(taskName: string): Promise<this> {
    await this.taskEditButton(taskName).click()
    await this.page.waitForURL(this.editTaskUrlPattern)
    return this
  }

  async checkAllTasksInOpenSectionMarkedIncomplete(): Promise<this> {
    const tasks = await this.openList.locator(this.taskGroup).all()
    for (const task of tasks) {
      await expect.soft(task.getByRole('checkbox')).not.toBeChecked()
      await expect.soft(task.getByRole('heading')).not.toHaveClass(this.completedTaskClass)
    }
    return this
  }

  async checkItemCountOnPage(expected: number): Promise<this> {
    await expect(this.openList.locator(this.taskGroup)).toHaveCount(expected)
    return this
  }
}
