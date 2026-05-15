import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { getPlaylistRanking } from '../api/playlistApi.js'
import { RankingPage } from './RankingPage.jsx'

vi.mock('../api/playlistApi.js', () => ({
  getPlaylistRanking: vi.fn(),
}))

describe('RankingPage', () => {
  it('renders all ten ranking items returned by the API', async () => {
    getPlaylistRanking.mockResolvedValue(
      Array.from({ length: 10 }, (_, index) => ({
        playlistId: index + 1,
        title: `랭킹 플레이리스트 ${index + 1}`,
        likeCount: 10 - index,
        viewCount: 100 - index,
        trackCount: index + 1,
      })),
    )

    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('랭킹 플레이리스트 10')).toBeInTheDocument()
    })

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(getPlaylistRanking).toHaveBeenCalledWith(10, 'like')
  })
})
