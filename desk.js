/* =========================
   Desk Badges
   ========================= */

/* Put a badge on the desk for every featured project. Hovering shows a preview, and clicking opens the project. */
;(function setupDesk() {
  const hero = document.getElementById('home')
  const desk = hero?.querySelector('.desk')
  const items = desk?.querySelector('.desk-items')
  const hintIdle = desk?.querySelector('.hint-idle')
  const hintActive = desk?.querySelector('.hint-active')
  const featuredProjects = window.ProjectManager?.getFeatured() || []
  let lastPointer = 'mouse'
  let active = -1

  if (!hero || !desk || !items || !featuredProjects.length) return

  const badges = []
  const preview = document.createElement('div')

  /* Where badges rest on the left of the desk: x (percent), y (px) and a slight turn. */
  const badgeSpots = [[10, 170, -10], [30, 235, 8], [13, 300, -4], [34, 165, 12], [22, 355, 6]]

  function makeLayer(className) {
    const layer = document.createElement('span')

    layer.className = className
    return layer
  }

  preview.className = 'desk-preview'
  preview.setAttribute('aria-hidden', 'true')
  preview.innerHTML =
    '<div class="desk-preview-copy"><p class="desk-preview-type"></p><p class="desk-preview-title"></p><p class="desk-preview-text"></p></div>'
  items.append(preview)

  /* Use the project's badge image, or its first letter until one is added. */
  function fillBadge(face, project) {
    const image = document.createElement('img')

    image.src = `assets/badges/${project.id}.png`
    image.alt = ''
    image.addEventListener('error', () => {
      face.textContent = project.title[0]
    })
    face.append(image)
  }

  /* The preview shows the project's type and team, name and summary. */
  function showPreview(project) {
    preview.querySelector('.desk-preview-type').textContent = `${project.type} · ${project.team === 'group' ? 'Group' : 'Solo'}`
    preview.querySelector('.desk-preview-title').textContent = project.title
    preview.querySelector('.desk-preview-text').textContent = project.summary
  }

  function activate(index) {
    active = index
    showPreview(featuredProjects[index])
    desk.classList.add('is-focused')
    document.documentElement.classList.add('desk-focused')
    preview.classList.add('is-visible')
    badges.forEach((badge, badgeIndex) => badge.classList.toggle('is-active', badgeIndex === index))
  }

  /* The hint's wording follows the kind of pointer. */
  function setHint() {
    const touch = lastPointer === 'touch'

    if (hintIdle) hintIdle.textContent = touch ? 'Tap any badge' : 'Hover any badge'
    if (hintActive) hintActive.textContent = touch ? 'Tap again to see more' : 'Click to see more'
  }

  function deactivate() {
    active = -1
    desk.classList.remove('is-focused')
    document.documentElement.classList.remove('desk-focused')
    preview.classList.remove('is-visible')
    badges.forEach(badge => badge.classList.remove('is-active'))
  }

  /* Open the project full page, growing out of its badge. */
  function openProject(project, badge) {
    window.DrawerCabinet?.open(project.id, badge)
  }

  featuredProjects.forEach((project, index) => {
    const badge = document.createElement('button')
    const face = document.createElement('span')
    const [x, y, tilt] = badgeSpots[index % badgeSpots.length]

    badge.className = 'desk-badge'
    badge.type = 'button'
    badge.setAttribute('aria-label', `${project.title}, open project`)
    badge.style.setProperty('--x', `${x}%`)
    badge.style.setProperty('--y', `${y}px`)
    badge.style.setProperty('--r', `${tilt}deg`)
    face.className = 'desk-badge-face'
    fillBadge(face, project)
    badge.append(makeLayer('desk-badge-shadow'))

    /* Three layers under the face make the badge look thick. */
    for (let layer = 0; layer < 4; layer++) {
      const edge = makeLayer('desk-badge-edge')

      edge.style.setProperty('--layer', layer)
      badge.append(edge)
    }

    badge.append(face)

    badge.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') activate(index)
    })
    badge.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') deactivate()
    })
    badge.addEventListener('focus', () => activate(index))
    badge.addEventListener('blur', deactivate)
    badge.addEventListener('click', () => {
      /* On touch screens the first tap previews and the second tap opens. */
      if (lastPointer === 'touch' && active !== index) {
        activate(index)
        return
      }

      openProject(project, badge)
    })

    items.append(badge)
    badges.push(badge)
  })

  /* Phones and tablets start with the tap wording. */
  lastPointer = window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse'
  setHint()

  document.addEventListener('pointerdown', event => {
    lastPointer = event.pointerType
    setHint()
    if (lastPointer === 'touch' && !event.target.closest('.desk-badge')) deactivate()
  })
})()


