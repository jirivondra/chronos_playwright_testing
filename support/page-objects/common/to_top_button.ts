import { Page, Locator, expect } from '@playwright/test'
import { Footer } from './footer'

export class ToTopButton extends Footer {
  private readonly toTopButton: Locator

  constructor(page: Page, path: string) {
    super(page, path)
    this.toTopButton = this.page.getByRole('button', { name: 'arrow_upward' })
  }

  // FIXME: relies on the app toggling the `hidden` attribute (display:none) once the
  // opacity fade-out finishes, not just opacity alone. Not yet on Chronost_App's main —
  // un-fixme the two "ToTop Button Full Flow" tests once it lands.
  async checkToTopButtonVisible(): Promise<this> {
    await expect(this.toTopButton).toBeVisible()
    return this
  }

  async checkToTopButtonNotVisible(): Promise<this> {
    await expect(this.toTopButton).not.toBeVisible()
    return this
  }

  async clickToTopButton(): Promise<this> {
    await this.toTopButton.click()
    return this
  }
}
