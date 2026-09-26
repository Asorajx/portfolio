/* =========================
   Project Data
   ========================= */

/* Each object stores the information needed to display one project. */
/* Add another object to this array when adding a new project. */
const projects = [
  {
    type: 'Web Development',
    title: 'Secure Data Sharing Platform for Collaborative Research',
    summary: 'Final Year Capstone Project.',
    date: 'July 2026 - Present',
    description:
      'A secure research collaboration platform designed for controlled data sharing and privacy protection. '
      + 'Collaborated in a 5-member team to design and implement the system.',
    github: 'https://github.com/fyp-26-s3-07/secure-data-sharing-platform',
  },
  {
    type: 'Cybersecurity',
    title: 'Honeypot Simulation',
    summary: 'Simulated honeypot environment using Cowrie.',
    date: 'August 2026',
    description:
      'A cybersecurity project using a honeypot server to capture, monitor, and analyse malicious SSH access attempts.',
    github: 'https://github.com/Asorajx/P01-honeypot-simulation',
  },
]


/* =========================
   Project Card Creation
   ========================= */

/* Creates one project card from an item in the projects array. */
/* The index is used to generate the project's two-digit display number. */
function createProjectCard(project, index) {
  const card = document.createElement('article')
  const number = String(index + 1).padStart(2, '0')

  /* Set up the project card and make it usable with the keyboard. */
  card.className = 'project-card'
  card.tabIndex = 0
  card.setAttribute('role', 'button')
  card.setAttribute('aria-label', `Open ${project.title}`)

  /* Store project information on the card so the popup can read it later. */
  card.dataset.number = number
  card.dataset.type = project.type
  card.dataset.title = project.title
  card.dataset.summary = project.summary
  card.dataset.date = project.date
  card.dataset.description = project.description
  card.dataset.github = project.github

  /* Create the visible project information. */
  const projectNumber = document.createElement('span')
  projectNumber.className = 'project-number'
  projectNumber.textContent = number

  const content = document.createElement('div')

  const projectType = document.createElement('p')
  projectType.className = 'project-type'
  projectType.textContent = project.type

  const title = document.createElement('h3')
  title.textContent = project.title

  const summary = document.createElement('p')
  summary.className = 'project-summary'
  summary.textContent = project.summary

  content.append(projectType, title, summary)

  const view = document.createElement('span')
  view.className = 'project-view'
  view.textContent = 'View project'

  /* Combine all parts into the completed card. */
  card.append(projectNumber, content, view)

  return card
}


/* =========================
   Project Rendering
   ========================= */

/* Creates and displays all project cards inside the given container. */
function renderProjects(container) {
  /* Stop if the project container cannot be found. */
  if (!container) {
    return
  }

  /* Clear existing cards before rendering the current project list. */
  container.replaceChildren()

  projects.forEach((project, index) => {
    container.appendChild(createProjectCard(project, index))
  })
}


/* =========================
   Project Manager
   ========================= */

/* Expose only the render function so script.js can display the projects. */
window.ProjectManager = {
  render: renderProjects,
}