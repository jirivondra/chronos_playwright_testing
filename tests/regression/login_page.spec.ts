import { test, expect } from '../../support/fixture'
import {
  loginPageData,
  loginCredentials,
  negativeLoginCases,
  invalidCredentialsCases,
} from '../../support/test-data/login_page_data'
import { contactMeInfo } from '../../support/test-data/general'
import { themeCases } from '../../support/test-data/visual_testing_data'

test.describe('Test Login page', () => {
  test.describe('Atomic Tests For Footer', () => {
    test('Check H1 On Page Login', async ({ loginPage }) => {
      await loginPage.checkH1(loginPageData.h1)
    })

    test('Check H2 On Page Login', async ({ loginPage }) => {
      await loginPage.checkH2(loginPageData.h2)
    })

    test('Check Sign In Button Visibility', async ({ loginPage }) => {
      await loginPage.checkSignInButtonVisible()
    })

    test('Check Create Account Link Visibility', async ({ loginPage }) => {
      await loginPage.checkCreateAccountVisible()
    })

    test('Check Forgot Access Link Visibility', async ({ loginPage }) => {
      await loginPage.checkForgotAccessVisible()
    })

    test('Check Heading Visibility', async ({ loginPage }) => {
      await loginPage.checkHeadingVisible()
    })

    test('Check Contact Icons Count', async ({ loginPage }) => {
      await expect(loginPage.contactIcons).toHaveCount(3)
    })

    test('Check GitHub Icon Link', async ({ loginPage }) => {
      await loginPage.checkContactIconLink(contactMeInfo.github.label)
    })

    test('Check Email Icon Link', async ({ loginPage }) => {
      await loginPage.checkContactIconLink(contactMeInfo.email.label)
    })

    test('Check LinkedIn Icon Link', async ({ loginPage }) => {
      await loginPage.checkContactIconLink(contactMeInfo.linkedIn.label)
    })
  })

  test.describe('E2E Test For Login Page', () => {
    // Needs the app to toggle `hidden` (display:none) on the button after the opacity
    // fade-out, not just opacity alone. Un-fixme once that lands on main.
    test.fixme('ToTop Button Full Flow', async ({ loginPage }) => {
      await loginPage
        .checkToTopButtonNotVisible()
        .then((l) => l.scrollToBottom())
        .then((l) => l.checkToTopButtonVisible())
        .then((l) => l.clickToTopButton())
        .then((l) => l.checkToTopButtonNotVisible())
    })

    test('Show And Hide Password', async ({ loginPage }) => {
      await loginPage
        .checkPasswordIsHidden()
        .then((l) => l.clickPasswordToggle())
        .then((l) => l.checkPasswordIsVisible())
        .then((l) => l.clickPasswordToggle())
        .then((l) => l.checkPasswordIsHidden())
    })

    test('Login With Correct Credentials', async ({ loginPage }) => {
      const dashboardPage = await loginPage.login(
        loginCredentials.validUser.username,
        loginCredentials.validUser.password
      )
      await dashboardPage.checkUrl(loginPageData.urlDashboard)
    })
  })

  test.describe('Login Page - Negative Scenarios', () => {
    negativeLoginCases.forEach(({ description, username, password }) => {
      test(`Login With ${description} Stays On Login Page`, async ({ loginPage }) => {
        await loginPage
          .fillUserName(username)
          .then((l) => l.fillPassword(password))
          .then((l) => l.clickSubmit())
          .then((l) => l.checkUrl(loginPageData.urlLoginPage))
      })
    })

    invalidCredentialsCases.forEach(({ description, username, password }) => {
      test(`Login With ${description} Shows Error Message`, async ({ loginPage }) => {
        await loginPage
          .fillUserName(username)
          .then((l) => l.fillPassword(password))
          .then((l) => l.clickSubmit())
          .then((l) => l.checkLoginErrorMessage(loginPageData.invalidCredentialsMessage))
      })
    })

    test('Login With Username Under Minimum Length Shows Field Error', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginPageData.underMinLengthValue)
        .then((l) => l.fillPassword(loginCredentials.invalidUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkUsernameFieldError(loginPageData.usernameFieldErrorMessage))
    })

    test('Login With Password Under Minimum Length Shows Field Error', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginCredentials.invalidUser.username)
        .then((l) => l.fillPassword(loginPageData.underMinLengthValue))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkPasswordFieldError(loginPageData.passwordFieldErrorMessage))
    })

    test('Login With Both Fields Under Minimum Length Shows Both Field Errors', async ({
      loginPage,
    }) => {
      await loginPage
        .fillUserName(loginPageData.underMinLengthValue)
        .then((l) => l.fillPassword(loginPageData.underMinLengthValue))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkUsernameFieldError(loginPageData.usernameFieldErrorMessage))
        .then((l) => l.checkPasswordFieldError(loginPageData.passwordFieldErrorMessage))
    })

    test('Login Shows Error When Backend Is Unreachable', async ({ loginPage }) => {
      await loginPage
        .simulateBackendUnreachable()
        .then((l) => l.fillUserName(loginCredentials.validUser.username))
        .then((l) => l.fillPassword(loginCredentials.validUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkLoginErrorMessage(loginPageData.backendUnreachableMessage))
    })

    test('Login Error Message Hides When Retyping Credentials', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginCredentials.invalidUser.username)
        .then((l) => l.fillPassword(loginCredentials.invalidUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkLoginErrorMessage(loginPageData.invalidCredentialsMessage))
        .then((l) => l.fillUserName(loginCredentials.validUser.username))
        .then((l) => l.checkLoginErrorHidden())
    })

    test('Password Field Error Hides When Retyping Password', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginCredentials.invalidUser.username)
        .then((l) => l.fillPassword(loginPageData.underMinLengthValue))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkPasswordFieldError(loginPageData.passwordFieldErrorMessage))
        .then((l) => l.fillPassword(loginCredentials.validUser.password))
        .then((l) => l.checkPasswordFieldErrorHidden())
    })

    test('Username Field Error Hides When Retyping Username', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginPageData.underMinLengthValue)
        .then((l) => l.fillPassword(loginCredentials.invalidUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkUsernameFieldError(loginPageData.usernameFieldErrorMessage))
        .then((l) => l.fillUserName(loginCredentials.validUser.username))
        .then((l) => l.checkUsernameFieldErrorHidden())
    })

    // Known app bug: the sign-in button is disabled on submit and only re-enabled
    // in the network-failure branch, not after a client-side validation failure —
    // the second clickSubmit() times out waiting for the (still disabled) button.
    test('Login Succeeds After Fixing Username Under Minimum Length', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginPageData.underMinLengthValue)
        .then((l) => l.fillPassword(loginCredentials.validUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkUsernameFieldError(loginPageData.usernameFieldErrorMessage))
        .then((l) => l.fillUserName(loginCredentials.validUser.username))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkUrl(loginPageData.urlDashboard))
    })

    // Known app bug: same missing button re-enable, this time in the invalid-credentials
    // branch (res not ok) — the retry's clickSubmit() times out on the disabled button.
    test('Login Succeeds After Retrying With Correct Credentials', async ({ loginPage }) => {
      await loginPage
        .fillUserName(loginCredentials.invalidUser.username)
        .then((l) => l.fillPassword(loginCredentials.invalidUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkLoginErrorMessage(loginPageData.invalidCredentialsMessage))
        .then((l) => l.fillUserName(loginCredentials.validUser.username))
        .then((l) => l.fillPassword(loginCredentials.validUser.password))
        .then((l) => l.clickSubmit())
        .then((l) => l.checkUrl(loginPageData.urlDashboard))
    })
  })

  themeCases.forEach(({ description, theme }) => {
    test.describe('Visual Tests For Login Page', () => {
      test.use({ theme })

      test(`Login Page Matches ${description} Snapshot`, async ({ loginPage }) => {
        await loginPage.checkFullPageSnapshot(`login-page-${theme}.png`)
      })
    })
  })
})
