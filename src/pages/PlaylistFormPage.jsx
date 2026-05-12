import { ArrowLeft, ChevronRight, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createPlaylist, getMyPlaylists, getPlaylistDetail, updatePlaylist } from '../api/playlistApi.js'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAuth } from '../stores/AuthContext.jsx'
import { toPlaylistRequest } from '../utils/format.js'
import { isOwnedPlaylist } from '../utils/ownership.js'

const emptyForm = {
  title: '',
  description: '',
  coverImageUrl: '',
  publicYn: 'Y',
}

export function PlaylistFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [checkingOwner, setCheckingOwner] = useState(editing)
  const [isOwner, setIsOwner] = useState(!editing)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!editing) return
    setCheckingOwner(true)
    Promise.all([getPlaylistDetail(id, userId), getMyPlaylists(userId).catch(() => [])])
      .then(([playlist, myPlaylists]) => {
        const owned = isOwnedPlaylist(playlist, userId, myPlaylists)
        setIsOwner(owned)
        setForm({
          title: playlist.title || '',
          description: playlist.description || '',
          coverImageUrl: playlist.coverImageUrl || '',
          publicYn: playlist.publicYn || 'Y',
        })
      })
      .catch(setError)
      .finally(() => setCheckingOwner(false))
  }, [editing, id, userId])

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = toPlaylistRequest(form)
      const playlist = editing
        ? await updatePlaylist(id, userId, payload)
        : await createPlaylist(userId, payload)
      const playlistId = playlist?.playlistId || id
      navigate(editing ? `/playlists/${playlistId}` : `/playlists/${playlistId}/add-tracks`)
    } catch (caughtError) {
      setError(caughtError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-section">
      <div className="container-xxl">
        {checkingOwner ? <LoadingView label="권한을 확인하는 중입니다." /> : null}
        {!checkingOwner && editing && !isOwner ? (
          <EmptyView
            title="수정 권한이 없습니다."
            action={
              <Link to={`/playlists/${id}`} className="btn btn-accent">
                상세로 돌아가기
              </Link>
            }
          />
        ) : null}
        {!checkingOwner && (!editing || isOwner) ? (
          <>
        <Link to={editing ? `/playlists/${id}` : '/playlists'} className="btn btn-link px-0 text-decoration-none">
          <ArrowLeft size={16} /> 돌아가기
        </Link>
        <div className="d-flex flex-wrap align-items-center gap-3 my-3">
          <div className="wizard-step active">
            <span className="wizard-dot">1</span>
            정보 입력
          </div>
          {!editing ? (
            <div className="wizard-step">
              <span className="wizard-dot">2</span>
              트랙 추가
            </div>
          ) : null}
        </div>
        <div className="row g-4 align-items-start">
          <div className="col-lg-4">
            <div className="surface p-4">
              <div className="thumb mb-3">
                {form.coverImageUrl ? <img src={form.coverImageUrl} alt="" /> : '📷'}
              </div>
              <p className="small text-secondary mb-0">
                먼저 플레이리스트 정보를 저장한 뒤 다음 화면에서 음악을 검색하고 추가합니다.
              </p>
            </div>
          </div>
          <div className="col-lg-8">
            <form className="surface p-4" onSubmit={handleSubmit}>
              <h1 className="h2 fw-bold">{editing ? '플레이리스트 수정' : '플레이리스트 만들기'}</h1>
              <p className="text-secondary">한 화면에는 기본 정보만 입력합니다.</p>
              {error ? <ErrorView error={error} /> : null}
              <div className="mb-3">
                <label className="form-label" htmlFor="title">
                  제목 *
                </label>
                <input
                  id="title"
                  name="title"
                  className="form-control form-control-lg"
                  value={form.title}
                  onChange={updateField}
                  placeholder="플레이리스트 제목을 입력하세요"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="description">
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={updateField}
                  placeholder="설명을 입력하세요"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="coverImageUrl">
                  커버 이미지 URL
                </label>
                <input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  className="form-control"
                  value={form.coverImageUrl}
                  onChange={updateField}
                  placeholder="https://..."
                />
              </div>
              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="publicYn"
                  name="publicYn"
                  checked={form.publicYn === 'Y'}
                  onChange={updateField}
                />
                <label className="form-check-label" htmlFor="publicYn">
                  이 플레이리스트를 공개합니다
                </label>
              </div>
              <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
                {editing ? <Save size={18} /> : <ChevronRight size={18} />}
                <span className="ms-2">{loading ? '저장 중...' : editing ? '저장' : '다음'}</span>
              </button>
            </form>
          </div>
        </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
