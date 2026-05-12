import { ArrowUpDown, ListVideo, Play, Repeat, Shuffle, SkipForward } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  getPlayableTracks,
  getYoutubeEmbedTitle,
  getYoutubeVideoId,
} from '../utils/youtube.js'

let youtubeApiPromise = null

function loadYoutubeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('브라우저 환경이 아닙니다.'))
  if (window.YT?.Player) return Promise.resolve(window.YT)

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.()
        resolve(window.YT)
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        script.async = true
        document.body.appendChild(script)
      }
    })
  }

  return youtubeApiPromise
}

export function YoutubeQueuePlayer({
  tracks,
  currentTrack,
  onTrackChange,
  onQueueChange,
  title = '뮤직비디오',
}) {
  const elementId = useId().replaceAll(':', '')
  const playerRef = useRef(null)
  const playableTracksRef = useRef([])
  const activeIndexRef = useRef(-1)
  const repeatQueueRef = useRef(false)
  const onTrackChangeRef = useRef(onTrackChange)
  const [apiReady, setApiReady] = useState(false)
  const [queueSort, setQueueSort] = useState('position')
  const [repeatQueue, setRepeatQueue] = useState(false)
  const playableTracks = useMemo(() => getPlayableTracks(tracks), [tracks])
  const activeTrack = currentTrack && getYoutubeVideoId(currentTrack.youtubeUrl) ? currentTrack : null
  const activeVideoId = getYoutubeVideoId(activeTrack?.youtubeUrl)
  const activeIndex = playableTracks.findIndex((track) => track.trackId === activeTrack?.trackId)

  useEffect(() => {
    playableTracksRef.current = playableTracks
    activeIndexRef.current = activeIndex
    onTrackChangeRef.current = onTrackChange
  }, [activeIndex, onTrackChange, playableTracks])

  useEffect(() => {
    repeatQueueRef.current = repeatQueue
  }, [repeatQueue])

  useEffect(() => {
    let mounted = true

    loadYoutubeApi().then(() => {
      if (mounted) setApiReady(true)
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!apiReady || !activeVideoId) return undefined

    function playNext() {
      const queue = playableTracksRef.current
      const nextTrack = queue[activeIndexRef.current + 1]
      if (nextTrack) {
        onTrackChangeRef.current?.(nextTrack)
        return
      }

      if (repeatQueueRef.current && queue.length > 0) {
        const firstTrack = queue[0]
        if (firstTrack.trackId === activeTrack?.trackId) {
          playerRef.current?.seekTo?.(0)
          playerRef.current?.playVideo?.()
          return
        }
        onTrackChangeRef.current?.(firstTrack)
      }
    }

    playerRef.current?.destroy?.()
    playerRef.current = new window.YT.Player(elementId, {
      videoId: activeVideoId,
      playerVars: {
        autoplay: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onStateChange(event) {
          if (event.data === window.YT.PlayerState.ENDED) {
            playNext()
          }
        },
      },
    })

    return () => {
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [activeTrack?.trackId, activeVideoId, apiReady, elementId])

  useEffect(() => {
    return () => {
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [])

  if (!activeTrack) {
    return (
      <aside className="surface p-4 video-player-panel">
        <h2 className="h5 fw-bold">{title}</h2>
        <div className="surface text-center p-5 bg-white">
          <ListVideo size={32} className="text-secondary mb-2" />
          <p className="mb-0 text-secondary">트랙의 뮤직비디오 버튼을 누르면 여기에 재생됩니다.</p>
        </div>
      </aside>
    )
  }

  function updateQueue(nextTracks) {
    onQueueChange?.(nextTracks, activeTrack)
  }

  function shuffleQueue() {
    const remainingTracks = playableTracks.filter((track) => track.trackId !== activeTrack.trackId)
    updateQueue([activeTrack, ...shuffleTracks(remainingTracks)])
    setQueueSort('shuffle')
  }

  function sortQueue(sortKey) {
    if (sortKey === 'shuffle') {
      shuffleQueue()
      return
    }
    setQueueSort(sortKey)
    if (sortKey === 'position') {
      updateQueue(sortTracks(playableTracks, sortKey))
      return
    }
    updateQueue(sortTracks(playableTracks, sortKey))
  }

  return (
    <aside className="surface p-3 p-lg-4 video-player-panel">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="h5 fw-bold mb-1">{title}</h2>
          <p className="small text-secondary text-truncate mb-0">
            {getYoutubeEmbedTitle(activeTrack)}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={activeIndex < 0 || activeIndex >= playableTracks.length - 1}
          onClick={() => onTrackChange?.(playableTracks[activeIndex + 1])}
        >
          <SkipForward size={16} />
        </button>
      </div>
      <div className="video-frame overflow-hidden">
        <div id={elementId} className="w-100 h-100" />
      </div>
      <div className="mt-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <strong className="small">재생 목록</strong>
            <span className="small text-secondary ms-2">
              {Math.max(activeIndex + 1, 1)} / {playableTracks.length}
            </span>
          </div>
          <div className="d-flex flex-wrap justify-content-end align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={shuffleQueue}
              disabled={playableTracks.length < 2}
            >
              <Shuffle size={15} />
              셔플
            </button>
            <button
              type="button"
              className={`btn btn-sm d-inline-flex align-items-center gap-1 ${repeatQueue ? 'btn-accent' : 'btn-outline-secondary'}`}
              onClick={() => setRepeatQueue((enabled) => !enabled)}
              disabled={playableTracks.length === 0}
              aria-pressed={repeatQueue}
            >
              <Repeat size={15} />
              이어 재생
            </button>
            <label className="d-inline-flex align-items-center gap-1 small mb-0">
              <ArrowUpDown size={15} />
              <select
                className="form-select form-select-sm player-sort-select"
                value={queueSort}
                onChange={(event) => sortQueue(event.target.value)}
                aria-label="재생 목록 정렬"
              >
                <option value="shuffle">셔플</option>
                <option value="position">기본순</option>
                <option value="title">제목순</option>
                <option value="artist">아티스트순</option>
              </select>
            </label>
          </div>
        </div>
        <div className="video-queue-list d-grid gap-2">
          {playableTracks.slice(0, 12).map((track, index) => (
            <button
              type="button"
              className={`video-queue-item text-start ${track.trackId === activeTrack.trackId ? 'active' : ''}`}
              key={`${track.trackId}-${index}`}
              onClick={() => onTrackChange?.(track)}
            >
              <Play size={14} />
              <span className="text-truncate">{track.title}</span>
              <span className="text-secondary text-truncate">{track.artistName}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

function sortTracks(tracks, sortKey) {
  const sorted = [...tracks]
  if (sortKey === 'title') {
    return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  if (sortKey === 'artist') {
    return sorted.sort((a, b) => (a.artistName || '').localeCompare(b.artistName || ''))
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
