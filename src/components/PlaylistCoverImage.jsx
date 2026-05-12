import { DEFAULT_PLAYLIST_COVER, resolveAssetUrl } from '../utils/assets.js'

export function PlaylistCoverImage({ src, alt = '' }) {
  function handleImageError(event) {
    if (event.currentTarget.src.endsWith(DEFAULT_PLAYLIST_COVER)) return
    event.currentTarget.src = DEFAULT_PLAYLIST_COVER
  }

  return <img src={resolveAssetUrl(src)} alt={alt} onError={handleImageError} />
}
