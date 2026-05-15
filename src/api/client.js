import axios from 'axios'
import { clearAccessToken, getAccessToken, setAccessToken } from '../stores/tokenStore.js'
import { unwrapApiResponse } from './normalizers.js'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config
  }

  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

let reissuePromise = null

function readAuthorizationHeader(response) {
  return response?.headers?.authorization || response?.headers?.Authorization || null
}

export async function reissueAccessToken() {
  if (!reissuePromise) {
    reissuePromise = apiClient
      .post('/api/auth/reissue')
      .then((response) => {
        const token = readAuthorizationHeader(response)
        if (!token) {
          throw new Error('재발급 응답에 Access Token이 없습니다.')
        }
        setAccessToken(token)
        return token
      })
      .finally(() => {
        reissuePromise = null
      })
  }

  return reissuePromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (originalRequest?.url?.includes('/api/auth/reissue')) {
      return Promise.reject(error)
    }

    if (originalRequest?.skipAuth) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await reissueAccessToken()
        originalRequest.headers.Authorization = getAccessToken()
        return apiClient(originalRequest)
      } catch (reissueError) {
        clearAccessToken()
        return Promise.reject(reissueError)
      }
    }
    return Promise.reject(error)
  },
)

export async function request(config) {
  const response = await apiClient(config)
  return unwrapApiResponse(response.data)
}

export function extractAccessToken(response) {
  return readAuthorizationHeader(response)
}
