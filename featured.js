/* =========================
   Featured Crystal Ball
   ========================= */

/* Build a crystal ball for every project marked as featured. */
;(function setupFeaturedCrystals() {
  const list = document.querySelector('.featured-list')
  const details = document.getElementById('featuredDetails')
  const closeButton = document.querySelector('.featured-dialog-close')
  const display = document.querySelector('.featured-display')
  const featuredProjects = window.ProjectManager?.getFeatured() || []
  if (!list || !details || !display) return

  if (!featuredProjects.length) {
    const section = document.getElementById('projects')
    section.classList.add('is-empty')
    section.querySelector('.featured-gallery').hidden = true
    return
  }

  let activeCrystal = null
  let activeIndex = 0
  let dragged = false
  let pointerStart = null
  const crystals = []
  let announcement = null

  function setActive(index) {
    activeIndex = (index + crystals.length) % crystals.length
    crystals.forEach((item, itemIndex) => {
      let position = itemIndex - activeIndex
      if (position > crystals.length / 2) position -= crystals.length
      if (position < -crystals.length / 2) position += crystals.length
      const isOpposite = crystals.length % 2 === 0 && Math.abs(position) === crystals.length / 2
      item.container.dataset.position = isOpposite && crystals.length === 4
        ? 'back'
        : Math.abs(position) > 2 ? 'hidden' : String(position)
      item.container.inert = Math.abs(position) > 2
      item.crystal.tabIndex = Math.abs(position) > 2 ? -1 : 0
      item.crystal.setAttribute('aria-label', itemIndex === activeIndex
        ? `Show ${item.project.title} project details`
        : `Select ${item.project.title}`)
    })
    if (announcement) announcement.textContent = `${featuredProjects[activeIndex].title}, ${activeIndex + 1} of ${crystals.length}`
  }

  featuredProjects.forEach((project, index) => {
    const container = document.createElement('div')
    container.className = 'featured-display-art'
    const crystal = document.createElement('button')
    crystal.className = 'featured-crystal'
    crystal.type = 'button'
    crystal.setAttribute('aria-expanded', 'false')
    crystal.setAttribute('aria-controls', 'featuredDetails')
    crystal.setAttribute('aria-label', `Show ${project.title} project details`)
    crystal.innerHTML =
      '<span class="featured-orb"><span class="featured-orb-webgl" aria-hidden="true"></span><canvas class="featured-orb-canvas" aria-hidden="true"></canvas><span class="featured-orb-title"><span></span><small>View project</small></span></span>'
    crystal.querySelector('.featured-orb-title span').textContent = project.title
    container.appendChild(crystal)
    list.appendChild(container)
    crystals.push({ container, crystal, project })

    crystal.addEventListener('click', () => {
      if (dragged) return
      if (index !== activeIndex) {
        setActive(index)
        crystal.focus()
        return
      }
      activeCrystal = crystal
      const area = display.getBoundingClientRect()
      const ball = crystal.getBoundingClientRect()
      display.style.setProperty('--expansion-x', `${ball.left + ball.width / 2 - area.left}px`)
      display.style.setProperty('--expansion-y', `${ball.top + ball.height / 2 - area.top}px`)
      display.style.setProperty('--expansion-size', `${ball.width}px`)
      crystal.classList.add('is-selected')
      details.querySelector('.eyebrow').textContent = project.type
      details.querySelector('h3').textContent = project.title
      details.querySelector('.featured-description').textContent = project.summary
      details.querySelector('.featured-display-link').href = `projects.html#${project.id}`
      display.classList.add('is-open')
      crystal.setAttribute('aria-expanded', 'true')
      list.inert = true
      details.inert = false
      details.setAttribute('aria-hidden', 'false')
      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 460
      setTimeout(() => {
        if (display.classList.contains('is-open')) closeButton?.focus()
      }, delay)
    })

    setupCrystalEffect(crystal, index === 0)
    setupCrystalRenderer(crystal)
  })

  if (crystals.length > 1) {
    list.classList.add('is-carousel')
    list.setAttribute('role', 'region')
    list.setAttribute('aria-roledescription', 'carousel')
    list.setAttribute('aria-label', 'Featured projects')

    const instructions = document.createElement('span')
    instructions.id = 'featuredCarouselInstructions'
    instructions.className = 'featured-carousel-status'
    instructions.textContent = 'Use the left and right arrow keys to browse featured projects.'
    list.setAttribute('aria-describedby', instructions.id)
    announcement = document.createElement('span')
    announcement.className = 'featured-carousel-status'
    announcement.setAttribute('aria-live', 'polite')
    list.append(instructions, announcement)

    let lastWheelTime = 0
    list.addEventListener('wheel', event => {
      if (!event.target.closest('.featured-crystal') || event.ctrlKey) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheelTime < 550) return
      lastWheelTime = now
      setActive(activeIndex + (delta > 0 ? 1 : -1))
    }, { passive: false })
    list.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      setActive(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1))
      crystals[activeIndex].crystal.focus()
    })
    list.addEventListener('pointerdown', event => {
      if (event.button !== 0) return
      pointerStart = { x: event.clientX, y: event.clientY }
      dragged = false
      event.target.closest('.featured-crystal')?.setPointerCapture(event.pointerId)
    })
    list.addEventListener('pointerup', event => {
      if (!pointerStart) return
      const dx = event.clientX - pointerStart.x
      const dy = event.clientY - pointerStart.y
      pointerStart = null
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return
      dragged = true
      setActive(activeIndex + (dx < 0 ? 1 : -1))
      setTimeout(() => { dragged = false }, 250)
    })
    list.addEventListener('pointercancel', () => {
      pointerStart = null
    })
    setActive(0)
  }

  function closeDetails(restoreFocus = true) {
    display.classList.remove('is-open')
    activeCrystal?.classList.remove('is-selected')
    activeCrystal?.setAttribute('aria-expanded', 'false')
    list.inert = false
    details.inert = true
    details.setAttribute('aria-hidden', 'true')
    if (restoreFocus) activeCrystal?.focus()
  }

  closeButton?.addEventListener('click', () => closeDetails())
  document.addEventListener('click', event => {
    if (!display.classList.contains('is-open')) return
    if (!display.contains(event.target)) closeDetails(false)
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && display.classList.contains('is-open')) closeDetails(false)
  })
})()

