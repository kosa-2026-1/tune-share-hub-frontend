import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { EmptyView } from '../components/StatusView.jsx'
import { canShowYoutubeEmbed, getYoutubeEmbedTitle } from '../utils/youtube.js'

export function TrackDetailPage() {
  const { state } = useLocation()
  const track = state?.track

  if (!track) {
    return (
      <main className="page-section">
        <div className="container-xxl">
          <EmptyView
            title="트랙 정보가 없습니다."
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

  return (
    <main className="page-section">
      <div className="container-xxl">
        <Link to="/search" className="btn btn-link px-0 text-decoration-none">
          <ArrowLeft size={16} /> 뒤로
        </Link>
        <div className="row g-4 align-items-start">
          <section className="col-lg-4">
            <div className="surface p-4">
              <div className="thumb mb-3">{track.albumImageUrl ? <img src={track.albumImageUrl} alt="" /> : null}</div>
              <h1 className="h3 fw-bold">{track.title}</h1>
              <p className="text-secondary">{track.artistName} · {track.albumName}</p>
              {track.spotifyUrl ? (
                <a className="btn btn-outline-secondary" href={track.spotifyUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Spotify에서 열기
                </a>
              ) : null}
            </div>
          </section>
          <section className="col-lg-8">
            <div className="surface p-4">
              <h2 className="h5 fw-bold">뮤직비디오</h2>
              {canShowYoutubeEmbed(track.youtubeUrl) ? (
                <iframe
                  className="video-frame"
                  src={track.youtubeUrl}
                  title={getYoutubeEmbedTitle(track)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="surface text-center p-5">연결된 뮤직비디오가 없습니다.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
