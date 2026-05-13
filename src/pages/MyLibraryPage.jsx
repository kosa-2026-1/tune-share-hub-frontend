import { MoreHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyPlaylists } from '../api/playlistApi.js'
import { getLikedPlaylists } from '../api/userApi.js'
import { Pager } from '../components/Pager.jsx'
import { PlaylistCard } from '../components/PlaylistCard.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { useAuth } from '../stores/AuthContext.jsx'
import { paginate } from '../utils/format.js'

const PAGE_SIZE = 8

export function MyLibraryPage() {
  const { userId } = useAuth()
  const [tab, setTab] = useState('mine')
  const [page, setPage] = useState(1)
  const { data, loading, error, execute } = useAsync(async () => {
    const [mine, liked] = await Promise.all([getMyPlaylists(), getLikedPlaylists()])
    return { mine: mine || [], liked: liked || [] }
  }, [userId])

  const currentItems = useMemo(
    () => (tab === 'mine' ? data?.mine || [] : data?.liked || []),
    [data, tab],
  )
  const pagedItems = useMemo(() => paginate(currentItems, page, PAGE_SIZE), [currentItems, page])

  function switchTab(nextTab) {
    setTab(nextTab)
    setPage(1)
  }

  return (
    <main className="page-section">
      <div className="container-xxl">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="h2 fw-bold">내 라이브러리</h1>
            <div className="btn-group mt-3" role="tablist">
              <button
                className={`btn ${tab === 'mine' ? 'btn-accent' : 'btn-outline-secondary'}`}
                type="button"
                onClick={() => switchTab('mine')}
              >
                내 플레이리스트
              </button>
              <button
                className={`btn ${tab === 'liked' ? 'btn-accent' : 'btn-outline-secondary'}`}
                type="button"
                onClick={() => switchTab('liked')}
              >
                좋아요한 목록
              </button>
            </div>
          </div>
          <Link to="/playlists/new" className="btn btn-accent">
            + 새 플레이리스트
          </Link>
        </div>
        {loading ? <LoadingView /> : null}
        {error ? <ErrorView error={error} onRetry={execute} /> : null}
        {!loading && !error && currentItems.length === 0 ? <EmptyView /> : null}
        <div className="row g-3">
          {pagedItems.items.map((playlist) => (
            <div className="col-sm-6 col-lg-3 position-relative" key={playlist.playlistId}>
              <PlaylistCard playlist={playlist} />
              {tab === 'mine' ? (
                <Link
                  to={`/playlists/${playlist.playlistId}/edit`}
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-2"
                  aria-label="수정"
                >
                  <MoreHorizontal size={18} />
                </Link>
              ) : null}
            </div>
          ))}
        </div>
        <Pager page={page} totalPages={pagedItems.totalPages} onPageChange={setPage} />
      </div>
    </main>
  )
}
