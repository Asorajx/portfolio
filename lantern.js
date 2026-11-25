/* =========================
   Lantern Travel Helpers
   ========================= */

/* Shared by the home page and the About page, which pass the lantern back and forth between them. */
window.LanternFlight = (function () {
  const blurId = 'motionBlurFx'

  /* The sideways blur used while things fly past. Pages that do not have it get it added. */
  function ensureBlurFilter() {
    if (document.getElementById(blurId)) return

    document.body.insertAdjacentHTML(
      'afterbegin',
      '<svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false"><filter id="motionBlur" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur id="motionBlurFx" stdDeviation="0 0"/></filter><filter id="lanternBlur" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur id="lanternBlurFx" stdDeviation="0 0"/></filter></svg>',
    )
  }

  /* A copy of the lantern on the page itself, so no transform on the page can move it. */
  function makeFlyer(lantern, heroScroll = 0) {
    const start = lantern.getBoundingClientRect()
    const flyer = lantern.cloneNode(true)

    ensureBlurFilter()
    flyer.removeAttribute('href')
    flyer.removeAttribute('id')
    flyer.classList.add('is-flying')
    flyer.style.cssText = `--hero-scroll: ${heroScroll}; position: fixed; z-index: 200; margin: 0; left: ${start.left}px; top: ${start.top}px; width: ${start.width}px; height: ${start.height}px; filter: url(#lanternBlur);`
    document.body.append(flyer)
    lantern.style.visibility = 'hidden'

    return { flyer, start }
  }

  /* The faster the element moves sideways, the stronger the blur. */
  function trackBlur(element, duration) {
    const effect = document.getElementById(blurId)
    const lanternEffect = document.getElementById('lanternBlurFx')
    const end = performance.now() + duration
    let lastX = element.getBoundingClientRect().left

    ensureBlurFilter()

    function step() {
      if (performance.now() > end) {
        effect?.setAttribute('stdDeviation', '0 0')
        lanternEffect?.setAttribute('stdDeviation', '0 0')
        return
      }

      const x = element.getBoundingClientRect().left

      effect?.setAttribute('stdDeviation', `${Math.min(Math.abs(lastX - x) * .5, 44)} 0`)
      /* The lantern itself only softens a little, so it stays solid in front of the page. */
      lanternEffect?.setAttribute('stdDeviation', `${Math.min(Math.abs(lastX - x) * .08, 6)} 0`)
      lastX = x
      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  /* Leave glowing embers behind the flyer. They are shed from its flame, float up and drift a little, then fade. The faster it flies, the more it sheds. */
  function trail(flyer, duration) {
    const colours = ['#fff0c0', '#ffd27a', '#ffb45c', '#ff9a4a']
    const begin = performance.now()
    let last = null

    function spawn(x, y, spread) {
      const ember = document.createElement('span')
      const size = 2 + Math.random() * 4
      const colour = colours[Math.floor(Math.random() * colours.length)]

      ember.className = 'lantern-ember'
      Object.assign(ember.style, {
        left: `${x + (Math.random() - .5) * spread - size / 2}px`,
        top: `${y + (Math.random() - .5) * 8 - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: colour,
        boxShadow: `0 0 ${size * 2.5}px ${size * .5}px rgba(255, 170, 80, .65)`,
      })
      document.body.append(ember)
      ember.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${(Math.random() - .5) * 56}px, ${-(16 + Math.random() * 56)}px) scale(.2)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 900, easing: 'cubic-bezier(.2, .6, .3, 1)' }).finished.then(() => ember.remove(), () => ember.remove())
    }

    function step(now) {
      if (now - begin > duration || !flyer.isConnected) return

      const box = flyer.getBoundingClientRect()
      const x = box.left + box.width * .5
      const y = box.top + box.height * .88
      const speed = last ? Math.hypot(x - last[0], y - last[1]) : 0

      last = [x, y]
      if (document.getElementsByClassName('lantern-ember').length < 140) {
        for (let i = 0, count = Math.min(4, 1 + Math.floor(speed / 14)); i < count; i++) spawn(x, y, box.width * .4)
      }
      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  /* The leaving flight, drawn as one smooth path with no stops, like half of an infinity sign. From where it hangs, the lantern swings down and back across the screen, round the far side in a single wide loop, then straight out over where it started. direction is 1 for the home page (loop to the left, leave to the right) and -1 for the mirror. */
  function flyLoop(flyer, start, direction, duration, lineY) {
    const W = window.innerWidth
    const H = window.innerHeight
    const d = direction
    const toX = u => (d > 0 ? u : W - u)
    const startU = d > 0 ? start.left + start.width / 2 : W - (start.left + start.width / 2)
    const startY = start.top + start.height / 2
    const radius = Math.min(150, H * .18)
    const centreU = W * .05 + radius
    const bottom = [centreU, lineY + radius]
    const top = [centreU, lineY - radius]
    const exit = [W + 240, lineY + 10]
    const points = []

    /* A dense list of points in "u" space, where u runs from the starting side towards the far side. */
    const addCurve = (p0, p1, p2, p3) => {
      for (let i = 1; i <= 80; i++) {
        const t = i / 80
        const m = 1 - t

        points.push([
          m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
          m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
        ])
      }
    }

    points.push([startU, startY])
    /* Down and back across the screen, arriving level at the bottom of the loop. */
    addCurve([startU, startY], [startU - (startU - centreU) * .2, startY + (bottom[1] - startY) * .85], [centreU + (startU - centreU) * .4, bottom[1]], bottom)
    /* The loop itself: round the far side, from the bottom up to the top. */
    for (let angle = 90; angle <= 270; angle += 3) {
      const rad = angle * Math.PI / 180

      points.push([centreU + radius * Math.cos(rad), lineY + radius * Math.sin(rad)])
    }
    /* Straight out, passing over where it started. */
    addCurve(top, [centreU + (W - centreU) * .4, top[1]], [W * .66, top[1] + (exit[1] - top[1]) * .5], exit)

    /* Distance along the path at every point. */
    const lengths = [0]

    for (let i = 1; i < points.length; i++) {
      lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
    }

    const total = lengths[lengths.length - 1]
    const begin = performance.now()
    let lean = 0

    function step(now) {
      const t = Math.min((now - begin) / duration, 1)
      /* One gentle acceleration from start to finish, so the lantern never stops. */
      const distance = Math.pow(t, 1.45) * total
      let low = 0
      let high = lengths.length - 1

      while (high - low > 1) {
        const mid = (low + high) >> 1

        if (lengths[mid] > distance) high = mid
        else low = mid
      }

      const here = points[low]
      const ahead = points[Math.min(low + 3, points.length - 1)]
      const heading = ahead[0] - here[0]
      const speed = Math.hypot(heading, ahead[1] - here[1]) || 1

      /* It leans into the direction it is travelling, smoothly. */
      lean += ((heading / speed) * d * 14 - lean) * .12

      flyer.style.transform = `translate(${toX(here[0]) - (start.left + start.width / 2)}px, ${here[1] - startY}px) rotate(${lean}deg) scale(${1 + Math.pow(t, 1.2) * 1.4})`

      if (t < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  /* The screen follows the lantern: once it rushes off, the page streams the opposite way and fades. */
  function streamContent(elements, direction, duration, startAt = .5) {
    const delay = duration * startAt

    elements.forEach(element => {
      setTimeout(() => { element.style.filter = 'url(#motionBlur)' }, delay)
      element.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${-direction * 130}vw)`, opacity: 0 },
      ], { duration: duration * (1 - startAt), delay, easing: 'cubic-bezier(.6, 0, .9, .55)', fill: 'forwards' })
    })
  }

  return { ensureBlurFilter, makeFlyer, trackBlur, trail, flyLoop, streamContent }
})()


