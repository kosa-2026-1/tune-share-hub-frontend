export function formatDuration(durationMs) {
  if (!durationMs) return '--:--'
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getTrackCount(playlist) {
  if (playlist?.trackCount != null) return Number(playlist.trackCount)
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
    publicYn: form.publicYn,
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
