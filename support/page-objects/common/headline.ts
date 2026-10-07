import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './base_page'

export class Headline extends BasePage {
  readonly h1: Locator
  readonly h2: Locator
  readonly lengthH1: number

  constructor(page: Page, path: string) {
    super(page, path)
    this.h1 = this.page.getByRole('heading', { level: 1 })
    this.h2 = this.page.getByRole('heading', { level: 2 })
    this.lengthH1 = 1
  }

  async checkH1(text: string): Promise<this> {
    await expect.soft(this.h1).toBeVisible()
    await expect.soft(this.h1).toHaveCount(this.lengthH1)
    await expect.soft(this.h1).toHaveText(text)
    return this
  }

  async checkH2(text: string): Promise<this> {
    await expect.soft(this.h2).toBeVisible()
    await expect.soft(this.h2).toHaveText(text)
    return this
  }
}
