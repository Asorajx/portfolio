/* =========================
   Project Detail Data
   ========================= */

const projectDetails = window.portfolioProjects



/* =========================
   Project Collection
   ========================= */

;(function setupProjectCollection() {
  const switcher = document.querySelector('.project-switcher')
  const content = document.getElementById('projectContent')

  if (!switcher || !content || !projectDetails.length) return

  /* Build the collection from the same data used by the bookshelf. */
  const offsets = [-4, 6, -1]
  const featuredColumns = Math.ceil(projectDetails.filter(project => project.featured).length / 3)
  let featuredIndex = 0
  let otherIndex = 0
  const tabs = projectDetails.map((project, index) => {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = `project-switcher-card project-switcher-card--${index % 8 + 1}`
    tab.classList.toggle('is-featured', !!project.featured)
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-selected', 'false')
    tab.setAttribute('aria-controls', 'projectContent')
    tab.tabIndex = -1
    tab.dataset.projectTab = project.id
    const stackIndex = project.featured ? featuredIndex++ : otherIndex++
    tab.style.setProperty('--book-x', `${offsets[stackIndex % offsets.length]}px`)
    const firstColumn = project.featured ? 1 : featuredColumns + 1
    tab.style.gridColumn = String(firstColumn + Math.floor(stackIndex / 3))
    tab.style.gridRow = String(3 - stackIndex % 3)

    const number = document.createElement('span')
    number.className = 'project-switcher-number'
    number.textContent = String(index + 1).padStart(2, '0')
    const title = document.createElement('strong')
    title.className = 'project-switcher-title'
    title.textContent = project.shortTitle || project.title
    if (project.featured) {
      const star = document.createElement('span')
      star.className = 'project-switcher-featured'
      star.setAttribute('aria-hidden', 'true')
      star.textContent = '✦'
      title.append(' ', star)
    }
    tab.append(number, title)
    return tab
  })
  switcher.replaceChildren(...tabs)

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

  /* Only the selected tab belongs in the normal keyboard tab order. */
  function updateTabSelection(projectId) {
    tabs.forEach(tab => {
      const selected = tab.dataset.projectTab === projectId
      tab.classList.toggle('is-active', selected)
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
    })
  }

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

      /* Show the PDF link only when the project has a documentation URL. */
      if (project.documentation) fields.documentation.href = project.documentation
      fields.github.href = project.github

      /* Demo Preview */
      if (project.hasVideoDemo) {
        if (project.videoDemo) {
          /* Recreate controls when a different project is selected. */
          fields.demoFrame.replaceChildren(window.DemoVideo.create(project.videoDemo, `${project.title} demonstration`))
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
      } else if (project.hasVideoDemo) {
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

      /* Shows only the sections this project has. */
      window.syncProjectSections(content, project)

      updateTabSelection(project.id)

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

    /* Arrow keys cycle through books; Home and End reach either end. */
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
      if (!keys.includes(event.key)) return

      event.preventDefault()
      const currentIndex = tabs.indexOf(tab)
      let nextIndex = currentIndex

      if (event.key === 'Home') nextIndex = 0
      if (event.key === 'End') nextIndex = tabs.length - 1
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length

      const nextTab = tabs[nextIndex]
      nextTab.focus()
      updateTabSelection(nextTab.dataset.projectTab)
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

  updateTabSelection(getProject(window.location.hash.slice(1)).id)
  showProject(window.location.hash.slice(1), !window.location.hash)
})()
