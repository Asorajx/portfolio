/* =========================
   Project Detail Data
   ========================= */

const projectDetails = window.portfolioProjects


/* =========================
   Project Content
   ========================= */

;(function setupProjectContent() {
  const content = document.getElementById('projectContent')

  if (!content || !projectDetails.length) return

  const fields = {
    type: document.getElementById('projectType'),
    featuredStatus: document.getElementById('projectFeaturedStatus'),
    title: document.getElementById('projectTitle'),
    summary: document.getElementById('projectSummary'),
    date: document.getElementById('projectDate'),
    recordType: document.getElementById('projectRecordType'),
    focus: document.getElementById('projectFocus'),
    description: document.getElementById('projectDescription'),
    story: document.getElementById('projectStory'),
    documentation: document.getElementById('projectDocumentation'),
    demoFrame: document.getElementById('projectDemoSection')?.querySelector('.project-demo-frame'),
    oldDemo: document.getElementById('projectOldDemo'),
    thenNowNote: document.getElementById('projectThenNowNote'),
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

  /* Wrap a video or image so each one fills the track width. */
  function createDemoSlide(content) {
    const slide = document.createElement('div')
    slide.className = 'project-demo-slide'
    slide.append(content)

    /* Use a 16:10 box until the real size is known, then follow the media. */
    const settle = () => { slide.style.aspectRatio = 'auto' }
    if (content.tagName === 'IMG') {
      content.complete && content.naturalWidth ? settle() : content.addEventListener('load', settle, { once: true })
    } else {
      content.querySelector('video')?.addEventListener('loadedmetadata', settle, { once: true })
    }
    return slide
  }

  /* Arrows, dots and a counter for the demo track; the frame height follows the current slide. */
  function createDemoControls(track) {
    const slides = [...track.children]
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const controls = document.createElement('div')
    controls.className = 'project-demo-controls'
    controls.innerHTML = `
      <span class="project-demo-count" aria-live="polite"></span>
      <button class="project-demo-arrow project-demo-arrow--previous" type="button" aria-label="Previous preview"><span class="arrow-mark" aria-hidden="true"></span></button>
      <button class="project-demo-arrow project-demo-arrow--next" type="button" aria-label="Next preview"><span class="arrow-mark" aria-hidden="true"></span></button>
      <div class="project-demo-dots"></div>
    `
    const [previous, next] = controls.querySelectorAll('.project-demo-arrow')
    const count = controls.querySelector('.project-demo-count')
    const dots = slides.map((_, index) => {
      const dot = document.createElement('button')
      dot.className = 'project-demo-dot'
      dot.type = 'button'
      dot.setAttribute('aria-label', `Show preview ${index + 1}`)
      dot.addEventListener('click', () => goTo(index))
      return dot
    })
    controls.querySelector('.project-demo-dots').append(...dots)

    function current() {
      return Math.round(track.scrollLeft / track.clientWidth) || 0
    }

    function goTo(index) {
      const target = Math.max(0, Math.min(slides.length - 1, index))
      track.scrollTo({ left: target * track.clientWidth, behavior: motion.matches ? 'auto' : 'smooth' })
    }

    /* Fade the counter out after 2.5 seconds without activity, like the video controls. */
    let idleTimer
    function wakeCount() {
      count.classList.remove('is-idle')
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        if (count.isConnected) count.classList.add('is-idle')
      }, 2500)
    }

    function update() {
      wakeCount()
      const index = Math.min(current(), slides.length - 1)
      track.style.height = `${slides[index].offsetHeight}px`
      count.textContent = `${index + 1} / ${slides.length}`
      previous.disabled = index === 0
      next.disabled = index === slides.length - 1
      dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index)))
    }

    previous.addEventListener('click', () => goTo(current() - 1))
    next.addEventListener('click', () => goTo(current() + 1))
    track.addEventListener('scroll', update, { passive: true })
    ;[track, controls].forEach(area => {
      ;['pointermove', 'pointerdown', 'focusin'].forEach(name => area.addEventListener(name, wakeCount))

      /* A mouse leaving hides the counter at once; touch relies on the timer. */
      area.addEventListener('pointerleave', event => {
        if (event.pointerType === 'touch') return wakeCount()
        clearTimeout(idleTimer)
        count.classList.add('is-idle')
      })
    })
    track.addEventListener('keydown', event => {
      if (event.target !== track) return
      if (event.key === 'ArrowLeft') goTo(current() - 1)
      if (event.key === 'ArrowRight') goTo(current() + 1)
    })

    /* Resize the frame when a slide changes size (media loaded, window resized). */
    const observer = new ResizeObserver(update)
    slides.forEach(slide => observer.observe(slide))
    update()
    return controls
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
      fields.story.textContent = project.story

      /* Links */
      if (project.liveDemo) fields.liveDemo.href = project.liveDemo
      if (project.documentation) fields.documentation.href = project.documentation
      if (project.github) fields.github.href = project.github

      /* Demo Preview */
      if (project.hasDemo) {
        const images = project.demoImages || []
        fields.demoFrame.parentElement.querySelector('.project-demo-controls')?.remove()
        fields.demoFrame.classList.toggle('has-video', !!project.videoDemo)
        if (project.videoDemo || images.length) {
          /* One scrollable track: the video first, then each image. */
          const track = document.createElement('div')
          track.className = 'project-demo-track'
          if (project.videoDemo) {
            /* Recreate controls when a different project is selected. */
            track.append(createDemoSlide(window.DemoVideo.create(project.videoDemo, `${project.title} demonstration`)))
          }
          images.forEach((source, index) => {
            const image = document.createElement('img')
            image.src = source
            image.alt = `${project.title} screenshot ${index + 1}`
            image.className = 'project-zoomable'
            image.tabIndex = 0
            image.setAttribute('role', 'button')
            track.append(createDemoSlide(image))
          })
          fields.demoFrame.replaceChildren(track)
          if (track.children.length > 1) {
            track.tabIndex = 0
            track.setAttribute('role', 'group')
            track.setAttribute('aria-roledescription', 'carousel')
            track.setAttribute('aria-label', `${project.title} previews`)
            fields.demoFrame.after(createDemoControls(track))
          }
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
        image.className = 'project-zoomable'
        image.tabIndex = 0
        image.setAttribute('role', 'button')
        fields.oldDemo.replaceChildren(image)
      } else {
        fields.oldDemo.replaceChildren()
      }
      fields.oldDemo.classList.toggle('project-old-demo--image', !project.oldDemo && !!project.oldImage)
      fields.thenNowNote.textContent = project.thenNowNote || ''
      fields.thenNowNote.hidden = !project.thenNowNote

      /* Optional Sections */
      window.syncProjectSections(content, project)

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

  /* Only project IDs should change the selected project. */
  window.addEventListener('hashchange', () => {
    const projectId = window.location.hash.slice(1)
    if (projectDetails.some(project => project.id === projectId)) {
      showProject(projectId, false)
    }
  })

  showProject(window.location.hash.slice(1), !window.location.hash)
})()


/* =========================
   Opened From the Cabinet
   ========================= */

/* Inside the cabinet's frame, the bottom buttons scroll to the top or put the project back. */
;(function setupEmbeddedButtons() {
  if (document.documentElement.dataset.embed !== '1') return

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

  document.getElementById('embedTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motion.matches ? 'auto' : 'smooth' })
  })
  document.getElementById('embedReturn')?.addEventListener('click', () => window.parent.DrawerCabinet?.close())
})()
