import { Page } from '@playwright/test'
import { ThemeValue } from '../../types/chronos/theme'

export class Theme {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async inject(value: ThemeValue): Promise<void> {
    await this.page.addInitScript((t) => {
      localStorage.setItem('theme', t)
    }, value)
  }
}
