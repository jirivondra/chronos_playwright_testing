import { test } from '../../support/fixture'
import { logoutPageData } from '../../support/test-data/logout_page_data'
import { loginPageData, loginCredentials } from '../../support/test-data/login_page_data'
import { themeCases } from '../../support/test-data/visual_testing_data'

test.describe('Test Logout page', () => {
  test.describe('Atomic Tests For Logout Page', () => {
    test.describe('Structure', () => {
      test('Check H1 On Page Logout', async ({ logoutPage }) => {
        await logoutPage.checkH1(logoutPageData.h1)
      })

      test('Check Return To Login Link Visibility', async ({ logoutPage }) => {
        await logoutPage.checkReturnToLoginVisible()
      })
    })

    test.describe('Session Behavior', () => {
      test('Logout Clears Auth Session', async ({ logoutPage }) => {
        await logoutPage.simulateLoggedInSession().then((l) => l.checkSessionCleared())
      })

      test('Click Return To Login Navigates To Login Page', async ({ logoutPage }) => {
        await logoutPage.clickReturnToLogin().then((l) => l.checkUrl(loginPageData.urlLoginPage))
      })
    })
  })

  test.describe('E2E Test For Logout Page', () => {
    // Needs the app to toggle `hidden` (display:none) on the button after the opacity
    // fade-out, not just opacity alone. Un-fixme once that lands on main.
    test.fixme('ToTop Button Full Flow', async ({ logoutPage }) => {
      await logoutPage
        .checkToTopButtonNotVisible()
        .then((l) => l.scrollToBottom())
        .then((l) => l.checkToTopButtonVisible())
        .then((l) => l.clickToTopButton())
        .then((l) => l.checkToTopButtonNotVisible())
    })

    test('Login Logout Login Round Trip', async ({ loginPage }) => {
      const dashboardPage = await test.step('Login with valid credentials', async () => {
        const dashboardPage = await loginPage.login(
          loginCredentials.validUser.username,
          loginCredentials.validUser.password
        )
        await dashboardPage.checkUrl(loginPageData.urlDashboard)
        return dashboardPage
      })

      await test.step('Logout', async () => {
        const returnedLogoutPage = await dashboardPage.clickLogout()
        await returnedLogoutPage.checkUrl(loginPageData.urlLogoutPage)
      })

      await test.step('Direct dashboard access is blocked after logout', async () => {
        await dashboardPage.goto().then((d) => d.checkUrl(loginPageData.urlLoginPage))
      })

      await test.step('Login again succeeds', async () => {
        const dashboardPageAgain = await loginPage.login(
          loginCredentials.validUser.username,
          loginCredentials.validUser.password
        )
        await dashboardPageAgain.checkUrl(loginPageData.urlDashboard)
      })
    })
  })

  themeCases.forEach(({ description, theme }) => {
    test.describe('Visual Tests For Logout Page', () => {
      test.use({ theme })

      test(`Logout Page Matches ${description} Snapshot`, async ({ logoutPage }) => {
        await logoutPage.checkFullPageSnapshot(`logout-page-${theme}.png`)
      })
    })
  })
})
