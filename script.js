/* =========================
   Banner Reveal Animation
   ========================= */

/* Give each banner strip a different delay so they do not move together. */
const strips = document.querySelectorAll('.banner-reveal span')
const delays = [0, 120, 240]

/* Shuffle the delays so the reveal order changes each time the page loads. */
delays.sort(() => Math.random() - 0.5)

strips.forEach((strip, index) => {
  strip.style.animationDelay = `${delays[index]}ms`
})


/* =========================
   Theme Toggle
   ========================= */

/* Button used to switch between light and dark themes. */
const themeButton = document.getElementById('themeToggle')

/* Check whether the user has previously selected a theme. */
const savedTheme = localStorage.getItem('theme')

/* Use light mode for first-time visitors. */
if (!savedTheme) {
  document.documentElement.dataset.theme = 'light'
}

/* Change the theme when the toggle is clicked. */
if (themeButton) {
  themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme

    const newTheme =
      currentTheme === 'dark'
        ? 'light'
        : 'dark'

    document.documentElement.dataset.theme = newTheme

    /* Save the choice so it remains available after a refresh. */
    localStorage.setItem('theme', newTheme)
  })
}


/* =========================
   Spirit Lights
   ========================= */

/* Create floating spirit dots inside selected sections. */
/* Their positions and movement are generated randomly when the page loads. */
(function spawnSpirits() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const colors = [
    'var(--spirit-a)',
    'var(--spirit-b)',
    'var(--spirit-c)',
  ]

  /* Set how many spirit dots appear in each section. */
  const placements = {
    home: 4,
    about: 2,
    projects: 2,
    contact: 2,
  }

  /* Store generated animations in a new stylesheet. */
  const styleEl = document.createElement('style')
  document.head.appendChild(styleEl)

  const sheet = styleEl.sheet

  Object.entries(placements).forEach(([id, count]) => {
    const host = document.getElementById(id)

    /* Skip a section if it cannot be found. */
    if (!host) {
      return
    }

    const layer = document.createElement('div')
    layer.className = 'spirit-layer'
    host.insertBefore(layer, host.firstChild)

    /* Create the required number of spirit dots for this section. */
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div')
      dot.className = 'spirit'

      /* Give each spirit a random position and cycle through the theme colours. */
      dot.style.left = `${12 + Math.random() * 76}%`
      dot.style.top = `${18 + Math.random() * 64}%`
      dot.style.setProperty('--c', colors[i % colors.length])

      /* Only animate the spirits when reduced motion is not requested. */
      if (!reduced) {
        const duration = (12 + Math.random() * 10).toFixed(1)
        const name = `wander${Math.random().toString(36).slice(2)}`
        const d = () => (Math.random() * 50 - 25).toFixed(1)

        /* Generate a unique movement path for this spirit. */
        const rule =
          `@keyframes ${name}{` +
          `0%{transform:translate(0,0);opacity:.25;}` +
          `25%{transform:translate(${d()}px,${d()}px);opacity:.6;}` +
          `50%{transform:translate(${d()}px,${d()}px);opacity:.3;}` +
          `75%{transform:translate(${d()}px,${d()}px);opacity:.65;}` +
          `100%{transform:translate(0,0);opacity:.25;}}`

        sheet.insertRule(rule, sheet.cssRules.length)

        dot.style.animation =
          `${name} ${duration}s ease-in-out infinite`
      }

      layer.appendChild(dot)
    }
  })
})()


/* =========================
   DOM Elements
   ========================= */

/* Project slider and navigation buttons. */
const slider = document.getElementById('projectSlider')
const previousButton = document.getElementById('previousProject')
const nextButton = document.getElementById('nextProject')

/* Popup container and background overlay. */
const overlay = document.getElementById('projectOverlay')
const popup = document.getElementById('projectPopup')