/* =========================
   Sky Lantern Flight
   ========================= */

/* The lantern is the thing that travels between pages. Clicking it, or About in the navbar, sends the lantern round in one wide loop and out to the right, while the page streams away to the left behind it. It reappears from the right on the About page, as the words fly in, and settles at the top left. Coming back, it arrives from the left. */
;(function setupLanternFlight() {
  const lantern = document.querySelector('.hero-lantern')
  const hero = document.getElementById('home')
  const aboutNavLink = document.querySelector('.nav-links a[href$="about.html"]')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const flightTime = 1150
  const arriveTime = 1100
  let flying = false

  if (!lantern || !hero || !window.LanternFlight) return

  function startFlight(href) {
    const { flyer, start } = window.LanternFlight.makeFlyer(lantern, hero.style.getPropertyValue('--hero-scroll') || 0)
    const streamAway = [...hero.querySelectorAll('.hero-desk > .container, .desk')]
    const clouds = [...hero.querySelectorAll('.sky-cloud')]

    flying = true

    const tagline = hero.querySelector('.hero-tagline').getBoundingClientRect()

    /* The lantern swings down and round in one wide loop, then heads straight out to the right. */
    window.LanternFlight.flyLoop(flyer, start, 1, flightTime, tagline.top + tagline.height / 2)

    /* The screen follows it: the words, desk and clouds stream away to the left. */
    window.LanternFlight.streamContent(streamAway, 1, flightTime, .5)

    clouds.forEach((cloud, index) => {
      cloud.animate([
        { translate: '0 0' },
        { translate: `${-140 - index * 15}vw 0` },
      ], { duration: flightTime * .5, delay: flightTime * .5, easing: 'cubic-bezier(.6, 0, .9, .55)', fill: 'forwards' })
    })

    window.LanternFlight.trackBlur(flyer, flightTime)
    window.LanternFlight.trail(flyer, flightTime)

    setTimeout(() => {
      try { sessionStorage.setItem('lantern-arrive', 'about') } catch {}
      window.location.href = href
    }, flightTime)
  }

  /* Plain clicks fly. Anything that opens a new tab or window just follows the link. */
  function takeFlight(event, href) {
    const box = lantern.getBoundingClientRect()
    const onScreen = box.bottom > 0 && box.top < window.innerHeight

    if (
      flying ||
      reducedMotion.matches ||
      !onScreen ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return

    event.preventDefault()
    startFlight(href)
  }

  lantern.addEventListener('click', event => takeFlight(event, lantern.href))
  aboutNavLink?.addEventListener('click', event => takeFlight(event, aboutNavLink.href))

  /* Coming back from About: the lantern flies in from the left and settles into its place as the page slides in behind it. */
  let arrival = null

  try {
    arrival = sessionStorage.getItem('lantern-arrive')
    if (arrival === 'home') sessionStorage.removeItem('lantern-arrive')
  } catch {}

  if (arrival === 'home' && !reducedMotion.matches) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const { flyer, start } = window.LanternFlight.makeFlyer(lantern, 0)
      /* The lantern comes home from the right, the way it left About. */
      const fromX = window.innerWidth - start.left + 160

      flyer.animate([
        { transform: `translate(${fromX}px, 36px) rotate(-8deg) scale(1.6)`, offset: 0 },
        { transform: `translate(${fromX * .35}px, -14px) rotate(-5deg) scale(1.35)`, offset: .45 },
        { transform: `translate(${fromX * .08}px, 6px) rotate(2deg) scale(1.08)`, offset: .8 },
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', offset: 1 },
      ], { duration: arriveTime, easing: 'cubic-bezier(.2, .7, .25, 1)', fill: 'forwards' })

      hero.querySelectorAll('.hero-desk > .container, .desk').forEach(element => {
        element.style.filter = 'url(#motionBlur)'
        element.animate([
          { transform: 'translateX(40vw)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 },
        ], { duration: arriveTime * .85, delay: 150, easing: 'cubic-bezier(.1, .7, .3, 1)', fill: 'backwards' })
      })

      window.LanternFlight.trackBlur(flyer, arriveTime)
      window.LanternFlight.trail(flyer, arriveTime * .7)

      setTimeout(() => {
        flyer.remove()
        lantern.style.visibility = ''
        hero.querySelectorAll('.hero-desk > .container, .desk').forEach(element => { element.style.filter = '' })
      }, arriveTime)
    }))
  }
})()


