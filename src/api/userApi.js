import { request } from './client.js'

export async function getUserInfo() {
  return request({ method: 'get', url: '/api/user/me' })
}

export async function getLikedPlaylists() {
  return request({ method: 'get', url: '/api/user/me/likes' })
}
