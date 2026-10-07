import { Page, Locator, expect } from '@playwright/test'
import { ToTopButton } from './to_top_button'
import { LogoutPage } from '../logout_page'

export class Header extends ToTopButton {
  private readonly logoutButton: Locator
  private readonly logoutUrlPattern: string
  private readonly topHeader: Locator
  private readonly clock: Locator
  private readonly themeToggle: Locator

  constructor(page: Page, path: string) {
    super(page, path)
    this.logoutButton = page.getByRole('link', { name: 'logout' })
    this.logoutUrlPattern = '**/logout.html'
    this.topHeader = page.getByRole('banner')
    // Both change independently of theme/page content — mask them so the snapshot
    // doesn't depend on the exact second the test runs or the resolved system theme.
    this.clock = page.locator('.mech-clock')
    this.themeToggle = page.locator('#theme-toggle')
  }

  async clickLogout(): Promise<LogoutPage> {
    await this.logoutButton.click()
    await this.page.waitForURL(this.logoutUrlPattern)
    return new LogoutPage(this.page)
  }

  async checkTopHeaderSnapshot(name: string): Promise<this> {
    await expect(this.topHeader).toHaveScreenshot(name, { mask: [this.clock, this.themeToggle] })
    return this
  }
}
