/* =========================
   Project Data
   ========================= */

/* Each object stores the information for one project. */
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

/* Creates one project card using information from the projects array. */
/* The index is used to generate the project's display number. */
function createProjectCard(project, index) {
  const card = document.createElement('article')

  /* Convert the project position into a two-digit number. */
  /* For example, index 0 becomes "01". */
  const number = String(index + 1).padStart(2, '0')

  /* Set up the main project card. */
  card.className = 'project-card'
  card.tabIndex = 0
  card.setAttribute('role', 'button')
  card.setAttribute('aria-label', `Open ${project.title}`)

  /* Store the project information inside the card. */
  /* The popup can read these values later when the card is opened. */
  card.dataset.number = number
  card.dataset.type = project.type
  card.dataset.title = project.title
  card.dataset.summary = project.summary
  card.dataset.date = project.date
  card.dataset.description = project.description
  card.dataset.github = project.github

  /* Create the project number shown on the card. */
  const projectNumber = document.createElement('span')
  projectNumber.className = 'project-number'
  projectNumber.textContent = number

  /* Create a container for the main project information. */
  const content = document.createElement('div')

  /* Create the project type. */
  const projectType = document.createElement('p')
  projectType.className = 'project-type'
  projectType.textContent = project.type

  /* Create the project title. */
  const title = document.createElement('h3')
  title.textContent = project.title

  /* Create the short project summary. */
  const summary = document.createElement('p')
  summary.className = 'project-summary'
  summary.textContent = project.summary

  /* Place the project information inside the content container. */
  content.append(projectType, title, summary)

  /* Create the label that tells the user the card can be opened. */
  const view = document.createElement('span')
  view.className = 'project-view'
  view.textContent = 'View project →'

  /* Combine all parts to form the complete project card. */
  card.append(projectNumber, content, view)

  /* Return the completed card so it can be added to the page. */
  return card
}


/* =========================
   Project Rendering
   ========================= */

/* Displays all project cards inside the given container. */
function renderProjects(container) {
  /* Stop the function if the project container cannot be found. */
  if (!container) {
    return
  }

  /* Remove any existing project cards before rendering them again. */
  container.replaceChildren()

  /* Go through every project in the projects array. */
  /* Create a card for each project and add it to the container. */
  projects.forEach((project, index) => {
    container.appendChild(createProjectCard(project, index))
  })
}


/* =========================
   Project Manager
   ========================= */

/* Make the render function available for script.js to use. */
/* The other functions remain inside this file and are not exposed globally. */
window.ProjectManager = {
  render: renderProjects,
}