/* =========================
   Shared Project Preview
   ========================= */

/* Book Page Preview */
;(function setupSharedProjectPreview() {
  /* Bookshelf Page Only */
  if (!document.getElementById('projectOverlay')) return

  /* Fetch Projects Page */
  const sourcePromise = fetch('projects.html', { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Could not read projects.html')
      return response.text()
    })
    .then(html => new DOMParser().parseFromString(html, 'text/html'))
    .catch(() => null)

  /* Create Skeleton */
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

    /* Project Switcher Tabs */
    if (switcher && window.portfolioProjects?.length) {
      const tabs = window.portfolioProjects.map((project, index) => {
        const tab = document.createElement('span')
        tab.className = `project-switcher-card project-switcher-card--${index % 8 + 1}`
        tab.classList.toggle('is-featured', !!project.featured)
        tab.dataset.projectTab = project.id
        const number = document.createElement('span')
        number.className = 'project-switcher-number'
        number.textContent = String(index + 1).padStart(2, '0')
        const title = document.createElement('strong')
        title.textContent = project.shortTitle || project.title
        tab.append(number, title)
        return tab
      })
      window.stackProjectTabs(tabs, window.portfolioProjects)
      switcher.replaceChildren(...tabs)
    }

    /* Remove Media */
    article.querySelectorAll('img, picture, video, iframe, audio, source').forEach(media => media.remove())
    article.querySelectorAll('.project-demo-frame, .project-old-demo').forEach(area => area.replaceChildren())

    /* Disable IDs and Controls */
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

  /* Book Preview Size */
  function sizeBookPreview(preview) {
    if (!preview || !preview.closest('.popup-back')) return
    /* Screen-Width Layout */
    const documentWidth = innerWidth
    const pageWidth = preview.clientWidth
    if (!pageWidth) return
    preview.style.setProperty('--preview-document-width', `${documentWidth}px`)
    preview.style.setProperty('--preview-scale', String(pageWidth / documentWidth))
  }

  /* Video Placeholder */
  function createVideoPlaceholder() {
    const placeholder = document.createElement('div')
    const mark = document.createElement('span')
    const controls = document.createElement('span')
    placeholder.className = 'project-preview-video'
    mark.className = 'project-preview-video__mark'
    controls.className = 'project-preview-video__controls'
    placeholder.append(mark, controls)
    return placeholder
  }

  /* Empty Placeholder */
  function createEmptyPlaceholder() {
    const placeholder = document.createElement('div')
    placeholder.className = 'project-demo-placeholder project-preview-empty'
    placeholder.append(document.createElement('span'), document.createElement('span'))
    return placeholder
  }

  /* Set Project */
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
    assign('projectReason', project.reason)

    const featured = preview.querySelector('[data-source-id="projectFeaturedStatus"]')
    if (featured) featured.hidden = !project.featured

    /* Demo Areas */
    const demoFrame = preview.querySelector('.project-demo-frame')
    if (demoFrame) {
      demoFrame.classList.toggle('has-video', !!project.videoDemo)
      demoFrame.replaceChildren(project.videoDemo ? createVideoPlaceholder() : createEmptyPlaceholder())
    }

    const oldDemo = preview.querySelector('.project-old-demo')
    if (oldDemo) oldDemo.replaceChildren(...(project.oldDemo ? [createVideoPlaceholder()] : []))

    /* Optional Sections */
    window.syncProjectSections(preview, project)

    preview.querySelectorAll('.project-switcher-card').forEach(tab => {
      tab.classList.toggle('is-active', tab.dataset.projectTab === project.id)
    })
  }

  /* Insert Previews */
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
    /* Preview API */
    setProject,
    sizeBookPreview,
  }
  addEventListener('resize', () => {
    sizeBookPreview(document.querySelector('.popup-back .project-page-skeleton--shared'))
  })
})()
