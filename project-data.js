/* =========================
   Shared Project Data
   ========================= */

/* Project Details (fields follow the page order) */
window.portfolioProjects = [
  {
    // Bookshelf
    id: 'secure-data-sharing',
    bookTitle: 'Mosaic',
    bookSize: 'wide',
    preview: 'A secure platform for controlled research data sharing and privacy protection.',
    // Project Switcher
    shortTitle: 'Mosaic',
    // Hero
    title: 'Mosaic',
    type: 'Full-Stack',
    featured: true,
    team: 'group',
    summary: 'Secure Data Sharing Platform for Collaborative Research · Final Year Capstone Project.',
    // Buttons
    liveDemo: '',
    github: 'https://github.com/fyp-26-s3-07/secure-data-sharing-platform',
    documentation: '',
    // Project Record
    date: 'July 2026 - Present',
    focus: 'Secure collaborative research',
    // Overview
    description: 'A secure research collaboration platform designed for controlled data sharing and privacy protection. Collaborated in a 5-member team to design and implement the system.',
    tech: {
      frontend: [],
      backend: [],
      tools: [],
    },
    // Demo
    hasVideoDemo: true,
    videoDemo: '',
    // Reason
    reasonTitle: '',
    reason: '',
  },

  {
    // Bookshelf
    id: 'honeypot',
    bookTitle: 'Honeypot Simulation',
    bookSize: 'wide',
    preview: 'A Cowrie honeypot environment for capturing and analysing malicious SSH activity.',
    // Project Switcher
    shortTitle: 'Honeypot',
    // Hero
    title: 'Honeypot Simulation',
    type: 'Cybersecurity',
    featured: false,
    team: 'solo',
    summary: 'Simulated honeypot environment using Cowrie.',
    // Buttons
    liveDemo: '',
    github: 'https://github.com/Asorajx/honeypot-simulation',
    documentation: 'https://github.com/Asorajx/honeypot-simulation/blob/main/P01-honeypot-simulation.pdf',
    // Project Record
    date: 'August 2026',
    focus: 'SSH attack analysis',
    // Overview
    description: 'A cybersecurity project using a honeypot server to capture, monitor, and analyse malicious SSH access attempts.',
    tech: {
      frontend: [],
      backend: [],
      tools: ['Cowrie', 'Hydra', 'Ubuntu 22.04', 'Kali Linux', 'Oracle VirtualBox'],
    },
    // Demo
    hasVideoDemo: false,
    videoDemo: '',
    // Reason
    reasonTitle: '',
    reason: 'I wanted to learn more about how honeypots work, so I decided to try setting one up myself. I deployed a honeypot server to capture and monitor SSH login attempts, and analysed the activity it received. It was mainly a hands-on way for me to explore how honeypots are used to observe potential cyber threats.',
  },

  {
    // Bookshelf
    id: 'writepretty',
    bookTitle: 'WritePretty',
    bookSize: 'regular',
    preview: 'A client-side writing cleanup tool with configurable formatting and local autosave.',
    // Project Switcher
    shortTitle: 'WritePretty',
    // Hero
    title: 'WritePretty',
    type: 'Web Application',
    featured: false,
    team: 'solo',
    summary: 'Rule-based text cleanup and formatting tool.',
    // Buttons
    liveDemo: 'https://asorajx.github.io/writepretty/',
    github: 'https://github.com/Asorajx/writepretty',
    documentation: 'https://github.com/Asorajx/writepretty/blob/main/P02-writepretty.pdf',
    // Project Record
    date: 'September 2026',
    updated: 'November 2026',
    focus: 'Text cleanup',
    // Overview
    description: 'A lightweight client-side writing cleanup tool with configurable formatting rules, optional Markdown cleanup, browser-based spellcheck, History Mode, and local autosave without AI rewriting.',
    tech: {
      frontend: ['HTML', 'CSS', 'JavaScript'],
      backend: [],
      tools: [],
    },
    // Demo
    hasVideoDemo: true,
    videoDemo: 'assets/demos/WritePretty-Demo2.mp4',
    // Then & Now
    oldImage: 'assets/images/WritePretty-v1.png',
    thenNowNote: 'The original version hid the cleanup controls in a separate panel away from the text, and its punctuation rule could wrongly alter names like “Fuse.js”. The updated version keeps the controls beside the editor as an icon rail and refines the rules to leave such names intact, so the tool is easier to use and more reliable.',
    // Reason
    reasonTitle: '',
    reason: 'I work with a lot of documents and reports for school, and I often find myself spending time fixing small formatting issues, especially when copying text from different sources. I wanted a quick way to clean things up without having to rely on AI every time. So I decided to build WritePretty, a tool that lets users quickly clean up their text and choose which formatting they want to remove, while keeping the original content unchanged.',
  },
  {
    // Bookshelf
    id: 'loop',
    bookTitle: 'LOOP',
    bookSize: 'regular',
    preview: 'An interactive visualizer for exploring Python OOP execution, state, and inheritance.',
    // Project Switcher
    shortTitle: 'LOOP',
    // Hero
    title: 'LOOP',
    type: 'Web Application',
    featured: false,
    team: 'solo',
    summary: 'Interactive visualizer for learning Python OOP.',
    // Buttons
    liveDemo: 'https://loop-duzg.onrender.com/',
    github: 'https://github.com/Asorajx/LOOP',
    documentation: 'https://github.com/Asorajx/LOOP/blob/main/P03-LOOP-v2.pdf',
    // Project Record
    date: 'October 2026',
    updated: 'November 2026',
    focus: 'Python OOP learning',
    // Overview
    description: 'An interactive Python OOP visualizer that uses scenario-based simulations to show method execution, object interactions, state changes, inheritance, and source code in real time.',
    tech: {
      frontend: ['HTML', 'CSS', 'JavaScript'],
      backend: ['Python', 'FastAPI'],
      tools: [],
    },
    // Demo
    hasVideoDemo: true,
    videoDemo: 'assets/demos/LOOP-Demo2.mp4',
    // Reason
    reasonTitle: '',
    reason: 'I built LOOP as a way to practise and reinforce what I\'d learnt about Python OOP in school, while also creating something that could help other students understand these concepts better. I wanted to make it easier to visualise how objects interact, how methods run, and how their states change in real time.',
    // Then & Now
    oldDemo: 'assets/demos/LOOP-Demo.mp4',
    thenNowNote: 'The original interface was cluttered, making the source code difficult to follow. The updated version has a cleaner, more intuitive layout, with clearer code visualization and brief explanations of each concept, so Python OOP is easier to understand.',
  },
  {
    // Bookshelf
    id: 'starjot',
    bookTitle: 'Starjot',
    bookSize: 'regular',
    preview: 'A browser-based workspace for notes, visual ideas, and project planning.',
    // Project Switcher
    shortTitle: 'Starjot',
    // Hero
    title: 'Starjot',
    type: 'Web Application',
    featured: true,
    team: 'solo',
    summary: 'A local workspace for notes and project planning.',
    // Buttons
    liveDemo: 'https://asorajx.github.io/starjot/#home',
    github: 'https://github.com/Asorajx/starjot',
    documentation: 'https://github.com/Asorajx/starjot/blob/main/P04-starjot.pdf',
    // Project Record
    date: 'October 2026 - November 2026',
    focus: 'Note-taking and planning',
    // Overview
    description: 'A browser-based workspace that brings notes and project work together. Notespace supports rich text and visual canvases, while Boardspace organises work through list, board, and timeline views. Workspace data is stored locally in the browser.',
    tech: {
      frontend: ['React', 'TypeScript', 'CSS'],
      backend: [],
      tools: ['Vite', 'Vitest', 'GitHub Actions CI/CD'],
    },
    // Demo
    hasVideoDemo: true,
    videoDemo: 'assets/demos/Starjot-Demo.mp4',
    // Reason
    reasonTitle: '',
    reason: 'I use note-taking apps a lot for school and projects, mainly Notion, but lately I\'ve found it a little too bloated with features I don\'t really need. I was curious about what a simpler alternative could look like, so I decided to experiment with building my own workspace for notes and project work. I also wanted to explore the idea of local data storage rather than relying entirely on the cloud. This led me to build Starjot.',
  },
]


