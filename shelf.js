/* =========================
   Project Data
   ========================= */

/* Each object stores the information needed to display one project. */

/* Add another object to this array when adding a new project. */
const projects = [
  {
    id: 'secure-data-sharing',
    type: 'Full-Stack Development',
    title: 'Mosaic',
    spineTitle: 'Mosaic',
    summary: 'Secure Data Sharing Platform for Collaborative Research · Final Year Capstone Project.',
    preview: 'A secure platform for controlled research data sharing and privacy protection.',
    page: 'projects.html#secure-data-sharing',
    bookSize: 'wide',
    featured: true,
  },
  {
    id: 'honeypot',
    type: 'Cybersecurity',
    title: 'Honeypot Simulation',
    spineTitle: 'Honeypot Simulation',
    summary: 'Simulated honeypot environment using Cowrie.',
    preview: 'A Cowrie honeypot environment for capturing and analysing malicious SSH activity.',
    page: 'projects.html#honeypot',
    bookSize: 'wide',
  },
  {
    id: 'writepretty',
    type: 'Web Application',
    title: 'WritePretty',
    spineTitle: 'WritePretty',
    summary: 'Rule-based text cleanup and formatting tool.',
    preview: 'A client-side writing cleanup tool with configurable formatting and local autosave.',
    page: 'projects.html#writepretty',
    bookSize: 'regular',
  },
  {
    id: 'loop',
    type: 'Web Application',
    title: 'LOOP',
    spineTitle: 'LOOP',
    summary: 'Interactive visualizer for learning Python OOP.',
    preview: 'An interactive visualizer for exploring Python OOP execution, state, and inheritance.',
    page: 'projects.html#loop',
    bookSize: 'regular',
  },
]


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

  card.href = project.page
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

  projects.forEach((project, index) => {
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

/* Expose only the render function to script.js. */
window.ProjectManager = { render: renderProjects }
