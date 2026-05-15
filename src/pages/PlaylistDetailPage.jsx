import {
  ArrowUpDown,
  Copy,
  Edit3,
  GripVertical,
  Heart,
  Link as LinkIcon,
  Lock,
  Plus,
  Save,
  Shuffle,
  Trash2,
  Unlock,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  copyPlaylist,
  createPlaylistComment,
  deletePlaylist,
  deletePlaylistComment,
  getPlaylistDetail,
  getMyPlaylists,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  togglePlaylistLike,
  updatePlaylistComment,
  updatePlaylistVisibility,
} from '../api/playlistApi.js'
import { applyLikeResponseToPlaylist } from '../api/normalizers.js'
import { Pager } from '../components/Pager.jsx'
import { PlaylistCoverImage } from '../components/PlaylistCoverImage.jsx'
import { EmptyView, ErrorView, LoadingView } from '../components/StatusView.jsx'
import { TrackRow } from '../components/TrackRow.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { useAuth } from '../stores/AuthContext.jsx'
import {
  formatDateTime,
  getTrackCount,
  isPublicPlaylist,
  paginate,
} from '../utils/format.js'
import { isOwnedPlaylist } from '../utils/ownership.js'
import { getPlayableTracks } from '../utils/youtube.js'

const COMMENT_PAGE_SIZE = 5

