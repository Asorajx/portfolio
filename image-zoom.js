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
    image.draggable = false
    Object.assign(image.style, {
      left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`,
    })

    const closeButton = document.createElement('button')
    closeButton.className = 'image-zoom__close'
    closeButton.type = 'button'
    closeButton.setAttribute('aria-label', 'Close enlarged image')
    closeButton.textContent = '×'

    backdrop.append(image, closeButton)
    document.body.append(backdrop)
    source.style.visibility = 'hidden'

    /* Real size is the furthest the image can zoom. */
    const maxZoom = Math.max(1, source.naturalWidth / to.width)
    active = { source, backdrop, image, fitted: to, rect: to, zoom: 1, maxZoom }
    image.classList.toggle('is-zoomable', maxZoom > 1.05)

    image.animate(flip(from, to), { duration, easing })
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration * .6, easing: 'ease-out' })

    backdrop.addEventListener('click', close)
    backdrop.addEventListener('wheel', onWheel, { passive: false })
    image.addEventListener('click', onImageClick)
    image.addEventListener('pointerdown', onPointerDown)
    image.addEventListener('pointermove', onPointerMove)
    image.addEventListener('pointerup', onPointerEnd)
    image.addEventListener('pointercancel', onPointerEnd)
    backdrop.tabIndex = -1
    backdrop.focus({ preventScroll: true })
  }

  /* Zoom and Pan */
  const pointers = new Map()
  let moved = 0
  let pinchDistance = 0

  /* Place the image, keeping it centred when small and covering the screen when large. */
  function place(rect, animated = false) {
    const { image } = active
    const width = rect.width
    const height = rect.height
    const left = width <= innerWidth ? (innerWidth - width) / 2 : Math.max(innerWidth - width, Math.min(0, rect.left))
    const top = height <= innerHeight ? (innerHeight - height) / 2 : Math.max(innerHeight - height, Math.min(0, rect.top))
    const next = { left, top, width, height }

    if (animated && duration) image.animate(flip(active.rect, next), { duration: duration * .6, easing })
    Object.assign(image.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` })
    active.rect = next
    active.zoom = width / active.fitted.width
    image.classList.toggle('is-zoomed', active.zoom > 1.01)
  }

  /* Zoom around a point so that spot stays under the cursor or fingers. */
  function setZoom(value, x = innerWidth / 2, y = innerHeight / 2, animated = false) {
    const { fitted, maxZoom, rect } = active
    const zoom = Math.max(1, Math.min(maxZoom, value))
    const ratio = fitted.width * zoom / rect.width
    place({
      left: x - (x - rect.left) * ratio,
      top: y - (y - rect.top) * ratio,
      width: fitted.width * zoom,
      height: fitted.height * zoom,
    }, animated)
  }

  /* Click toggles between fitted and real size, unless it was the end of a drag. */
  function onImageClick(event) {
    event.stopPropagation()
    if (!active) return
    if (moved > 4) return (moved = 0)
    if (active.maxZoom <= 1.05) return
    setZoom(active.zoom > 1.01 ? 1 : active.maxZoom, event.clientX, event.clientY, true)
  }

  function onWheel(event) {
    event.preventDefault()
    if (!active) return
    setZoom(active.zoom * Math.exp(-event.deltaY * .002), event.clientX, event.clientY)
  }

  function onPointerDown(event) {
    /* The viewer is already closing, so ignore new touches. */
    if (!active) return

    /* Stop the browser starting its own image drag, which would cancel the pan. */
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 1) moved = 0
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinchDistance = Math.hypot(a.x - b.x, a.y - b.y)
    }
  }

  function onPointerMove(event) {
    if (!active) return
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const point = { x: event.clientX, y: event.clientY }
    pointers.set(event.pointerId, point)

    if (pointers.size === 2) {
      /* Pinch: scale with the distance between the two fingers. */
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      moved = 99
      if (pinchDistance) setZoom(active.zoom * distance / pinchDistance, (a.x + b.x) / 2, (a.y + b.y) / 2)
      pinchDistance = distance
    } else if (active.zoom > 1.01) {
      /* Drag to look around the zoomed image. */
      const dx = point.x - previous.x
      const dy = point.y - previous.y
      moved += Math.abs(dx) + Math.abs(dy)
      place({ ...active.rect, left: active.rect.left + dx, top: active.rect.top + dy })
    }
  }

  function onPointerEnd(event) {
    pointers.delete(event.pointerId)
    pinchDistance = 0
  }

  function close() {
    if (!active) return
    const { source, backdrop, image } = active
    active = null
    pointers.clear()

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
