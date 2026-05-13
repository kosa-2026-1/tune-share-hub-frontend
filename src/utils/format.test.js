import { describe, expect, it } from 'vitest'
import { formatDateTime, getTrackCount } from './format.js'

describe('getTrackCount', () => {
  it('uses the backend trackCount column when it is present', () => {
    expect(getTrackCount({ trackCount: 12, tracks: [{ playlistTrackId: 1 }] })).toBe(12)
  })

  it('falls back to the tracks array length for older responses', () => {
    expect(getTrackCount({ tracks: [{ playlistTrackId: 1 }, { playlistTrackId: 2 }] })).toBe(2)
  })
})

describe('formatDateTime', () => {
  it('formats valid date strings for Korean UI', () => {
    expect(formatDateTime('2026-05-13T01:23:00Z')).toContain('2026')
  })

  it('keeps backend string values when they are not parseable dates', () => {
    expect(formatDateTime('방금 전')).toBe('방금 전')
  })
})
