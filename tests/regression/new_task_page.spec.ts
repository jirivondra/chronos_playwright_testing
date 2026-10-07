import { test } from '../../support/fixture'
import { taskHeadlineH1 } from '../../support/test-data/task_headline'

test.describe('Test New Task Page', () => {
  test.describe('Atomic Tests For Create Task Form', () => {
    test('Create Task Button Is Disabled Until Title Is Filled', async ({ newTaskPage }) => {
      await newTaskPage.checkCreateTaskButtonBehave()
    })

    test('Check H1 On Page New Task', async ({ newTaskPage }) => {
      await newTaskPage.checkH1(taskHeadlineH1.newTaskHeadline)
    })
  })

  test.describe('E2E Test For New Task Page', () => {
    test('Create New Task', async ({ newTaskPage }) => {
      await newTaskPage
        .fillTaskTitle()
        .then((n) => n.clickCreateTaskButton())
        .then((d) => d.checkTaskInOpenSection(newTaskPage.taskName))
    })

    test.skip('Create Task Button Triggers POST Request', async ({ newTaskPage }) => {
      await newTaskPage.fillTaskTitle().then((n) => n.checkCreateTaskPostRequest())
    })
  })
})
