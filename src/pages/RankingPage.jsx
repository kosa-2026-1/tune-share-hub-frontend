import { Link } from 'react-router-dom'
import { getPlaylistRanking } from '../api/playlistApi.js'
import { PlaylistCoverImage } from '../components/PlaylistCoverImage.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAsync } from '../hooks/useAsync.js'

export function RankingPage() {
  const { data, loading, error, execute } = useAsync(() => getPlaylistRanking(10), [])
  const ranking = data || []
  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3, 8)

  return (
    <main className="page-section">
      <div className="container-xxl">
        <h1 className="h2 fw-bold">🏆 인기 플레이리스트 랭킹</h1>
        <p className="text-secondary">좋아요 수 기준 실시간 랭킹</p>
        {loading ? <LoadingView /> : null}
        {error ? <ErrorView error={error} onRetry={execute} /> : null}
        {!loading && !error && ranking.length === 0 ? <EmptyView /> : null}
        <div className="row g-3 align-items-end my-4">
          {podium.map((playlist, index) => (
            <div className="col-md-4" key={playlist.playlistId}>
              <Link to={`/playlists/${playlist.playlistId}`} className="surface d-block text-center p-4 text-decoration-none">
                <div className="display-6 fw-bold text-success">#{index + 1}</div>
                <div className="thumb my-3">
                  <PlaylistCoverImage src={playlist.coverImageUrl} />
                </div>
                <div className="fw-bold text-truncate">{playlist.title}</div>
                <div className="small text-secondary">♥ {playlist.likeCount ?? 0} · 🎵 {playlist.tracks?.length ?? 0}곡</div>
              </Link>
            </div>
          ))}
        </div>
        {rest.length ? <h2 className="h5 fw-bold mt-5">4위 이하</h2> : null}
        <div className="d-grid gap-2">
          {rest.map((playlist, index) => (
            <Link
              to={`/playlists/${playlist.playlistId}`}
              className="ranking-row d-flex align-items-center gap-3 p-3 text-decoration-none"
              key={playlist.playlistId}
            >
              <div className="h5 mb-0" style={{ width: 40 }}>
                {index + 4}
              </div>
              <div className="album-art">
                <PlaylistCoverImage src={playlist.coverImageUrl} />
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="fw-bold text-truncate">{playlist.title}</div>
                <div className="small text-secondary">♥ {playlist.likeCount ?? 0} · 🎵 {playlist.tracks?.length ?? 0}곡</div>
              </div>
              <span className="btn btn-sm btn-outline-secondary">보러 가기</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
