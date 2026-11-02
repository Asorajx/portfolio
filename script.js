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
   Page Transition
   ========================= */

;(function setupPageTransition() {
  const transition = document.querySelector('.page-transition')
  const transitionLinks = document.querySelectorAll(
    'a[href="about.html"], a[href^="index.html"], a.featured-display-link',
  )
  const softDisplacement = document.querySelector(
    '#pageTransitionWaterSoft feDisplacementMap',
  )
  const strongDisplacement = document.querySelector(
    '#pageTransitionWaterStrong feDisplacementMap',
  )
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const arrivingFromTransition =
    document.documentElement.dataset.pageTransition === 'ready'
  const coverDuration = 380
  const revealDuration = 300

  if (!transition) {
    window.navigateWithPageTransition = destination => {
      window.location.href = destination
    }
    return
  }

  /* Update the strength of the liquid distortion. */
  function setDisplacement(displacement, value) {
    if (!displacement) return
    displacement.setAttribute('scale', value.toFixed(2))
  }

  /* Animate the liquid distortion through each strength. */
  function animateDisplacement(displacement, values, duration) {
    if (!displacement) return Promise.resolve()

    return new Promise(resolve => {
      let startTime = null
      const segmentCount = values.length - 1

      setDisplacement(displacement, values[0])

      function update(timestamp) {
        if (startTime === null) startTime = timestamp

        const progress = Math.min((timestamp - startTime) / duration, 1)
        const scaledProgress = progress * segmentCount
        const segment = Math.min(Math.floor(scaledProgress), segmentCount - 1)
        const segmentProgress = scaledProgress - segment

        /* Ease each change so the effect stays smooth. */
        const easedProgress = segmentProgress * segmentProgress * (3 - 2 * segmentProgress)
        const startValue = values[segment]
        const endValue = values[segment + 1]
        const value = startValue + (endValue - startValue) * easedProgress

        setDisplacement(displacement, value)

        if (progress < 1) {
          requestAnimationFrame(update)
          return
        }

        setDisplacement(displacement, values[values.length - 1])
        resolve()
      }

      requestAnimationFrame(update)
    })
  }

  function clearArrivalState() {

    /* Reset the liquid effect before clearing the transition. */
    setDisplacement(softDisplacement, 0)
    document.documentElement.removeAttribute('data-page-transition')
    document.documentElement.classList.remove('page-transition-active')
    transition.classList.remove('is-revealing')
  }

  if (arrivingFromTransition) {
    try {
      sessionStorage.removeItem('portfolio-page-transition')
    } catch {}

    if (reducedMotion) {
      clearArrivalState()
    } else {
      requestAnimationFrame(() => {
        transition.classList.add('is-revealing')

        /* Ease the liquid effect back to normal. */
        animateDisplacement(softDisplacement, [11, 5, 0], revealDuration)
          .then(clearArrivalState)
      })

      /* Clean up if the animation is interrupted. */
      setTimeout(clearArrivalState, revealDuration + 120)
    }
  }

  /* Reuse the same liquid transition for scripted project navigation. */
  function navigateWithPageTransition(destinationHref) {
    const destination = new URL(destinationHref, window.location.href)

    if (reducedMotion) {
      window.location.href = destination.href
      return
    }

    try {
      sessionStorage.setItem('portfolio-page-transition', 'ready')
    } catch {}

    document.documentElement.classList.add('page-transition-active')
    transition.classList.add('is-covering')

    /* Build the liquid effect quickly, then ease it toward the arrival strength. */
    animateDisplacement(strongDisplacement, [0, 18, 11], coverDuration)
      .then(() => {
        window.location.href = destination.href
      })
  }

  window.navigateWithPageTransition = navigateWithPageTransition

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
      navigateWithPageTransition(destination.href)
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

  const transition = document.querySelector('.page-transition')

  try {
    sessionStorage.removeItem('portfolio-page-transition')
  } catch {}

  document.documentElement.removeAttribute('data-page-transition')
  document.documentElement.classList.remove('page-transition-active')
  transition?.classList.remove('is-covering', 'is-revealing')
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
    projectDetail: [[7, 12],[93, 17],[9, 39],[91, 47],[5, 67],[95, 76],[22, 91],[79, 92]],
  }

  Object.entries(layouts).forEach(([id, anchors]) => {
    const section = document.getElementById(id)
    if (!section) return

    const layer = document.createElement('div')
    layer.className = 'spirit-layer'
    layer.setAttribute('aria-hidden', 'true')
    section.prepend(layer)

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
const bookLiftDuration = 580
const bookOpenDuration = 440
const bookZoomDuration = 760
const bookEasing = 'cubic-bezier(.22, 1, .36, 1)'
let popupOpen = false
let bookOperation = 0
let flightBook
let flightAnimation
let flipAnimation
let zoomAnimations = []
let flightFrames
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

/* Create Flying Book */
function createFlyingBook(card) {
  const bounds = card.getBoundingClientRect()
  const copy = document.createElement('div')
  const front = card.cloneNode(true)
  const inside = document.createElement('div')
  const watermark = document.createElement('span')
  const styles = getComputedStyle(card)

  copy.className = 'project-flying-book'
  copy.setAttribute('aria-hidden', 'true')
  copy.style.left = `${bounds.left}px`
  copy.style.top = `${bounds.top}px`
  copy.style.width = `${bounds.width}px`
  copy.style.height = `${bounds.height}px`
  copy.style.setProperty('--book-cover', styles.getPropertyValue('--book-cover'))
  copy.style.setProperty('--book-ink', styles.getPropertyValue('--book-ink'))

  /* Cover Faces */
  front.classList.add('project-flying-book__front')
  front.removeAttribute('href')
  front.tabIndex = -1
  front.style.boxShadow = styles.boxShadow
  front.style.filter = styles.filter
  inside.className = 'project-flying-book__inside'
  watermark.className = 'popup-cover-watermark'
  inside.append(watermark)
  copy.append(front, inside)
  bookCamera.append(copy)
  card.classList.add('is-lifted')
  return { copy, bounds }
}

/* Lift Book */
function liftBook(bounds) {
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

  /* Lift Keyframe */
  function frame(progress, rise) {
    const currentScale = 1 + (scale - 1) * progress
    return {
      offset: progress,
      transform: `translate3d(${moveX * progress}px, ${moveY * progress - rise}px, 0) scale(${currentScale})`,
    }
  }

  flightFrames = [
    frame(0, 0),
    frame(.3, 26),
    frame(.75, 12),
    frame(1, 0),
  ]
  landingTransform = flightFrames[flightFrames.length - 1].transform
  popup.style.setProperty('--popup-start-width', `${width}px`)
  popup.style.setProperty('--popup-start-height', `${height}px`)

  return flightBook.animate(flightFrames, {
    duration: bookLiftDuration,
    easing: bookEasing,
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
  flightAnimation?.cancel()
  flipAnimation?.cancel()
  zoomAnimations.forEach(animation => animation.cancel())
  zoomAnimations = []
  flightAnimation = null
  flipAnimation = null
  flightFrames = null
  landingTransform = null
  flightBook?.remove()
  flightBook = null
  lastFocusedCard?.classList.remove('is-lifted')
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

  const { copy, bounds } = createFlyingBook(card)
  flightBook = copy

  overlay.classList.add('open')
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')

  flightAnimation = liftBook(bounds)
  /* Size Preview */
  window.ProjectSkeleton?.sizeBookPreview(popup.querySelector('.project-page-skeleton--shared'))
  try { await flightAnimation.finished } catch { return }
  if (bookOperation !== operation) return

  /* Landed */
  copy.style.transform = landingTransform
  flightAnimation.cancel()
  flightAnimation = null
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
    flightBook.style.transform = landingTransform
    overlay.classList.remove('flipped', 'arrived')
  }

  /* Reverse Lift */
  if (flightAnimation) {
    flightAnimation.reverse()
  } else if (flightFrames) {
    flightAnimation = flightBook.animate(flightFrames, {
      duration: bookLiftDuration,
      direction: 'reverse',
      easing: bookEasing,
      fill: 'both',
    })
  }

  if (flightAnimation) {
    try { await flightAnimation.finished } catch {}
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
   Contact Form
   ========================= */

const contactModal = document.getElementById('contactModal')
const contactDialog = document.getElementById('contactDialog')
const contactClose = document.getElementById('contactClose')
const contactForm = document.getElementById('contactForm')
const contactOpeners = document.querySelectorAll('[data-open-contact]')
let contactFormOpen = false
let lastContactTrigger

/* Open the form and move keyboard focus into the dialog. */
function openContactForm(trigger) {
  if (!contactModal || contactFormOpen) return
  contactFormOpen = true
  lastContactTrigger = trigger
  contactModal.classList.add('open')
  contactModal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')
  document.getElementById('contactName')?.focus()
}

/* Close the form and return focus to the button that opened it. */
function closeContactForm() {
  if (!contactModal || !contactFormOpen) return
  contactFormOpen = false
  contactModal.classList.remove('open')
  contactModal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('popup-open')
  lastContactTrigger?.focus()
}

contactOpeners.forEach(button => {
  button.addEventListener('click', () => openContactForm(button))
})

/* Contact Nav: jump to the contact section, then open the form. */
document.querySelectorAll('[data-contact-nav]').forEach(link => {
  link.addEventListener('click', () => {
    if (contactModal) {
      setTimeout(() => openContactForm(link), 450)
      return
    }
    try { sessionStorage.setItem('portfolio-open-contact', 'ready') } catch {}
  })
})

try {
  if (contactModal && sessionStorage.getItem('portfolio-open-contact')) {
    sessionStorage.removeItem('portfolio-open-contact')
    setTimeout(() => openContactForm(document.querySelector('[data-contact-nav]')), 700)
  }
} catch {}

contactClose?.addEventListener('click', closeContactForm)

contactModal?.addEventListener('click', event => {
  if (event.target === contactModal) closeContactForm()
})

contactDialog?.addEventListener('click', event => event.stopPropagation())

/* Keep Tab focus inside the open contact dialog. */
contactDialog?.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return

  const focusable = [
    ...contactDialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]',
    ),
  ]

  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
})


/* Submit the contact form without leaving the portfolio. */
contactForm?.addEventListener('submit', async event => {
  event.preventDefault()

  const submitButton = contactForm.querySelector('.contact-submit')
  const formNote = document.getElementById('contactFormNote')

  if (submitButton.disabled) return

  /* Prepare the form and prevent duplicate submissions. */
  const formData = new FormData(contactForm)
  const originalButtonText = 'Send message'

  submitButton.disabled = true
  submitButton.textContent = 'Sending...'
  formNote.textContent = 'Sending your message...'

  try {
    /* Send the message to Formspree in the background. */
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Form submission failed')
    }

    /* Clear the fields only after Formspree confirms success. */
    contactForm.reset()
    formNote.textContent = 'Message sent successfully! Thank you for reaching out.'
    submitButton.textContent = 'Message sent!'
  } catch (error) {
    /* Preserve the form inputs so visitors can try again. */
    formNote.textContent = 'Unable to send your message. Please try again.'
    submitButton.textContent = originalButtonText
  } finally {
    submitButton.disabled = false
  }
})



/* =========================
   Footer Year
   ========================= */

const currentYear = document.getElementById('currentYear')

if (currentYear) {
  currentYear.textContent = new Date().getFullYear()
}


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
    '.hero-copy, .hero-note-wrap, .featured-work-heading, .featured-list, .bookshelf-sign, .shelf-row, .about-page-grid > h1, .about-intro, .listening-note, .project-collection, .project-detail-intro, .project-record, .project-detail-section, .project-bottom-navigation',
  )

  sections.forEach(element => {
    if (element.closest('.about-page') && !preference.matches) return
    /* Hide elements up front so they never flash in before their fade starts. */
    element.classList.add('apothecary-pending')
    observer.observe(element)
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
