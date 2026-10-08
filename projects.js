/* =========================
   Project Detail Data
   ========================= */

const projectDetails = [
  {
    id: 'secure-data-sharing',
    featured: true,
    shortTitle: 'Mosaic',
    type: 'Full-Stack Development',
    title: 'Mosaic',
    summary: 'Secure Data Sharing Platform for Collaborative Research · Final Year Capstone Project.',
    date: 'July 2026 - Present',
    focus: 'Secure collaboration',
    description: 'A secure research collaboration platform designed for controlled data sharing and privacy protection. Collaborated in a 5-member team to design and implement the system.',
    extra: 'Nothing for now...',
    documentation: '',
    github: 'https://github.com/fyp-26-s3-07/secure-data-sharing-platform',
    hasDemo: true,
    demo: '',
    liveDemo: '',
  },
  {
    id: 'honeypot',
    featured: false,
    shortTitle: 'Honeypot',
    type: 'Cybersecurity',
    title: 'Honeypot Simulation',
    summary: 'Simulated honeypot environment using Cowrie.',
    date: 'August 2026',
    focus: 'SSH attack analysis',
    description: 'A cybersecurity project using a honeypot server to capture, monitor, and analyse malicious SSH access attempts.',
    extra: 'Nothing for now...',
    documentation: 'https://github.com/Asorajx/honeypot-simulation/blob/main/P01-honeypot-simulation.pdf',
    github: 'https://github.com/Asorajx/honeypot-simulation',
    hasDemo: false,
    demo: '',
    liveDemo: '',
  },
  {
    id: 'writepretty',
    featured: false,
    shortTitle: 'WritePretty',
    type: 'Web Application',
    title: 'WritePretty',
    summary: 'Rule-based text cleanup and formatting tool.',
    date: 'September 2026',
    focus: 'Text cleanup',
    description: 'A lightweight client-side writing cleanup tool with configurable formatting rules, optional Markdown cleanup, browser-based spellcheck, History Mode, and local autosave without AI rewriting.',
    extra: 'Nothing for now...',
    documentation: 'https://github.com/Asorajx/writepretty/blob/main/P02-write-pretty.pdf',
    github: 'https://github.com/Asorajx/writepretty',
    hasDemo: true,
    demo: 'assets/demos/WritePretty-Demo.mp4',
    liveDemo: 'https://asorajx.github.io/writepretty/',
  },
  {
    id: 'loop',
    featured: false,
    shortTitle: 'LOOP',
    type: 'Web Application',
    title: 'LOOP',
    summary: 'Interactive visualizer for learning Python OOP.',
    date: 'October 2026',
    focus: 'Python OOP learning',
    description: 'An interactive Python OOP visualizer that uses scenario-based simulations to show method execution, object interactions, state changes, inheritance, and source code in real time.',
    extra: 'Nothing for now...',
    documentation: '',
    github: 'https://github.com/Asorajx/LOOP',
    hasDemo: true,
    demo: 'assets/demos/LOOP-Demo.mp4',
    liveDemo: 'https://loop-duzg.onrender.com/',
  },
]


/* =========================
   Project Collection
   ========================= */

;(function setupProjectCollection() {
  const tabs = [...document.querySelectorAll('[data-project-tab]')]
  const content = document.getElementById('projectContent')

  if (!tabs.length || !content) return

  const fields = {
    type: document.getElementById('projectType'),
    featuredStatus: document.getElementById('projectFeaturedStatus'),
    title: document.getElementById('projectTitle'),
    summary: document.getElementById('projectSummary'),
    date: document.getElementById('projectDate'),
    recordType: document.getElementById('projectRecordType'),
    focus: document.getElementById('projectFocus'),
    description: document.getElementById('projectDescription'),
    extra: document.getElementById('projectExtra'),
    documentation: document.getElementById('projectDocumentation'),
    demoSection: document.getElementById('projectDemoSection'),
    demoFrame: document.querySelector('.project-demo-frame'),
    github: document.getElementById('projectGithub'),
    liveDemo: document.getElementById('projectDemo'),
  }

  let switchTimer

  /* Find the requested project, or fall back to the first one. */
  function getProject(projectId) {
    return (
      projectDetails.find(project => project.id === projectId) ||
      projectDetails[0]
    )
  }

  /* Update the page content for the selected project. */
  function showProject(projectId, updateHash = true) {
    const project = getProject(projectId)

    clearTimeout(switchTimer)
    content.classList.add('is-switching')

    switchTimer = setTimeout(() => {
      fields.type.textContent = project.type
      fields.featuredStatus.hidden = !project.featured
      fields.title.textContent = project.title
      fields.summary.textContent = project.summary
      fields.date.textContent = project.date
      fields.recordType.textContent = project.type
      fields.focus.textContent = project.focus
      fields.description.textContent = project.description
      fields.extra.textContent = project.extra || ''
      fields.extra.hidden = !project.extra

      /* Show the PDF link only when the project has a documentation URL. */
      fields.documentation.hidden = !project.documentation
      if (project.documentation) fields.documentation.href = project.documentation
      fields.github.href = project.github
      fields.demoSection.hidden = !project.hasDemo

      /* Demo Preview */
      if (project.hasDemo) {
        if (project.demo) {
          /* Recreate controls when a different project is selected. */
          fields.demoFrame.replaceChildren(window.DemoVideo.create(project.demo, `${project.title} demonstration`))
        } else {
          fields.demoFrame.innerHTML = `
            <div class="project-demo-placeholder">
              <span>No preview currently available</span>
              <p>A preview for this project may be added later.</p>
            </div>
          `
        }
      }

      /* Live Demo in external website button. */
      if (project.liveDemo) {
        fields.liveDemo.outerHTML = `
          <a
            id="projectDemo"
            class="project-detail-button project-detail-button--primary"
            href="${project.liveDemo}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Live demo <span aria-hidden="true">↗</span>
          </a>
        `
      } else if (project.hasDemo) {
        fields.liveDemo.outerHTML = `
          <span
            id="projectDemo"
            class="project-detail-button project-detail-button--primary is-disabled"
            aria-disabled="true"
          >
            Live demo unavailable
          </span>
        `
      } else {
        fields.liveDemo.outerHTML = `
          <span id="projectDemo" hidden></span>
        `
      }

      fields.liveDemo = document.getElementById('projectDemo')

      tabs.forEach(tab => {
        const selected = tab.dataset.projectTab === project.id
        tab.classList.toggle('is-active', selected)
        tab.setAttribute('aria-selected', String(selected))
      })

      document.title = `${project.shortTitle} | Jun Xiang`

      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.content = `Project details for ${project.title} by Jun Xiang.`
      }

      if (updateHash) {
        history.replaceState(null, '', `#${project.id}`)
      }

      content.classList.remove('is-switching')
    }, 110)
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showProject(tab.dataset.projectTab)
    })

    /* Arrow keys move between project tabs. */
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return

      event.preventDefault()
      const currentIndex = tabs.indexOf(tab)
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
      const nextTab = tabs[nextIndex]

      nextTab.focus()
      showProject(nextTab.dataset.projectTab)
    })
  })

  /* Only project IDs should change the selected project. */
  window.addEventListener('hashchange', () => {
    const projectId = window.location.hash.slice(1)
    if (projectDetails.some(project => project.id === projectId)) {
      showProject(projectId, false)
    }
  })

  /* Scroll without changing the project URL or triggering the tab switcher. */
  document.getElementById('projectBackToTop')?.addEventListener('click', event => {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  showProject(window.location.hash.slice(1), !window.location.hash)
})()