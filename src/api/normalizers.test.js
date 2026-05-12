import { describe, expect, it } from 'vitest'
import {
  applyLikeResponseToPlaylist,
  normalizePlaylistPage,
  toPlaylistFormData,
  unwrapApiResponse,
} from './normalizers.js'

describe('unwrapApiResponse', () => {
  it('returns data from a successful API envelope', () => {
    expect(unwrapApiResponse({ success: true, data: { ok: true }, message: 'ok' })).toEqual({
      ok: true,
    })
  })

  it('throws an API message for failed envelopes', () => {
    expect(() => unwrapApiResponse({ success: false, message: '실패' })).toThrow('실패')
  })
})

describe('normalizePlaylistPage', () => {
  it('normalizes common paged map shapes', () => {
    expect(
      normalizePlaylistPage({
        playlists: [{ playlistId: 1 }],
        page: 2,
        size: 8,
        totalPages: 3,
        totalElements: 20,
      }),
    ).toEqual({
      items: [{ playlistId: 1 }],
      page: 2,
      size: 8,
      totalPages: 3,
      totalElements: 20,
    })
  })

  it('falls back to arrays when the backend returns a bare list', () => {
    expect(normalizePlaylistPage([{ playlistId: 1 }]).items).toEqual([{ playlistId: 1 }])
  })
})

describe('applyLikeResponseToPlaylist', () => {
  it('updates only the like fields from a like toggle response', () => {
    const playlist = {
      playlistId: 1,
      title: '내 플레이리스트',
      likeCount: 3,
      tracks: [{ playlistTrackId: 10 }],
    }

    expect(
      applyLikeResponseToPlaylist(playlist, {
        playlistId: 1,
        status: 'LIKED',
        totalLikeCount: 4,
      }),
    ).toEqual({
      playlistId: 1,
      title: '내 플레이리스트',
      likeCount: 4,
      liked: true,
      likeStatus: 'LIKED',
      tracks: [{ playlistTrackId: 10 }],
    })
  })

  it('keeps the previous playlist when the response is empty', () => {
    const playlist = { playlistId: 1, likeCount: 3 }

    expect(applyLikeResponseToPlaylist(playlist, null)).toBe(playlist)
  })
})

describe('toPlaylistFormData', () => {
  it('serializes playlist fields, tags, and cover image for multipart requests', () => {
    const file = new File(['cover'], 'cover.png', { type: 'image/png' })
    const formData = toPlaylistFormData({
      title: '  제목  ',
      description: '  설명  ',
      publicYn: 'N',
      tags: ['rock', 'k-pop'],
      coverImageFile: file,
    })

    expect(formData.get('title')).toBe('제목')
    expect(formData.get('description')).toBe('설명')
    expect(formData.get('public_yn')).toBe('N')
    expect(formData.getAll('tags')).toEqual(['rock', 'k-pop'])
    expect(formData.get('coverImage')).toBe(file)
  })

  it('limits tags to five non-empty values', () => {
    const formData = toPlaylistFormData({
      title: '제목',
      description: '',
      publicYn: 'Y',
      tags: ['a', 'b', '', 'c', 'd', 'e', 'f'],
    })

    expect(formData.getAll('tags')).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})
