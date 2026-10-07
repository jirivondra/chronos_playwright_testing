import { Page, Locator, expect } from '@playwright/test'
import { SiteBarMenu } from './common/site_bar_menu'
import { Pagination } from './common/pagination'
import { getTodos } from '../helper/todo_api'
import { Todo } from '../types/chronos/todo'

export class ClosedTasksPage extends SiteBarMenu {
  private readonly pagination: Pagination
  private readonly doneList: Locator
  private readonly taskGroup: Locator
  private readonly completedTaskClass: RegExp
  private readonly pageHeaderBlock: Locator
  private readonly sortOrderSelect: Locator
  private readonly pageSizeSelect: Locator

  constructor(page: Page) {
    super(page, '/finished-tasks.html')
    this.pagination = new Pagination(page)
    this.doneList = page.locator('#done-list')
    this.taskGroup = page.locator('.group')
    this.completedTaskClass = /line-through/
    // The breadcrumb + h1 + subtitle share one unlabelled <div>, which is the h1's own
    // parent — scoping off the h1 avoids depending on a utility class name.
    this.pageHeaderBlock = page
      .locator('main')
      .getByRole('heading', { level: 1 })
      .locator('xpath=..')
    this.sortOrderSelect = page.locator('#sort-order')
    this.pageSizeSelect = page.locator('#page-size')
  }

  async checkHeaderSnapshot(name: string): Promise<this> {
    await expect(this.pageHeaderBlock).toHaveScreenshot(name)
    return this
  }

  async checkSortOrderValue(value: string): Promise<this> {
    await expect(this.sortOrderSelect).toHaveValue(value)
    return this
  }

  async checkSortOrderOptions(labels: string[]): Promise<this> {
    await expect(this.sortOrderSelect.locator('option')).toHaveText(labels)
    return this
  }

  async selectSortOrder(value: string): Promise<this> {
    await this.sortOrderSelect.selectOption(value)
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
    await expect(this.pageSizeSelect.locator('option')).toHaveText(values.map(String))
    return this
  }

  async selectPageSize(value: number): Promise<this> {
    await this.pageSizeSelect.selectOption(String(value))
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
}
