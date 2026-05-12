import { Heart, ListMusic } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTrackCount, isPublicPlaylist } from '../utils/format.js'

export function PlaylistCard({ playlist }) {
  const trackCount = getTrackCount(playlist)
  const publicPlaylist = isPublicPlaylist(playlist)

  return (
    <article className="playlist-card h-100">
      <Link to={`/playlists/${playlist.playlistId}`} className="text-decoration-none">
        <div className="thumb">
          {playlist.coverImageUrl ? (
            <img src={playlist.coverImageUrl} alt="" />
          ) : (
            <ListMusic size={44} color="#9b9b9b" />
          )}
        </div>
        <div className="p-3">
          <div className="d-flex justify-content-between gap-2 mb-2">
            <h3 className="h6 mb-0 text-truncate">{playlist.title}</h3>
            <span className={`badge ${publicPlaylist ? 'badge-public' : 'badge-private'}`}>
              {publicPlaylist ? '공개' : '비공개'}
            </span>
          </div>
          <p className="small text-secondary line-clamp-2 mb-2">
            {playlist.description || '설명이 없습니다.'}
          </p>
          <div className="d-flex align-items-center gap-3 small text-secondary">
            <span className="d-inline-flex align-items-center gap-1">
              <Heart size={14} />
              {playlist.likeCount ?? 0}
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <ListMusic size={14} />
              {trackCount}곡
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
