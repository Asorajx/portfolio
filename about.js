/* =========================
   About Page Entrance
   ========================= */

/* Animate copies of the letters without changing the original text layout. */
;(function setupAboutEntrance() {
  const page = document.querySelector('.about-page')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!page || motion.matches) return

  const passages = page.querySelectorAll('h1, .about-summary p')
  const note = page.querySelector('.listening-note')
  const layer = document.createElement('div')
  layer.className = 'about-letter-layer'
  layer.setAttribute('aria-hidden', 'true')
  document.body.appendChild(layer)

  passages.forEach(passage => {
    const walker = document.createTreeWalker(passage, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const style = getComputedStyle(node.parentElement)
      for (let index = 0; index < node.length; index++) {
        const character = node.data[index]
        if (/\s/.test(character)) continue

        const range = document.createRange()
        range.setStart(node, index)
        range.setEnd(node, index + 1)
        const bounds = range.getBoundingClientRect()
        const slot = document.createElement('span')
        const letter = document.createElement('span')
        slot.className = 'about-letter-slot'
        slot.style.left = `${bounds.left + window.scrollX}px`
        slot.style.top = `${bounds.top + window.scrollY}px`
        slot.style.width = `${bounds.width}px`
        slot.style.height = `${bounds.height}px`
        slot.style.font = style.font
        slot.style.lineHeight = `${bounds.height}px`
        slot.style.color = style.color
        letter.className = 'about-letter'
        letter.textContent = character
        letter.style.setProperty('--from-x', `${Math.round((Math.random() - .5) * 100)}vw`)
        letter.style.setProperty('--from-y', `${Math.round((Math.random() - .5) * 100)}vh`)
        letter.style.setProperty('--from-rotation', `${Math.round((Math.random() - .5) * 80)}deg`)
        letter.style.setProperty('--delay', `${Math.round(Math.random() * 600)}ms`)
        slot.appendChild(letter)
        layer.appendChild(slot)

        /* Match the original glyph position, including its font baseline. */
        const letterRange = document.createRange()
        letterRange.selectNodeContents(letter)
        const letterBounds = letterRange.getBoundingClientRect()
        slot.style.left = `${bounds.left + window.scrollX + bounds.left - letterBounds.left}px`
        slot.style.top = `${bounds.top + window.scrollY + bounds.top - letterBounds.top}px`
      }
    }
    passage.classList.add('about-text-pending')
  })

  note?.classList.add('about-note-pending')

  function finish() {
    page.classList.remove('about-entrance-playing')
    note?.classList.remove('about-note-pending')
    passages.forEach(passage => passage.classList.remove('about-text-pending', 'about-text-settling'))
    layer.remove()
  }

  const delay = document.documentElement.dataset.pageTransition === 'ready' ? 350 : 0
  setTimeout(() => {
    if (motion.matches) {
      finish()
      return
    }
    page.classList.add('about-entrance-playing')
    layer.classList.add('about-entrance-playing')
    setTimeout(() => {
      passages.forEach(passage => passage.classList.add('about-text-settling'))
      layer.classList.add('about-text-settling')
    }, 1900)
    /* Start the glow as the last letters land rather than after the fade. */
    setTimeout(() => {
      if (!motion.matches) playAboutBorderGlow(motion)
    }, 1700)
    setTimeout(finish, 2300)
  }, delay)
})()

/* Send two lights around the viewport after the introduction settles. */
function playAboutBorderGlow(motion) {
  const overlay = document.createElement('div')
  overlay.className = 'about-border-glow'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.innerHTML = `
    <div class="about-glow-frame">
      <div class="about-glow-beam"><span class="about-glow-mesh"></span><span class="about-glow-light"></span></div>
      <div class="about-glow-beam"><span class="about-glow-mesh"></span><span class="about-glow-light"></span></div>
    </div>
  `
  document.body.appendChild(overlay)

  const frame = overlay.querySelector('.about-glow-frame')
  const beams = overlay.querySelectorAll('.about-glow-beam')
  const duration = 700
  const radius = parseFloat(getComputedStyle(overlay).getPropertyValue('--glow-radius')) || 0
  let startTime = null
  let animation = 0

  /* Keep the lights moving evenly along the rounded frame. */
  function getPosition(progress, width, height) {
    const corner = Math.min(radius, width / 4, height / 4)
    const horizontal = Math.max(0, width / 2 - corner)
    const vertical = Math.max(0, height - 2 * corner)
    const arc = Math.PI * corner / 2
    let distance = progress * (2 * horizontal + vertical + 2 * arc)

    if (distance < horizontal) return [width / 2 + distance, 0]
    distance -= horizontal
    if (distance < arc) {
      const angle = distance / Math.max(corner, .001)
      return [width - corner + corner * Math.sin(angle), corner - corner * Math.cos(angle)]
    }
    distance -= arc
    if (distance < vertical) return [width, corner + distance]
    distance -= vertical
    if (distance < arc) {
      const angle = distance / Math.max(corner, .001)
      return [width - corner + corner * Math.cos(angle), height - corner + corner * Math.sin(angle)]
    }
    distance -= arc
    return [Math.max(width / 2, width - corner - distance), height]
  }

  function stop() {
    cancelAnimationFrame(animation)
    overlay.remove()
    motion.removeEventListener('change', onMotionChange)
    window.removeEventListener('pagehide', stop)
  }

  function onMotionChange() {
    if (motion.matches) stop()
  }

  function draw(time) {
    if (startTime === null) startTime = time
    const progress = Math.min((time - startTime) / duration, 1)
    const bounds = frame.getBoundingClientRect()
    const [x, y] = getPosition(progress, bounds.width, bounds.height)
    const angle = Math.atan2(x - bounds.width / 2, bounds.height / 2 - y) * 180 / Math.PI
    const opacity = Math.max(0, Math.min(1, progress / .13, (1 - progress) / .28))

    beams.forEach((beam, index) => {
      beam.style.setProperty('--glow-angle', `${index === 0 ? angle : -angle}deg`)
      beam.style.setProperty('--glow-opacity', opacity.toFixed(4))
    })

    if (progress < 1) animation = requestAnimationFrame(draw)
    else stop()
  }

  motion.addEventListener('change', onMotionChange)
  window.addEventListener('pagehide', stop, { once: true })
  animation = requestAnimationFrame(draw)
}
