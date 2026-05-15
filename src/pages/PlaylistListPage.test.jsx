import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { getPublicPlaylists, searchPlaylists } from '../api/playlistApi.js'
import { PlaylistListPage } from './PlaylistListPage.jsx'

vi.mock('../api/playlistApi.js', () => ({
  getPublicPlaylists: vi.fn(),
  searchPlaylists: vi.fn(),
}))

describe('PlaylistListPage', () => {
  it('uses the playlist search API when a keyword query param is present', async () => {
    searchPlaylists.mockResolvedValue([
      {
        playlistId: 1,
        title: '로맨틱 재즈',
        description: '저녁에 듣기 좋은 플레이리스트',
        publicYn: 'Y',
        trackCount: 12,
      },
    ])

    render(
      <MemoryRouter initialEntries={['/playlists?keyword=로맨틱']}>
        <Routes>
          <Route path="/playlists" element={<PlaylistListPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitForElementToBeRemoved(() => screen.queryByText('불러오는 중입니다.'))

    expect(searchPlaylists).toHaveBeenCalledWith('로맨틱')
    expect(getPublicPlaylists).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: '플레이리스트 검색 결과' })).toBeInTheDocument()
    expect(screen.getByText('로맨틱 재즈')).toBeInTheDocument()
  })
})
