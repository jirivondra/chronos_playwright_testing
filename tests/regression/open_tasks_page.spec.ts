import { test } from '../../support/fixture'
import { paginationData, generateNonLastPageNumber } from '../../support/test-data/pagination_data'

test.describe('Test Open Tasks Page', () => {
  test.describe('Atomic Tests For Pagination', () => {
    let paginationVisible: boolean

    test.beforeEach(async ({ openTasksPage }) => {
      paginationVisible = await openTasksPage.isPaginationVisible()
    })

    test('Check Pagination Hidden When Task Count Does Not Exceed Page Size', async ({
      openTasksPage,
    }) => {
      test.skip(paginationVisible)
      await openTasksPage.checkPaginationNotVisible()
    })

    test('Check Pagination Visible When Task Count Exceeds Page Size', async ({
      openTasksPage,
    }) => {
      test.skip(!paginationVisible)
      await openTasksPage.checkPaginationVisible()
    })
  })

  test.describe('E2E Test For Pagination Navigation', () => {
    let paginationVisible: boolean

    test.beforeEach(async ({ openTasksPage }) => {
      paginationVisible = await openTasksPage.isPaginationVisible()
    })

    test('Navigate To Random Page Shows Correct Page And Item Count', async ({ openTasksPage }) => {
      test.skip(!paginationVisible)

      const totalPages = await test.step('Read total page count', async () => {
        return openTasksPage.getTotalPages()
      })

      const targetPage = generateNonLastPageNumber(totalPages)

      await test.step('Navigate to a non-last page', async () => {
        await openTasksPage.goToPage(targetPage)
      })

      await test.step('Verify current page and item count', async () => {
        await openTasksPage.checkCurrentPage(targetPage)
        await openTasksPage.checkItemCountOnPage(paginationData.pageSize)
      })
    })
  })
})
