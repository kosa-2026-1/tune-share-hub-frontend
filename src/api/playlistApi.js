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

export async function getPlaylistRanking(limit = 10, type = 'like') {
  return request({ method: 'get', url: '/api/playlists/ranking', params: { limit, type } })
}

export async function getMyPlaylists() {
  return request({ method: 'get', url: '/api/users/me/playlists' })
}

export async function getPlaylistDetail(id) {
  return request({ method: 'get', url: `/api/playlists/${id}` })
}

export async function createPlaylist(userIdOrPayload, maybePayload) {
  return request({
    method: 'post',
    url: '/api/playlists',
    data: maybePayload ?? userIdOrPayload,
  })
}

export async function updatePlaylist(id, userIdOrPayload, maybePayload) {
  return request({
    method: 'put',
    url: `/api/playlists/${id}`,
    data: maybePayload ?? userIdOrPayload,
  })
}

export async function deletePlaylist(id) {
  return request({ method: 'delete', url: `/api/playlists/${id}` })
}

export async function copyPlaylist(id) {
  return request({ method: 'post', url: `/api/playlists/${id}/copy` })
}

export async function updatePlaylistVisibility(id, userIdOrPayload, maybePayload) {
  const payload = maybePayload ?? userIdOrPayload
  const publicYn = typeof payload === 'string' ? payload : payload?.publicYn || payload?.public_yn
  return request({
    method: 'patch',
    url: `/api/playlists/${id}/visibility`,
    params: { publicYn },
  })
}

export async function addTracksToPlaylist(id, userIdOrTracks, maybeTracks) {
  return request({
    method: 'post',
    url: `/api/playlists/${id}/tracks`,
    data: maybeTracks ?? userIdOrTracks,
  })
}

export async function removeTrackFromPlaylist(id, userIdOrTrackId, maybeTrackId) {
  const trackId = maybeTrackId ?? userIdOrTrackId
  return request({
    method: 'delete',
    url: `/api/playlists/${id}/tracks/${trackId}`,
  })
}

export async function reorderPlaylistTracks(id, userIdOrTracks, maybeTracks) {
  return request({
    method: 'patch',
    url: `/api/playlists/${id}/tracks/reorder`,
    data: maybeTracks ?? userIdOrTracks,
  })
}

export async function togglePlaylistLike(id) {
  return request({ method: 'post', url: `/api/playlists/${id}/likes` })
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
