import { describe, expect, it } from 'vitest'
import { resolveAssetUrl } from './assets.js'

describe('resolveAssetUrl', () => {
  it('resolves backend upload paths against the API origin', () => {
    expect(resolveAssetUrl('/uploads/images/cover.png')).toBe(
      'http://localhost:8080/uploads/images/cover.png',
    )
  })

  it('keeps local public assets on the frontend origin', () => {
    expect(resolveAssetUrl('/assets/default-playlist-cover.png')).toBe(
      '/assets/default-playlist-cover.png',
    )
  })

  it('keeps absolute and blob urls unchanged', () => {
    expect(resolveAssetUrl('https://example.com/cover.png')).toBe('https://example.com/cover.png')
    expect(resolveAssetUrl('blob:http://localhost:3000/cover')).toBe(
      'blob:http://localhost:3000/cover',
    )
  })
})
