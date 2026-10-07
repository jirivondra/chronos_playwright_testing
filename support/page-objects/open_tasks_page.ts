import { Page, Locator } from '@playwright/test'
import { SiteBarMenu } from './common/site_bar_menu'
import { ActionTask } from './common/action_task'
import { Pagination } from './common/pagination'

export class OpenTasksPage extends SiteBarMenu {
  private readonly actionTask: ActionTask
  private readonly pagination: Pagination
  readonly openListEmptyMessage: Locator
  readonly expandOpenListButton: Locator

  constructor(page: Page) {
    super(page, '/open-tasks.html')
    this.actionTask = new ActionTask(page)
    this.pagination = new Pagination(page)
    this.openListEmptyMessage = this.actionTask.openListEmptyMessage
    this.expandOpenListButton = this.actionTask.expandOpenListButton
  }

  async clickExpandButton(): Promise<this> {
    await this.actionTask.clickExpandButton()
    return this
  }

  async countOpenTasks(): Promise<number> {
    return this.actionTask.countOpenTasks()
  }

  async checkExpandButtonVisible(): Promise<this> {
    await this.actionTask.checkExpandButtonVisible()
    return this
  }

  async checkExpandButtonNotVisible(): Promise<this> {
    await this.actionTask.checkExpandButtonNotVisible()
    return this
  }

  async checkEmptyOpenSection(): Promise<this> {
    await this.actionTask.checkEmptyOpenSection()
    return this
  }

  async deleteTaskByTitle(title: string): Promise<void> {
    await this.actionTask.deleteTaskByTitle(title)
  }

  async checkTaskInOpenSection(taskName: string): Promise<this> {
    await this.actionTask.checkTaskInOpenSection(taskName)
    return this
  }

  async checkTaskHasEditAndDeleteButtons(taskName: string): Promise<this> {
    await this.actionTask.checkTaskHasEditAndDeleteButtons(taskName)
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

  async checkTaskEditNavigation(taskName: string): Promise<this> {
    await this.actionTask.checkTaskEditNavigation(taskName)
    return this
  }

  async checkAllTasksInOpenSectionMarkedIncomplete(): Promise<this> {
    await this.actionTask.checkAllTasksInOpenSectionMarkedIncomplete()
    return this
  }

  async checkItemCountOnPage(expected: number): Promise<this> {
    await this.actionTask.checkItemCountOnPage(expected)
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
