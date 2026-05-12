import { request } from './client.js'

export async function getSearchHistory(userId) {
  return request({ method: 'get', url: '/api/search/history', params: { userId } })
}

export async function saveSearchHistory(userId, keyword) {
  return request({
    method: 'post',
    url: '/api/search/history',
    params: { userId },
    data: { keyword },
  })
}

export async function deleteSearchHistory(userId, historyId) {
  return request({
    method: 'delete',
    url: '/api/search/history',
    params: { userId, historyId },
  })
}
