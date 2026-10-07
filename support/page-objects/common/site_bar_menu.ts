import { Page, Locator, expect } from '@playwright/test'
import { Header } from './header'

export class SiteBarMenu extends Header {
  protected appVersionTitleText: string
  private readonly logoTitleText: string
  private readonly logoSubtitleText: string
  private readonly navDashboardText: string
  private readonly navOpenTasksText: string
  private readonly navClosedTasksText: string
  private readonly navCalendarText: string

  protected openMenuButton: Locator
  protected appVersionTitle: Locator
  protected appVersion: Locator

  private readonly sidebar: Locator
  private readonly appVersionValue: Locator
  private readonly logoImage: Locator
  private readonly logoTitle: Locator
  private readonly logoSubtitle: Locator

  private readonly navDashboardLink: Locator
  private readonly navOpenTasksLink: Locator
  private readonly navClosedTasksLink: Locator
  private readonly navCalendarLink: Locator

  private readonly navDashboardLabel: Locator
  private readonly navOpenTasksLabel: Locator
  private readonly navClosedTasksLabel: Locator
  private readonly navCalendarLabel: Locator

  private readonly navDashboardIcon: Locator
  private readonly navOpenTasksIcon: Locator
  private readonly navClosedTasksIcon: Locator
  private readonly navCalendarIcon: Locator

  constructor(page: Page, path: string) {
    super(page, path)

    this.appVersionTitleText = 'App version'
    this.logoTitleText = 'Chronos'
    this.logoSubtitleText = 'Personal Space'
    this.navDashboardText = 'Dashboard'
    this.navOpenTasksText = 'Open Tasks'
    this.navClosedTasksText = 'Closed Tasks'
    this.navCalendarText = 'Calendar'

    this.openMenuButton = page.getByRole('button', { name: 'menu_open' })
    this.appVersionTitle = page.getByText(this.appVersionTitleText, { exact: true })
    this.appVersion = page.getByText(this.appVersionTitleText)
    // The actual version number (e.g. "v1.0.0"), fetched from assets/version.json — distinct
    // from appVersion/appVersionTitle above, which both target the static "App version" label.
    this.appVersionValue = page.locator('#app-version')

    // <aside id="sidebar"> carries the implicit ARIA role "complementary" — no need for a
    // CSS/ID fallback, it's already semantic.
    this.sidebar = page.getByRole('complementary')

    this.logoImage = page.getByRole('img', { name: this.logoTitleText })
    this.logoTitle = this.sidebar.getByText(this.logoTitleText, { exact: true })
    this.logoSubtitle = page.getByText(this.logoSubtitleText)

    // Scoped to #sidebar: the breadcrumb on OpenTasksPage/ClosedTasksPage has its own
    // "home" link accessible-named "Dashboard", which otherwise collides with this one.
    this.navDashboardLink = this.sidebar.getByRole('link', { name: this.navDashboardText })
    this.navOpenTasksLink = this.sidebar.getByRole('link', { name: this.navOpenTasksText })
    this.navClosedTasksLink = this.sidebar.getByRole('link', { name: this.navClosedTasksText })
    this.navCalendarLink = this.sidebar.getByRole('link', { name: this.navCalendarText })

    this.navDashboardLabel = this.navDashboardLink.getByText(this.navDashboardText, {
      exact: true,
    })
    this.navOpenTasksLabel = this.navOpenTasksLink.getByText(this.navOpenTasksText, {
      exact: true,
    })
    this.navClosedTasksLabel = this.navClosedTasksLink.getByText(this.navClosedTasksText, {
      exact: true,
    })
    this.navCalendarLabel = this.navCalendarLink.getByText(this.navCalendarText, { exact: true })

    this.navDashboardIcon = this.navDashboardLink.locator('span.material-symbols-outlined')
    this.navOpenTasksIcon = this.navOpenTasksLink.locator('span.material-symbols-outlined')
    this.navClosedTasksIcon = this.navClosedTasksLink.locator('span.material-symbols-outlined')
    this.navCalendarIcon = this.navCalendarLink.locator('span.material-symbols-outlined')
  }