/* =========================
   Navbar and Clouds on Scroll
   ========================= */

/* The hero stays pinned while its desk tilts and grows. --hero-scroll is how far through that pinned scroll you are (0 to 1). The navbar gets its frosted bar as soon as the page scrolls. */
;(function setupHeroScroll() {
  const track = document.querySelector('.hero-track')
  const hero = document.getElementById('home')
  let frame = 0

  if (!track || !hero) return

  function update() {
    frame = 0

    const pinned = track.offsetHeight - hero.offsetHeight
    const progress = pinned > 0 ? Math.min(Math.max(window.scrollY / pinned, 0), 1) : 0

    hero.style.setProperty('--hero-scroll', progress.toFixed(3))
  }

  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update)
  }, { passive: true })
  window.addEventListener('resize', update)

  update()
})()


/* =========================
   Desk Scroll Steps
   ========================= */

/* The hero scrolls in steps, so it is always clear where to stop. One scroll tips the desk up and brings it into focus. The next scroll moves on to the cabinet. Scrolling back up reverses each step. */
;(function setupDeskSteps() {
  const track = document.querySelector('.hero-track')
  const hero = document.getElementById('home')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const moveTime = 800
  const stepKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
  let locked = false
  let settling = false
  let userScrolling = false
  let userTimer = 0
  let lastWheel = 0
  let lastY = window.scrollY

  if (!track || !hero) return

  function markUserScroll() {
    userScrolling = true
    clearTimeout(userTimer)
    userTimer = setTimeout(() => { userScrolling = false }, 200)
  }

  /* While a step is moving, and while trackpad momentum from the last flick is dying out, scrolling is ignored. */
  function handleInput(event) {
    const gap = event.timeStamp - lastWheel

    if (event.type === 'wheel') lastWheel = event.timeStamp

    if (locked || (settling && event.type === 'wheel' && gap < 120)) {
      event.preventDefault()
      return
    }

    settling = false
    markUserScroll()
  }

  function moveTo(top) {
    window.scrollTo({ top, behavior: 'smooth' })
    locked = true
    setTimeout(() => {
      locked = false
      settling = true
    }, moveTime)
  }

  window.addEventListener('wheel', handleInput, { passive: false })
  window.addEventListener('touchmove', handleInput, { passive: false })
  window.addEventListener('keydown', event => {
    if (!stepKeys.includes(event.key) || event.target.closest('input, textarea, select, button')) return
    handleInput(event)
  })

  window.addEventListener('scroll', () => {
    const y = window.scrollY
    const stop = track.offsetHeight - hero.offsetHeight
    const next = track.offsetHeight

    /* Only the user's own scrolling steps, not links or badge clicks that scroll the page. */
    if (!reducedMotion.matches && userScrolling && !locked && stop > 0 && y !== lastY) {
      const down = y > lastY

      if (y > 2 && y < stop - 2) moveTo(down ? stop : 0)
      else if (y > stop + 2 && y < next - 2) moveTo(down ? next : stop)
    }

    lastY = y
  }, { passive: true })
})()
