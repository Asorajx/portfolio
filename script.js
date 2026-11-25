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
  const contactSection = document.getElementById('contact')
  let activeLink = navigation?.querySelector('a.active')
  let trackMainPageSections = ['#contact', '#cabinet'].includes(window.location.hash)

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
    if (!trackMainPageSections || !contactSection) return

    const projectsLink = findHashLink('#cabinet')
    const contactLink = findHashLink('#contact')

    if (!projectsLink || !contactLink) return

    /* Contact is selected once it has risen into the top half of the screen. */
    const contactReached = contactSection.getBoundingClientRect().top <= window.innerHeight * .5

    setActiveLink(contactReached ? contactLink : projectsLink)
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
    trackMainPageSections = ['#contact', '#cabinet'].includes(window.location.hash)
    restoreHighlight()
  })

  window.addEventListener('scroll', syncMainPageSection, { passive: true })
  window.addEventListener('resize', restoreHighlight)
  window.addEventListener('load', restoreHighlight)

  requestAnimationFrame(restoreHighlight)
})()


/* =========================
   Navbar Scroll
   ========================= */

/* The frosted bar fades in behind the navbar once the page scrolls. */
;(function setupNavbarScroll() {
  const header = document.querySelector('.site-header')
  if (!header) return

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 4)

  window.addEventListener('scroll', update, { passive: true })
  update()
})()


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
    contact: [[9, 22],[49, 20],[46, 69],[91, 62],[27, 41],[68, 28],[58, 84],[31, 88]],
    projects: [[9, 24],[28, 68],[75, 25],[91, 70]],
    cabinet: [[8, 24],[25, 19],[53, 23],[84, 21],[94, 38],[7, 48],[92, 58],[13, 73],[38, 84],[67, 79],[89, 86]],
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
    '.hero-copy, .hero-note-wrap, .about-intro, .listening-note, .project-detail-intro, .project-record, .project-detail-section, .about-background-row',
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
