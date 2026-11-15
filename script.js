/* =========================
   Theme Toggle
   ========================= */

const themeButton = document.getElementById('themeToggle')
const savedTheme = localStorage.getItem('portfolio-theme') ||
  (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')

document.documentElement.dataset.theme = savedTheme

/* Keep the animated checkbox in sync with the saved portfolio theme. */
if (themeButton) {
  themeButton.checked = savedTheme === 'dark'
  themeButton.setAttribute(
    'aria-label',
    savedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  )

  themeButton.addEventListener('change', () => {
    const theme = themeButton.checked ? 'dark' : 'light'

    document.documentElement.dataset.theme = theme
    localStorage.setItem('portfolio-theme', theme)
    themeButton.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    )
  })
}


/* =========================
   Navigation Highlight
   ========================= */

;(function setupNavigationHighlight() {
  const navigation = document.querySelector('.nav-links')
  const links = navigation?.querySelectorAll('a')
  const projectsSection = document.getElementById('projects')
  const header = document.querySelector('.site-header')
  let activeLink = navigation?.querySelector('a.active')
  let trackMainPageSections = ['#contact', '#projects'].includes(window.location.hash)

  if (!navigation || !links?.length) return

  /* Move the underline below the chosen link. */
  function moveHighlight(link) {
    navigation.style.setProperty('--nav-highlight-left', `${link.offsetLeft}px`)
    navigation.style.setProperty('--nav-highlight-width', `${link.offsetWidth}px`)
    navigation.style.setProperty('--nav-highlight-opacity', '1')
  }

  /* Find a navigation link for the current page and hash. */
  function findHashLink(hash) {
    return [...links].find(link => {
      const destination = new URL(link.href, window.location.href)
      const current = new URL(window.location.href)

      return (
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash === hash
      )
    })
  }

  /* Update which navigation item is currently selected. */
  function setActiveLink(link) {
    if (!link) return

    links.forEach(item => {
      item.classList.toggle('active', item === link)
    })

    activeLink = link
    moveHighlight(link)
  }

  /* Keep Contact and Projects in sync as the main page scrolls. */
  function syncMainPageSection() {
    if (!trackMainPageSections || !projectsSection) return

    const projectsLink = findHashLink('#projects')
    const contactLink = findHashLink('#contact')

    if (!projectsLink || !contactLink) return

    const headerBottom = header?.getBoundingClientRect().bottom ?? 0
    const projectsReached =
      projectsSection.getBoundingClientRect().top <= headerBottom + 48

    setActiveLink(projectsReached ? projectsLink : contactLink)
  }

  /* Return the underline to the current section or page. */
  function restoreHighlight() {
    if (trackMainPageSections) {
      syncMainPageSection()
      return
    }

    if (activeLink) {
      moveHighlight(activeLink)
      return
    }

    navigation.style.setProperty('--nav-highlight-opacity', '0')
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveHighlight(link))
    link.addEventListener('focus', () => moveHighlight(link))
  })

  navigation.addEventListener('mouseleave', restoreHighlight)
  navigation.addEventListener('focusout', event => {
    if (!navigation.contains(event.relatedTarget)) {
      restoreHighlight()
    }
  })

  window.addEventListener('hashchange', () => {
    trackMainPageSections = ['#contact', '#projects'].includes(window.location.hash)
    restoreHighlight()
  })

  window.addEventListener('scroll', syncMainPageSection, { passive: true })
  window.addEventListener('resize', restoreHighlight)
  window.addEventListener('load', restoreHighlight)

  requestAnimationFrame(restoreHighlight)
})()


/* =========================
   Iris Transition
   ========================= */

;(function setupIrisTransition() {
  const transitionLinks = document.querySelectorAll(
    'a[href="about.html"], a[href^="index.html"], a.featured-display-link',
  )
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const irisTransitionCloseDuration = 340
  const irisTransitionOpenDuration = 650

  /* Arrival: open the iris transition once the new page is ready. */
  if (document.documentElement.dataset.irisTransition === 'closed') {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.dataset.irisTransition = 'open'
    }))
    setTimeout(() => {
      document.documentElement.removeAttribute('data-iris-transition')
    }, irisTransitionOpenDuration + 160)
  }

  /* Close the iris, then go to the destination page. */
  function navigateWithIrisTransition(destinationHref) {
    const destination = new URL(destinationHref, window.location.href)

    if (reducedMotion) {
      window.location.href = destination.href
      return
    }

    try {
      sessionStorage.setItem('portfolio-iris-transition', 'ready')
    } catch {}

    document.documentElement.dataset.irisTransition = 'close'
    setTimeout(() => {
      window.location.href = destination.href
    }, irisTransitionCloseDuration)
  }

  transitionLinks.forEach(link => {
    link.addEventListener('click', event => {
      const destination = new URL(link.href, window.location.href)
      const current = new URL(window.location.href)
      const sameDocument =
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search

      if (
        sameDocument ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        (link.target && link.target !== '_self')
      ) {
        return
      }

      event.preventDefault()
      navigateWithIrisTransition(destination.href)
    })
  })
})()


