import { describe, expect, it } from 'vitest'
import {
  buildYoutubeEmbedUrl,
  canShowYoutubeEmbed,
  getPlayableTracks,
  getYoutubeEmbedTitle,
  getYoutubeVideoId,
} from './youtube.js'

describe('youtube helpers', () => {
  it('accepts backend-provided embed URLs without conversion', () => {
    expect(canShowYoutubeEmbed('https://www.youtube.com/embed/video-id')).toBe(true)
    expect(getYoutubeVideoId('https://www.youtube.com/embed/video-id')).toBe('video-id')
  })

  it('does not show an empty embed', () => {
    expect(canShowYoutubeEmbed('')).toBe(false)
    expect(canShowYoutubeEmbed(null)).toBe(false)
    expect(getYoutubeVideoId('')).toBeNull()
  })

  it('filters the playable queue to tracks with embed video ids', () => {
    expect(
      getPlayableTracks([
        { trackId: '1', youtubeUrl: 'https://www.youtube.com/embed/a' },
        { trackId: '2', youtubeUrl: '' },
      ]),
    ).toEqual([{ trackId: '1', youtubeUrl: 'https://www.youtube.com/embed/a' }])
  })

  it('can add iframe API parameters to embed URLs', () => {
    const url = buildYoutubeEmbedUrl('https://www.youtube.com/embed/video-id')

    expect(url).toContain('enablejsapi=1')
    expect(url).toContain('playsinline=1')
    expect(url).toContain('autoplay=1')
  })

  it('builds a readable iframe title', () => {
    expect(getYoutubeEmbedTitle({ title: 'Track', artistName: 'Artist' })).toBe(
      'Track - Artist 뮤직비디오',
    )
  })
})
