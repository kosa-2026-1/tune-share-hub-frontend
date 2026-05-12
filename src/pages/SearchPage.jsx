import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMusic } from '../api/musicApi.js'
import {
  deleteSearchHistory,
  getSearchHistory,
  saveSearchHistory,
} from '../api/searchHistoryApi.js'
import { Pager } from '../components/Pager.jsx'
import { EmptyView, ErrorView } from '../components/StatusView.jsx'
import { TrackRow } from '../components/TrackRow.jsx'
import { useAuth } from '../stores/AuthContext.jsx'
import { paginate } from '../utils/format.js'

const RESULT_PAGE_SIZE = 6

export function SearchPage() {
  const { userId } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKeyword = searchParams.get('keyword') || ''
  const [keyword, setKeyword] = useState(initialKeyword)
  const [tracks, setTracks] = useState([])
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const pagedTracks = useMemo(() => paginate(tracks, page, RESULT_PAGE_SIZE), [tracks, page])

  useEffect(() => {
    getSearchHistory(userId).then(setHistory).catch(() => setHistory([]))
  }, [userId])

  useEffect(() => {
    if (initialKeyword) {
      runSearch(initialKeyword)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSearch(nextKeyword = keyword) {
    const trimmedKeyword = nextKeyword.trim()
    if (!trimmedKeyword) return
    setLoading(true)
    setError(null)
    setPage(1)
    try {
      const result = await searchMusic(trimmedKeyword)
      setTracks(result || [])
      setKeyword(trimmedKeyword)
      setSearchParams({ keyword: trimmedKeyword })
      await saveSearchHistory(userId, trimmedKeyword).catch(() => {})
      setHistory(await getSearchHistory(userId).catch(() => history))
    } catch (caughtError) {
      setError(caughtError)
    } finally {
      setLoading(false)
    }
  }

  async function removeHistory(historyId) {
    await deleteSearchHistory(userId, historyId)
    setHistory((items) => items.filter((item) => item.historyId !== historyId))
  }

  return (
    <main className="page-section">
      <div className="container-xxl">
        <form
          className="surface d-flex flex-column flex-md-row gap-2 p-3 mb-4"
          onSubmit={(event) => {
            event.preventDefault()
            runSearch()
          }}
        >
          <input
            className="form-control form-control-lg"
            placeholder="아티스트, 곡, 플레이리스트 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button type="submit" className="btn btn-accent px-4" disabled={loading}>
            검색
          </button>
        </form>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
          <span className="fw-bold me-2">최근 검색어</span>
          {history.length === 0 ? <span className="small text-secondary">검색 기록이 없습니다.</span> : null}
          {history.slice(0, 8).map((item) => (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              key={item.historyId}
              onClick={() => runSearch(item.keyword)}
            >
              {item.keyword}
              <span
                className="ms-2"
                onClick={(event) => {
                  event.stopPropagation()
                  removeHistory(item.historyId)
                }}
              >
                ×
              </span>
            </button>
          ))}
        </div>
        <h1 className="h4 fw-bold">트랙</h1>
        {error ? <ErrorView error={error} /> : null}
        {loading ? <div className="surface p-4 text-center">검색 중입니다.</div> : null}
        {!loading && !error && tracks.length === 0 ? <EmptyView title="검색 결과가 없습니다." /> : null}
        <div className="d-grid gap-2">
          {pagedTracks.items.map((track, index) => (
            <TrackRow
              track={track}
              index={(page - 1) * RESULT_PAGE_SIZE + index}
              key={`${track.trackId}-${index}`}
              playerState={{
                tracks,
                backTo: `/search${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`,
              }}
            />
          ))}
        </div>
        <Pager page={page} totalPages={pagedTracks.totalPages} onPageChange={setPage} />
      </div>
    </main>
  )
}
