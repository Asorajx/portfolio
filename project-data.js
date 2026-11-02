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
    type: 'Full-Stack Development',
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
    // Demo
    hasVideoDemo: true,
    videoDemo: '',
    // Reason
    reason: '',
    reasonTitle: '',
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
    // Demo
    hasVideoDemo: false,
    videoDemo: '',
    // Reason
    reason: '',
    reasonTitle: '',
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
    focus: 'Text cleanup',
    // Overview
    description: 'A lightweight client-side writing cleanup tool with configurable formatting rules, optional Markdown cleanup, browser-based spellcheck, History Mode, and local autosave without AI rewriting.',
    // Demo
    hasVideoDemo: true,
    videoDemo: 'assets/demos/WritePretty-Demo.mp4',
    // Reason
    reason: '',
    reasonTitle: '',
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
    documentation: 'https://github.com/Asorajx/LOOP/blob/main/P03-LOOP.pdf',
    // Project Record
    date: 'October 2026',
    focus: 'Python OOP learning',
    // Overview
    description: 'An interactive Python OOP visualizer that uses scenario-based simulations to show method execution, object interactions, state changes, inheritance, and source code in real time.',
    // Demo
    hasVideoDemo: true,
    videoDemo: 'assets/demos/LOOP-Demo.mp4',
    // Reason
    reason: '',
    reasonTitle: '',
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
    // Demo
    hasVideoDemo: true,
    videoDemo: 'assets/demos/Starjot-Demo.mp4',
    // Reason
    reason: '',
    reasonTitle: '',
  },
]


/* =========================
   Project Section Visibility
   ========================= */

/* Optional Sections, Chapter Numbers and Solo/Group Pill */
window.syncProjectSections = function syncProjectSections(root, project) {
  if (!root || !project) return

  const fields = {
    projectDemoSection: !!project.hasVideoDemo,
    projectDocumentation: !!project.documentation,
    projectReasonSection: !!project.reason,
    projectDemo: !!(project.liveDemo || project.hasVideoDemo),
  }

  Object.entries(fields).forEach(([id, visible]) => {
    const element = root.querySelector(`[id="${id}"], [data-source-id="${id}"]`)
    if (element) element.hidden = !visible
  })

  const reasonTitle = root.querySelector('[id="projectReasonTitle"], [data-source-id="projectReasonTitle"]')
  if (reasonTitle) {
    reasonTitle.textContent = project.reasonTitle || 'Why This Project'
  }

  /* Chapter Numbers */
  const numerals = ['I', 'II', 'III', 'IV', 'V']
  ;[...root.querySelectorAll('[data-chapter]')]
    .filter(chapter => !chapter.hidden)
    .forEach((chapter, index) => {
      chapter.querySelectorAll('[data-chapter-number]').forEach(number => {
        number.textContent = numerals[index]
      })
    })

  const team = root.querySelector('[id="projectTeamStatus"], [data-source-id="projectTeamStatus"]')
  if (team) {
    const isGroup = project.team === 'group'
    team.textContent = isGroup ? 'Group' : 'Solo'
    team.classList.toggle('is-group', isGroup)
  }
}