/* =========================
   Book Zoom Arrival
   ========================= */

;(function setupBookZoomArrival() {
  const root = document.documentElement
  if (root.dataset.bookTransition !== 'ready') return

  try {
    sessionStorage.removeItem('portfolio-book-transition')
  } catch {}

  /* Reveal Content */
  setTimeout(() => {
    root.dataset.bookTransition = 'revealing'
    setTimeout(() => root.removeAttribute('data-book-transition'), 400)
  }, 80)
})()

/* Clear the transition if the browser restores a cached page. */
window.addEventListener('pageshow', event => {
  if (!event.persisted) return

  document.documentElement.removeAttribute('data-iris-transition')
})


/* =========================
   Magic Contact Circle
   ========================= */

;(function setupMagicContactCircle() {
  const stage = document.querySelector('.magic-circle-stage')
  const links = document.querySelectorAll('[data-magic-node]')

  if (!stage || !links.length) return

  let activeNode = null

  function activate(link) {
    const node = link.dataset.magicNode
    if (!node) return

    if (activeNode) stage.classList.remove(`is-${activeNode}`)
    activeNode = node
    stage.classList.add('is-resonating', `is-${node}`)
  }

  function deactivate() {
    stage.classList.remove('is-resonating')

    if (activeNode) {
      stage.classList.remove(`is-${activeNode}`)
      activeNode = null
    }
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => activate(link))
    link.addEventListener('mouseleave', deactivate)
    link.addEventListener('focus', () => activate(link))
    link.addEventListener('blur', deactivate)
  })
})()


/* =========================
   Spirit Lights
   ========================= */

;(function spawnSpiritLights() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const colours = ['var(--spirit-a)', 'var(--spirit-b)', 'var(--spirit-c)']
  const layouts = {
    home: [[9, 22],[49, 20],[46, 69],[91, 62]],
    projects: [[9, 24],[28, 68],[75, 25],[91, 70]],
    bookshelf: [[8, 24],[25, 19],[53, 23],[84, 21],[94, 38],[7, 48],[92, 58],[13, 73],[38, 84],[67, 79],[89, 86]],
    about: [[12, 22],[88, 18],[18, 76],[82, 72]],
    background: [[7, 8],[93, 14],[9, 32],[91, 40],[6, 58],[94, 64],[11, 84],[89, 90]],
    projectDetail: [[7, 12],[93, 17],[9, 39],[91, 47],[5, 67],[95, 76],[22, 91],[79, 92]],
  }

  /* Pause a layer's CSS animations only while it is genuinely off-screen (200px margin so lights are already moving as they scroll in). Paused animations resume where they stopped. */
  const visibility = !reducedMotion && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting)
        })
      }, { rootMargin: '200px 0px' })
    : null

  Object.entries(layouts).forEach(([id, anchors]) => {
    const section = document.getElementById(id)
    if (!section) return

    const layer = document.createElement('div')
    layer.className = 'spirit-layer'
    layer.setAttribute('aria-hidden', 'true')
    section.prepend(layer)
    visibility?.observe(section)

    anchors.forEach(([x, y], index) => {
      const light = document.createElement('span')
      const drift = () => (Math.random() * 18 - 9).toFixed(0)

      light.className = `spirit-light${reducedMotion ? ' still' : ''}`
      light.style.left = `${x + Math.random() * 4 - 2}%`
      light.style.top = `${y + Math.random() * 4 - 2}%`
      light.style.setProperty('--spirit-colour', colours[index % colours.length])
      light.style.setProperty('--spirit-size', `${(3.5 + Math.random() * 2).toFixed(1)}px`)
      light.style.setProperty('--spirit-delay', `${(-Math.random() * 6).toFixed(1)}s`)
      light.style.setProperty('--spirit-glow-duration', `${(3.8 + Math.random() * 2.6).toFixed(1)}s`)
      light.style.setProperty('--spirit-drift-duration', `${(9 + Math.random() * 7).toFixed(1)}s`)
      light.style.setProperty('--spirit-x1', `${drift()}px`)
      light.style.setProperty('--spirit-y1', `${drift()}px`)
      light.style.setProperty('--spirit-x2', `${drift()}px`)
      light.style.setProperty('--spirit-y2', `${drift()}px`)
      light.style.setProperty('--spirit-x3', `${drift()}px`)
      light.style.setProperty('--spirit-y3', `${drift()}px`)
      layer.appendChild(light)
    })
  })
})()