export function PlaylistDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [commentPage, setCommentPage] = useState(1)
  const [comment, setComment] = useState('')
  const [trackSort, setTrackSort] = useState('position')
  const [shareCopied, setShareCopied] = useState(false)
  const [localTracks, setLocalTracks] = useState([])
  const [draggedTrackKey, setDraggedTrackKey] = useState(null)
  const [reorderDirty, setReorderDirty] = useState(false)
  const [reorderSaving, setReorderSaving] = useState(false)
  const [likeSaving, setLikeSaving] = useState(false)
  const [copySaving, setCopySaving] = useState(false)
  const [copyError, setCopyError] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingComment, setEditingComment] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const shareNoticeTimerRef = useRef(null)
  const { data, loading, error, execute, setData } = useAsync(async () => {
    const playlist = await getPlaylistDetail(id)
    return { playlist }
  }, [id, userId])

  const playlist = data?.playlist
  const tracks = useMemo(() => playlist?.tracks || [], [playlist])
  const trackSource = useMemo(
    () =>
      localTracks.length || tracks.length === 0
        ? localTracks
        : sortTracks(tracks, 'position'),
    [localTracks, tracks]
  )
  const sortedTracks = useMemo(
    () =>
      trackSort === 'position'
        ? trackSource
        : sortTracks(trackSource, trackSort),
    [trackSource, trackSort]
  )
  const comments = useMemo(
    () => sortCommentsByNewest(playlist?.comments || []),
    [playlist]
  )
  const pagedComments = useMemo(
    () => paginate(comments, commentPage, COMMENT_PAGE_SIZE),
    [comments, commentPage]
  )

  async function refreshFrom(action) {
    const result = await action()
    setData((prev) => ({ ...prev, playlist: result }))
  }

  useEffect(() => {
    let active = true

    setIsOwner(false)
    if (!playlist || !userId) {
      return () => {
        active = false
      }
    }

    if (isOwnedPlaylist(playlist, userId)) {
      setIsOwner(true)
      return () => {
        active = false
      }
    }

    getMyPlaylists()
      .then((myPlaylists) => {
        if (active) {
          setIsOwner(isOwnedPlaylist(playlist, userId, myPlaylists))
        }
      })
      .catch(() => {
        if (active) {
          setIsOwner(false)
        }
      })

    return () => {
      active = false
    }
  }, [playlist, userId])

  useEffect(() => {
    setLocalTracks(sortTracks(tracks, 'position'))
    setDraggedTrackKey(null)
    setReorderDirty(false)
  }, [tracks])

  async function handleDeletePlaylist() {
    if (!window.confirm('플레이리스트를 삭제할까요?')) return
    await deletePlaylist(id)
    navigate('/library')
  }

  async function handleLikePlaylist() {
    setLikeSaving(true)
    try {
      const likeResponse = await togglePlaylistLike(id)
      setData((prev) => ({
        ...prev,
        playlist: applyLikeResponseToPlaylist(prev?.playlist, likeResponse),
      }))
    } finally {
      setLikeSaving(false)
    }
  }

  async function handleCopyPlaylist() {
    setCopySaving(true)
    setCopyError(null)
    try {
      const copiedPlaylist = await copyPlaylist(id)
      const copiedPlaylistId = copiedPlaylist?.playlistId || copiedPlaylist?.id
      if (copiedPlaylistId) {
        navigate(`/playlists/${copiedPlaylistId}`)
        return
      }
      await execute()
    } catch (caughtError) {
      setCopyError(caughtError)
    } finally {
      setCopySaving(false)
    }
  }

  useEffect(() => {
    return () => {
      if (shareNoticeTimerRef.current) {
        window.clearTimeout(shareNoticeTimerRef.current)
      }
    }
  }, [])

  async function handleShare() {
    await navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    if (shareNoticeTimerRef.current) {
      window.clearTimeout(shareNoticeTimerRef.current)
    }
    shareNoticeTimerRef.current = window.setTimeout(() => {
      setShareCopied(false)
    }, 500)
  }

  function handleRandomPlay() {
    const randomQueue = shuffleTracks(getPlayableTracks(sortedTracks))
    if (!randomQueue.length) return
    navigate('/player', {
      state: {
        tracks: randomQueue,
        currentTrack: randomQueue[0],
        backTo: `/playlists/${id}`,
      },
    })
  }

  function movePlaylistTrack(targetTrackKey) {
    if (!draggedTrackKey || draggedTrackKey === targetTrackKey) return

    setLocalTracks((items) => {
      const fromIndex = items.findIndex(
        (item) => getTrackKey(item) === draggedTrackKey
      )
      const toIndex = items.findIndex(
        (item) => getTrackKey(item) === targetTrackKey
      )
      if (fromIndex < 0 || toIndex < 0) return items

      const nextItems = [...items]
      const [movedTrack] = nextItems.splice(fromIndex, 1)
      nextItems.splice(toIndex, 0, movedTrack)
      setReorderDirty(true)
      return nextItems
    })
  }

  async function saveTrackOrder() {
    setReorderSaving(true)
    try {
      await refreshFrom(() =>
        reorderPlaylistTracks(
          id,
          localTracks.map((track, index) => ({
            playlistTrackId: track.playlistTrackId,
            positionNo: index + 1,
          }))
        )
      )
      setTrackSort('position')
      setReorderDirty(false)
    } finally {
      setReorderSaving(false)
    }
  }

  async function submitComment(event) {
    event.preventDefault()
    if (!comment.trim()) return
    await refreshFrom(() =>
      createPlaylistComment(id, { content: comment.trim() })
    )
    setComment('')
    setCommentPage(1)
  }

  function startEditComment(item) {
    setEditingCommentId(item.commentId)
    setEditingComment(item.content || '')
  }

  function cancelEditComment() {
    setEditingCommentId(null)
    setEditingComment('')
  }

  async function submitEditComment(event, commentId) {
    event.preventDefault()
    if (!editingComment.trim()) return
    setCommentSaving(true)
    try {
      await refreshFrom(() =>
        updatePlaylistComment(id, commentId, { content: editingComment.trim() })
      )
      cancelEditComment()
    } finally {
      setCommentSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="page-section container-xxl">
        <LoadingView />
      </main>
    )
  }

  if (error) {
    return (
      <main className="page-section container-xxl">
        <ErrorView error={error} onRetry={execute} />
      </main>
    )
  }

  if (!playlist) return null

  const publicPlaylist = isPublicPlaylist(playlist)
  const likedPlaylist = isLikedPlaylist(playlist)
  const canReorder =
    isOwner && trackSort === 'position' && localTracks.length > 1

  return (
    <main className="page-section">
      <div className="container-xxl">
        <div className="row g-4 playlist-detail-layout">
          <aside className="col-lg-4 col-xl-3">
            <div className="surface p-4 playlist-info-panel">
              <div className="thumb mb-3">
                <PlaylistCoverImage src={playlist.coverImageUrl} />
              </div>
              <h1 className="h4 fw-bold">{playlist.title}</h1>
              <p className="text-secondary">
                {playlist.description || '설명이 없습니다.'}
              </p>
              <p className="small text-secondary">
                ♥ {playlist.likeCount ?? 0} · 🎵 {getTrackCount(playlist)}곡 ·{' '}
                {publicPlaylist ? '공개' : '비공개'}
              </p>
              {playlist.tags?.length ? (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {playlist.tags.map((tag) => (
                    <span className="tag-chip" key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="d-flex flex-wrap gap-2 position-relative">
                <button
                  className={`btn btn-sm ${likedPlaylist ? 'btn-accent' : 'btn-outline-secondary'}`}
                  type="button"
                  onClick={handleLikePlaylist}
                  disabled={likeSaving}
                  aria-pressed={likedPlaylist}
                >
                  <Heart
                    size={15}
                    fill={likedPlaylist ? 'currentColor' : 'none'}
                  />
                  {likeSaving
                    ? '처리 중'
                    : likedPlaylist
                      ? '좋아요 취소'
                      : '좋아요'}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={handleShare}
                >
                  <LinkIcon size={15} /> 공유
                </button>
                {publicPlaylist ? (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={handleCopyPlaylist}
                    disabled={copySaving}
                  >
                    <Copy size={15} /> {copySaving ? '복사 중' : '복사'}
                  </button>
                ) : null}
                {shareCopied ? (
                  <span className="share-copy-notice" role="status">
                    링크가 복사되었습니다.
                  </span>
                ) : null}
                {isOwner ? (
                  <>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      type="button"
                      onClick={() =>
                        refreshFrom(() =>
                          updatePlaylistVisibility(
                            id,
                            publicPlaylist ? 'N' : 'Y'
                          )
                        )
                      }
                    >
                      {publicPlaylist ? (
                        <>
                          <Lock size={15} /> 비공개 전환
                        </>
                      ) : (
                        <>
                          <Unlock size={15} /> 공개 전환
                        </>
                      )}
                    </button>
                    <Link
                      className="btn btn-sm btn-outline-secondary"
                      to={`/playlists/${id}/edit`}
                    >
                      <Edit3 size={15} /> 수정
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                      type="button"
                      onClick={handleDeletePlaylist}
                      aria-label="플레이리스트 삭제"
                      title="플레이리스트 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                ) : null}
              </div>
              {copyError ? (
                <div className="alert alert-danger py-2 px-3 small mt-3 mb-0">
                  {copyError.message || '플레이리스트를 복사하지 못했습니다.'}
                </div>
              ) : null}
            </div>
          </aside>
          <section className="col-lg-8 col-xl-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h4 fw-bold mb-0">수록곡</h2>
                <p className="small text-secondary mb-0">
                  총 {sortedTracks.length}곡
                </p>
              </div>
              <div className="d-flex flex-wrap justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                  onClick={handleRandomPlay}
                  disabled={getPlayableTracks(sortedTracks).length === 0}
                >
                  <Shuffle size={15} /> 랜덤 재생
                </button>
                <label className="d-inline-flex align-items-center gap-1 small">
                  <ArrowUpDown size={15} />
                  <select
                    className="form-select form-select-sm"
                    value={trackSort}
                    onChange={(event) => setTrackSort(event.target.value)}
                    aria-label="트랙 정렬"
                  >
                    <option value="position">기본순</option>
                    <option value="title">제목순</option>
                    <option value="artist">아티스트순</option>
                  </select>
                </label>
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      disabled={!reorderDirty || reorderSaving}
                      onClick={saveTrackOrder}
                    >
                      <Save size={15} />{' '}
                      {reorderSaving ? '저장 중' : '순서 저장'}
                    </button>
                    <Link
                      className="btn btn-sm btn-accent"
                      to={`/playlists/${id}/add-tracks`}
                    >
                      <Plus size={15} /> 곡 추가
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
            {tracks.length === 0 ? (
              <EmptyView title="아직 수록곡이 없습니다." />
            ) : null}
            {isOwner ? (
              <p className="small text-secondary mb-2">
                {trackSort === 'position'
                  ? '핸들을 드래그한 뒤 순서 저장을 누르면 곡 순서가 변경됩니다.'
                  : '곡 순서 변경은 기본순에서 사용할 수 있습니다.'}
              </p>
            ) : null}
            <div className="playlist-track-scroll d-grid gap-2">
              {sortedTracks.map((track, index) => (
                <div
                  className={`position-relative playlist-track-sortable-row ${canReorder ? 'reorder-enabled' : ''} ${draggedTrackKey === getTrackKey(track) ? 'dragging' : ''}`}
                  key={track.playlistTrackId || track.trackId}
                  draggable={canReorder}
                  onDragStart={(event) => {
                    if (!canReorder) return
                    setDraggedTrackKey(getTrackKey(track))
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(event) => {
                    if (!canReorder) return
                    event.preventDefault()
                    movePlaylistTrack(getTrackKey(track))
                  }}
                  onDragEnd={() => setDraggedTrackKey(null)}
                >
                  {canReorder ? (
                    <span
                      className="track-drag-handle"
                      aria-label="곡 순서 이동"
                    >
                      <GripVertical size={16} />
                    </span>
                  ) : null}
                  <TrackRow
                    track={track}
                    index={index}
                    playerState={{
                      tracks: sortedTracks,
                      backTo: `/playlists/${id}`,
                    }}
                  />
                  {isOwner ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger track-delete-button"
                      aria-label="트랙 삭제"
                      onClick={() =>
                        refreshFrom(() =>
                          removeTrackFromPlaylist(id, track.playlistTrackId)
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <section className="mt-5">
              <h2 className="h5 fw-bold">댓글</h2>
              <form
                className="d-flex flex-nowrap gap-2 mb-3"
                onSubmit={submitComment}
              >
                <input
                  className="form-control min-w-0"
                  placeholder="댓글을 입력하세요"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                <button className="btn btn-accent flex-shrink-0" type="submit">
                  작성
                </button>
              </form>
              {comments.length === 0 ? (
                <EmptyView title="아직 댓글이 없습니다." />
              ) : null}
              <div className="d-grid gap-2">
                {pagedComments.items.map((item) => (
                  <article className="comment-item p-3" key={item.commentId}>
                    <div className="d-flex justify-content-between gap-3 align-items-start">
                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <strong>
                            {item.userNickname || `user-${item.userId}`}
                          </strong>
                          <span className="small text-secondary">
                            {getCommentDateLabel(item)}
                          </span>
                        </div>
                        {editingCommentId === item.commentId ? (
                          <form
                            className="d-flex flex-nowrap gap-2"
                            onSubmit={(event) =>
                              submitEditComment(event, item.commentId)
                            }
                          >
                            <input
                              className="form-control form-control-sm min-w-0"
                              value={editingComment}
                              onChange={(event) =>
                                setEditingComment(event.target.value)
                              }
                              aria-label="댓글 수정 내용"
                            />
                            <button
                              type="submit"
                              className="btn btn-sm btn-accent flex-shrink-0"
                              disabled={commentSaving || !editingComment.trim()}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary flex-shrink-0"
                              onClick={cancelEditComment}
                              disabled={commentSaving}
                            >
                              취소
                            </button>
                          </form>
                        ) : (
                          <p className="mb-0">{item.content}</p>
                        )}
                      </div>
                      {isMyComment(item, userId) ? (
                        <div className="comment-actions">
                          {editingCommentId === item.commentId ? null : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary comment-action-button"
                              onClick={() => startEditComment(item)}
                            >
                              <Edit3 size={15} /> 수정
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger comment-icon-button"
                            aria-label="댓글 삭제"
                            title="댓글 삭제"
                            onClick={() =>
                              refreshFrom(() =>
                                deletePlaylistComment(id, item.commentId)
                              )
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
              <Pager
                page={commentPage}
                totalPages={pagedComments.totalPages}
                onPageChange={setCommentPage}
              />
            </section>
          </section>
        </div>
      </div>
    </main>
  )
}

function sortTracks(tracks, sortKey) {
  const sorted = [...tracks]
  if (sortKey === 'title') {
    return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  if (sortKey === 'artist') {
    return sorted.sort((a, b) =>
      (a.artistName || '').localeCompare(b.artistName || '')
    )
  }
  return sorted.sort((a, b) => (a.positionNo ?? 0) - (b.positionNo ?? 0))
}

function shuffleTracks(tracks) {
  const shuffled = [...tracks]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

function getTrackKey(track) {
  return String(track.playlistTrackId || track.trackId)
}

function isLikedPlaylist(playlist) {
  if (typeof playlist?.liked === 'boolean') return playlist.liked
  return ['Y', 'TRUE', 'LIKED'].includes(
    String(playlist?.liked || playlist?.likeStatus || '').toUpperCase()
  )
}

function isMyComment(comment, userId) {
  return String(comment?.userId) === String(userId)
}

function getCommentDateLabel(comment) {
  const createdAt = formatDateTime(comment?.createdAt)
  return createdAt ? `작성일 ${createdAt}` : ''
}

function sortCommentsByNewest(comments) {
  return [...comments].sort((a, b) => getCommentTime(b) - getCommentTime(a))
}

function getCommentTime(comment) {
  const time = new Date(comment?.createdAt || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}
