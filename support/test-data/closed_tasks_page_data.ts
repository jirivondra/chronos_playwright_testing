import dayjs from 'dayjs'

export const closedTasksPageData = {
  h1: 'Closed Tasks',
}

export function generateClosedTaskTitle() {
  return `Closed Test - ${dayjs().format('DD.MM.YYYY - HH:mm:ss.SSS')}`
}