/* =========================
   Project Preview
   ========================= */

const projectContainer = document.getElementById('projectSlider')
const overlay = document.getElementById('projectOverlay')
const popup = document.getElementById('projectPopup')
const reducedProjectMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const bookPulloutDuration = 580
const bookTurnDuration = 760
const bookTurnEasing = 'cubic-bezier(.45, .05, .25, 1)'
const bookOpenDuration = 440
const bookZoomDuration = 760
const bookEasing = 'cubic-bezier(.22, 1, .36, 1)'
let popupOpen = false
let bookOperation = 0
let pulloutBook
let pulloutSpine
let pulloutDuration = bookPulloutDuration
let pulloutEasing = bookEasing
let pulloutAnimation
let flipAnimation
let zoomAnimations = []
let pulloutFrames
let landingTransform
let lastFocusedCard

/* Book Camera */
const bookCamera = document.createElement('div')
if (overlay && popup) {
  bookCamera.className = 'project-book-camera'
  overlay.append(bookCamera)
  bookCamera.append(popup)
}

/* Zoom Surface */
const zoomSurface = document.createElement('div')
if (overlay) {
  zoomSurface.className = 'project-zoom-surface'
  zoomSurface.setAttribute('aria-hidden', 'true')
  overlay.append(zoomSurface)
}

/* Render project books only when the project manager and container are available. */
window.ProjectManager?.render(projectContainer)

/* Set Book Preview */
function setBookPreview(card) {
  overlay.dataset.projectId = card.dataset.id || ''
  const project = window.portfolioProjects?.find(item => item.id === card.dataset.id)
  overlay.querySelectorAll('.project-page-skeleton--shared').forEach(preview => {
    window.ProjectSkeleton?.setProject(preview, project)
  })
}

/* Pullout Start */
/* Spine Pullout Size */
const coverSizes = { slim: [116, 198], regular: [148, 214], wide: [194, 228] }
function getPulloutBounds(card) {
  const bounds = card.getBoundingClientRect()
  if (!card.classList.contains('is-spine')) return bounds
  const [width, height] = coverSizes[card.dataset.bookSize] || coverSizes.regular
  const left = bounds.left + bounds.width / 2 - width / 2
  const top = bounds.bottom - height
  return { left, top, width, height, right: left + width, bottom: bounds.bottom }
}

