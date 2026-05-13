import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from './client.js'
import { deleteSearchHistory, getSearchHistory, saveSearchHistory } from './searchHistoryApi.js'

vi.mock('./client.js', () => ({
  request: vi.fn(),
}))

describe('searchHistoryApi', () => {
  beforeEach(() => {
    request.mockResolvedValue({})
    request.mockClear()
  })

  it('uses authenticated search-history endpoints without userId query params', async () => {
    await getSearchHistory()
    await saveSearchHistory('iu')
    await deleteSearchHistory(7)

    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'get',
      url: '/api/search/history',
    })
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'post',
      url: '/api/search/history',
      data: { keyword: 'iu' },
    })
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'delete',
      url: '/api/search/history',
      params: { historyId: 7 },
    })
  })
})
