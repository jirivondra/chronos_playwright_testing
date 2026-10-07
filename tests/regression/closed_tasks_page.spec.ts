import { test } from '../../support/fixture'
import { paginationData, generateNonLastPageNumber } from '../../support/test-data/pagination_data'
import { closedTasksPageData } from '../../support/test-data/closed_tasks_page_data'
import { themeCases } from '../../support/test-data/visual_testing_data'
import {
  listControlsData,
  sortOrderCases,
  pageSizeCases,
} from '../../support/test-data/list_controls_data'

test.describe('Test Closed Tasks Page', () => {
  let paginationVisible: boolean

  test.beforeEach(async ({ closedTasksPage }) => {
    paginationVisible = await closedTasksPage.isPaginationVisible()
  })

  test.describe('Atomic Tests For Closed Tasks Page', () => {
    test('Check H1 On Page Closed Tasks', async ({ closedTasksPage }) => {
      await closedTasksPage.checkH1(closedTasksPageData.h1)
    })

    test('Check All Closed Tasks Marked Complete', async ({ closedTasksPage }) => {
      await closedTasksPage.checkAllTasksMarkedComplete()
    })

    test('Check Pagination Hidden When Task Count Does Not Exceed Page Size', async ({
      closedTasksPage,
    }) => {
      test.skip(paginationVisible)
      await closedTasksPage.checkPaginationNotVisible()
    })

    test('Check Pagination Visible When Task Count Exceeds Page Size', async ({
      closedTasksPage,
    }) => {
      test.skip(!paginationVisible)
      await closedTasksPage.checkPaginationVisible()
    })

    test('Check Sort Order Default Value', async ({ closedTasksPage }) => {
      await closedTasksPage.checkSortOrderValue(listControlsData.defaultSortOrder)
    })

    test('Check Sort Order Options', async ({ closedTasksPage }) => {
      await closedTasksPage.checkSortOrderOptions(sortOrderCases.map((c) => c.label))
    })

    test('Check Page Size Default Value', async ({ closedTasksPage }) => {
      test.skip(!paginationVisible)
      await closedTasksPage.checkPageSizeValue(listControlsData.defaultPageSize)
    })

    test('Check Page Size Options', async ({ closedTasksPage }) => {
      test.skip(!paginationVisible)
      await closedTasksPage.checkPageSizeOptions(pageSizeCases.map((c) => c.value))
    })
  })

  test.describe('E2E Test For Closed Tasks Page', () => {
    test('Sidebar Menu Collapse And Expand', async ({ closedTasksPage }) => {
      await closedTasksPage.checkOpenAndCloseSiteMenu()
    })
  })

  test.describe('E2E Test For Pagination Navigation', () => {
    test('Navigate To Random Page Shows Correct Page And Item Count', async ({
      closedTasksPage,
    }) => {
      test.skip(!paginationVisible)

      const totalPages = await test.step('Read total page count', async () => {
        return closedTasksPage.getTotalPages()
      })

      const targetPage = generateNonLastPageNumber(totalPages)

      await test.step('Navigate to a non-last page', async () => {
        await closedTasksPage.goToPage(targetPage)
      })

      await test.step('Verify current page and item count', async () => {
        await closedTasksPage.checkCurrentPage(targetPage)
        await closedTasksPage.checkItemCountOnPage(paginationData.pageSize)
      })

      await test.step('Verify tasks on this page are marked complete', async () => {
        await closedTasksPage.checkAllTasksMarkedComplete()
      })
    })
  })

  sortOrderCases.forEach(({ description, value }) => {
    test.describe('E2E Test For Sort Order Change', () => {
      test(`Selecting ${description} Reorders The Task List`, async ({ closedTasksPage }) => {
        const expectedTitles = await test.step('Fetch expected order from the API', async () => {
          const titles = await closedTasksPage.getCompletedTaskTitles(value)
          return titles.slice(0, listControlsData.defaultPageSize)
        })

        await test.step('Select the sort order', async () => {
          await closedTasksPage.selectSortOrder(value)
          await closedTasksPage.checkSortOrderValue(value)
        })

        await test.step('Verify the task list reflects the new order', async () => {
          await closedTasksPage.checkDisplayedTaskTitlesOrder(expectedTitles)
        })
      })
    })
  })

  pageSizeCases.forEach(({ description, value }) => {
    test.describe('E2E Test For Page Size Change', () => {
      test(`Selecting ${description} Per Page Updates Visible Task Count`, async ({
        closedTasksPage,
      }) => {
        test.skip(!paginationVisible)

        const totalCompleted = await test.step('Fetch total completed task count', async () => {
          const titles = await closedTasksPage.getCompletedTaskTitles()
          return titles.length
        })

        await test.step('Select the page size', async () => {
          await closedTasksPage.selectPageSize(value)
          await closedTasksPage.checkPageSizeValue(value)
        })

        await test.step('Verify the visible item count matches the new page size', async () => {
          await closedTasksPage.checkItemCountOnPage(Math.min(value, totalCompleted))
        })
      })
    })
  })
})

themeCases.forEach(({ description, theme }) => {
  test.describe('Visual Tests For Closed Tasks Page', () => {
    test.use({ theme })

    test(`Closed Tasks Header Matches ${description} Snapshot`, async ({ closedTasksPage }) => {
      await closedTasksPage.checkHeaderSnapshot(`closed-tasks-header-${theme}.png`)
    })

    test(`Closed Tasks Sidebar Matches ${description} Snapshot`, async ({ closedTasksPage }) => {
      await closedTasksPage.checkSidebarSnapshot(`closed-tasks-sidebar-${theme}.png`)
    })

    test(`Closed Tasks Top Header Matches ${description} Snapshot`, async ({ closedTasksPage }) => {
      await closedTasksPage.checkTopHeaderSnapshot(`closed-tasks-top-header-${theme}.png`)
    })
  })
})
