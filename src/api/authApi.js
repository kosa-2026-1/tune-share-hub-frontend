import { apiClient, extractAccessToken, request } from './client.js'

export async function login(credentials) {
  const response = await apiClient.post('/api/auth/login', credentials)
  return {
    user: response.data?.data,
    accessToken: extractAccessToken(response),
    message: response.data?.message,
  }
}

export async function logout(userId) {
  return request({
    method: 'post',
    url: '/api/auth/logout',
    params: { userId },
  })
}

export async function reissue() {
  const response = await apiClient.post('/api/auth/reissue')
  return {
    accessToken: extractAccessToken(response),
    message: response.data?.message,
  }
}
