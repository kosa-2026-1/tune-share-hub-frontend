import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { getMyPlaylists, getPlaylistDetail } from '../api/playlistApi.js'
import { PlaylistDetailPage } from './PlaylistDetailPage.jsx'

vi.mock('../api/playlistApi.js', () => ({
  copyPlaylist: vi.fn(),
  createPlaylistComment: vi.fn(),
  deletePlaylist: vi.fn(),
  deletePlaylistComment: vi.fn(),
  getMyPlaylists: vi.fn(),
  getPlaylistDetail: vi.fn(),
  removeTrackFromPlaylist: vi.fn(),
  reorderPlaylistTracks: vi.fn(),
  togglePlaylistLike: vi.fn(),
  updatePlaylistComment: vi.fn(),
  updatePlaylistVisibility: vi.fn(),
}))

vi.mock('../stores/AuthContext.jsx', () => ({
  useAuth: () => ({ userId: 7 }),
}))

describe('PlaylistDetailPage', () => {
  it('renders an empty playlist without waiting for ownership lookup', async () => {
    getPlaylistDetail.mockResolvedValue({
      playlistId: 1,
      title: '빈 플레이리스트',
      description: '아직 곡이 없습니다.',
      publicYn: 'Y',
      tracks: [],
      comments: [],
    })
    getMyPlaylists.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter initialEntries={['/playlists/1']}>
        <Routes>
          <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitForElementToBeRemoved(() => screen.queryByText('불러오는 중입니다.'))

    expect(screen.getByRole('heading', { name: '빈 플레이리스트' })).toBeInTheDocument()
    expect(screen.getByText('아직 수록곡이 없습니다.')).toBeInTheDocument()
  })
})
