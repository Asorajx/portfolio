/* =========================
   Banner Reveal Animation
   ========================= */

const strips = document.querySelectorAll(".banner-reveal span");

const delays = [0, 120, 240, 360, 480];

// Shuffle delays randomly
delays.sort(() => Math.random() - 0.5);

strips.forEach((strip, index) => {
  strip.style.animationDelay = `${delays[index]}ms`;
});


/* =========================
   Theme Toggle
   ========================= */

/* Button used to switch between light and dark themes. */
const themeButton = document.getElementById('themeToggle')

/* Restore the user's previous theme choice. */
const savedTheme = localStorage.getItem('theme')

if (!savedTheme) {
  document.documentElement.dataset.theme = 'light'
}

/* Use light mode for first-time visitors. */
if (!savedTheme) {
  document.documentElement.dataset.theme = 'light'
}

/* Change the theme when the toggle is clicked. */
if (themeButton) {
    themeButton.addEventListener('click', () => {
    const currentTheme =
      document.documentElement.dataset.theme

    const newTheme =
      currentTheme === 'dark'
        ? 'light'
        : 'dark'

    document.documentElement.dataset.theme = newTheme

    /* Save the choice so it remains after refresh. */
    localStorage.setItem('theme', newTheme)
  })
}


/* =========================
   Spirit Lights
   ========================= */

/* Creates floating spirit dots inside selected sections. */
/* The dots are generated here because their positions and movement are random. */
(function spawnSpirits() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const colors = [
    'var(--spirit-a)',
    'var(--spirit-b)',
    'var(--spirit-c)'
  ]

  /* Number of spirits per section */
  const placements = {
    home: 3,
    about: 1,
    projects: 1,
    contact: 1,
  }

  const styleEl = document.createElement('style')
  document.head.appendChild(styleEl)
  const sheet = styleEl.sheet

  Object.entries(placements).forEach(([id, count]) => {
    const host = document.getElementById(id)

    if (!host) {
      return
    }

    const layer = document.createElement('div')
    layer.className = 'spirit-layer'
    host.insertBefore(layer, host.firstChild)

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div')
      dot.className = 'spirit'

      dot.style.left = `${12 + Math.random() * 76}%`
      dot.style.top = `${18 + Math.random() * 64}%`
      dot.style.setProperty('--c', colors[i % colors.length])

      if (!reduced) {
        const duration = (12 + Math.random() * 10).toFixed(1)
        const name = `wander${Math.random().toString(36).slice(2)}`
        const d = () => (Math.random() * 50 - 25).toFixed(1)

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

/* Elements that display the selected project's information. */
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

/* Tracks whether the project popup is currently open. */
let popupOpen = false

/* Stores the popup flip timer so it can be cancelled when needed. */
let flipTimer = null


/* =========================
   Project Rendering
   ========================= */

/* Render the project cards if ProjectManager has been loaded. */
if (window.ProjectManager) {
  window.ProjectManager.render(slider)
}


/* =========================
   Project Slider
   ========================= */

/* Calculate how far the slider should move when an arrow button is pressed. */
function getScrollDistance() {
  const card = slider.querySelector('.project-card')

  /* Use a fallback distance if no project card is available. */
  if (!card) {
    return 360
  }

  /* Move by one card width plus the space between cards. */
  return card.getBoundingClientRect().width + 18
}

/* Move the slider to the next project. */
nextButton.addEventListener('click', () => {
  slider.scrollBy({
    left: getScrollDistance(),
    behavior: 'smooth',
  })
})

/* Move the slider to the previous project. */
previousButton.addEventListener('click', () => {
  slider.scrollBy({
    left: -getScrollDistance(),
    behavior: 'smooth',
  })
})


/* =========================
   Open Project Popup
   ========================= */

/* Open the popup and fill it with information from the selected card. */
function openProject(card) {
  /* Prevent the popup from being opened again while it is already open. */
  if (popupOpen) {
    return
  }

  popupOpen = true

  /* Copy the selected project's data into the popup. */
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


/* =========================
   Close Project Popup
   ========================= */

/* Close the popup and reset its animation state. */
function closeProject() {
  /* Stop if the popup is already closed. */
  if (!popupOpen) {
    return
  }

  popupOpen = false

  /* Cancel the flip animation if it has not started yet. */
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

/* Event delegation allows dynamically generated project cards to work automatically. */
slider.addEventListener('click', event => {
  const card = event.target.closest('.project-card')

  /* Open the project only if the clicked card belongs to this slider. */
  if (card && slider.contains(card)) {
    openProject(card)
  }
})

/* Allow project cards to be opened using the keyboard. */
slider.addEventListener('keydown', event => {
  /* Only respond to Enter or Space. */
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  const card = event.target.closest('.project-card')

  if (card && slider.contains(card)) {
    /* Prevent Space from scrolling the page when activating a card. */
    event.preventDefault()
    openProject(card)
  }
})


/* =========================
   Popup Background Click
   ========================= */

/* Close the popup when the user clicks the background overlay. */
overlay.addEventListener('click', event => {
  if (event.target === overlay) {
    closeProject()
  }
})

/* Prevent clicks inside the popup from reaching the overlay. */
popup.addEventListener('click', event => {
  event.stopPropagation()
})


/* =========================
   Escape Key
   ========================= */

/* Close the popup when the Escape key is pressed. */
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeProject()
  }
})