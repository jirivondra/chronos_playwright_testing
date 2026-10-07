import { Page, Locator, expect } from '@playwright/test'
import { ToTopButton } from './common/to_top_button'
import { LoginPage } from './login_page'

export class LogoutPage extends ToTopButton {
  private readonly returnToLoginButton: Locator
  private readonly authStorageKey: string
  private readonly testAuthToken: string
  private readonly loginUrlPattern: string

  constructor(page: Page) {
    super(page, '/logout.html')
    this.returnToLoginButton = page.getByRole('link', { name: 'Return to Login' })
    this.authStorageKey = 'auth'
    this.testAuthToken = 'test-token'
    this.loginUrlPattern = '**/login.html'
  }

  async checkUrl(url: string): Promise<this> {
    await expect(this.page).toHaveURL(url)
    return this
  }

  async checkFullPageSnapshot(name: string): Promise<this> {
    await expect(this.page).toHaveScreenshot(name, { fullPage: true })
    return this
  }

  async checkReturnToLoginVisible(): Promise<this> {
    await expect(this.returnToLoginButton).toBeVisible()
    return this
  }

  async simulateLoggedInSession(): Promise<this> {
    await this.page.context().addInitScript(
      ({ key, token }) => {
        sessionStorage.setItem(key, token)
      },
      { key: this.authStorageKey, token: this.testAuthToken }
    )
    await this.goto()
    return this
  }

  async checkSessionCleared(): Promise<this> {
    const authToken = await this.page.evaluate(
      (key) => sessionStorage.getItem(key),
      this.authStorageKey
    )
    expect(authToken).toBeNull()
    return this
  }

  async clickReturnToLogin(): Promise<LoginPage> {
    await this.returnToLoginButton.click()
    await this.page.waitForURL(this.loginUrlPattern)
    return new LoginPage(this.page)
  }
}
