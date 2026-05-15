import { Library, LogOut, Menu, Moon, Search, Sun, Trophy, User } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../stores/AuthContext.jsx'

function navClass({ isActive }) {
  return `nav-link px-lg-3 ${isActive ? 'active' : ''}`
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function submitGlobalSearch(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const keyword = String(formData.get('keyword') || '').trim()

    if (!keyword) return

    setOpen(false)
    navigate(`/playlists?keyword=${encodeURIComponent(keyword)}`)
    event.currentTarget.reset()
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg app-navbar sticky-top">
        <div className="container-xxl gap-3">
          <Link to="/" className="brand-mark">
            ♪ Tune Share Hub
          </Link>
          <form
            className="search-pill d-none d-lg-flex align-items-center px-3"
            onSubmit={submitGlobalSearch}
          >
            <Search size={16} className="text-secondary me-2" />
            <input
              className="form-control form-control-sm border-0 bg-transparent shadow-none"
              name="keyword"
              placeholder="플레이리스트 검색"
              aria-label="플레이리스트 검색"
            />
          </form>
          <button
            type="button"
            className="navbar-toggler"
            aria-label="메뉴 열기"
            onClick={() => setOpen((value) => !value)}
          >
            <Menu size={22} />
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
            <div className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">
              <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
                홈
              </NavLink>
              <NavLink to="/search" className={navClass} onClick={() => setOpen(false)}>
                검색
              </NavLink>
              <NavLink to="/library" className={navClass} onClick={() => setOpen(false)}>
                내 라이브러리
              </NavLink>
              <NavLink to="/ranking" className={navClass} onClick={() => setOpen(false)}>
                랭킹
              </NavLink>
              <NavLink
                to="/profile"
                className="nav-link user-nav-link d-inline-flex align-items-center gap-1"
                onClick={() => setOpen(false)}
              >
                <User size={16} />
                <span>{user?.nickname || user?.email || '사용자'}</span>
              </NavLink>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 ms-lg-2"
                onClick={toggleTheme}
                aria-label="테마 전환"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span className="d-lg-none">{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 ms-lg-2"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                로그아웃
              </button>
            </div>
            <form
              className="search-pill d-flex d-lg-none align-items-center px-3 mt-3"
              onSubmit={submitGlobalSearch}
            >
              <Search size={16} className="text-secondary me-2" />
              <input
                className="form-control form-control-sm border-0 bg-transparent shadow-none"
                name="keyword"
                placeholder="플레이리스트 검색"
                aria-label="플레이리스트 검색"
              />
            </form>
          </div>
        </div>
      </nav>
      <Outlet />
      <footer className="border-top py-4 mt-5">
        <div className="container-xxl d-flex flex-wrap justify-content-between gap-2 small text-secondary">
          <span>♪ Tune Share Hub</span>
          <span className="d-inline-flex align-items-center gap-3">
            <Library size={14} /> 플레이리스트 공유
            <Trophy size={14} /> 랭킹
          </span>
        </div>
      </footer>
    </div>
  )
}