/* =========================
   Project Section Visibility
   ========================= */

/* Optional Sections, Chapter Numbers, Tech Stack and Team */
window.syncProjectSections = function syncProjectSections(root, project) {
  if (!root || !project) return

  const fields = {
    projectDemoSection: !!project.hasVideoDemo,
    projectReasonSection: !!project.reason,
    projectThenNowSection: !!(project.oldDemo || project.oldImage || project.thenNowNote),
    projectDemo: !!project.liveDemo,
    projectGithub: !!project.github,
    projectDocumentation: !!project.documentation,
  }

  Object.entries(fields).forEach(([id, visible]) => {
    const element = root.querySelector(`[id="${id}"], [data-source-id="${id}"]`)
    if (element) element.hidden = !visible
  })

  const reasonTitle = root.querySelector('[id="projectReasonTitle"], [data-source-id="projectReasonTitle"]')
  if (reasonTitle) {
    reasonTitle.textContent = project.reasonTitle || 'Why this project'
  }

  /* Chapter Numbers */
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI']
  ;[...root.querySelectorAll('[data-chapter]')]
    .filter(chapter => !chapter.hidden)
    .forEach((chapter, index) => {
      chapter.querySelectorAll('[data-chapter-number]').forEach(number => {
        number.textContent = numerals[index]
      })
    })

  /* Tech Stack: every group shows, with a dash when empty. */
  const tech = project.tech || {}
  ;['frontend', 'backend', 'tools'].forEach(group => {
    const id = `projectTech${group[0].toUpperCase()}${group.slice(1)}`
    const list = root.querySelector(`[id="${id}"], [data-source-id="${id}"]`)
    if (!list) return
    const items = tech[group] || []
    list.replaceChildren(...items.map(item => {
      const tag = document.createElement('span')
      tag.className = 'project-tech-tag'
      tag.textContent = item
      return tag
    }))
    if (!items.length) list.textContent = '-'
  })

  /* Updated Note */
  const updated = root.querySelector('[id="projectUpdated"], [data-source-id="projectUpdated"]')
  if (updated) {
    updated.hidden = !project.updated
    updated.textContent = project.updated ? `Updated ${project.updated}` : ''
  }

  const thenNowUpdated = root.querySelector('[id="projectThenNowUpdated"], [data-source-id="projectThenNowUpdated"]')
  if (thenNowUpdated) {
    thenNowUpdated.hidden = !project.updated
    thenNowUpdated.textContent = project.updated ? `Updated ${project.updated}` : ''
  }

  const team = root.querySelector('[id="projectTeamStatus"], [data-source-id="projectTeamStatus"]')
  if (team) {
    const isGroup = project.team === 'group'
    team.textContent = isGroup ? 'Group' : 'Solo'
  }
}


/* =========================
   Project Book Stack
   ========================= */

/* Book Stack Placement */
window.stackProjectTabs = function stackProjectTabs(tabs, projects) {
  const looks = [
    { x: -5, width: 4 },
    { x: 9, width: -12 },
    { x: -2, width: 0 },
    { x: 4, width: -6 },
    { x: -8, width: 8 },
    { x: 6, width: -4 },
  ]
  const featuredColumns = Math.ceil(projects.filter(project => project.featured).length / 3)
  let featuredIndex = 0
  let otherIndex = 0

  tabs.forEach((tab, index) => {
    const project = projects[index]
    const look = looks[index % looks.length]
    const stackIndex = project.featured ? featuredIndex++ : otherIndex++
    const firstColumn = project.featured ? 1 : featuredColumns + 1
    tab.style.gridColumn = String(firstColumn + Math.floor(stackIndex / 3))
    tab.style.gridRow = String(3 - stackIndex % 3)
    tab.style.setProperty('--book-x', `${look.x}px`)
    tab.style.setProperty('--book-width', `${look.width}px`)
  })
}