/* Use the supplied WebGL renderer when available and keep the canvas fallback. */
function setupCrystalRenderer(crystal) {
  const container = crystal.querySelector('.featured-orb-webgl')
  const fallback = crystal.querySelector('.featured-orb-canvas')
  if (!container || !fallback || !window.CrystalizedBall) return

  function mount() {
    const lightTheme = document.documentElement.dataset.theme === 'light'
    window.CrystalizedBall.mount(container, {
      preset: 'aurora',
      color: lightTheme ? '#c8bd83' : '#8cb994',
      theme: 'dark',
      size: 0.94,
      particleCount: 5000,
      crackle: 0.65,
      glow: 0.75,
      fill: 0.32,
      motion: 'drift',
      hoverStrength: 0.7,
      intro: false,
    })
    const error = container.querySelector('.crystalized-ball-error')
    fallback.hidden = !error && !!container.querySelector('canvas')
    error?.remove()
  }

  mount()
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', mount)
  new MutationObserver(mount).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
}

/* =========================
   Crystal Ball Animation
   ========================= */

/* Draw a flickering rim and drifting dust inside the featured crystal ball. */
function setupCrystalEffect(crystal, drawBackground) {
  const canvas = crystal.querySelector('.featured-orb-canvas')
  const backgroundCanvas = drawBackground
    ? document.querySelector('.featured-background-canvas')
    : null
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!canvas || !crystal) return

  const context = canvas.getContext('2d')
  if (!context) return
  const backgroundContext = backgroundCanvas?.getContext('2d')

  const size = 300
  canvas.width = size
  canvas.height = size
  const particles = Array.from({ length: 117 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.sqrt(Math.random()) * 95,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    speedX: 0.00045 + Math.random() * 0.0008,
    speedY: 0.00045 + Math.random() * 0.0008,
    driftX: 10 + Math.random() * 18,
    driftY: 10 + Math.random() * 18,
    backgroundX: Math.random(),
    backgroundY: Math.random(),
  }))
  let pointerX = 0
  let pointerY = 0
  let currentX = 0
  let currentY = 0
  let spread = 1.2
  let targetSpread = 1.2
  let glowAngle = 0
  let targetGlowAngle = 0
  let animation = 0
  let crystalVisible = true
  let backgroundVisible = !!backgroundCanvas
  let backgroundBounds = { width: 0, height: 0 }
  let backgroundRatio = 1
  let backgroundWidth = 0
  let backgroundHeight = 0

  function measureBackground() {
    if (!backgroundCanvas) return
    backgroundRatio = Math.min(window.devicePixelRatio || 1, 2)
    backgroundBounds = {
      width: backgroundCanvas.clientWidth,
      height: backgroundCanvas.clientHeight,
    }
    backgroundWidth = Math.round(backgroundBounds.width * backgroundRatio)
    backgroundHeight = Math.round(backgroundBounds.height * backgroundRatio)
  }
  measureBackground()

  /* Animate only while this crystal (or the background it paints) is on screen. */
  const shouldAnimate = () => (crystalVisible || backgroundVisible) && !document.hidden

  function draw(time = 0) {
    const lightTheme = document.documentElement.dataset.theme === 'light'

    currentX += (pointerX - currentX) * 0.045
    currentY += (pointerY - currentY) * 0.045
    spread += (targetSpread - spread) * 0.025
    const angleDifference = Math.atan2(
      Math.sin(targetGlowAngle - glowAngle),
      Math.cos(targetGlowAngle - glowAngle),
    )
    glowAngle += angleDifference * 0.08
    crystal.style.setProperty('--glow-angle', `${glowAngle}rad`)
    context.clearRect(0, 0, size, size)
    context.save()
    context.translate(150, 150)
    context.strokeStyle = lightTheme ? 'rgba(240, 221, 184, .85)' : 'rgba(213, 233, 193, .8)'
    context.lineWidth = 1.1
    context.shadowColor = lightTheme ? 'rgba(201, 169, 121, .8)' : 'rgba(151, 200, 151, .9)'
    context.shadowBlur = 9
    for (let strand = 0; strand < 2; strand++) {
      context.globalAlpha = strand ? 0.45 : 0.9
      context.beginPath()
      for (let i = 0; i <= 160; i++) {
        const angle = (i * Math.PI * 2) / 160
        const flame = Math.pow(Math.max(0, Math.sin(angle * 13 + time * 0.003 + strand * 1.8)), 5)
        const radius =
          141 +
          flame * (2.5 + 1.5 * Math.sin(time * 0.004 + angle * 7)) +
          Math.sin(angle * 23 - time * 0.004 + strand) * 1.1
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.closePath()
      context.stroke()
    }
    particles.forEach((particle, index) => {
      const influence = 1 - particle.radius / 150
      const x =
        Math.cos(particle.angle) * particle.radius * spread +
        Math.sin(time * particle.speedX + particle.phaseX) * particle.driftX +
        currentX * influence * 0.38
      const y =
        Math.sin(particle.angle) * particle.radius * spread +
        Math.sin(time * particle.speedY + particle.phaseY) * particle.driftY +
        currentY * influence * 0.38
      context.globalAlpha = 0.35 + (0.3 * (1 + Math.sin(time * 0.0015 + index))) / 2
      context.fillStyle = lightTheme ? '#f2e6ce' : '#e6edcc'
      context.beginPath()
      context.arc(x, y, index % 6 === 0 ? 1.8 : 1, 0, Math.PI * 2)
      context.fill()
    })
    context.restore()
    if (backgroundContext && backgroundCanvas) {
      /* Size comes from the cached ResizeObserver measurement, not a per-frame layout read. */
      const bounds = backgroundBounds
      const ratio = backgroundRatio
      if (backgroundCanvas.width !== backgroundWidth || backgroundCanvas.height !== backgroundHeight) {
        backgroundCanvas.width = backgroundWidth
        backgroundCanvas.height = backgroundHeight
      }
      backgroundContext.setTransform(ratio, 0, 0, ratio, 0, 0)
      backgroundContext.clearRect(0, 0, bounds.width, bounds.height)
      particles.forEach((particle, index) => {
        const x =
          particle.backgroundX * bounds.width +
          Math.sin(time * particle.speedX + particle.phaseX) * particle.driftX
        const y =
          particle.backgroundY * bounds.height +
          Math.sin(time * particle.speedY + particle.phaseY) * particle.driftY
        backgroundContext.globalAlpha = 0.35 + (0.3 * (1 + Math.sin(time * 0.0015 + index))) / 2
        backgroundContext.fillStyle = lightTheme ? '#e9d8b9' : '#e6edcc'
        backgroundContext.beginPath()
        backgroundContext.arc(x, y, index % 6 === 0 ? 1.8 : 1, 0, Math.PI * 2)
        backgroundContext.fill()
      })
    }
    if (!motion.matches && shouldAnimate()) animation = requestAnimationFrame(draw)
    else animation = 0
  }

  function start() {
    if (!animation) draw(performance.now())
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      crystalVisible = entry.isIntersecting
      if (crystalVisible && !motion.matches) start()
    }).observe(crystal)

    if (backgroundCanvas) {
      new IntersectionObserver(([entry]) => {
        backgroundVisible = entry.isIntersecting
        if (backgroundVisible && !motion.matches) start()
      }).observe(backgroundCanvas)
      new ResizeObserver(() => {
        measureBackground()
        if (motion.matches) draw()
      }).observe(backgroundCanvas)
    }
  }
  crystal.addEventListener('pointermove', event => {
    targetSpread = 0.88
    const bounds = canvas.getBoundingClientRect()
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * size
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * size
    targetGlowAngle = Math.atan2(pointerX, -pointerY)
  })
  crystal.addEventListener('pointerleave', () => {
    pointerX = 0
    pointerY = 0
    targetSpread = 1.2
  })

  motion.addEventListener('change', () => {
    if (motion.matches) {
      cancelAnimationFrame(animation)
      animation = 0
      draw()
    } else {
      start()
    }
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animation)
      animation = 0
    } else {
      start()
    }
  })
  start()
}
