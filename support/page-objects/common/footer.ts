import { Page, Locator, expect } from '@playwright/test'
import { contactMeInfo } from '../../test-data/general'

export class Footer {
  protected readonly footer: Locator
  private readonly footerHeadingText: string
  readonly footerHeading: Locator
  readonly contactIcons: Locator

  constructor(page: Page) {
    this.footer = page.locator('footer')
    this.footerHeadingText = 'Connect with me'
    this.footerHeading = this.footer.getByText(this.footerHeadingText)
    this.contactIcons = this.contactIconByLabel(contactMeInfo.github.label)
      .or(this.contactIconByLabel(contactMeInfo.email.label))
      .or(this.contactIconByLabel(contactMeInfo.linkedIn.label))
  }

  contactIconByLabel(label: string): Locator {
    return this.footer.getByRole('link', { name: label, exact: true })
  }

  async checkHeadingVisible(): Promise<this> {
    await expect(this.footerHeading).toBeVisible()
    return this
  }

  async checkContactIconLink(label: string): Promise<this> {
    await expect(this.contactIconByLabel(label)).toBeVisible()
    return this
  }
}
