export function formatDuration(durationMs) {
  if (!durationMs) return '--:--'
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function getTrackCount(playlist) {
  return Array.isArray(playlist?.tracks) ? playlist.tracks.length : 0
}

export function isPublicPlaylist(playlist) {
  return (playlist?.publicYn || playlist?.public_yn || 'Y') === 'Y'
}

export function toPlaylistRequest(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    cover_image_url: form.coverImageUrl.trim(),
    public_yn: form.publicYn,
  }
}

export function paginate(items, page, size) {
  const safeItems = Array.isArray(items) ? items : []
  const totalPages = Math.max(1, Math.ceil(safeItems.length / size))
  const start = (page - 1) * size
  return {
    items: safeItems.slice(start, start + size),
    totalPages,
  }
}
