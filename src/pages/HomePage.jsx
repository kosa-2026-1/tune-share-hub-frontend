import { Link } from 'react-router-dom'
import { getPlaylistRanking, getPublicPlaylists } from '../api/playlistApi.js'
import { PlaylistCard } from '../components/PlaylistCard.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAsync } from '../hooks/useAsync.js'

export function HomePage() {
  const { data, loading, error, execute } = useAsync(async () => {
    const [ranking, recent] = await Promise.all([
      getPlaylistRanking(4),
      getPublicPlaylists({ page: 1, size: 4 }),
    ])
    return { ranking, recent: recent.items }
  }, [])

  return (
    <main>
      <section className="hero-band d-flex align-items-center">
        <div className="container-xxl py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h1 className="display-6 fw-bold">오늘의 인기 플레이리스트</h1>
              <p className="fs-5 text-secondary mb-0">좋아요 순으로 정렬된 공개 플레이리스트</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/playlists" className="btn btn-accent btn-lg">
                전체 탐색하기
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container-xxl">
          {loading ? <LoadingView /> : null}
          {error ? <ErrorView error={error} onRetry={execute} /> : null}
          {data ? (
            <>
              <SectionHeader title="🏆 인기 플레이리스트" to="/ranking" />
              <PlaylistGrid playlists={data.ranking?.slice(0, 4)} />
              <SectionHeader title="🎵 최근 추가된 플레이리스트" to="/playlists" className="mt-5" />
              <PlaylistGrid playlists={data.recent?.slice(0, 4)} />
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function SectionHeader({ title, to, className = '' }) {
  return (
    <div className={`d-flex align-items-center justify-content-between gap-3 mb-3 ${className}`}>
      <h2 className="h4 fw-bold mb-0">{title}</h2>
      <Link to={to} className="btn btn-sm btn-outline-secondary">
        전체보기
      </Link>
    </div>
  )
}

function PlaylistGrid({ playlists }) {
  if (!playlists?.length) return <EmptyView title="아직 표시할 플레이리스트가 없습니다." />
  return (
    <div className="row g-3">
      {playlists.map((playlist) => (
        <div className="col-sm-6 col-lg-3" key={playlist.playlistId}>
          <PlaylistCard playlist={playlist} />
        </div>
      ))}
    </div>
  )
}
