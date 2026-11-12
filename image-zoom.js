/* =========================
   Image Zoom
   ========================= */

/* Click-to-Enlarge, Same Motion as the Book Zoom */
;(function setupImageZoom() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const easing = 'cubic-bezier(.22, 1, .36, 1)'
  const duration = reduceMotion ? 0 : 560
  let active = null

  /* Fitted Size */
  function targetRect(image) {
    const ratio = image.naturalWidth / image.naturalHeight || 16 / 10
    const width = Math.min(innerWidth * .92, innerHeight * .9 * ratio)
    const height = width / ratio
    return { left: (innerWidth - width) / 2, top: (innerHeight - height) / 2, width, height }
  }

  /* Move Between Two Rectangles */
  function flip(from, to) {
    return [
      { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
      { transform: 'none' },
    ]
  }

  function open(source) {
    if (active) return
    const from = source.getBoundingClientRect()
    const to = targetRect(source)

    const backdrop = document.createElement('div')
    backdrop.className = 'image-zoom'
    backdrop.setAttribute('role', 'dialog')
    backdrop.setAttribute('aria-modal', 'true')
    backdrop.setAttribute('aria-label', source.alt || 'Enlarged image')

    const image = document.createElement('img')
    image.className = 'image-zoom__image'
    image.src = source.currentSrc || source.src
    image.alt = source.alt
    Object.assign(image.style, {
      left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`,
    })

    backdrop.append(image)
    document.body.append(backdrop)
    source.style.visibility = 'hidden'
    active = { source, backdrop, image }

    image.animate(flip(from, to), { duration, easing })
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration * .6, easing: 'ease-out' })

    backdrop.addEventListener('click', close)
    backdrop.tabIndex = -1
    backdrop.focus({ preventScroll: true })
  }

  function close() {
    if (!active) return
    const { source, backdrop, image } = active
    active = null

    const from = source.getBoundingClientRect()
    const to = image.getBoundingClientRect()
    const finish = () => {
      backdrop.remove()
      source.style.visibility = ''
      source.focus({ preventScroll: true })
    }

    if (!duration) return finish()
    const motion = image.animate(flip(from, to).reverse(), { duration: duration * .8, easing, fill: 'forwards' })
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duration * .8, easing: 'ease-in', fill: 'forwards' })
    motion.onfinish = finish
  }

  document.addEventListener('click', event => {
    const image = event.target.closest?.('.project-zoomable')
    if (image) open(image)
  })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close()
    if ((event.key === 'Enter' || event.key === ' ') && event.target.classList?.contains('project-zoomable')) {
      event.preventDefault()
      open(event.target)
    }
  })
})()