/* Create Book Pullout */
function createBookPullout(card) {
  const bounds = getPulloutBounds(card)
  const copy = document.createElement('div')
  const front = card.cloneNode(true)
  const inside = document.createElement('div')
  const watermark = document.createElement('span')
  const styles = getComputedStyle(card)

  copy.className = 'book-pullout'
  copy.setAttribute('aria-hidden', 'true')
  copy.style.left = `${bounds.left}px`
  copy.style.top = `${bounds.top}px`
  copy.style.width = `${bounds.width}px`
  copy.style.height = `${bounds.height}px`
  copy.style.setProperty('--book-cover', styles.getPropertyValue('--book-cover'))
  copy.style.setProperty('--book-ink', styles.getPropertyValue('--book-ink'))

  /* Cover Faces */
  front.classList.remove('is-spine')
  front.classList.add('book-pullout__front')
  front.removeAttribute('href')
  front.tabIndex = -1
  front.style.boxShadow = styles.boxShadow
  front.style.filter = styles.filter
  inside.className = 'book-pullout__inside'
  watermark.className = 'popup-cover-watermark'
  inside.append(watermark)
  copy.append(front, inside)
  bookCamera.append(copy)
  card.classList.add('is-pulled-out')

  /* Spine Box */
  pulloutSpine = null
  if (card.classList.contains('is-spine')) {
    const spine = card.getBoundingClientRect()
    const startScale = spine.width / bounds.height
    const thickness = spine.height / startScale
    const face = (className, css) => {
      const side = document.createElement('div')
      side.className = `book-pullout__side ${className}`
      Object.assign(side.style, css)
      copy.append(side)
      return side
    }

    /* Spine Face */
    const spineFace = face('book-pullout__spine', {
      left: `${-thickness}px`,
      width: `${thickness}px`,
      height: `${bounds.height}px`,
      transformOrigin: '100% 50%',
      transform: 'rotateY(-90deg)',
    })
    const spineCard = card.cloneNode(true)
    spineCard.classList.remove('is-pulled-out')
    spineCard.querySelector('.spine-peek')?.remove()
    spineCard.removeAttribute('href')
    spineCard.tabIndex = -1
    Object.assign(spineCard.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: `${spine.width}px`,
      minWidth: '0',
      maxWidth: 'none',
      height: `${spine.height}px`,
      margin: '0',
      transition: 'none',
      transform: `translateX(${thickness}px) rotate(90deg) scale(${1 / startScale})`,
      transformOrigin: '0 0',
    })
    spineFace.append(spineCard)
    face('book-pullout__edge', { top: `${-thickness}px`, width: `${bounds.width}px`, height: `${thickness}px`, transformOrigin: '50% 100%', transform: 'rotateX(90deg)' })
    face('book-pullout__edge', { top: `${bounds.height}px`, width: `${bounds.width}px`, height: `${thickness}px`, transformOrigin: '50% 0', transform: 'rotateX(-90deg)' })
    face('book-pullout__pages', { left: `${bounds.width}px`, width: `${thickness}px`, height: `${bounds.height}px`, transformOrigin: '0 50%', transform: 'rotateY(90deg)' })
    pulloutSpine = { x: spine.left + spine.width / 2, y: spine.top + spine.height / 2, startScale, thickness }
  }
  return { copy, bounds }
}

/* Pull Out Book */
function pullOutBook(bounds) {
  const maxWidth = window.innerWidth - 56
  const maxHeight = window.innerHeight - 120
  const scale = Math.max(1, Math.min(
    1.85,
    390 / bounds.height,
    maxWidth / bounds.width,
    maxHeight / bounds.height,
  ))

  const width = bounds.width * scale
  const height = bounds.height * scale
  const endX = (window.innerWidth - width) / 2
  const endY = (window.innerHeight - height) / 2
  const moveX = endX - bounds.left
  const moveY = endY - bounds.top

  /* Pullout Keyframe */
  const turnAway = Boolean(pulloutSpine)
  const startScale = turnAway ? pulloutSpine.startScale : 1
  const pivotY = bounds.height / 2
  const thickness = turnAway ? pulloutSpine.thickness : 0
  const startX = turnAway ? pulloutSpine.x - bounds.left : 0
  const startY = turnAway ? pulloutSpine.y - bounds.top - startScale * pivotY : 0
  function frame(progress, rise, position = progress, pull = 1, turn = 0, roll = turn) {
    if (!turnAway) {
      const currentScale = 1 + (scale - 1) * progress
      return { offset: progress, transform: `translate3d(${moveX * progress}px, ${moveY * progress - rise}px, 0) scale(${currentScale})` }
    }
    const x = startX + (moveX - startX) * position
    const y = startY + (moveY - startY) * position - rise
    const currentScale = (startScale + (scale - startScale) * position) * pull
    const lift = (thickness / 2) * (turn / 90)

    /* Spine Pivot */
    return {
      offset: progress,
      transform: `translate3d(${x}px, ${y}px, 0) scale(${currentScale}) translate3d(0, ${pivotY}px, ${lift - thickness / 2}px) perspective(1400px) rotateZ(${roll}deg) rotateY(${turn}deg) translate3d(0, ${-pivotY}px, ${thickness / 2}px)`,
    }
  }

  pulloutFrames = turnAway
    ? [
      frame(0, 0, 0, 1, 90, -90),
      frame(.2, 0, .03, 1.1, 90, -90),
      frame(.7, 16, .7, 1.02, 20, -20),
      frame(1, 0, 1, 1, 0),
    ]
    : [
      frame(0, 0),
      frame(.3, 26),
      frame(.75, 12),
      frame(1, 0),
    ]
  pulloutDuration = turnAway ? bookTurnDuration : bookPulloutDuration
  pulloutEasing = turnAway ? bookTurnEasing : bookEasing
  landingTransform = `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale})`

  popup.style.setProperty('--popup-start-width', `${width}px`)
  popup.style.setProperty('--popup-start-height', `${height}px`)

  return pulloutBook.animate(pulloutFrames, {
    duration: pulloutDuration,
    easing: pulloutEasing,
    fill: 'both',
  })
}

