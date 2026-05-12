function sameId(left, right) {
  return String(left ?? '') === String(right ?? '')
}

export function isOwnedPlaylist(playlist, userId, myPlaylists = []) {
  if (!playlist || !userId) return false

  const ownerCandidates = [
    playlist.userId,
    playlist.ownerId,
    playlist.memberId,
    playlist.creatorId,
    playlist.createdBy,
  ].filter((value) => value !== undefined && value !== null)

  if (ownerCandidates.some((ownerId) => sameId(ownerId, userId))) {
    return true
  }

  return myPlaylists.some((item) => sameId(item.playlistId, playlist.playlistId))
}