  async checkMenuExpandedOnLoad(): Promise<this> {
    await this.checkVisibilityForOpenMenu()
    await this.checkLogoExpandedVisible()
    await this.checkNavExpandedVisible()
    return this
  }

  async checkVisibilityForOpenMenu(): Promise<this> {
    await expect(this.openMenuButton).toBeVisible()
    return this
  }

  async checkVisibilityForCloseMenu(): Promise<this> {
    await expect(this.openMenuButton).not.toBeVisible()
    return this
  }

  async clickMenuButton(): Promise<this> {
    await this.openMenuButton.click()
    return this
  }

  async checkOpenAndCloseSiteMenu(): Promise<this> {
    await this.checkVisibilityForOpenMenu()
    await this.checkLogoExpandedVisible()
    await this.checkVersionOfAppIsVisible()
    await this.checkNavExpandedVisible()
    await this.clickMenuButton()
    await this.checkLogoCollapsedHidden()
    await this.checkVersionOfAppIsNotVisible()
    await this.checkNavCollapsedVisible()
    await this.clickMenuButton()
    return this
  }

  async checkVersionTitle(): Promise<this> {
    await expect.soft(this.appVersionTitle).toBeVisible()
    await expect.soft(this.appVersionTitle).toHaveText(this.appVersionTitleText)
    return this
  }

  async checkVersionOfAppIsVisible(): Promise<this> {
    await expect.soft(this.appVersion).toBeVisible()
    return this
  }

  async checkVersionOfAppIsNotVisible(): Promise<this> {
    await expect.soft(this.appVersion).not.toBeVisible()
    return this
  }

  async checkLogoImageVisible(): Promise<this> {
    await expect(this.logoImage).toBeVisible()
    return this
  }

  async checkSidebarSnapshot(name: string): Promise<this> {
    await expect(this.sidebar).toHaveScreenshot(name, { mask: [this.appVersionValue] })
    return this
  }

  async checkLogoExpandedVisible(): Promise<this> {
    await expect.soft(this.logoTitle).toBeVisible()
    await expect.soft(this.logoTitle).toHaveText(this.logoTitleText)
    await expect.soft(this.logoSubtitle).toBeVisible()
    await expect.soft(this.logoSubtitle).toHaveText(this.logoSubtitleText)
    return this
  }

  async checkLogoCollapsedHidden(): Promise<this> {
    await expect.soft(this.logoTitle).not.toBeVisible()
    await expect.soft(this.logoSubtitle).not.toBeVisible()
    return this
  }

  async checkNavExpandedVisible(): Promise<this> {
    await expect.soft(this.navDashboardIcon).toBeVisible()
    await expect.soft(this.navDashboardLabel).toBeVisible()
    await expect.soft(this.navOpenTasksIcon).toBeVisible()
    await expect.soft(this.navOpenTasksLabel).toBeVisible()
    await expect.soft(this.navClosedTasksIcon).toBeVisible()
    await expect.soft(this.navClosedTasksLabel).toBeVisible()
    await expect.soft(this.navCalendarIcon).toBeVisible()
    await expect.soft(this.navCalendarLabel).toBeVisible()
    return this
  }

  async checkNavCollapsedVisible(): Promise<this> {
    await expect.soft(this.navDashboardIcon).toBeVisible()
    await expect.soft(this.navDashboardLabel).not.toBeVisible()
    await expect.soft(this.navOpenTasksIcon).toBeVisible()
    await expect.soft(this.navOpenTasksLabel).not.toBeVisible()
    await expect.soft(this.navClosedTasksIcon).toBeVisible()
    await expect.soft(this.navClosedTasksLabel).not.toBeVisible()
    await expect.soft(this.navCalendarIcon).toBeVisible()
    await expect.soft(this.navCalendarLabel).not.toBeVisible()
    return this
  }
}
