import { request } from './client.js'

export async function searchMusic(keyword) {
  return request({ method: 'get', url: '/api/spotify/search', params: { keyword } })
}
