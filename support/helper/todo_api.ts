import { HttpMethod } from '../constants/http_method'
import { todosEndpoint } from '../constants/endpoints'

function headers() {
  const authHeader =
    'Basic ' +
    Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString('base64')
  return {
    Authorization: authHeader,
    'Content-Type': 'application/json',
  }
}

export async function getTodos(order?: 'asc' | 'desc'): Promise<Response> {
  const query = order ? `?order=${order}` : ''
  return fetch(`${process.env.API_BASE_URL}${todosEndpoint}${query}`, {
    headers: headers(),
  })
}

export async function createTodo(body: {
  title: string
  due_date?: string
  completed?: boolean
}): Promise<Response> {
  return fetch(`${process.env.API_BASE_URL}${todosEndpoint}`, {
    method: HttpMethod.Post,
    headers: headers(),
    body: JSON.stringify(body),
  })
}

export async function deleteTodo(id: number): Promise<Response> {
  return fetch(`${process.env.API_BASE_URL}${todosEndpoint}/${id}`, {
    method: HttpMethod.Delete,
    headers: headers(),
  })
}
