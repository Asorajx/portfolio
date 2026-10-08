/* =========================
   Demo Video Player
   ========================= */

/* Create one accessible player for a project MP4. */
/* Playback remains native; only its controls are customised. */
;(function () {
  const icons = {
    play: '▶', pause: 'Ⅱ', mute: '◌', volume: '♫', fullscreen: '⛶'
  }
  let activePlayer = null

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00'
    const total = Math.floor(seconds)
    const minutes = Math.floor(total / 60)
    return `${minutes}:${String(total % 60).padStart(2, '0')}`
  }

  function create(source, title = 'Project demo') {
    const player = document.createElement('div')
    player.className = 'demo-video is-loading'
    player.innerHTML = `
      <video class="demo-video__media" muted playsinline preload="metadata" aria-label="${escapeText(title)}"></video>
      <div class="demo-video__skeleton" aria-hidden="true"><span class="demo-video__skeleton-mark"></span></div>
      <div class="demo-video__loading" role="status" aria-label="Loading video"><span class="demo-video__spinner"></span></div>
      <div class="demo-video__notice" role="alert" hidden>Unable to play this video. Please check the MP4 file.</div>
      <div class="demo-video__seek-feedback" aria-hidden="true"></div>
      <div class="demo-video__controls">
        <div class="demo-video__timeline">
          <div class="demo-video__buffered" aria-hidden="true"></div>
          <div class="demo-video__played" aria-hidden="true"></div>
          <input class="demo-video__seek" aria-label="Seek video" type="range" min="0" max="1000" value="0" step="1">
        </div>
        <div class="demo-video__toolbar">
          <button class="demo-video__button demo-video__play" type="button" aria-label="Play">${icons.play}</button>
          <span class="demo-video__time" aria-live="off">0:00 / 0:00</span>
          <span class="demo-video__grow"></span>
          <button class="demo-video__button demo-video__mute" type="button" aria-label="Unmute">${icons.mute}</button>
          <input class="demo-video__volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">
          <div class="demo-video__speed-wrap">
            <button class="demo-video__button demo-video__speed" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Playback speed">1×</button>
            <div class="demo-video__speed-menu" hidden role="group" aria-label="Playback speed options">
              <button type="button" data-speed="0.5">0.5×</button>
              <button type="button" data-speed="0.75">0.75×</button>
              <button type="button" data-speed="1" aria-pressed="true">1×</button>
              <button type="button" data-speed="1.25">1.25×</button>
              <button type="button" data-speed="1.5">1.5×</button>
              <button type="button" data-speed="2">2×</button>
            </div>
          </div>
          <button class="demo-video__button demo-video__fullscreen" type="button" aria-label="Enter fullscreen">${icons.fullscreen}</button>
        </div>
      </div>
    `

    const video = player.querySelector('video')
    const play = player.querySelector('.demo-video__play')
    const mute = player.querySelector('.demo-video__mute')
    const volume = player.querySelector('.demo-video__volume')
    const seek = player.querySelector('.demo-video__seek')
    const buffered = player.querySelector('.demo-video__buffered')
    const played = player.querySelector('.demo-video__played')
    const time = player.querySelector('.demo-video__time')
    const speed = player.querySelector('.demo-video__speed')
    const speedMenu = player.querySelector('.demo-video__speed-menu')
    const fullscreen = player.querySelector('.demo-video__fullscreen')
    const feedback = player.querySelector('.demo-video__seek-feedback')
    let tapTime = 0
    let tapSide = ''
    let feedbackTimer
    let singleTapTimer
    let lastPointerWasTouch = false


    function updateTimeline() {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      const position = duration ? video.currentTime / duration : 0
      seek.value = String(Math.round(position * 1000))
      seek.disabled = !duration
      played.style.width = `${position * 100}%`
      time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`
      seek.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} of ${formatTime(duration)}`)
      let loaded = 0
      for (let i = 0; i < video.buffered.length; i += 1) {
        if (video.buffered.start(i) <= video.currentTime && video.currentTime <= video.buffered.end(i)) {
          loaded = video.buffered.end(i)
          break
        }
      }
      buffered.style.width = `${duration ? Math.min(100, loaded / duration * 100) : 0}%`
    }

    function updatePlayback() {
      play.textContent = video.paused ? icons.play : icons.pause
      play.setAttribute('aria-label', video.paused ? 'Play' : 'Pause')
    }

    function updateVolume() {
      mute.textContent = video.muted || video.volume === 0 ? icons.mute : icons.volume
      mute.setAttribute('aria-label', video.muted || video.volume === 0 ? 'Unmute' : 'Mute')
      mute.setAttribute('aria-pressed', String(video.muted || video.volume === 0))
      volume.value = String(video.muted ? 0 : video.volume)
    }

    function togglePlayback() {
      if (video.paused) video.play().catch(() => {})
      else video.pause()
    }

    function skip(amount) {
      if (!Number.isFinite(video.duration)) return
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + amount))
      feedback.textContent = `${amount > 0 ? '+' : '−'}${Math.abs(amount)}s`
      feedback.classList.add('is-visible')
      clearTimeout(feedbackTimer)
      feedbackTimer = setTimeout(() => feedback.classList.remove('is-visible'), 650)
    }

    function closeSpeedMenu() {
      speedMenu.hidden = true
      speed.setAttribute('aria-expanded', 'false')
    }

    play.addEventListener('click', togglePlayback)
    video.addEventListener('play', updatePlayback)
    video.addEventListener('pause', updatePlayback)
    video.addEventListener('ended', updatePlayback)
    video.addEventListener('timeupdate', updateTimeline)
    video.addEventListener('progress', updateTimeline)
    video.addEventListener('durationchange', updateTimeline)
    video.addEventListener('loadedmetadata', () => {
      player.classList.remove('is-loading')
      updateTimeline()
    })
    video.addEventListener('canplay', () => player.classList.remove('is-buffering'))
    video.addEventListener('playing', () => player.classList.remove('is-buffering'))
    video.addEventListener('waiting', () => player.classList.add('is-buffering'))
    video.addEventListener('seeking', () => player.classList.add('is-buffering'))
    video.addEventListener('seeked', () => player.classList.remove('is-buffering'))
    video.addEventListener('error', () => {
      player.classList.remove('is-loading', 'is-buffering')
      player.querySelector('.demo-video__notice').hidden = false
    })
    seek.addEventListener('input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 1000 * video.duration
    })
    mute.addEventListener('click', () => { video.muted = !video.muted; updateVolume() })
    volume.addEventListener('input', () => {
      video.volume = Number(volume.value)
      video.muted = video.volume === 0
      updateVolume()
    })
    speed.addEventListener('click', () => {
      speedMenu.hidden = !speedMenu.hidden
      speed.setAttribute('aria-expanded', String(!speedMenu.hidden))
    })
    speedMenu.addEventListener('click', event => {
      const option = event.target.closest('[data-speed]')
      if (!option) return
      video.playbackRate = Number(option.dataset.speed)
      speed.textContent = option.textContent
      speedMenu.querySelectorAll('button').forEach(button => {
        button.setAttribute('aria-pressed', String(button === option))
      })
      closeSpeedMenu()
      speed.focus()
    })
    player.addEventListener('focusout', event => {
      if (!player.querySelector('.demo-video__speed-wrap').contains(event.relatedTarget)) closeSpeedMenu()
    })
    video.addEventListener('click', () => {
      /* Touch gestures are handled separately to avoid a second play toggle. */
      if (!lastPointerWasTouch) togglePlayback()
    })
    video.addEventListener('pointerdown', event => {
      lastPointerWasTouch = event.pointerType === 'touch'
    })
    video.addEventListener('pointerup', event => {
      if (event.pointerType !== 'touch') return
      const side = event.offsetX < video.clientWidth / 2 ? 'left' : 'right'
      const now = performance.now()
      clearTimeout(singleTapTimer)
      if (side === tapSide && now - tapTime < 350) {
        skip(side === 'left' ? -5 : 5)
        tapTime = 0
      } else {
        tapTime = now
        tapSide = side
        singleTapTimer = setTimeout(() => {
          if (player.isConnected) togglePlayback()
          tapTime = 0
        }, 350)
      }
    })
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === player) await document.exitFullscreen()
        else if (player.requestFullscreen) await player.requestFullscreen()
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen()
      } catch (error) { /* Fullscreen may be denied by the browser. */ }
    })
    document.addEventListener('fullscreenchange', () => {
      if (!player.isConnected) return
      fullscreen.setAttribute('aria-label', document.fullscreenElement === player ? 'Exit fullscreen' : 'Enter fullscreen')
    })

    /* Keep keyboard shortcuts connected to the currently displayed demo. */
    activePlayer = { player, togglePlayback, skip, closeSpeedMenu }

    video.src = source
    video.load()
    updatePlayback()
    updateVolume()
    updateTimeline()
    return player
  }

  /* Control the visible demo without interrupting typing or focused controls. */
  document.addEventListener('keydown', event => {
    if (!activePlayer?.player.isConnected) return

    if (event.key === 'Escape') {
      activePlayer.closeSpeedMenu()
      return
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return

    const target = event.target
    if (target instanceof Element && (
      target.closest('input, textarea, select, button, a, [contenteditable], [role="slider"]') ||
      target.isContentEditable
    )) return

    if (event.code === 'Space' || event.key.toLowerCase() === 'k') {
      event.preventDefault()
      activePlayer.togglePlayback()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      activePlayer.skip(-5)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      activePlayer.skip(5)
    }
  })

  /* Safely insert project names into a small HTML template. */
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
  }

  window.DemoVideo = { create }
})()