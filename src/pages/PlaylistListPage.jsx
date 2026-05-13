import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPublicPlaylists } from '../api/playlistApi.js'
import { Pager } from '../components/Pager.jsx'
import { PlaylistCard } from '../components/PlaylistCard.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { getTrackCount } from '../utils/format.js'

const PAGE_SIZE = 8

export function PlaylistListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('keyword')?.trim() || ''
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('new')
  const { data, loading, error, execute } = useAsync(
    () => getPublicPlaylists({ page, size: PAGE_SIZE }),
    [page],
  )

  const playlists = filterPlaylists(data?.items || [], keyword).sort((a, b) => {
    if (sort === 'like') return (b.likeCount || 0) - (a.likeCount || 0)
    if (sort === 'track') return getTrackCount(b) - getTrackCount(a)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  function clearKeyword() {
    setSearchParams({})
    setPage(1)
  }

  return (
    <main className="page-section">
      <div className="container-xxl">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h2 fw-bold">공개 플레이리스트</h1>
            <p className="text-secondary mb-0">
              {keyword ? `"${keyword}" 검색 결과` : '모든 공개 플레이리스트를 탐색하세요'}
            </p>
          </div>
          <Link to="/playlists/new" className="btn btn-accent">
            + 새 플레이리스트
          </Link>
        </div>
        <div className="surface d-flex flex-wrap align-items-center gap-2 p-3 mb-4">
          <span className="small text-secondary me-2">정렬:</span>
          {[
            ['new', '최신순'],
            ['like', '좋아요순'],
            ['track', '곡 수순'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm ${sort === value ? 'btn-accent' : 'btn-outline-secondary'}`}
              onClick={() => setSort(value)}
            >
              {label}
            </button>
          ))}
          {keyword ? (
            <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" onClick={clearKeyword}>
              검색 초기화
            </button>
          ) : null}
        </div>
        {loading ? <LoadingView /> : null}
        {error ? <ErrorView error={error} onRetry={execute} /> : null}
        {!loading && !error && playlists.length === 0 ? (
          <EmptyView title={keyword ? '검색 결과가 없습니다.' : undefined} />
        ) : null}
        <div className="row g-3">
          {playlists.map((playlist) => (
            <div className="col-sm-6 col-lg-3" key={playlist.playlistId}>
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
        <Pager page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
      </div>
    </main>
  )
}

function filterPlaylists(playlists, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return [...playlists]

  return playlists.filter((playlist) => {
    const searchableText = [
      playlist.title,
      playlist.description,
      ...(Array.isArray(playlist.tags) ? playlist.tags : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedKeyword)
  })
}
