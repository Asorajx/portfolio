/* =========================
   Featured Crystal
   ========================= */

/* Build a crystal for every project marked as featured. */
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
  featuredProjects.forEach((project, index) => {
    const container = document.createElement('div')
    container.className = 'featured-display-art'
    const crystal = document.createElement('button')
    crystal.className = 'featured-crystal'
    crystal.type = 'button'
    crystal.setAttribute('aria-expanded', 'false')
    crystal.setAttribute('aria-controls', 'featuredDetails')
    crystal.setAttribute('aria-label', `Show ${project.title} project details`)
    crystal.innerHTML = '<span class="featured-orb"><canvas class="featured-orb-canvas" aria-hidden="true"></canvas><span class="featured-orb-title"><span></span><small>View project</small></span></span>'
    crystal.querySelector('.featured-orb-title span').textContent = project.title
    container.appendChild(crystal)
    list.appendChild(container)

    crystal.addEventListener('click', () => {
      activeCrystal = crystal
      details.querySelector('.eyebrow').textContent = project.type
      details.querySelector('h3').textContent = project.title
      details.querySelector('.featured-description').textContent = project.preview
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
  })

  closeButton?.addEventListener('click', () => {
    display.classList.remove('is-open')
    activeCrystal?.setAttribute('aria-expanded', 'false')
    list.inert = false
    details.inert = true
    details.setAttribute('aria-hidden', 'true')
    activeCrystal?.focus()
  })
})()


/* =========================
   Crystal Animation
   ========================= */

/* Draw a flickering rim and drifting dust inside the featured crystal. */
function setupCrystalEffect(crystal, drawBackground) {
  const canvas = crystal.querySelector('.featured-orb-canvas')
  const backgroundCanvas = drawBackground ? document.querySelector('.featured-background-canvas') : null
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
    speedX: .00045 + Math.random() * .0008,
    speedY: .00045 + Math.random() * .0008,
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

  function draw(time = 0) {
    const lightTheme = document.documentElement.dataset.theme === 'light'

    currentX += (pointerX - currentX) * .045
    currentY += (pointerY - currentY) * .045
    spread += (targetSpread - spread) * .025
    const angleDifference = Math.atan2(
      Math.sin(targetGlowAngle - glowAngle),
      Math.cos(targetGlowAngle - glowAngle),
    )
    glowAngle += angleDifference * .08
    crystal.style.setProperty('--glow-angle', `${glowAngle}rad`)
    context.clearRect(0, 0, size, size)
    context.save()
    context.translate(150, 150)
    context.strokeStyle = 'rgba(213, 233, 193, .8)'
    context.lineWidth = 1.1
    context.shadowColor = 'rgba(151, 200, 151, .9)'
    context.shadowBlur = 9
    for (let strand = 0; strand < 2; strand++) {
      context.globalAlpha = strand ? .45 : .9
      context.beginPath()
      for (let i = 0; i <= 160; i++) {
        const angle = i * Math.PI * 2 / 160
        const flame = Math.pow(
          Math.max(0, Math.sin(angle * 13 + time * .003 + strand * 1.8)),
          5,
        )
        const radius = 141 +
          flame * (2.5 + 1.5 * Math.sin(time * .004 + angle * 7)) +
          Math.sin(angle * 23 - time * .004 + strand) * 1.1
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
      const x = Math.cos(particle.angle) * particle.radius * spread +
        Math.sin(time * particle.speedX + particle.phaseX) * particle.driftX +
        currentX * influence * .38
      const y = Math.sin(particle.angle) * particle.radius * spread +
        Math.sin(time * particle.speedY + particle.phaseY) * particle.driftY +
        currentY * influence * .38
      context.globalAlpha = .35 + .3 * (1 + Math.sin(time * .0015 + index)) / 2
      context.fillStyle = lightTheme ? '#f0e8c9' : '#e6edcc'
      context.beginPath()
      context.arc(x, y, index % 6 === 0 ? 1.8 : 1, 0, Math.PI * 2)
      context.fill()
    })
    context.restore()
    if (backgroundContext && backgroundCanvas) {
      const bounds = backgroundCanvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(bounds.width * ratio)
      const height = Math.round(bounds.height * ratio)
      if (backgroundCanvas.width !== width || backgroundCanvas.height !== height) {
        backgroundCanvas.width = width
        backgroundCanvas.height = height
      }
      backgroundContext.setTransform(ratio, 0, 0, ratio, 0, 0)
      backgroundContext.clearRect(0, 0, bounds.width, bounds.height)
      particles.forEach((particle, index) => {
        const x = particle.backgroundX * bounds.width + Math.sin(time * particle.speedX + particle.phaseX) * particle.driftX
        const y = particle.backgroundY * bounds.height + Math.sin(time * particle.speedY + particle.phaseY) * particle.driftY
        backgroundContext.globalAlpha = .35 + .3 * (1 + Math.sin(time * .0015 + index)) / 2
        backgroundContext.fillStyle = '#e6edcc'
        backgroundContext.beginPath()
        backgroundContext.arc(x, y, index % 6 === 0 ? 1.8 : 1, 0, Math.PI * 2)
        backgroundContext.fill()
      })
    }
    if (!motion.matches && !document.hidden) animation = requestAnimationFrame(draw)
    else animation = 0
  }

  function start() {
    if (!animation) draw()
  }
  crystal.addEventListener('pointermove', event => {
    targetSpread = .88
    const bounds = canvas.getBoundingClientRect()
    pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * size
    pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * size
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
