import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EmptyView } from '../components/StatusView.jsx'
import { YoutubeQueuePlayer } from '../components/YoutubeQueuePlayer.jsx'

const EMPTY_TRACKS = []

export function PlayerPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const initialTracks = state?.tracks || EMPTY_TRACKS
  const initialCurrentTrack = state?.currentTrack || null
  const [tracks, setTracks] = useState(initialTracks)
  const [currentTrack, setCurrentTrack] = useState(initialCurrentTrack)
  const backTo = state?.backTo || '/search'

  useEffect(() => {
    setTracks(initialTracks)
    setCurrentTrack(initialCurrentTrack)
  }, [initialCurrentTrack, initialTracks])

  if (!currentTrack) {
    return (
      <main className="page-section">
        <div className="container-xxl">
          <EmptyView
            title="재생할 트랙이 없습니다."
            action={
              <Link to="/search" className="btn btn-accent">
                검색으로 이동
              </Link>
            }
          />
        </div>
      </main>
    )
  }

  function changeTrack(nextTrack) {
    setCurrentTrack(nextTrack)
    navigate('/player', {
      replace: true,
      state: {
        ...state,
        tracks,
        currentTrack: nextTrack,
        backTo,
      },
    })
  }

  function changeQueue(nextTracks, nextCurrentTrack = currentTrack) {
    setTracks(nextTracks)
    setCurrentTrack(nextCurrentTrack)
    navigate('/player', {
      replace: true,
      state: {
        ...state,
        tracks: nextTracks,
        currentTrack: nextCurrentTrack,
        backTo,
      },
    })
  }

  return (
    <main className="page-section">
      <div className="container-xxl">
        <Link to={backTo} className="btn btn-link px-0 text-decoration-none">
          <ArrowLeft size={16} /> 돌아가기
        </Link>
        <div className="row g-4 align-items-start">
          <section className="col-xl-8">
            <YoutubeQueuePlayer
              tracks={tracks.length ? tracks : [currentTrack]}
              currentTrack={currentTrack}
              onTrackChange={changeTrack}
              onQueueChange={changeQueue}
              title="플레이어"
            />
          </section>
          <aside className="col-xl-4">
            <div className="surface p-4">
              <h1 className="h4 fw-bold">{currentTrack.title}</h1>
              <p className="text-secondary mb-3">{currentTrack.artistName}</p>
              {currentTrack.albumImageUrl ? (
                <div className="thumb player-cover">
                  <img src={currentTrack.albumImageUrl} alt="" />
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