/* Zoom Into Page */
function zoomIntoPage() {
  const page = popup.getBoundingClientRect()
  const scale = window.innerWidth / page.width
  const camera = bookCamera.animate([
    { transform: 'translate3d(0, 0, 0) scale(1)' },
    { transform: `translate3d(${-page.left * scale}px, ${-page.top * scale}px, 0) scale(${scale})` },
  ], {
    duration: bookZoomDuration,
    easing: 'cubic-bezier(.65, 0, .25, 1)',
    fill: 'both',
  })

  /* Zoom Surface Fade */
  const surface = zoomSurface.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: bookZoomDuration * .25,
    delay: bookZoomDuration * .75,
    fill: 'both',
  })
  return [camera, surface]
}

/* Reset Book */
function resetProjectBook() {
  pulloutAnimation?.cancel()
  flipAnimation?.cancel()
  zoomAnimations.forEach(animation => animation.cancel())
  zoomAnimations = []
  pulloutAnimation = null
  flipAnimation = null
  pulloutFrames = null
  landingTransform = null
  pulloutBook?.remove()
  pulloutBook = null
  lastFocusedCard?.classList.remove('is-pulled-out')
  overlay?.classList.remove('zooming', 'flipped', 'arrived', 'open')
  overlay?.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('popup-open')
  popupOpen = false
}

/* Open Project */
async function openProject(card) {
  if (!overlay || !popup || popupOpen) return

  const destination = card.href || card.dataset.page
  if (!destination) return

  if (reducedProjectMotion) {
    window.location.href = destination
    return
  }

  popupOpen = true
  const operation = ++bookOperation
  lastFocusedCard = card
  setBookPreview(card)

  const { copy, bounds } = createBookPullout(card)
  pulloutBook = copy

  overlay.classList.add('open')
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')

  pulloutAnimation = pullOutBook(bounds)

  /* Size Preview */
  window.ProjectSkeleton?.sizeBookPreview(popup.querySelector('.project-page-skeleton--shared'))
  try { await pulloutAnimation.finished } catch { return }
  if (bookOperation !== operation) return

  /* Landed */
  copy.style.transform = landingTransform
  pulloutAnimation.cancel()
  pulloutAnimation = null
  overlay.classList.add('arrived')

  /* Open Cover */
  flipAnimation = copy.animate([
    { transform: landingTransform },
    { transform: `${landingTransform} rotateY(-165deg)` },
  ], {
    duration: bookOpenDuration,
    easing: bookEasing,
    fill: 'both',
  })
  try { await flipAnimation.finished } catch { return }
  if (bookOperation !== operation) return

  overlay.classList.add('flipped', 'zooming')
  zoomAnimations = zoomIntoPage()
  try { await zoomAnimations[0].finished } catch { return }
  if (bookOperation !== operation) return

  /* Navigate */
  try { sessionStorage.setItem('portfolio-book-transition', 'ready') } catch {}
  window.location.href = destination
}

/* Close Project */
async function closeProject() {
  if (!overlay || !popupOpen) return

  popupOpen = false
  const operation = ++bookOperation

  if (zoomAnimations.length) {
    zoomAnimations.forEach(animation => animation.reverse())
    try { await zoomAnimations[0].finished } catch {}
    if (bookOperation !== operation) return
    zoomAnimations.forEach(animation => animation.cancel())
    zoomAnimations = []
    overlay.classList.remove('zooming')
  }

  if (flipAnimation) {
    flipAnimation.reverse()
    try { await flipAnimation.finished } catch {}
    if (bookOperation !== operation) return
    flipAnimation.cancel()
    flipAnimation = null
    pulloutBook.style.transform = landingTransform
    overlay.classList.remove('flipped', 'arrived')
  }

  /* Reverse Pullout */
  if (pulloutAnimation) {
    pulloutAnimation.reverse()
  } else if (pulloutFrames) {
    pulloutAnimation = pulloutBook.animate(pulloutFrames, {
      duration: pulloutDuration,
      direction: 'reverse',
      easing: pulloutEasing,
      fill: 'both',
    })
  }

  if (pulloutAnimation) {
    try { await pulloutAnimation.finished } catch {}
  }
  if (bookOperation !== operation) return

  resetProjectBook()
  lastFocusedCard?.focus({ preventScroll: true })
}

