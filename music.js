/* =========================
   Music Data
   ========================= */

/* Update this list when changing the songs shown on the About page. */
const musicTracks = [
  {
    title: 'Kill It',
    artist: 'aespa',
    cover: 'assets/music/cover-1.jpg',
    playing: true,
  },
  {
    title: 'Count on Me',
    artist: 'aespa',
    cover: 'assets/music/cover-2.jpg',
    playing: false,
  },
  {
    title: 'BLACKHOLE',
    artist: 'IVE',
    cover: 'assets/music/cover-3.jpg',
    playing: false,
  },
  {
    title: 'Super in Love',
    artist: 'ILLIT',
    cover: 'assets/music/cover-4.jpg',
    playing: false,
  },
  {
    title: 'Why do I cry?',
    artist: 'fromis_9',
    cover: 'assets/music/cover-5.jpg',
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

/* Create one song button from a track object. */
function createTrackRow(track, index) {
  const row = document.createElement('button')
  row.type = 'button'
  row.className = 'track-row'
  row.setAttribute('aria-label', `Show ${track.title} by ${track.artist}`)
  row.addEventListener('click', () => showTrack(index))

  const cover = document.createElement('img')
  cover.className = 'track-cover'
  cover.src = track.cover
  cover.alt = ''

  const info = document.createElement('span')
  info.className = 'track-info'

  const name = document.createElement('span')
  name.className = 'track-name'
  name.textContent = track.title

  const artist = document.createElement('span')
  artist.className = 'track-artist'
  artist.textContent = track.artist

  info.append(name, artist)

  const play = document.createElement('span')
  play.className = 'track-play'
  play.setAttribute('aria-hidden', 'true')

  row.append(cover, info, play)
  return row
}

/* Album Display */
function setAlbum(track) {
  document.getElementById('albumCover').src = track.cover
  document.getElementById('albumVinylLabel').src = track.cover
  document.getElementById('albumTitle').textContent = track.title
  document.getElementById('albumArtist').textContent = track.artist
}

/* Song List: every track except the one on display. */
function renderMusicTracks(currentIndex) {
  const trackList = document.getElementById('musicTrackList')
  trackList.replaceChildren(
    ...musicTracks
      .map((track, index) => index === currentIndex ? null : createTrackRow(track, index))
      .filter(Boolean),
  )
}

/* Change Song: slide the vinyl away, swap the album, slide it back. */
function showTrack(index) {
  const display = document.getElementById('albumDisplay')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  renderMusicTracks(index)
  if (reducedMotion) {
    setAlbum(musicTracks[index])
    return
  }

  display.classList.add('is-changing')
  setTimeout(() => {
    setAlbum(musicTracks[index])
    display.classList.remove('is-changing')
  }, 280)
}

/* Start with the track marked as playing, only on the About page. */
if (document.getElementById('albumDisplay')) {
  const startIndex = Math.max(0, musicTracks.findIndex(track => track.playing))
  document.getElementById('albumEqualizer').append(createEqualizer())
  setAlbum(musicTracks[startIndex])
  renderMusicTracks(startIndex)
}
