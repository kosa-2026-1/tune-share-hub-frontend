export function canShowYoutubeEmbed(youtubeUrl) {
  return typeof youtubeUrl === 'string' && youtubeUrl.trim().length > 0
}

export function getYoutubeVideoId(youtubeUrl) {
  if (!canShowYoutubeEmbed(youtubeUrl)) return null

  try {
    const url = new URL(youtubeUrl)
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.split('/').filter(Boolean)[0] || null
    }
    if (url.pathname.includes('/embed/')) {
      return url.pathname.split('/embed/')[1]?.split('/')[0] || null
    }
    return url.searchParams.get('v')
  } catch {
    return null
  }
}

export function getPlayableTracks(tracks) {
  return (tracks || []).filter((track) => getYoutubeVideoId(track.youtubeUrl))
}

export function buildYoutubeEmbedUrl(youtubeUrl) {
  if (!canShowYoutubeEmbed(youtubeUrl)) return ''

  try {
    const url = new URL(youtubeUrl)
    url.searchParams.set('enablejsapi', '1')
    url.searchParams.set('playsinline', '1')
    url.searchParams.set('autoplay', '1')
    if (typeof window !== 'undefined') {
      url.searchParams.set('origin', window.location.origin)
    }
    return url.toString()
  } catch {
    return youtubeUrl
  }
}

export function getYoutubeEmbedTitle(track) {
  const title = track?.title || '트랙'
  const artist = track?.artistName ? ` - ${track.artistName}` : ''
  return `${title}${artist} 뮤직비디오`
}
