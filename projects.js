/* =========================
   Project Data
   ========================= */

/* Each object stores the information needed to display one project. */
/* Add another object to this array when adding a new project. */
const projects = [
  {
    type: 'Full-Stack Development',
    title: 'Secure Data Sharing Platform for Collaborative Research',
    spineTitle: 'Secure Data Sharing',
    summary: 'Final Year Capstone Project.',
    date: 'July 2026 - Present',
    description: 'A secure research collaboration platform designed for controlled data sharing and privacy protection. Collaborated in a 5-member team to design and implement the system.',
    github: 'https://github.com/fyp-26-s3-07/secure-data-sharing-platform',
    bookSize: 'wide',
  },
  {
    type: 'Cybersecurity',
    title: 'Honeypot Simulation',
    spineTitle: 'Honeypot Simulation',
    summary: 'Simulated honeypot environment using Cowrie.',
    date: 'August 2026',
    description: 'A cybersecurity project using a honeypot server to capture, monitor, and analyse malicious SSH access attempts.',
    github: 'https://github.com/Asorajx/honeypot-simulation',
    bookSize: 'wide',
  },
  {
    type: 'Web Application',
    title: 'WritePretty',
    spineTitle: 'WritePretty',
    summary: 'Rule-based text cleanup and formatting tool.',
    date: 'September 2026',
    description: 'A lightweight client-side writing cleanup tool with configurable formatting rules, optional Markdown cleanup, browser-based spellcheck, History Mode, and local autosave without AI rewriting.',
    github: 'https://github.com/Asorajx/writepretty',
    bookSize: 'regular',
  },
  {
    type: 'Web Application',
    title: 'LOOP',
    spineTitle: 'LOOP',
    summary: 'Interactive visualizer for learning Python OOP.',
    date: 'October 2026',
    description: 'An interactive Python OOP visualizer that uses scenario-based simulations to show method execution, object interactions, state changes, inheritance, and source code in real time.',
    github: 'https://github.com/Asorajx/LOOP',
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
  const card = makeElement('article', `project-card book-${size} book-tone-${(index % 4) + 1}`)

  card.tabIndex = 0
  card.setAttribute('role', 'button')
  card.setAttribute('aria-label', `Open ${project.title}`)
  Object.assign(card.dataset, { number, ...project })

  const content = makeElement('div', 'book-spine-content')
  content.append(
    makeElement('p', 'project-type', project.type),
    makeElement('h3', '', project.spineTitle || project.title),
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