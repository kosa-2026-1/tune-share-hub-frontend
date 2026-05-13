import { ArrowLeft, GripVertical, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { searchMusic } from '../api/musicApi.js'
import { addTracksToPlaylist, getMyPlaylists, getPlaylistDetail } from '../api/playlistApi.js'
import { toPlaylistTrackCreateRequest } from '../api/normalizers.js'
import { Pager } from '../components/Pager.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { TrackRow } from '../components/TrackRow.jsx'
import { paginate } from '../utils/format.js'

const PAGE_SIZE = 6

export function PlaylistTrackAddPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [tracks, setTracks] = useState([])
  const [selectedTracks, setSelectedTracks] = useState([])
  const [existingTracks, setExistingTracks] = useState([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checkingOwner, setCheckingOwner] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [draggedTrackId, setDraggedTrackId] = useState(null)

  const pagedTracks = useMemo(() => paginate(tracks, page, PAGE_SIZE), [tracks, page])
  const existingTrackIds = useMemo(
    () => new Set(existingTracks.map((track) => track.trackId).filter(Boolean).map(String)),
    [existingTracks],
  )
  const selectedTrackIds = useMemo(
    () => new Set(selectedTracks.map((track) => track.trackId).filter(Boolean).map(String)),
    [selectedTracks],
  )

  useEffect(() => {
    setCheckingOwner(true)
    Promise.all([getMyPlaylists(), getPlaylistDetail(id)])
      .then(([playlists, playlist]) => {
        setIsOwner(playlists.some((playlist) => String(playlist.playlistId) === String(id)))
        setExistingTracks(playlist?.tracks || [])
      })
      .catch((caughtError) => {
        setIsOwner(false)
        setExistingTracks([])
        setError(caughtError)
      })
      .finally(() => setCheckingOwner(false))
  }, [id])

  async function handleSearch(event) {
    event.preventDefault()
    if (!keyword.trim()) return
    setLoading(true)
    setError(null)
    setPage(1)
    try {
      setTracks((await searchMusic(keyword.trim())) || [])
    } catch (caughtError) {
      setError(caughtError)
    } finally {
      setLoading(false)
    }
  }

  function addTrack(track) {
    if (existingTrackIds.has(String(track.trackId))) return
    setSelectedTracks((prev) =>
      prev.some((item) => item.trackId === track.trackId) ? prev : [...prev, track],
    )
  }

  function moveSelectedTrack(targetTrackId) {
    if (!draggedTrackId || draggedTrackId === targetTrackId) return

    setSelectedTracks((items) => {
      const fromIndex = items.findIndex((item) => item.trackId === draggedTrackId)
      const toIndex = items.findIndex((item) => item.trackId === targetTrackId)
      if (fromIndex < 0 || toIndex < 0) return items

      const nextItems = [...items]
      const [movedTrack] = nextItems.splice(fromIndex, 1)
      nextItems.splice(toIndex, 0, movedTrack)
      return nextItems
    })
  }

  async function saveTracks() {
    setSaving(true)
    setError(null)
    try {
      const payload = selectedTracks.map(toPlaylistTrackCreateRequest)
      await addTracksToPlaylist(id, payload)
      navigate(`/playlists/${id}`)
    } catch (caughtError) {
      setError(caughtError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-section">
      <div className="container-xxl">
        {checkingOwner ? <LoadingView label="권한을 확인하는 중입니다." /> : null}
        {!checkingOwner && !isOwner ? (
          <EmptyView
            title="트랙을 추가할 권한이 없습니다."
            action={
              <Link to={`/playlists/${id}`} className="btn btn-accent">
                상세로 돌아가기
              </Link>
            }
          />
        ) : null}
        {!checkingOwner && isOwner ? (
          <>
        <Link to={`/playlists/${id}`} className="btn btn-link px-0 text-decoration-none">
          <ArrowLeft size={16} /> 상세로 돌아가기
        </Link>
        <div className="d-flex flex-wrap align-items-center gap-3 my-3">
          <div className="wizard-step">
            <span className="wizard-dot">1</span>
            정보 입력
          </div>
          <div className="wizard-step active">
            <span className="wizard-dot">2</span>
            트랙 추가
          </div>
        </div>
        <div className="row g-4">
          <section className="col-lg-8">
            <form className="surface d-flex flex-nowrap gap-2 p-3 mb-3" onSubmit={handleSearch}>
              <input
                className="form-control form-control-lg min-w-0"
                placeholder="추가할 곡이나 아티스트 검색"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
              <button type="submit" className="btn btn-accent px-4 flex-shrink-0" disabled={loading}>
                검색
              </button>
            </form>
            {error ? <ErrorView error={error} /> : null}
            {loading ? <div className="surface p-4 text-center">검색 중입니다.</div> : null}
            {!loading && tracks.length === 0 ? <EmptyView title="검색 후 트랙을 선택하세요." /> : null}
            <div className="d-grid gap-2">
              {pagedTracks.items.map((track, index) => (
                <TrackRow
                  key={`${track.trackId}-${index}`}
                  track={track}
                  index={(page - 1) * PAGE_SIZE + index}
                  playerState={{
                    tracks,
                    backTo: `/playlists/${id}/add-tracks`,
                  }}
                  onAdd={addTrack}
                  added={
                    existingTrackIds.has(String(track.trackId)) ||
                    selectedTrackIds.has(String(track.trackId))
                  }
                  addedLabel={
                    existingTrackIds.has(String(track.trackId)) ? '이미 수록됨' : '추가됨'
                  }
                />
              ))}
            </div>
            <Pager page={page} totalPages={pagedTracks.totalPages} onPageChange={setPage} />
          </section>
          <aside className="col-lg-4 align-self-start">
            <div className="surface p-4">
              <h2 className="h5 fw-bold">선택한 트랙</h2>
              <p className="small text-secondary">드래그로 순서를 바꾼 뒤 저장하면 그 순서대로 추가됩니다.</p>
              <div className="selected-track-list d-grid gap-2 mb-3">
                {selectedTracks.map((track, index) => (
                  <div
                    className={`selected-track-row small ${draggedTrackId === track.trackId ? 'dragging' : ''}`}
                    key={track.trackId}
                    draggable
                    onDragStart={(event) => {
                      setDraggedTrackId(track.trackId)
                      event.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      moveSelectedTrack(track.trackId)
                    }}
                    onDragEnd={() => setDraggedTrackId(null)}
                  >
                    <GripVertical size={16} className="text-secondary flex-shrink-0" aria-hidden="true" />
                    <span className="text-secondary flex-shrink-0">{index + 1}</span>
                    <span className="text-truncate">{track.title}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-1 flex-shrink-0"
                      aria-label={`${track.title} 삭제`}
                      onClick={() =>
                        setSelectedTracks((items) => items.filter((item) => item.trackId !== track.trackId))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {selectedTracks.length === 0 ? <span className="small text-secondary">선택된 트랙이 없습니다.</span> : null}
              </div>
              <button
                type="button"
                className="btn btn-accent w-100 d-inline-flex align-items-center justify-content-center gap-2"
                disabled={selectedTracks.length === 0 || saving}
                onClick={saveTracks}
              >
                <Save size={17} />
                {saving ? '저장 중...' : '저장하고 완료'}
              </button>
              <div className="border-top mt-4 pt-3">
                <h3 className="h6 fw-bold">기존 수록곡</h3>
                <p className="small text-secondary mb-2">
                  기존 곡은 저장 요청에 포함하지 않고 중복 선택만 막습니다.
                </p>
                <div className="existing-track-list d-grid gap-2">
                  {existingTracks.map((track, index) => (
                    <div className="existing-track-row small" key={track.playlistTrackId || track.trackId}>
                      <span className="text-secondary flex-shrink-0">{index + 1}</span>
                      <span className="text-truncate">{track.title}</span>
                    </div>
                  ))}
                  {existingTracks.length === 0 ? (
                    <span className="small text-secondary">아직 기존 수록곡이 없습니다.</span>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
