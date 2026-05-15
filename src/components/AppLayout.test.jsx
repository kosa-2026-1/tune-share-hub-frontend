import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout.jsx'

vi.mock('../hooks/useTheme.js', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

vi.mock('../stores/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { nickname: '테스터' },
    logout: vi.fn(),
  }),
}))

function LocationProbe() {
  const location = useLocation()
  const keyword = new URLSearchParams(location.search).get('keyword') || ''

  return (
    <div>
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="keyword">{keyword}</span>
    </div>
  )
}

describe('AppLayout', () => {
  it('routes the top bar playlist search to the playlist list page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LocationProbe />} />
            <Route path="playlists" element={<LocationProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const desktopSearchInput = screen.getAllByPlaceholderText('플레이리스트 검색')[0]
    await user.type(desktopSearchInput, '로맨틱{enter}')

    expect(screen.getByTestId('pathname')).toHaveTextContent('/playlists')
    expect(screen.getByTestId('keyword')).toHaveTextContent('로맨틱')
  })
})
