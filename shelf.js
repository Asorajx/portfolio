/* =========================
   Project Book Rendering
   ========================= */

/* Relative widths used when deciding how many books fit on one shelf row. */
const bookUnits = { slim: 1, regular: 2, wide: 3 }

/* Small helper to avoid repeating createElement/className/textContent setup. */
const makeElement = (tag, className, text = '') => {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text
  return element
}

/* Build one accessible project book and store popup data on its dataset. */
function createProjectCard(project, index) {
  const number = String(index + 1).padStart(2, '0')
  const size = project.bookSize || 'regular'
  const featuredClass = project.featured ? ' is-featured' : ''
  const card = makeElement(
    'a',
    `project-card book-${size} book-tone-${(index % 4) + 1}${featuredClass}`,
  )

  card.href = `projects.html#${project.id}`
  card.setAttribute('aria-label', `Open ${project.title} project page`)
  Object.assign(card.dataset, { number, ...project })

  const content = makeElement('div', 'book-spine-content')
  const title = makeElement('h3', 'project-book-title')
  const titleText = makeElement('span', '', project.spineTitle || project.title)

  title.appendChild(titleText)

  if (project.featured) {
    title.appendChild(makeElement('span', 'project-featured-star', '✦'))
  }

  content.append(
    makeElement('p', 'project-type', project.type),
    title,
  )
  card.append(
    makeElement('span', 'project-number', number),
    content,
    makeElement('span', 'project-view', 'Open'),
  )
  return card
}

/* Create one wooden shelf row and its inner book container. */
function createShelfRow() {
  const row = makeElement('div', 'shelf-row')
  const books = makeElement('div', 'shelf-books')
  row.appendChild(books)
  return { row, books }
}

/* Pack books into shelf rows according to their configured size. */
function renderProjects(container) {
  if (!container) return
  container.replaceChildren()

  const capacity = 6
  let used = 0
  let shelf = createShelfRow()
  container.appendChild(shelf.row)

  window.portfolioProjects.forEach((project, index) => {
    const units = bookUnits[project.bookSize] || bookUnits.regular
    if (used && used + units > capacity) {
      shelf = createShelfRow()
      container.appendChild(shelf.row)
      used = 0
    }
    shelf.books.appendChild(createProjectCard(project, index))
    used += units
  })
}

/* Share project rendering and featured entries with the page scripts. */
window.ProjectManager = {
  render: renderProjects,
  getFeatured: () => window.portfolioProjects.filter(project => project.featured),
}

/* =========================
   Hanging Sign
   ========================= */

;(function setupHangingSign() {
  const sign = document.querySelector('.bookshelf-sign')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!sign) return

  let offset = 0
  let velocity = 0
  let previousX = null
  let frame = 0

  function settle() {
    velocity = (velocity - offset * .025) * .94
    offset += velocity
    const chainHeight = parseFloat(getComputedStyle(sign, '::before').height) || 45
    sign.style.setProperty('--sign-offset', `${offset}px`)
    sign.style.setProperty('--chain-angle', `${Math.atan(offset / chainHeight)}rad`)
    sign.style.setProperty('--sign-tilt', `${Math.max(-9, Math.min(9, velocity * 5))}deg`)

    if (Math.abs(offset) < .03 && Math.abs(velocity) < .03) {
      offset = 0
      velocity = 0
      sign.style.removeProperty('--sign-offset')
      sign.style.removeProperty('--chain-angle')
      sign.style.removeProperty('--sign-tilt')
      frame = 0
      return
    }
    frame = requestAnimationFrame(settle)
  }

  sign.addEventListener('pointermove', event => {
    if (motion.matches || event.pointerType === 'touch') return
    if (previousX !== null) velocity = Math.max(-2, Math.min(2, velocity + (event.clientX - previousX) * .08))
    previousX = event.clientX
    if (!frame) frame = requestAnimationFrame(settle)
  })
  sign.addEventListener('pointerleave', () => { previousX = null })
  motion.addEventListener('change', event => {
    if (!event.matches) return
    cancelAnimationFrame(frame)
    frame = 0
    offset = 0
    velocity = 0
    previousX = null
    sign.style.removeProperty('--sign-offset')
    sign.style.removeProperty('--chain-angle')
    sign.style.removeProperty('--sign-tilt')
  })
})()
