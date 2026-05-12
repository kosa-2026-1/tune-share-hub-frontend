import { request } from './client.js'

export async function getUserInfo(userId) {
  return request({ method: 'get', url: '/api/user/me', params: { userId } })
}

export async function getLikedPlaylists(userId) {
  return request({ method: 'get', url: '/api/user/me/likes', params: { userId } })
}
