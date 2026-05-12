import { API_BASE_URL } from '../api/client.js'

export const DEFAULT_PLAYLIST_COVER = '/assets/default-playlist-cover.png'

export function resolveAssetUrl(src) {
  if (!src) return DEFAULT_PLAYLIST_COVER

  if (/^(https?:|blob:|data:)/i.test(src)) {
    return src
  }

  if (src.startsWith('/assets/')) {
    return src
  }

  return new URL(src, API_BASE_URL).toString()
}
