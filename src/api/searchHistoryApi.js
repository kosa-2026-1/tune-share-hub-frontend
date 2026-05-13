import { request } from './client.js'

export async function getSearchHistory() {
  return request({ method: 'get', url: '/api/search/history' })
}

export async function saveSearchHistory(userIdOrKeyword, maybeKeyword) {
  const keyword = maybeKeyword ?? userIdOrKeyword
  return request({
    method: 'post',
    url: '/api/search/history',
    data: { keyword },
  })
}

export async function deleteSearchHistory(userIdOrHistoryId, maybeHistoryId) {
  const historyId = maybeHistoryId ?? userIdOrHistoryId
  return request({
    method: 'delete',
    url: '/api/search/history',
    params: { historyId },
  })
}
