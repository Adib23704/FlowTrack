const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface RequestConfig extends RequestInit {
  token?: string
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { token, ...fetchConfig } = config

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...config.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchConfig,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred')
  }

  return data
}

export const api = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), token }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'DELETE', token }),
}

export default api