/* Outside Click */
bookCamera?.addEventListener('click', event => {
  if (event.target === bookCamera) closeProject()
})

/* Mouse/touch interaction for project books. */
projectContainer?.addEventListener('click', event => {
  const card = event.target.closest('.project-card')
  if (!card) return

  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) return

  event.preventDefault()
  openProject(card)
})

/* Space keeps the shelf books usable like the previous button interaction. */
projectContainer?.addEventListener('keydown', event => {
  if (event.key !== ' ') return
  const card = event.target.closest('.project-card')
  if (!card) return
  event.preventDefault()
  openProject(card)
})

/* Close from the backdrop, close button, or Escape key. */
overlay?.addEventListener('click', event => { if (event.target === overlay) closeProject() })
popup?.addEventListener('click', event => event.stopPropagation())
document.addEventListener('keydown', event => { if (event.key === 'Escape' && popupOpen) closeProject() })

/* Back Navigation Reset */
window.addEventListener('pageshow', event => {
  if (!event.persisted || !overlay) return
  ++bookOperation
  resetProjectBook()
})


/* =========================
   Footer Year
   ========================= */

const currentYear = document.getElementById('currentYear')

if (currentYear) {
  currentYear.textContent = new Date().getFullYear()
}


/* =========================
   Footer Back To Top
   ========================= */

/* Scroll without changing the URL hash, which the project page uses as its project ID. */
document.querySelectorAll('.footer-back-link').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault()
    window.scrollTo({ top: 0 })
  })
})


/* =========================
   Copy Email Button
   ========================= */

;(function setupEmailCopy() {
  const button = document.querySelector('[data-copy-email]')
  if (!button) return
  const email = button.dataset.copyEmail
  let resetTimer

  /* Copy text with a legacy textarea fallback for browsers without Clipboard API. */
  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value)
    const helper = document.createElement('textarea')
    Object.assign(helper.style, { position: 'fixed', opacity: '0', pointerEvents: 'none' })
    helper.value = value
    helper.readOnly = true
    document.body.appendChild(helper)
    helper.select()
    const copied = document.execCommand('copy')
    helper.remove()
    if (!copied) throw new Error('Copy failed')
  }

  button.addEventListener('click', async () => {
    if (!email) return
    try {
      await copyText(email)
      clearTimeout(resetTimer)
      button.classList.add('is-copied')
      button.setAttribute('aria-label', 'Email copied')
      button.title = 'Copied'
      resetTimer = setTimeout(() => {
        button.classList.remove('is-copied')
        button.setAttribute('aria-label', 'Copy email address')
        button.title = 'Copy email address'
      }, 1600)
    } catch {
      button.setAttribute('aria-label', 'Unable to copy email address')
      button.title = 'Unable to copy'
    }
  })
})()


/* =========================
   Section Entrances
   ========================= */

/* Animate each section once as it enters the viewport. */
;(function setupApothecaryEntrances() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (preference.matches || !('IntersectionObserver' in window)) return

  /* Stagger elements that enter together so they arrive one after another. */
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
      entry.target.style.setProperty('--arrive-delay', `${index * 110}ms`)
      entry.target.classList.replace('apothecary-pending', 'apothecary-arrive')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })

  const sections = document.querySelectorAll(
    '.hero-copy, .hero-note-wrap, .featured-work-heading, .featured-list, .bookshelf-sign, .shelf-row, .about-page-grid > h1, .about-intro, .listening-note, .project-collection, .project-detail-intro, .project-record, .project-detail-section, .project-bottom-navigation, .about-background-row',
  )

  sections.forEach(element => {
    if (element.closest('.about-page') && !preference.matches) return

    /* Hide elements up front so they never flash in before their fade starts. */
    element.classList.add('apothecary-pending')

    /* After the iris, so the page is not animating twice at once. */
    if (document.documentElement.dataset.irisTransition) setTimeout(() => observer.observe(element), 500)
    else observer.observe(element)
    element.addEventListener('animationend', event => {
      if (event.animationName !== 'apothecary-arrive') return
      element.classList.remove('apothecary-arrive')
      element.style.removeProperty('--arrive-delay')
    })
  })

  preference.addEventListener('change', event => {
    if (!event.matches) return
    observer.disconnect()
    document.querySelectorAll('.apothecary-arrive, .apothecary-pending').forEach(element => element.classList.remove('apothecary-arrive', 'apothecary-pending'))
  })
})()


