import { describe, expect, it } from 'vitest'
import { isOwnedPlaylist } from './ownership.js'

describe('isOwnedPlaylist', () => {
  it('uses direct owner fields when they exist', () => {
    expect(isOwnedPlaylist({ playlistId: 1, userId: 7 }, 7)).toBe(true)
  })

  it('falls back to the current user playlist list', () => {
    expect(isOwnedPlaylist({ playlistId: 2 }, 7, [{ playlistId: 2 }])).toBe(true)
  })

  it('returns false when ownership cannot be confirmed', () => {
    expect(isOwnedPlaylist({ playlistId: 3 }, 7, [{ playlistId: 2 }])).toBe(false)
  })
})
