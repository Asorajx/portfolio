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
  window.stackProjectTabs(tabs, projectDetails)
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
    reason: document.getElementById('projectReason'),
    documentation: document.getElementById('projectDocumentation'),
    demoSection: document.getElementById('projectDemoSection'),
    demoFrame: document.getElementById('projectDemoSection')?.querySelector('.project-demo-frame'),
    oldDemo: document.getElementById('projectOldDemo'),
    thenNowNote: document.getElementById('projectThenNowNote'),
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
      fields.reason.textContent = project.reason

      /* Links */
      if (project.liveDemo) fields.liveDemo.href = project.liveDemo
      if (project.documentation) fields.documentation.href = project.documentation
      if (project.github) fields.github.href = project.github

      /* Demo Preview */
      if (project.hasVideoDemo) {
        fields.demoFrame.classList.toggle('has-video', !!project.videoDemo)
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

      /* Then & Now */
      if (project.oldDemo) {
        /* Same custom player as the main demo, rebuilt when a project is selected. */
        fields.oldDemo.replaceChildren(window.DemoVideo.create(project.oldDemo, `${project.title} earlier demonstration`))
      } else if (project.oldImage) {
        const image = document.createElement('img')
        image.src = project.oldImage
        image.alt = `${project.title} earlier version`
        image.loading = 'lazy'
        fields.oldDemo.replaceChildren(image)
      } else {
        fields.oldDemo.replaceChildren()
      }
      fields.oldDemo.classList.toggle('project-old-demo--image', !project.oldDemo && !!project.oldImage)
      fields.thenNowNote.textContent = project.thenNowNote || ''
      fields.thenNowNote.hidden = !project.thenNowNote

      /* Optional Sections */
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
