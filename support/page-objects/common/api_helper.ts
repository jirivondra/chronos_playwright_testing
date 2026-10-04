import { HttpMethod } from '../../constants/http_method'

export class ApiHelper {
  protected path: string
  protected baseApiUrl: string
  private authHeader: string
  private readonly authScheme: string
  private readonly authEncoding: BufferEncoding
  private readonly authorizationHeaderName: string
  private readonly contentTypeHeaderName: string
  private readonly jsonContentType: string
  private readonly unsupportedMethodMessage: string

  constructor(path: string) {
    this.path = path
    this.baseApiUrl = process.env.API_BASE_URL!
    this.authScheme = 'Basic '
    this.authEncoding = 'base64'
    this.authorizationHeaderName = 'Authorization'
    this.contentTypeHeaderName = 'Content-Type'
    this.jsonContentType = 'application/json'
    this.unsupportedMethodMessage = 'Nepodporovaná metoda'
    this.authHeader =
      this.authScheme +
      Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`).toString(
        this.authEncoding
      )
  }

  protected headers() {
    return {
      [this.authorizationHeaderName]: this.authHeader,
      [this.contentTypeHeaderName]: this.jsonContentType,
    }
  }

  protected async get(endpoint: string) {
    return fetch(`${this.baseApiUrl}${endpoint}`, {
      headers: this.headers(),
    })
  }

  protected async post(endpoint: string, body?: object) {
    return fetch(`${this.baseApiUrl}${endpoint}`, {
      method: HttpMethod.Post,
      headers: this.headers(),
      body: JSON.stringify(body),
    })
  }

  protected async put(endpoint: string, body?: object) {
    return fetch(`${this.baseApiUrl}${endpoint}`, {
      method: HttpMethod.Put,
      headers: this.headers(),
      body: JSON.stringify(body),
    })
  }

  protected async delete(endpoint: string) {
    return fetch(`${this.baseApiUrl}${endpoint}`, {
      method: HttpMethod.Delete,
      headers: this.headers(),
    })
  }

  async apiRequest(method: HttpMethod, endpoint: string, body?: object) {
    switch (method) {
      case HttpMethod.Get:
        return this.get(endpoint)
      case HttpMethod.Post:
        return this.post(endpoint, body)
      case HttpMethod.Put:
        return this.put(endpoint, body)
      case HttpMethod.Delete:
        return this.delete(endpoint)
      default:
        throw new Error(`${this.unsupportedMethodMessage}: ${method}`)
    }
  }
}
