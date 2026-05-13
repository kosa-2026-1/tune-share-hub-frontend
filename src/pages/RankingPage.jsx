import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlaylistRanking } from '../api/playlistApi.js'
import { PlaylistCoverImage } from '../components/PlaylistCoverImage.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { getTrackCount } from '../utils/format.js'

export function RankingPage() {
  const [rankingType, setRankingType] = useState('like')
  const { data, loading, error, execute } = useAsync(
    () => getPlaylistRanking(10, rankingType),
    [rankingType],
  )
  const ranking = data || []
  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3, 8)
  const title = rankingType === 'view' ? '조회수 랭킹' : '좋아요 랭킹'

  return (
    <main className="page-section">
      <div className="container-xxl">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h2 fw-bold">🏆 인기 플레이리스트 랭킹</h1>
            <p className="text-secondary mb-0">{title} 기준 실시간 랭킹</p>
          </div>
          <div className="btn-group align-self-md-start" role="group" aria-label="랭킹 기준">
            <button
              type="button"
              className={`btn ${rankingType === 'like' ? 'btn-accent' : 'btn-outline-secondary'}`}
              onClick={() => setRankingType('like')}
            >
              좋아요 수
            </button>
            <button
              type="button"
              className={`btn ${rankingType === 'view' ? 'btn-accent' : 'btn-outline-secondary'}`}
              onClick={() => setRankingType('view')}
            >
              조회수
            </button>
          </div>
        </div>
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
                <div className="small text-secondary">
                  ♥ {playlist.likeCount ?? 0} · 👁 {playlist.viewCount ?? 0} · 🎵 {getTrackCount(playlist)}곡
                </div>
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
                <div className="small text-secondary">
                  ♥ {playlist.likeCount ?? 0} · 👁 {playlist.viewCount ?? 0} · 🎵 {getTrackCount(playlist)}곡
                </div>
              </div>
              <span className="btn btn-sm btn-outline-secondary">보러 가기</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