/* Elements used to display the selected project's information. */
const popupNumber = document.getElementById('popupNumber')
const popupType = document.getElementById('popupType')
const popupFrontTitle = document.getElementById('popupFrontTitle')
const popupSummary = document.getElementById('popupSummary')
const popupTitle = document.getElementById('popupTitle')
const popupDate = document.getElementById('popupDate')
const popupDescription = document.getElementById('popupDescription')
const popupGithub = document.getElementById('popupGithub')


/* =========================
   Popup State
   ========================= */

/* Track whether the popup is open and keep its flip timer available to cancel. */
let popupOpen = false
let flipTimer = null


/* =========================
   Project Rendering
   ========================= */

/* Render the project cards after projects.js has loaded ProjectManager. */
if (window.ProjectManager) {
  window.ProjectManager.render(slider)
}


/* =========================
   Project Slider
   ========================= */

/* Calculate how far the slider should move for one project card. */
function getScrollDistance() {
  const card = slider.querySelector('.project-card')

  /* Use a fallback distance if no project card is available. */
  if (!card) {
    return 360
  }

  /* Move by one card width plus the gap between cards. */
  return card.getBoundingClientRect().width + 18
}

/* Move to the next project. */
nextButton.addEventListener('click', () => {
  slider.scrollBy({
    left: getScrollDistance(),
    behavior: 'smooth',
  })
})

/* Move to the previous project. */
previousButton.addEventListener('click', () => {
  slider.scrollBy({
    left: -getScrollDistance(),
    behavior: 'smooth',
  })
})


/* =========================
   Project Popup
   ========================= */

/* Open the popup and fill it with information from the selected card. */
function openProject(card) {
  /* Prevent the popup from opening again while it is already visible. */
  if (popupOpen) {
    return
  }

  popupOpen = true

  /* Copy the selected project's stored data into the popup. */
  popupNumber.textContent = card.dataset.number
  popupType.textContent = card.dataset.type
  popupFrontTitle.textContent = card.dataset.title
  popupSummary.textContent = card.dataset.summary
  popupTitle.textContent = card.dataset.title
  popupDate.textContent = card.dataset.date
  popupDescription.textContent = card.dataset.description
  popupGithub.href = card.dataset.github

  /* Show the popup in its starting position. */
  overlay.classList.remove('flipped')
  overlay.classList.add('open')
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')

  /* Wait briefly before starting the card flip animation. */
  flipTimer = setTimeout(() => {
    overlay.classList.add('flipped')
  }, 260)
}

/* Close the popup and reset its animation state. */
function closeProject() {
  /* Stop if the popup is already closed. */
  if (!popupOpen) {
    return
  }

  popupOpen = false

  /* Cancel the flip if it has not started yet. */
  clearTimeout(flipTimer)

  /* Flip the popup back before hiding it completely. */
  overlay.classList.remove('flipped')

  setTimeout(() => {
    overlay.classList.remove('open')
    overlay.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('popup-open')
  }, 180)
}


/* =========================
   Project Card Events
   ========================= */

/* Event delegation lets dynamically generated project cards use one listener. */
slider.addEventListener('click', event => {
  const card = event.target.closest('.project-card')

  /* Open the project only if the clicked card belongs to this slider. */
  if (card && slider.contains(card)) {
    openProject(card)
  }
})

/* Allow project cards to be opened using Enter or Space. */
slider.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  const card = event.target.closest('.project-card')

  if (card && slider.contains(card)) {
    /* Prevent Space from scrolling the page while activating a card. */
    event.preventDefault()
    openProject(card)
  }
})


/* =========================
   Popup Events
   ========================= */

/* Close the popup when the user clicks its background overlay. */
overlay.addEventListener('click', event => {
  if (event.target === overlay) {
    closeProject()
  }
})

/* Keep clicks inside the popup from reaching the background overlay. */
popup.addEventListener('click', event => {
  event.stopPropagation()
})

/* Close the popup when the Escape key is pressed. */
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeProject()
  }
})