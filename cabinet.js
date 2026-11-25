/* =========================
   Cabinet
   ========================= */

/* A cabinet of drawers, one for each project. Hovering slides a drawer out, and clicking (or deliberately scrolling on the open drawer) opens the project full page. Scrolling up at the very top of the project, or pressing Return to Cabinet, puts it back. */
;(function setupCabinet() {
  const section = document.getElementById('cabinet')
  const grid = section?.querySelector('.cabinet')
  const projects = window.portfolioProjects || []
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const columns = 4
  const dwell = 350
  const intentNeeded = 260
  const pullNeeded = 260
  const drawers = new Map()
  const views = new Map()
  let openDrawer = null
  let closeTimer = 0
  let expanded = null
  let busy = false
  let closeQueued = false
  let lastPageScroll = 0

  if (!grid || !projects.length) return

  window.addEventListener('scroll', () => { lastPageScroll = performance.now() }, { passive: true })


  /* =========================
     Build the Drawers
     ========================= */

  projects.forEach(project => {
    const name = project.shortTitle || project.title
    const drawer = document.createElement('button')
    const inside = document.createElement('span')
    const note = document.createElement('span')

    drawer.className = 'drawer'
    drawer.type = 'button'
    drawer.dataset.id = project.id
    drawer.classList.toggle('is-featured', !!project.featured)
    drawer.setAttribute('aria-haspopup', 'dialog')
    drawer.setAttribute('aria-label', `${name}, ${project.type}${project.featured ? ', featured' : ''}. ${project.summary}`)

    inside.className = 'drawer-inside'
    inside.setAttribute('aria-hidden', 'true')
    note.className = 'drawer-note'
    note.innerHTML = `<strong>${project.focus}</strong><span>${project.date}</span>`
    inside.append(note)
    inside.insertAdjacentHTML('beforeend', '<span class="drawer-progress"></span>')

    drawer.append(inside)
    drawer.insertAdjacentHTML('beforeend',
      '<span class="drawer-front"><span class="drawer-label">' +
      (project.featured ? '<span class="drawer-star" aria-hidden="true">✦</span>' : '') +
      `<span class="drawer-head"><img class="drawer-logo" src="assets/badges/${project.id}.png" alt=""><span class="drawer-titles"><strong>${name}</strong><span class="drawer-kind">${project.type}</span></span></span>` +
      `<span class="drawer-text">${project.summary}</span>` +
      `<span class="drawer-team">${project.team === 'group' ? 'Group' : 'Solo'}</span>` +
      '</span><span class="drawer-pull" aria-hidden="true"></span></span>')

    grid.append(drawer)
    drawers.set(project.id, drawer)
  })

  /* Fill the last row with a blank drawer. */
  if (projects.length % columns) {
    const empty = document.createElement('div')

    empty.className = 'drawer drawer-empty'
    empty.setAttribute('aria-hidden', 'true')
    empty.innerHTML = '<span class="drawer-front"><span class="drawer-label"><span class="drawer-soon">More to come...</span></span><span class="drawer-pull"></span></span>'
    grid.append(empty)
  }


  /* =========================
     Hover and Focus
     ========================= */

  function open(drawer) {
    if (expanded || openDrawer === drawer) return
    close(openDrawer)
    clearTimeout(closeTimer)
    openDrawer = drawer
    drawer.dataset.openedAt = String(performance.now())
    drawer.classList.add('is-open')

    /* Once someone lingers on a drawer, its project is fetched ready for opening. */
    setTimeout(() => {
      if (openDrawer === drawer) prepare(drawer.dataset.id)
    }, 250)
  }

  function close(drawer) {
    if (!drawer) return
    drawer.classList.remove('is-open')
    drawer.style.removeProperty('--intent')
    if (openDrawer === drawer) openDrawer = null
  }

  drawers.forEach(drawer => {
    drawer.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return
      open(drawer)
    })

    drawer.addEventListener('pointerleave', event => {
      if (event.pointerType === 'touch') return
      clearTimeout(closeTimer)
      /* A short pause stops the drawer flickering as the pointer crosses its edge. */
      closeTimer = setTimeout(() => { if (!expanded) close(drawer) }, 120)
    })

    drawer.addEventListener('focus', () => { if (drawer.matches(':focus-visible')) open(drawer) })
    drawer.addEventListener('blur', () => { if (!expanded) close(drawer) })
    drawer.addEventListener('click', () => expand(drawer.dataset.id))


    /* =========================
       Scroll to Open
       ========================= */

    /* Scrolling down over the open drawer fills a line, and a full line opens the project. This only counts once the drawer has settled, and only while the page itself is not scrolling past. It never counts on touch and never captures scrolling upwards. */
    let intent = 0
    let decay = 0

    drawer.addEventListener('wheel', event => {
      if (expanded || !hover.matches || !drawer.classList.contains('is-open') || event.deltaY <= 0) return

      const now = performance.now()

      if (now - Number(drawer.dataset.openedAt) < dwell || now - lastPageScroll < 120) return

      /* Mice in some browsers report lines or pages instead of pixels. */
      const pixels = event.deltaY * (event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? 400 : 1)

      event.preventDefault()
      intent += pixels
      drawer.style.setProperty('--intent', Math.min(intent / intentNeeded, 1).toFixed(3))
      clearTimeout(decay)
      decay = setTimeout(() => {
        intent = 0
        drawer.style.setProperty('--intent', '0')
      }, 600)

      if (intent >= intentNeeded) {
        intent = 0
        expand(drawer.dataset.id)
      }
    }, { passive: false })
  })


  /* =========================
     The Full Page Project
     ========================= */

  /* The project page loads inside a frame, so its content is always the same as the standalone page. */
  function prepare(id) {
    if (views.has(id)) return views.get(id)

    const project = projects.find(item => item.id === id)
    const view = document.createElement('div')
    const frame = document.createElement('iframe')
    const hint = document.createElement('button')

    view.className = 'drawer-view'
    view.hidden = true
    view.setAttribute('role', 'dialog')
    view.setAttribute('aria-modal', 'true')
    view.setAttribute('aria-label', project.title)
    frame.className = 'drawer-frame'
    frame.title = `${project.title} project`
    frame.src = `projects.html?embed=1#${id}`
    hint.className = 'drawer-hint'
    hint.type = 'button'
    hint.setAttribute('aria-label', 'Return to the cabinet')
    hint.innerHTML = '<span class="drawer-chevron" aria-hidden="true"></span>Scroll up to close<span class="drawer-chevron" aria-hidden="true"></span>'
    hint.addEventListener('click', requestClose)
    view.append(frame, hint)
    document.body.append(view)
    frame.addEventListener('load', () => watchFrame(view, frame))

    const entry = { view, frame }

    views.set(id, entry)
    return entry
  }

  /* Scrolling up at the very top puts the project back. Only a fresh gesture that starts at the top counts, so a scroll that is still coasting up from below never closes it. */
  function watchFrame(view, frame) {
    const win = frame.contentWindow
    let pull = 0
    let lastWheel = 0
    let gestureCounts = false
    let reset = 0

    if (!win) return
    const markTop = () => view.classList.toggle('is-top', win.scrollY === 0)

    win.addEventListener('scroll', markTop, { passive: true })
    markTop()
    win.addEventListener('keydown', event => { if (event.key === 'Escape') requestClose() })
    win.addEventListener('wheel', event => {
      const now = performance.now()

      if (now - lastWheel > 200) gestureCounts = win.scrollY === 0
      lastWheel = now

      if (!gestureCounts || event.deltaY >= 0 || win.scrollY > 0) {
        pull = 0
        view.style.setProperty('--pull', '0')
        return
      }

      pull += -event.deltaY
      view.style.setProperty('--pull', Math.min(pull / pullNeeded, 1).toFixed(3))
      clearTimeout(reset)
      reset = setTimeout(() => {
        pull = 0
        view.style.setProperty('--pull', '0')
      }, 450)

      if (pull >= pullNeeded) {
        pull = 0
        view.style.setProperty('--pull', '0')
        requestClose()
      }
    }, { passive: true })

    /* On touch screens, dragging down from the very top does the same. */
    let startY = 0
    let dragCounts = false

    win.addEventListener('touchstart', event => {
      startY = event.touches[0].clientY
      dragCounts = win.scrollY === 0
    }, { passive: true })

    win.addEventListener('touchmove', event => {
      const distance = event.touches[0].clientY - startY

      if (!dragCounts || win.scrollY > 0 || distance <= 0) return
      view.style.setProperty('--pull', Math.min(distance / 160, 1).toFixed(3))
      if (distance >= 160) {
        dragCounts = false
        view.style.setProperty('--pull', '0')
        requestClose()
      }
    }, { passive: true })

    win.addEventListener('touchend', () => {
      dragCounts = false
      view.style.setProperty('--pull', '0')
    }, { passive: true })
  }

  /* The shape the project grows out of and shrinks back into: the part of a drawer that is showing, or the whole of any other element, such as a desk badge. */
  function originRect(origin) {
    const box = origin.getBoundingClientRect()
    const height = origin.classList.contains('drawer') ? box.height * .24 : box.height

    return `inset(${box.top}px ${window.innerWidth - box.right}px ${window.innerHeight - box.top - height}px ${box.left}px round 6px)`
  }

  function setPage(locked) {
    const root = document.documentElement

    if (locked) root.style.setProperty('--scrollbar-gap', `${window.innerWidth - root.clientWidth}px`)
    root.classList.toggle('drawer-locked', locked)
    ;['.site-header', 'main', '.site-footer'].forEach(selector => {
      const element = document.querySelector(selector)

      if (element) element.inert = locked
    })
  }

  async function expand(id, { instant = false, origin } = {}) {
    if (expanded || busy) return

    const drawer = drawers.get(id)
    const { view, frame } = prepare(id)
    const shortcut = instant || motion.matches

    busy = true
    closeQueued = false
    origin = origin || drawer
    expanded = { id, drawer, view, origin }
    clearTimeout(closeTimer)
    if (origin === drawer) {
      if (openDrawer !== drawer) open(drawer)
      drawer.classList.add('is-expanded')
    }
    setPage(true)
    view.hidden = false

    if (!instant) history.pushState({ cabinet: id }, '', `#cabinet/${id}`)

    if (!shortcut) {
      await view.animate(
        [{ clipPath: originRect(origin) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }],
        { duration: 640, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      ).finished.catch(() => {})
    } else if (!instant) {
      await view.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }).finished.catch(() => {})
    }

    busy = false
    frame.contentWindow?.focus()

    /* A close asked for while the project was still opening happens as soon as it has opened. */
    if (closeQueued) {
      closeQueued = false
      requestClose()
    }
  }

  /* Back, Escape and the buttons all end up here. */
  function requestClose() {
    if (!expanded) return
    if (busy) {
      closeQueued = true
      return
    }
    if (history.state?.cabinet === expanded.id) history.back()
    else collapse()
  }

  async function collapse() {
    if (!expanded || busy) return

    const { drawer, view, frame, origin } = expanded

    busy = true
    drawer.classList.remove('is-expanded')

    if (motion.matches) {
      await view.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).finished.catch(() => {})
    } else {
      await view.animate(
        [{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: originRect(origin) }],
        { duration: 560, easing: 'cubic-bezier(.65, 0, .35, 1)' }
      ).finished.catch(() => {})
    }

    view.hidden = true
    if (window.location.hash.startsWith('#cabinet/')) history.replaceState(null, '', '#cabinet')
    try { frame.contentWindow.scrollTo(0, 0) } catch {}
    setPage(false)
    expanded = null
    busy = false
    closeQueued = false
    origin.focus({ preventScroll: true })

    /* A drawer stays out for a moment, then slides back in. */
    if (origin === drawer) closeTimer = setTimeout(() => { if (!drawer.matches(':hover')) close(drawer) }, motion.matches ? 0 : 320)
  }

  /* Back puts the project away, and Forward brings it out again. */
  window.addEventListener('popstate', () => {
    const id = history.state?.cabinet

    if (expanded && !id) collapse()
    else if (!expanded && id && drawers.has(id)) expand(id, { instant: true })
  })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) requestClose()
  })

  /* A link straight to a project opens it at once. */
  const linked = window.location.hash.match(/^#cabinet\/(.+)$/)

  if (linked && drawers.has(linked[1])) {
    section.scrollIntoView()
    expand(linked[1], { instant: true })
  }

  /* The project page's own buttons and the desk badges call this. */
  window.DrawerCabinet = {
    close: requestClose,
    open: (id, origin) => { if (drawers.has(id)) expand(id, { origin }) },
  }
})()
