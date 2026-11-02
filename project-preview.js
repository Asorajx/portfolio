/* =========================
   Shared Project Preview
   ========================= */

/* Builds the open book's page preview from the real projects.html,
   with text replaced by placeholders and media removed. */
;(function setupSharedProjectPreview() {
  /* Runs only on the page with the bookshelf. */
  if (!document.getElementById('projectOverlay')) return

  /* Loads projects.html as plain HTML; its scripts and videos do not run. */
  const sourcePromise = fetch('projects.html', { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Could not read projects.html')
      return response.text()
    })
    .then(html => new DOMParser().parseFromString(html, 'text/html'))
    .catch(() => null)

  /* Copies the page header and project section into a preview element. */
  function createSkeleton(source) {
    const pageHeader = source.querySelector('.site-header')
    const projectPage = source.querySelector('article.project-detail')
    if (!pageHeader || !projectPage) return null

    const preview = document.createElement('div')
    const viewport = document.createElement('div')
    preview.className = 'project-page-skeleton project-page-skeleton--shared'
    preview.setAttribute('aria-hidden', 'true')
    viewport.className = 'project-page-skeleton__viewport'

    const header = pageHeader.cloneNode(true)
    const article = projectPage.cloneNode(true)
    const switcher = article.querySelector('.project-switcher')

    /* Rebuilds the project switcher tabs from project-data.js. */
    if (switcher && window.portfolioProjects?.length) {
      const offsets = [-4, 6, -1]
      const featuredColumns = Math.ceil(window.portfolioProjects.filter(project => project.featured).length / 3)
      let featuredIndex = 0
      let otherIndex = 0
      switcher.replaceChildren(...window.portfolioProjects.map((project, index) => {
        const tab = document.createElement('span')
        tab.className = `project-switcher-card project-switcher-card--${index % 8 + 1}`
        tab.classList.toggle('is-featured', !!project.featured)
        tab.dataset.projectTab = project.id
        const stackIndex = project.featured ? featuredIndex++ : otherIndex++
        tab.style.setProperty('--book-x', `${offsets[stackIndex % offsets.length]}px`)
        tab.style.gridColumn = String((project.featured ? 1 : featuredColumns + 1) + Math.floor(stackIndex / 3))
        tab.style.gridRow = String(3 - stackIndex % 3)
        const number = document.createElement('span')
        number.className = 'project-switcher-number'
        number.textContent = String(index + 1).padStart(2, '0')
        const title = document.createElement('strong')
        title.textContent = project.shortTitle || project.title
        tab.append(number, title)
        return tab
      }))
    }

    /* Removes images, videos and embeds so nothing is downloaded. */
    article.querySelectorAll('img, picture, video, iframe, audio, source').forEach(media => media.remove())
    const demo = article.querySelector('.project-demo-frame')
    if (demo) {
      demo.replaceChildren()
      const placeholder = document.createElement('span')
      placeholder.className = 'project-preview-media-placeholder skeleton-line'
      demo.append(placeholder)
    }

    /* Moves IDs to data attributes and disables links and buttons in the copy. */
    for (const element of [header, article]) {
      element.querySelectorAll('[id]').forEach(item => {
        item.dataset.sourceId = item.id
        item.removeAttribute('id')
      })
      element.querySelectorAll('a').forEach(link => link.removeAttribute('href'))
      element.querySelectorAll('button, input').forEach(control => {
        control.tabIndex = -1
        control.disabled = true
      })
    }
    viewport.append(header, article)
    preview.append(viewport)
    return preview
  }

  /* Scales the full-size layout down to the width of the book page. */
  function sizeBookPreview(preview) {
    if (!preview || !preview.closest('.popup-back')) return
    /* Laid out at screen width, so the zoomed-in page matches the real one. */
    const documentWidth = innerWidth
    const pageWidth = preview.clientWidth
    if (!pageWidth) return
    preview.style.setProperty('--preview-document-width', `${documentWidth}px`)
    preview.style.setProperty('--preview-scale', String(pageWidth / documentWidth))
  }

  /* Fills the preview with a project's details and shows only its sections. */
  function setProject(preview, project) {
    if (!preview || !project) return

    const assign = (id, value) => {
      const element = preview.querySelector(`[data-source-id="${id}"]`)
      if (element && value != null) element.textContent = value
    }

    assign('projectTitle', project.title)
    assign('projectType', project.type)
    assign('projectSummary', project.summary)
    assign('projectDate', project.date)
    assign('projectRecordType', project.type)
    assign('projectFocus', project.focus)
    assign('projectDescription', project.description)
    assign('projectExtra', project.extra || '')

    const featured = preview.querySelector('[data-source-id="projectFeaturedStatus"]')
    if (featured) featured.hidden = !project.featured

    /* Same section rules as projects.js (from project-data.js). */
    window.syncProjectSections(preview, project)

    preview.querySelectorAll('.project-switcher-card').forEach(tab => {
      tab.classList.toggle('is-active', tab.dataset.projectTab === project.id)
    })
  }

  /* Puts the preview inside the book page and the full-screen zoom layer. */
  function upgradeBook(source) {
    const overlay = document.getElementById('projectOverlay')
    const back = overlay?.querySelector('.popup-back')
    const zoom = overlay?.querySelector('.project-zoom-surface')
    const skeleton = source && back && zoom ? createSkeleton(source) : null
    if (!skeleton) return

    const activeProject = window.portfolioProjects?.find(project => project.id === overlay.dataset.projectId)
    if (activeProject) setProject(skeleton, activeProject)
    back.replaceChildren(skeleton)
    zoom.replaceChildren(skeleton.cloneNode(true))
    sizeBookPreview(skeleton)
  }

  sourcePromise.then(upgradeBook)

  window.ProjectSkeleton = {
    /* Used by the shelf animation in script.js. */
    setProject,
    sizeBookPreview,
  }
  addEventListener('resize', () => {
    sizeBookPreview(document.querySelector('.popup-back .project-page-skeleton--shared'))
  })
})()
