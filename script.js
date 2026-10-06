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
      light.className = `spirit-light${reducedMotion ? ' still' : ''}`
      light.style.left = `${x + Math.random() * 5 - 2.5}%`
      light.style.top = `${y + Math.random() * 5 - 2.5}%`
      light.style.setProperty('--spirit-colour', colours[index % colours.length])
      light.style.setProperty('--spirit-size', `${(9 + Math.random() * 4).toFixed(1)}px`)
      light.style.setProperty('--spirit-delay', `${(-Math.random() * 8).toFixed(1)}s`)
      light.style.setProperty('--spirit-duration', `${(9 + Math.random() * 7).toFixed(1)}s`)
      light.style.setProperty('--spirit-x', `${(Math.random() * 42 - 21).toFixed(0)}px`)
      light.style.setProperty('--spirit-y', `${(Math.random() * 38 - 19).toFixed(0)}px`)
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
let popupOpen = false
let flipTimer
let closeFocusTimer
let lastFocusedCard

/* Render project books only when the project manager and container are available. */
window.ProjectManager?.render(projectContainer)

/* Copy the selected book's data into the popup, then trigger the card flip. */
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

  overlay.classList.remove('flipped')
  overlay.classList.add('open')
  overlay.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')

  flipTimer = setTimeout(() => {
    overlay.classList.add('flipped')
    closeFocusTimer = setTimeout(() => popupClose?.focus(), 680)
  }, 240)
}

/* Reverse the flip, hide the overlay, and return keyboard focus to the book. */
function closeProject() {
  if (!overlay || !popupOpen) return
  popupOpen = false
  clearTimeout(flipTimer)
  clearTimeout(closeFocusTimer)
  overlay.classList.remove('flipped')

  setTimeout(() => {
    overlay.classList.remove('open')
    overlay.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('popup-open')
    lastFocusedCard?.focus()
  }, 170)
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