export function unwrapApiResponse(payload) {
  if (!payload || typeof payload !== 'object' || !('success' in payload)) {
    return payload
  }

  if (!payload.success) {
    throw new Error(payload.message || '요청 처리에 실패했습니다.')
  }

  return payload.data
}

export function normalizePlaylistPage(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      size: payload.length,
      totalPages: 1,
      totalElements: payload.length,
    }
  }

  const items =
    payload?.items ||
    payload?.playlists ||
    payload?.content ||
    payload?.list ||
    payload?.data ||
    []

  return {
    items: Array.isArray(items) ? items : [],
    page: Number(payload?.page ?? payload?.currentPage ?? 1),
    size: Number(payload?.size ?? payload?.pageSize ?? (Array.isArray(items) ? items.length : 0)),
    totalPages: Number(payload?.totalPages ?? payload?.pages ?? 1),
    totalElements: Number(
      payload?.totalElements ?? payload?.totalCount ?? (Array.isArray(items) ? items.length : 0),
    ),
  }
}

export function toPlaylistTrackCreateRequest(track) {
  return {
    trackId: track.trackId,
    title: track.title,
    artistName: track.artistName,
    albumName: track.albumName,
    albumImageUrl: track.albumImageUrl,
    spotifyUrl: track.spotifyUrl,
    durationMs: track.durationMs,
    youtubeUrl: track.youtubeUrl,
  }
}

export function toPlaylistFormData(form) {
  const formData = new FormData()
  formData.append('title', form.title.trim())
  formData.append('description', form.description.trim())
  formData.append('publicYn', form.publicYn)

  normalizeTags(form.tags).forEach((tag) => {
    formData.append('tags', tag)
  })

  if (form.coverImageFile) {
    formData.append('coverImage', form.coverImageFile)
  }

  return formData
}

export function applyLikeResponseToPlaylist(playlist, likeResponse) {
  if (!playlist || !likeResponse) return playlist

  return {
    ...playlist,
    likeCount: Number(likeResponse.totalLikeCount ?? playlist.likeCount ?? 0),
    liked: isLikedStatus(likeResponse.status ?? likeResponse.liked),
    likeStatus: likeResponse.status,
  }
}

function normalizeTags(tags) {
  return (Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 5)
}

function isLikedStatus(status) {
  if (typeof status === 'boolean') return status
  return ['LIKED', 'Y', 'TRUE'].includes(String(status || '').toUpperCase())
}
