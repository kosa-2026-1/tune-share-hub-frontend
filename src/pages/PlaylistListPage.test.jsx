import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { getPublicPlaylists } from '../api/playlistApi.js'
import { PlaylistListPage } from './PlaylistListPage.jsx'

vi.mock('../api/playlistApi.js', () => ({
  getPublicPlaylists: vi.fn(),
}))

describe('PlaylistListPage', () => {
  it('passes keyword to the public playlist API when a keyword query param is present', async () => {
    getPublicPlaylists.mockResolvedValue({
      items: [
        {
          playlistId: 1,
          title: '로맨틱 재즈',
          description: '저녁에 듣기 좋은 플레이리스트',
          publicYn: 'Y',
          trackCount: 12,
        },
      ],
      page: 1,
      size: 8,
      totalPages: 1,
      totalElements: 1,
    })

    render(
      <MemoryRouter initialEntries={['/playlists?keyword=로맨틱']}>
        <Routes>
          <Route path="/playlists" element={<PlaylistListPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitForElementToBeRemoved(() => screen.queryByText('불러오는 중입니다.'))

    expect(getPublicPlaylists).toHaveBeenCalledWith({ page: 1, size: 8, keyword: '로맨틱' })
    expect(screen.getByRole('heading', { name: '플레이리스트 검색 결과' })).toBeInTheDocument()
    expect(screen.getByText('로맨틱 재즈')).toBeInTheDocument()
  })
})
