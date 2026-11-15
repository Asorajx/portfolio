/* =========================
   Project Book Rendering
   ========================= */

/* Stack Size */
const stackSize = 2

/* Small helper to avoid repeating createElement/className/textContent setup. */
const makeElement = (tag, className, text = '') => {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text
  return element
}

/* Spine */
function createSpine(project, number) {
  const spine = makeElement('span', 'book-spine')
  const label = makeElement('span', 'spine-label')
  const title = makeElement('span', 'spine-title', project.bookTitle || project.title)
  const team = project.team === 'group' ? 'group' : 'solo'
  if (project.featured) title.append(makeElement('span', 'project-featured-star', '✦'))
  label.append(makeElement('span', 'spine-type', project.type), title)
  spine.append(
    makeElement('span', 'spine-number', number),
    label,
    makeElement('span', `spine-team spine-team--${team}`, team === 'group' ? 'Group' : 'Solo'),
  )
  return spine
}

/* Peek Note */
function createPeek(project) {
  const peek = makeElement('span', 'spine-peek')
  peek.append(makeElement('span', 'spine-peek-focus', project.focus || project.summary || ''))
  return peek
}

/* Build one accessible project book and store popup data on its dataset. */
function createProjectCard(project, index) {
  const number = String(index + 1).padStart(2, '0')
  const size = project.bookSize || 'regular'
  const featuredClass = project.featured ? ' is-featured' : ''
  const card = makeElement(
    'a',
    `project-card book-${size} book-tone-${(index % 8) + 1}${featuredClass}`,
  )

  card.href = `projects.html#${project.id}`
  card.setAttribute('aria-label', `Open ${project.title} project page`)
  Object.assign(card.dataset, { number, ...project })

  const content = makeElement('div', 'book-spine-content')
  const title = makeElement('h3', 'project-book-title')
  const titleText = makeElement('span', '', project.bookTitle || project.title)

  title.appendChild(titleText)

  if (project.featured) {
    title.appendChild(makeElement('span', 'project-featured-star', '✦'))
  }

  content.append(
    makeElement('p', 'project-type', project.type),
    title,
  )
  const header = makeElement('div', 'project-book-header')
  header.append(
    makeElement('span', 'project-number', number),
    makeElement('span', 'project-team', project.team === 'group' ? 'Group' : 'Solo'),
  )

  card.append(
    header,
    content,
    makeElement('span', 'project-view', 'Open'),
  )
  card.classList.add('is-spine')
  card.prepend(createSpine(project, number))
  card.append(createPeek(project))
  return card
}

/* Create one wooden shelf row and its inner book container. */
function createShelfRow() {
  const row = makeElement('div', 'shelf-row')
  const books = makeElement('div', 'shelf-books')
  row.appendChild(books)
  return { row, books }
}

/* Shelf Sprites */
function addShelfSprites(container) {
  const sprites = makeElement('div', 'shelf-sprites')
  sprites.setAttribute('aria-hidden', 'true')
  ;['slime', 'mushroom', 'potion'].forEach(name => {
    const sprite = makeElement('img', `shelf-sprite shelf-sprite--${name}`)
    sprite.src = `assets/shelf/${name}.svg`
    sprite.alt = ''
    sprites.appendChild(sprite)
  })
  container.querySelector('.shelf-row .shelf-books')?.appendChild(sprites)
}

/* Shelf Props */
function addShelfProps(container) {
  const props = makeElement('div', 'shelf-props')
  props.setAttribute('aria-hidden', 'true')
  ;['mortar', 'bottle-gold', 'bottle-violet'].forEach(name => {
    const prop = makeElement('img', `shelf-sprite shelf-sprite--${name}`)
    prop.src = `assets/shelf/${name}.svg`
    prop.alt = ''
    props.appendChild(prop)
  })
  container.querySelector('.shelf-row:last-child .shelf-books')?.appendChild(props)
}

/* Spine Shelves */
function renderSpineShelves(container) {
  const compactWidth = window.matchMedia('(max-width: 1060px)')
  if (!container.dataset.repackOnResize) {
    container.dataset.repackOnResize = 'true'
    compactWidth.addEventListener('change', () => renderProjects(container))
  }
  const projects = window.portfolioProjects
  const stacks = []

  for (let start = 0; start < projects.length; start += stackSize) {
    const stack = makeElement('div', 'book-stack')
    projects.slice(start, start + stackSize).forEach((project, offset) => {
      stack.appendChild(createProjectCard(project, start + offset))
    })
    stacks.push(stack)
  }

  const stacksPerShelf = compactWidth.matches ? 1 : 2
  for (let start = 0; start < stacks.length; start += stacksPerShelf) {
    const shelf = createShelfRow()
    shelf.books.append(...stacks.slice(start, start + stacksPerShelf))
    container.appendChild(shelf.row)
  }
  addShelfSprites(container)
  addShelfProps(container)
}

/* Render Projects */
function renderProjects(container) {
  if (!container) return
  container.replaceChildren()
  container.classList.add('is-spine-layout')
  renderSpineShelves(container)
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
