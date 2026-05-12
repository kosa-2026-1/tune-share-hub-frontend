import { request } from './client.js'
import { normalizePlaylistPage } from './normalizers.js'

export async function getPublicPlaylists({ page = 1, size = 8 } = {}) {
  const data = await request({
    method: 'get',
    url: '/api/playlists',
    params: { page, size },
  })
  return normalizePlaylistPage(data)
}

export async function getPlaylistRanking(limit = 10) {
  return request({ method: 'get', url: '/api/playlists/ranking', params: { limit } })
}

export async function getMyPlaylists(userId) {
  return request({ method: 'get', url: '/api/users/me/playlists', params: { userId } })
}

export async function getPlaylistDetail(id, userId) {
  return request({ method: 'get', url: `/api/playlists/${id}`, params: { userId } })
}

export async function createPlaylist(userId, payload) {
  return request({
    method: 'post',
    url: '/api/playlists',
    params: { userId },
    data: payload,
  })
}

export async function updatePlaylist(id, userId, payload) {
  return request({
    method: 'put',
    url: `/api/playlists/${id}`,
    params: { userId },
    data: payload,
  })
}

export async function deletePlaylist(id, userId) {
  return request({ method: 'delete', url: `/api/playlists/${id}`, params: { userId } })
}

export async function updatePlaylistVisibility(id, userId, payload) {
  return request({
    method: 'patch',
    url: `/api/playlists/${id}/visibility`,
    params: { userId },
    data: payload,
  })
}

export async function addTracksToPlaylist(id, userId, tracks) {
  return request({
    method: 'post',
    url: `/api/playlists/${id}/tracks`,
    params: { userId },
    data: tracks,
  })
}

export async function removeTrackFromPlaylist(id, userId, trackId) {
  return request({
    method: 'delete',
    url: `/api/playlists/${id}/tracks/${trackId}`,
    params: { userId },
  })
}

export async function reorderPlaylistTracks(id, userId, tracks) {
  return request({
    method: 'patch',
    url: `/api/playlists/${id}/tracks/reorder`,
    params: { userId },
    data: tracks,
  })
}

export async function togglePlaylistLike(id, userId) {
  return request({ method: 'post', url: `/api/playlists/${id}/likes`, params: { userId } })
}

export async function createPlaylistComment(id, payload) {
  return request({ method: 'post', url: `/api/playlists/${id}/comments`, data: payload })
}

export async function updatePlaylistComment(id, commentId, payload) {
  return request({
    method: 'put',
    url: `/api/playlists/${id}/comments/${commentId}`,
    data: payload,
  })
}

export async function deletePlaylistComment(id, commentId) {
  return request({ method: 'delete', url: `/api/playlists/${id}/comments/${commentId}` })
}
