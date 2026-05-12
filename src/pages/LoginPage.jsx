import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../stores/AuthContext.jsx'

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function updateField(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(form)
      navigate('/')
    } catch (caughtError) {
      setError(caughtError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container-fluid p-0">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary position-fixed top-0 end-0 m-3 z-3 d-inline-flex align-items-center gap-1"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        {theme === 'dark' ? '라이트 모드' : '다크 모드'}
      </button>
      <div className="row g-0 min-vh-100">
        <section className="login-brand-panel col-lg-5 d-flex align-items-center">
          <div className="p-4 p-lg-5">
            <div className="h2 fw-bold mb-3">♪ Tune Share Hub</div>
            <p className="fs-5 text-secondary mb-4">나만의 플레이리스트를 만들고 공유하세요.</p>
            <div className="surface p-4 mb-4">
              <div className="small text-secondary mb-2">플레이리스트 서비스</div>
              <div className="fw-bold">곡 검색 · 플레이리스트 생성 · 공유</div>
            </div>
            <div className="row g-2 small">
              {[
                'Spotify 트랙 검색',
                '플레이리스트 CRUD',
                'YouTube 뮤직비디오',
                '좋아요 · 댓글 · 공유',
                '인기 플레이리스트 랭킹',
              ].map((item) => (
                <div className="col-sm-6" key={item}>
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="col-lg-7 d-flex align-items-center justify-content-center p-4">
          <form className="w-100" style={{ maxWidth: 420 }} onSubmit={handleSubmit}>
            <h1 className="h2 fw-bold">로그인</h1>
            <p className="text-secondary mb-4">이메일과 비밀번호로 로그인하세요</p>
            {error ? <div className="alert alert-danger">{error.message}</div> : null}
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control form-control-lg"
                placeholder="이메일 입력"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control form-control-lg"
                placeholder="비밀번호 입력"
                value={form.password}
                onChange={updateField}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn btn-accent btn-lg w-100" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <p className="text-center text-secondary small mt-3 mb-0">
              JWT Access Header + Refresh Cookie 발급
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}
