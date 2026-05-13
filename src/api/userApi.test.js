import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from './client.js'
import { getLikedPlaylists, getUserInfo } from './userApi.js'

vi.mock('./client.js', () => ({
  request: vi.fn(),
}))

describe('userApi', () => {
  beforeEach(() => {
    request.mockResolvedValue({})
    request.mockClear()
  })

  it('uses token-authenticated user endpoints without userId query params', async () => {
    await getUserInfo()
    await getLikedPlaylists()

    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'get',
      url: '/api/user/me',
    })
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'get',
      url: '/api/user/me/likes',
    })
  })
})
