/* =========================
   Theme Toggle
   ========================= */

const themeButton = document.getElementById('themeToggle')
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark'

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
    'a[href="about.html"], a[href^="index.html"]',
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

  if (!transition) return

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

      if (reducedMotion) return

      event.preventDefault()

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
    })
  })
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
    projects: [[8, 24],[25, 19],[53, 23],[84, 21],[94, 38],[7, 48],[92, 58],[13, 73],[38, 84],[67, 79],[89, 86]],
    about: [[12, 22],[88, 18],[18, 76],[82, 72]],
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
   Project Popup
   ========================= */

const projectContainer = document.getElementById('projectSlider')
const overlay = document.getElementById('projectOverlay')
const popup = document.getElementById('projectPopup')
const popupClose = document.getElementById('popupClose')
const popupBindings = {
  popupNumber: 'number',
  popupType: 'type',
  popupFrontTitle: 'title',
  popupSummary: 'summary',
  popupTitle: 'title',
  popupDate: 'date',
  popupDescription: 'description',
}
const reducedProjectMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const bookGrowDelay = reducedProjectMotion ? 0 : 60
const bookGrowDuration = reducedProjectMotion ? 0 : 220
const bookOpenDuration = reducedProjectMotion ? 0 : 400
const bookCloseDuration = reducedProjectMotion ? 0 : 360
let popupOpen = false
let growTimer
let flipTimer
let closeFocusTimer
let closeTimer
let lastFocusedCard

/* Render project books only when the project manager and container are available. */
window.ProjectManager?.render(projectContainer)

/* Copy the selected project into the popup and match the shelf book. */
function openProject(card) {
  if (!overlay || !popup || popupOpen) return
  popupOpen = true
  lastFocusedCard = card

  Object.entries(popupBindings).forEach(([id, key]) => {
    const element = document.getElementById(id)
    if (element) element.textContent = card.dataset[key]
  })

  const github = document.getElementById('popupGithub')
  if (github) github.href = card.dataset.github

  const bookStyles = getComputedStyle(card)
  const bookCover = bookStyles.getPropertyValue('--book-cover').trim()
  const bookInk = bookStyles.getPropertyValue('--book-ink').trim()
  const bookBounds = card.getBoundingClientRect()

  if (bookCover) popup.style.setProperty('--popup-book-cover', bookCover)
  if (bookInk) popup.style.setProperty('--popup-book-ink', bookInk)

  popup.style.setProperty('--popup-start-width', `${bookBounds.width}px`)
  popup.style.setProperty('--popup-start-height', `${bookBounds.height}px`)

  clearTimeout(growTimer)
  clearTimeout(flipTimer)
  clearTimeout(closeFocusTimer)
  clearTimeout(closeTimer)

  overlay.classList.remove('expanded', 'flipped')
  overlay.classList.add('open')
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')

  /* Grow the shelf-sized book before opening its cover. */
  growTimer = setTimeout(() => {
    overlay.classList.add('expanded')

    flipTimer = setTimeout(() => {
      overlay.classList.add('flipped')

      closeFocusTimer = setTimeout(
        () => popupClose?.focus(),
        bookOpenDuration,
      )
    }, bookGrowDuration)
  }, bookGrowDelay)
}

/* Close the cover before shrinking and hiding the book. */
function closeProject() {
  if (!overlay || !popupOpen) return
  popupOpen = false

  clearTimeout(growTimer)
  clearTimeout(flipTimer)
  clearTimeout(closeFocusTimer)
  clearTimeout(closeTimer)

  overlay.classList.remove('flipped')

  closeTimer = setTimeout(() => {
    overlay.classList.remove('expanded')

    setTimeout(() => {
      overlay.classList.remove('open')
      overlay.setAttribute('aria-hidden', 'true')
      document.body.classList.remove('popup-open')
      lastFocusedCard?.focus()
    }, bookGrowDuration)
  }, bookCloseDuration)
}


/* Mouse/touch interaction for project books. */
projectContainer?.addEventListener('click', event => {
  const card = event.target.closest('.project-card')
  if (card) openProject(card)
})

/* Keyboard interaction mirrors a normal button (Enter or Space). */
projectContainer?.addEventListener('keydown', event => {
  if (!['Enter', ' '].includes(event.key)) return
  const card = event.target.closest('.project-card')
  if (!card) return
  event.preventDefault()
  openProject(card)
})

/* Close from the backdrop, close button, or Escape key. */
overlay?.addEventListener('click', event => { if (event.target === overlay) closeProject() })
popup?.addEventListener('click', event => event.stopPropagation())
popupClose?.addEventListener('click', closeProject)
document.addEventListener('keydown', event => { if (event.key === 'Escape' && popupOpen) closeProject() })


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

/* This static portfolio uses the visitor's email app instead of a form service. */
contactForm?.addEventListener('submit', event => {
  event.preventDefault()

  const formData = new FormData(contactForm)
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const message = String(formData.get('message') || '').trim()

  const subject = encodeURIComponent(`Portfolio message from ${name}`)
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}`,
  )

  window.location.href = `mailto:xaranjin@gmail.com?subject=${subject}&body=${body}`
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && contactFormOpen) closeContactForm()
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