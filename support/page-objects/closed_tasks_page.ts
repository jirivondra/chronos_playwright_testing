import { Page, Locator, expect } from '@playwright/test'
import { SiteBarMenu } from './common/site_bar_menu'
import { Pagination } from './common/pagination'
import { ActionTask } from './common/action_task'
import { getTodos, createTodo } from '../helper/todo_api'
import { todosEndpoint } from '../constants/endpoints'
import { Todo } from '../types/chronos/todo'

export class ClosedTasksPage extends SiteBarMenu {
  private readonly pagination: Pagination
  private readonly actionTask: ActionTask
  private readonly doneList: Locator
  private readonly taskGroup: Locator
  private readonly completedTaskClass: RegExp
  private readonly sortOrderSelect: Locator
  private readonly pageSizeSelect: Locator

  constructor(page: Page) {
    super(page, '/finished-tasks.html')
    this.pagination = new Pagination(page)
    this.actionTask = new ActionTask(page)
    this.doneList = page.locator('#done-list')
    this.taskGroup = page.locator('.group')
    this.completedTaskClass = /line-through/
    this.sortOrderSelect = page.getByLabel('Sort by')
    this.pageSizeSelect = page.getByLabel('Items per page')
  }

  private taskInClosedList(taskName: string): Locator {
    return this.doneList.getByRole('heading', { name: taskName })
  }

  async createCompletedTask(title: string): Promise<this> {
    await createTodo({ title, completed: true })
    await this.goto()
    return this
  }

  async checkTaskNotInClosedList(taskName: string): Promise<this> {
    await expect(this.taskInClosedList(taskName)).not.toBeVisible()
    return this
  }

  async checkTaskInClosedList(taskName: string): Promise<this> {
    await expect(this.taskInClosedList(taskName)).toBeVisible()
    return this
  }

  async checkSortOrderValue(value: string): Promise<this> {
    await expect(this.sortOrderSelect).toHaveValue(value)
    return this
  }

  async checkSortOrderOptions(labels: string[]): Promise<this> {
    await expect(this.sortOrderSelect.getByRole('option')).toHaveText(labels)
    return this
  }

  async selectSortOrder(value: string): Promise<this> {
    const response = this.page.waitForResponse(
      (res) => res.url().includes(todosEndpoint) && res.ok()
    )
    await this.sortOrderSelect.selectOption(value)
    await response
    return this
  }

  async isPageSizeSelectorVisible(): Promise<boolean> {
    return this.pageSizeSelect.isVisible()
  }

  async checkPageSizeValue(value: number): Promise<this> {
    await expect(this.pageSizeSelect).toHaveValue(String(value))
    return this
  }

  async checkPageSizeOptions(values: number[]): Promise<this> {
    await expect(this.pageSizeSelect.getByRole('option')).toHaveText(values.map(String))
    return this
  }

  async selectPageSize(value: number): Promise<this> {
    const response = this.page.waitForResponse(
      (res) => res.url().includes(todosEndpoint) && res.ok()
    )
    await this.pageSizeSelect.selectOption(String(value))
    await response
    return this
  }

  async getCompletedTaskTitles(order: 'asc' | 'desc' = 'desc'): Promise<string[]> {
    const response = await getTodos(order)
    const todos = (await response.json()) as Todo[]
    return todos.filter((t) => t.completed).map((t) => t.title)
  }

  async checkDisplayedTaskTitlesOrder(expectedTitles: string[]): Promise<this> {
    const actualTitles = await this.doneList
      .locator(this.taskGroup)
      .getByRole('heading')
      .allTextContents()
    expect(actualTitles).toEqual(expectedTitles)
    return this
  }

  async checkItemCountOnPage(expected: number): Promise<this> {
    await expect(this.doneList.locator(this.taskGroup)).toHaveCount(expected)
    return this
  }

  async checkAllTasksMarkedComplete(): Promise<this> {
    const tasks = await this.doneList.locator(this.taskGroup).all()
    for (const task of tasks) {
      await expect.soft(task.getByRole('checkbox')).toBeChecked()
      await expect.soft(task.getByRole('heading')).toHaveClass(this.completedTaskClass)
    }
    return this
  }

  async isPaginationVisible(): Promise<boolean> {
    return this.pagination.isVisible()
  }

  async checkPaginationVisible(): Promise<this> {
    await this.pagination.checkVisible()
    return this
  }

  async checkPaginationNotVisible(): Promise<this> {
    await this.pagination.checkNotVisible()
    return this
  }

  async hasNextPage(): Promise<boolean> {
    return this.pagination.hasNextPage()
  }

  async hasPreviousPage(): Promise<boolean> {
    return this.pagination.hasPreviousPage()
  }

  async getTotalPages(): Promise<number> {
    return this.pagination.getTotalPages()
  }

  async getCurrentPage(): Promise<number> {
    return this.pagination.getCurrentPage()
  }

  async goToPage(pageNumber: number): Promise<this> {
    await this.pagination.goToPage(pageNumber)
    return this
  }

  async goToNextPage(): Promise<this> {
    await this.pagination.goToNextPage()
    return this
  }

  async goToPreviousPage(): Promise<this> {
    await this.pagination.goToPreviousPage()
    return this
  }

  async checkCurrentPage(pageNumber: number): Promise<this> {
    await this.pagination.checkCurrentPage(pageNumber)
    return this
  }

  async toggleTask(taskName: string): Promise<this> {
    await this.actionTask.toggleTask(taskName)
    return this
  }

  async checkTaskHasInfoAndDeleteButtons(taskName: string): Promise<this> {
    await this.actionTask.checkTaskHasInfoAndDeleteButtons(taskName)
    return this
  }

  async clickDeleteButton(taskName: string): Promise<this> {
    await this.actionTask.clickDeleteButton(taskName)
    return this
  }

  async checkDeleteDialogVisible(): Promise<this> {
    await this.actionTask.checkDeleteDialogVisible()
    return this
  }

  async checkDeleteDialogNotVisible(): Promise<this> {
    await this.actionTask.checkDeleteDialogNotVisible()
    return this
  }

  async cancelDeleteDialog(): Promise<this> {
    await this.actionTask.cancelDeleteDialog()
    return this
  }

  async confirmDeleteDialog(): Promise<this> {
    await this.actionTask.confirmDeleteDialog()
    return this
  }

  async checkTaskDetailNavigation(taskName: string): Promise<this> {
    await this.actionTask.checkTaskDetailNavigation(taskName)
    return this
  }

  async deleteTaskByTitle(title: string): Promise<void> {
    await this.actionTask.deleteTaskByTitle(title)
  }
}
