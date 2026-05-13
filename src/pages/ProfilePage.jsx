import { Heart, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserInfo } from '../api/userApi.js'
import { ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { useAuth } from '../stores/AuthContext.jsx'

export function ProfilePage() {
  const { user, userId, logout } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, execute } = useAsync(() => getUserInfo(), [userId])
  const profile = data || user

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <main>
      <section className="hero-band">
        <div className="container-xxl py-5 d-flex align-items-center gap-4">
          <div className="rounded-circle bg-white border" style={{ width: 120, height: 120 }} />
          <div>
            <h1 className="h2 fw-bold">{profile?.nickname || '닉네임'}</h1>
            <p className="text-secondary mb-0">{profile?.email || 'user@example.com'}</p>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container-xxl">
          {loading ? <LoadingView /> : null}
          {error ? <ErrorView error={error} onRetry={execute} /> : null}
          <div className="row g-4">
            <aside className="col-lg-3">
              <div className="surface p-3 d-grid gap-2">
                <Link className="btn btn-outline-secondary text-start" to="/library">
                  📋 내 플레이리스트
                </Link>
                <Link className="btn btn-outline-secondary text-start" to="/library">
                  <Heart size={18} /> 좋아요한 목록
                </Link>
                <button type="button" className="btn btn-outline-danger text-start" onClick={handleLogout}>
                  <LogOut size={18} /> 로그아웃
                </button>
              </div>
            </aside>
            <section className="col-lg-9">
              <div className="surface p-4">
                <h2 className="h5 fw-bold">내 정보</h2>
                <p className="text-secondary">현재 로그인한 사용자 정보를 확인합니다.</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">닉네임</label>
                    <input className="form-control" value={profile?.nickname || ''} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">이메일</label>
                    <input className="form-control" value={profile?.email || ''} readOnly />
                  </div>
                  <div className="col-12">
                    <label className="form-label">역할</label>
                    <input className="form-control" value={profile?.role || 'USER'} readOnly />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
