/* =========================
   Music Data
   ========================= */

/* Update this list when changing the songs shown on the About page. */
const musicTracks = [
  {
    title: 'Kill It',
    artist: 'aespa',
    cover: 'assets/music/cover-1.png',
    playing: true,
  },
  {
    title: 'Count on Me',
    artist: 'aespa',
    cover: 'assets/music/cover-2.png',
    playing: false,
  },
  {
    title: 'BLACKHOLE',
    artist: 'IVE',
    cover: 'assets/music/cover-3.png',
    playing: false,
  },
]


/* =========================
   Music Rendering
   ========================= */

/* Create the animated bars used by the currently playing track. */
function createEqualizer() {
  const equalizer = document.createElement('div')
  equalizer.className = 'track-equalizer'
  equalizer.setAttribute('aria-label', 'Playing')

  for (let index = 0; index < 4; index += 1) {
    const bar = document.createElement('span')
    bar.className = 'equalizer-bar'
    equalizer.appendChild(bar)
  }

  return equalizer
}

/* Create one playlist row from a track object. */
function createTrackRow(track) {
  const row = document.createElement('div')
  row.className = `track-row${track.playing ? ' is-playing' : ''}`

  const cover = document.createElement('img')
  cover.className = 'track-cover'
  cover.src = track.cover
  cover.alt = ''
  cover.setAttribute('aria-hidden', 'true')

  const info = document.createElement('div')
  info.className = 'track-info'

  const name = document.createElement('p')
  name.className = 'track-name'
  name.textContent = track.title

  const artist = document.createElement('p')
  artist.className = 'track-artist'
  artist.textContent = track.artist

  info.append(name, artist)

  if (track.playing) {
    row.append(cover, info, createEqualizer())
  } else {
    const play = document.createElement('span')
    play.className = 'track-play'
    play.setAttribute('aria-hidden', 'true')
    row.append(cover, info, play)
  }

  return row
}

/* Populate the playlist only when the About page track container exists. */
function renderMusicTracks() {
  const trackList = document.getElementById('musicTrackList')

  if (!trackList) {
    return
  }

  trackList.replaceChildren(
    ...musicTracks.map(track => createTrackRow(track)),
  )
}

renderMusicTracks()
