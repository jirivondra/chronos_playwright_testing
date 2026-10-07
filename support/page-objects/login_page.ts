import { Page, Locator, expect } from '@playwright/test'
import { ToTopButton } from './common/to_top_button'
import { Footer } from './common/footer'
import { DashboardPage } from './dashboard_page'
import { todosEndpoint } from '../constants/endpoints'

export class LoginPage extends ToTopButton {
  private readonly footer: Footer
  readonly footerHeading: Locator
  readonly contactIcons: Locator
  private readonly signInButton: Locator
  private readonly createAccountLink: Locator
  private readonly forgetAccessLink: Locator
  private readonly userName: Locator
  private readonly passwordInput: Locator
  private readonly passwordToggle: Locator
  private readonly loginError: Locator
  private readonly usernameFieldError: Locator
  private readonly passwordFieldError: Locator
  private readonly passwordHiddenType: string
  private readonly passwordVisibleType: string
  private readonly dashboardUrlPattern: string
  private readonly connectionRefusedErrorCode: string

  constructor(page: Page) {
    super(page, '/login.html')
    this.footer = new Footer(page)
    this.footerHeading = this.footer.footerHeading
    this.contactIcons = this.footer.contactIcons
    this.dashboardUrlPattern = '**/dashboard.html'
    this.userName = this.page.getByLabel('Username')
    this.passwordInput = this.page.getByLabel('Password')
    this.signInButton = this.page.getByRole('button', { name: 'Sign In' })
    this.createAccountLink = this.page.getByRole('link', { name: 'Create Account' })
    this.forgetAccessLink = this.page.getByRole('link', { name: 'Forgot Access?' })
    this.passwordToggle = this.page.getByRole('button', { name: 'visibility' })
    this.loginError = this.page.locator('#error-msg')
    this.usernameFieldError = this.page.locator('#username-error')
    this.passwordFieldError = this.page.locator('#password-error')
    this.passwordHiddenType = 'password'
    this.passwordVisibleType = 'text'
    this.connectionRefusedErrorCode = 'connectionrefused'
  }

  async checkUrl(url: string): Promise<this> {
    await expect(this.page).toHaveURL(url)
    return this
  }

  async checkFullPageSnapshot(name: string): Promise<this> {
    await expect(this.page).toHaveScreenshot(name, { fullPage: true })
    return this
  }

  async checkHeadingVisible(): Promise<this> {
    await this.footer.checkHeadingVisible()
    return this
  }

  async checkContactIconLink(label: string): Promise<this> {
    await this.footer.checkContactIconLink(label)
    return this
  }

  async fillUserName(userName: string): Promise<this> {
    await this.userName.fill(userName)
    return this
  }

  async fillPassword(password: string): Promise<this> {
    await this.passwordInput.fill(password)
    return this
  }

  async checkSignInButtonVisible(): Promise<this> {
    await expect(this.signInButton).toBeVisible()
    return this
  }

  async checkCreateAccountVisible(): Promise<this> {
    await expect(this.createAccountLink).toBeVisible()
    return this
  }

  async checkForgotAccessVisible(): Promise<this> {
    await expect(this.forgetAccessLink).toBeVisible()
    return this
  }

  async checkPasswordIsHidden(): Promise<this> {
    await expect(this.passwordInput).toHaveAttribute('type', this.passwordHiddenType)
    return this
  }

  async checkPasswordIsVisible(): Promise<this> {
    await expect(this.passwordInput).toHaveAttribute('type', this.passwordVisibleType)
    return this
  }

  async clickPasswordToggle(): Promise<this> {
    await this.passwordToggle.click()
    return this
  }

  async clickSubmit(): Promise<this> {
    await this.signInButton.click()
    return this
  }

  async checkLoginErrorMessage(text: string): Promise<this> {
    await expect.soft(this.loginError).toBeVisible()
    await expect.soft(this.loginError).toHaveText(text)
    return this
  }

  async checkLoginErrorHidden(): Promise<this> {
    await expect(this.loginError).not.toBeVisible()
    return this
  }

  async checkUsernameFieldError(text: string): Promise<this> {
    await expect.soft(this.usernameFieldError).toBeVisible()
    await expect.soft(this.usernameFieldError).toHaveText(text)
    return this
  }

  async checkUsernameFieldErrorHidden(): Promise<this> {
    await expect(this.usernameFieldError).not.toBeVisible()
    return this
  }

  async checkPasswordFieldError(text: string): Promise<this> {
    await expect.soft(this.passwordFieldError).toBeVisible()
    await expect.soft(this.passwordFieldError).toHaveText(text)
    return this
  }

  async checkPasswordFieldErrorHidden(): Promise<this> {
    await expect(this.passwordFieldError).not.toBeVisible()
    return this
  }

  async simulateBackendUnreachable(): Promise<this> {
    await this.page.route(`**${todosEndpoint}`, (route) =>
      route.abort(this.connectionRefusedErrorCode)
    )
    return this
  }

  async login(userName: string, password: string): Promise<DashboardPage> {
    await this.fillUserName(userName)
    await this.fillPassword(password)
    await this.clickSubmit()
    await this.page.waitForURL(this.dashboardUrlPattern)
    return new DashboardPage(this.page)
  }
}
