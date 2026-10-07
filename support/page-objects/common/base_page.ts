import { Page } from '@playwright/test'

export class BasePage {
  protected page: Page
  protected path: string

  constructor(page: Page, path: string) {
    this.page = page
    this.path = path
  }

  async goto(params = ''): Promise<this> {
    await this.page.goto(this.path + params)
    return this
  }

  async clearCache(): Promise<this> {
    await this.page.context().clearCookies()
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    return this
  }

  async scrollToBottom(): Promise<this> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    return this
  }
}