/* =========================
   Hero Tagline Rotation
   ========================= */

/* Cycle the phrase after "Building"; a click moves to the next one straight away. */
;(function setupTaglineRotation() {
  const phrase = document.querySelector('.hero-tagline__phrase')
  if (!phrase) return

  const words = phrase.dataset.words.split('|')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

  /* The timings live in home.css (--phrase-time and --phrase-hold) so they are changed in one place. */
  const style = getComputedStyle(phrase)
  const slideTime = parseFloat(style.getPropertyValue('--phrase-time')) || 420
  const readTime = parseFloat(style.getPropertyValue('--phrase-hold')) || 3200
  let index = 0
  let timer
  let paused = false
  let busy = false

  const current = () => phrase.querySelector('.is-current')

  /* Size the button to the phrase on screen, including after the web fonts load. */
  function fitWidth() {
    phrase.style.width = `${current().offsetWidth}px`
  }

  function show(next) {
    const old = current()
    phrase.setAttribute('aria-label', `${words[next].replace(/\.$/, '')}, press for the next phrase`)

    if (motion.matches) {
      old.textContent = words[next]
      fitWidth()
      return
    }

    busy = true
    const incoming = document.createElement('span')
    incoming.className = 'hero-tagline__word is-incoming'
    incoming.textContent = words[next]
    phrase.append(incoming)
    phrase.style.width = `${incoming.offsetWidth}px`
    incoming.getBoundingClientRect()
    incoming.classList.replace('is-incoming', 'is-current')
    old.classList.replace('is-current', 'is-leaving')
    setTimeout(() => {
      old.remove()
      busy = false
    }, slideTime + 20)
  }

  function advance() {
    if (busy) return
    index = (index + 1) % words.length
    show(index)
  }

  /* Wait a few seconds so the full line is read first, then keep going unless paused. */
  function schedule(delay = readTime) {
    clearTimeout(timer)
    if (motion.matches) return
    timer = setTimeout(() => {
      if (!paused && !document.hidden) advance()
      schedule()
    }, delay)
  }

  phrase.addEventListener('click', () => {
    advance()
    schedule()
  })
  ;['pointerenter', 'focusin'].forEach(name => phrase.addEventListener(name, () => { paused = true }))
  ;['pointerleave', 'focusout'].forEach(name => phrase.addEventListener(name, () => { paused = false }))

  window.addEventListener('resize', fitWidth)
  motion.addEventListener('change', () => schedule())
  fitWidth()
  if (document.fonts) document.fonts.ready.then(fitWidth)
  schedule(readTime + 600)
})()


/* =========================
   Shimmer Text
   ========================= */

/* Split each [data-shimmer] element into letters that light up from left to right. */
;(function setupShimmerText() {
  document.querySelectorAll('[data-shimmer]').forEach(element => {
    const text = element.textContent.trim().replace(/\s+/g, ' ')
    const duration = Math.max(0.2, Number(element.dataset.duration) || 1)
    const letterCount = text.replace(/ /g, '').length
    let index = 0

    element.classList.add('shimmer-text')
    element.dataset.wave = String(element.dataset.wave === 'true')
    element.setAttribute('aria-label', text)
    element.style.setProperty('--loop', `${duration * 2 + 0.6}s`)
    element.style.setProperty('--stagger', `${duration / Math.max(letterCount, 1)}s`)

    /* Words stay together so the text still wraps between words. */
    const parts = text.split(' ').flatMap((word, wordIndex) => {
      const wordSpan = document.createElement('span')
      wordSpan.className = 'shimmer-word'
      wordSpan.setAttribute('aria-hidden', 'true')
      Array.from(word).forEach(character => {
        const letter = document.createElement('span')
        letter.className = 'shimmer-letter'
        letter.textContent = character
        letter.style.setProperty('--i', index++)
        wordSpan.append(letter)
      })
      return wordIndex === 0 ? [wordSpan] : [' ', wordSpan]
    })
    element.replaceChildren(...parts)
  })
})()
