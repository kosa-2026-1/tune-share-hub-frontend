import { describe, expect, it } from 'vitest'
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore.js'

describe('tokenStore', () => {
  it('keeps the access token in memory only', () => {
    setAccessToken('Bearer access-token')

    expect(getAccessToken()).toBe('Bearer access-token')

    clearAccessToken()

    expect(getAccessToken()).toBeNull()
  })
})
