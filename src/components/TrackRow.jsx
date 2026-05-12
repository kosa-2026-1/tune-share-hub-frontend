import { ExternalLink, ListPlus, Music, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDuration } from '../utils/format.js'
import { canShowYoutubeEmbed } from '../utils/youtube.js'

export function TrackRow({ track, index, playerState, onAdd, added, actionLabel = '추가' }) {
  const canPlay = canShowYoutubeEmbed(track.youtubeUrl)

  return (
    <div className="track-row d-flex align-items-center gap-3 p-3">
      <div className="text-secondary small" style={{ width: 24 }}>
        {index + 1}
      </div>
      <div className="album-art">
        {track.albumImageUrl ? (
          <img src={track.albumImageUrl} alt="" />
        ) : (
          <div className="d-grid h-100 place-items-center">
            <Music size={18} color="#9b9b9b" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-grow-1">
        <div className="fw-bold text-truncate">{track.title}</div>
        <div className="small text-secondary text-truncate">
          {track.artistName}
          {track.albumName ? ` · ${track.albumName}` : ''}
        </div>
      </div>
      <div className="d-none d-md-block small text-secondary">{formatDuration(track.durationMs)}</div>
      <div className="d-flex flex-wrap justify-content-end gap-2">
        {canPlay ? (
          <Link
            to="/player"
            state={{ ...playerState, currentTrack: track }}
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          >
            <Play size={15} />
            재생
          </Link>
        ) : null}
        {track.spotifyUrl ? (
          <a
            className="btn btn-sm btn-outline-secondary"
            href={track.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Spotify에서 열기"
          >
            <ExternalLink size={15} />
          </a>
        ) : null}
        {onAdd ? (
          <button
            type="button"
            className="btn btn-sm btn-accent d-inline-flex align-items-center gap-1"
            disabled={added}
            onClick={() => onAdd(track)}
          >
            <ListPlus size={15} />
            {added ? '추가됨' : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
