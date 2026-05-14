import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from './client.js'
import {
  addTracksToPlaylist,
  copyPlaylist,
  deletePlaylist,
  getMyPlaylists,
  getPlaylistDetail,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  togglePlaylistLike,
  updatePlaylistVisibility,
} from './playlistApi.js'

vi.mock('./client.js', () => ({
  request: vi.fn(),
}))

describe('playlistApi', () => {
  beforeEach(() => {
    request.mockResolvedValue({})
    request.mockClear()
  })

  it('loads authenticated playlist resources without userId query params', async () => {
    await getMyPlaylists()
    await getPlaylistDetail(10)
    await deletePlaylist(10)
    await togglePlaylistLike(10)
    await copyPlaylist(10)

    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'get',
      url: '/api/users/me/playlists',
    })
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'get',
      url: '/api/playlists/10',
    })
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'delete',
      url: '/api/playlists/10',
    })
    expect(request).toHaveBeenNthCalledWith(4, {
      method: 'post',
      url: '/api/playlists/10/likes',
    })
    expect(request).toHaveBeenNthCalledWith(5, {
      method: 'post',
      url: '/api/playlists/10/copy',
    })
  })

  it('updates playlist tracks without userId query params', async () => {
    const tracks = [{ playlistTrackId: 1, positionNo: 1 }]

    await addTracksToPlaylist(10, tracks)
    await reorderPlaylistTracks(10, tracks)
    await removeTrackFromPlaylist(10, 1)

    expect(request).toHaveBeenNthCalledWith(1, {
      method: 'post',
      url: '/api/playlists/10/tracks',
      data: tracks,
    })
    expect(request).toHaveBeenNthCalledWith(2, {
      method: 'patch',
      url: '/api/playlists/10/tracks/reorder',
      data: tracks,
    })
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'delete',
      url: '/api/playlists/10/tracks/1',
    })
  })

  it('sends visibility as a publicYn query param only', async () => {
    await updatePlaylistVisibility(10, 'N')

    expect(request).toHaveBeenCalledWith({
      method: 'patch',
      url: '/api/playlists/10/visibility',
      params: { publicYn: 'N' },
    })
  })
})