/* =========================
   About Page Lantern
   ========================= */

/* The lantern arrives from the left as the words fly in, then rests in the sky above the page as "Back". Clicking it sends it round in one loop and off to the left, and it comes home from the left too. */
;(function setupAboutLantern() {
  const row = document.querySelector('.about-lantern-spot')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const arriveTime = 1100
  const flightTime = 1150
  let arrival = null
  let flying = false

  if (!row || !window.LanternFlight) return

  try {
    arrival = sessionStorage.getItem('lantern-arrive')
    if (arrival === 'about') sessionStorage.removeItem('lantern-arrive')
  } catch {}

  const lantern = document.createElement('a')

  lantern.className = 'hero-lantern about-lantern'
  lantern.href = './index.html'
  lantern.setAttribute('aria-label', 'Back to home')
  lantern.innerHTML =
    '<span class="lantern-glow" aria-hidden="true"></span>' +
    '<svg class="lantern-art" viewBox="0 0 110 106" aria-hidden="true" focusable="false">' +
    '<defs><radialGradient id="lanternPaper" cx=".5" cy=".78" r=".85"><stop offset="0" style="stop-color: var(--lantern-core)"/><stop offset=".4" style="stop-color: var(--lantern-mid)"/><stop offset="1" style="stop-color: var(--lantern-edge)"/></radialGradient><linearGradient id="lanternShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3d14" stop-opacity=".3"/><stop offset=".3" stop-color="#7a3d14" stop-opacity="0"/><stop offset=".7" stop-color="#7a3d14" stop-opacity="0"/><stop offset="1" stop-color="#7a3d14" stop-opacity=".36"/></linearGradient><radialGradient id="lanternInner" cx=".5" cy=".8" r=".55"><stop offset="0" stop-color="#fff9e3" stop-opacity=".85"/><stop offset="1" stop-color="#fff2c2" stop-opacity="0"/></radialGradient></defs><path class="lantern-flame" d="M55 92 C50 98 51 103 55 105 C59 103 60 98 55 92 Z"/><path class="lantern-core" d="M55 96 C53 99 53.4 102 55 103 C56.6 102 57 99 55 96 Z"/><path class="lantern-body" d="M30 28 H80 C92 36 102 46 104 58 C100 68 92 76 86 82 H24 C18 76 10 68 6 58 C8 46 18 36 30 28 Z"/><path class="lantern-shade" d="M30 28 H80 C92 36 102 46 104 58 C100 68 92 76 86 82 H24 C18 76 10 68 6 58 C8 46 18 36 30 28 Z"/><path class="lantern-inner" d="M30 28 H80 C92 36 102 46 104 58 C100 68 92 76 86 82 H24 C18 76 10 68 6 58 C8 46 18 36 30 28 Z"/><path class="lantern-lozenge" d="M19 52 L24 60 L19 68 L14 60 Z"/><path class="lantern-lozenge" d="M91 52 L96 60 L91 68 L86 60 Z"/><path class="lantern-line" d="M37 28 C30 44 27 62 30 82 M73 28 C80 44 83 62 80 82"/><path class="lantern-frame" d="M30 28 H80 C92 36 102 46 104 58 C100 68 92 76 86 82 H24 C18 76 10 68 6 58 C8 46 18 36 30 28 Z M33 31 C21 38 13 47 11 58 C15 67 21 74 27 79 H83 C89 74 95 67 99 58 C97 47 89 38 77 31 Z" fill-rule="evenodd"/><path class="lantern-frame" d="M55 1.5 L58.5 6.5 L55 11.5 L51.5 6.5 Z M54 11 H56 V16 H54 Z"/><path class="lantern-frame" d="M37 17 Q55 8 73 17 L80 24 H30 Z M28 24 H82 V29 H28 Z"/><path class="lantern-frame" d="M18 81 H92 V87 H18 Z M22 87 H88 L83 95 H27 Z"/><g aria-hidden="true"><path id="lanternLine0" d="M32 65 Q55 69 78 65" fill="none"/><text class="lantern-text" font-size="20" text-anchor="middle"><textPath href="#lanternLine0" startOffset="50%">Home</textPath></text></g>' +
    '</svg>'
  row.append(lantern)

  /* Arriving from Home: the lantern comes in from the left while the words fly in, and settles quickly into its place. */
  if (arrival === 'about' && !reducedMotion.matches) {
    lantern.style.visibility = 'hidden'

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const { flyer, start } = window.LanternFlight.makeFlyer(lantern, 0)
      const fromX = -(start.left + start.width + 160)
      const fromY = window.innerHeight * .3 - start.top

      flyer.animate([
        { transform: `translate(${fromX}px, ${fromY}px) rotate(8deg) scale(2.2)`, offset: 0 },
        { transform: `translate(${fromX * .35}px, ${fromY * .5}px) rotate(5deg) scale(1.7)`, offset: .45 },
        { transform: `translate(${fromX * .08}px, ${fromY * .1}px) rotate(-2deg) scale(1.15)`, offset: .8 },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', offset: 1 },
      ], { duration: arriveTime, easing: 'cubic-bezier(.2, .7, .25, 1)', fill: 'forwards' })

      window.LanternFlight.trackBlur(flyer, arriveTime)
      window.LanternFlight.trail(flyer, arriveTime * .7)

      setTimeout(() => {
        flyer.remove()
        lantern.style.visibility = ''
      }, arriveTime)
    }))
  }

  /* Back: the lantern flies off to the right and the page streams away behind it. */
  lantern.addEventListener('click', event => {
    if (
      flying ||
      reducedMotion.matches ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return

    event.preventDefault()
    flying = true
    document.documentElement.style.overflowX = 'hidden'

    const { flyer, start } = window.LanternFlight.makeFlyer(lantern, 0)
    /* Only the sheet streams away, so the sky stays put behind it. */
    const sheet = document.querySelector('.about-sheet')

    /* The mirror of leaving home: one wide loop, then straight out to the left while the page streams away to the right. */
    const line = document.querySelector('.about-page h1')?.getBoundingClientRect()

    window.LanternFlight.flyLoop(flyer, start, -1, flightTime, line ? line.top + line.height / 2 : window.innerHeight * .3)
    if (sheet) window.LanternFlight.streamContent([sheet], -1, flightTime, .5)

    window.LanternFlight.trackBlur(flyer, flightTime)
    window.LanternFlight.trail(flyer, flightTime)

    setTimeout(() => {
      try { sessionStorage.setItem('lantern-arrive', 'home') } catch {}
      window.location.href = lantern.href
    }, flightTime)
  })
})()
