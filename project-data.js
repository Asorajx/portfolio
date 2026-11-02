/* =========================
   Shared Project Data
   ========================= */

/* Add project details and bookshelf presentation settings here. */
window.portfolioProjects = [
  {
    id: 'secure-data-sharing',
    bookTitle: 'Mosaic',
    preview: 'A secure platform for controlled research data sharing and privacy protection.',
    bookSize: 'wide',
    featured: true,
    shortTitle: 'Mosaic',
    type: 'Full-Stack Development',
    title: 'Mosaic',
    summary: 'Secure Data Sharing Platform for Collaborative Research · Final Year Capstone Project.',
    date: 'July 2026 - Present',
    focus: 'Secure collaboration',
    description: 'A secure research collaboration platform designed for controlled data sharing and privacy protection. Collaborated in a 5-member team to design and implement the system.',
    extra: '',
    documentation: '',
    github: 'https://github.com/fyp-26-s3-07/secure-data-sharing-platform',
    hasVideoDemo: true,
    videoDemo: '',
    liveDemo: '',
  },
  {
    id: 'honeypot',
    bookTitle: 'Honeypot Simulation',
    preview: 'A Cowrie honeypot environment for capturing and analysing malicious SSH activity.',
    bookSize: 'wide',
    featured: false,
    shortTitle: 'Honeypot',
    type: 'Cybersecurity',
    title: 'Honeypot Simulation',
    summary: 'Simulated honeypot environment using Cowrie.',
    date: 'August 2026',
    focus: 'SSH attack analysis',
    description: 'A cybersecurity project using a honeypot server to capture, monitor, and analyse malicious SSH access attempts.',
    extra: '',
    documentation: 'https://github.com/Asorajx/honeypot-simulation/blob/main/P01-honeypot-simulation.pdf',
    github: 'https://github.com/Asorajx/honeypot-simulation',
    hasVideoDemo: false,
    videoDemo: '',
    liveDemo: '',
  },
  {
    id: 'writepretty',
    bookTitle: 'WritePretty',
    preview: 'A client-side writing cleanup tool with configurable formatting and local autosave.',
    bookSize: 'regular',
    featured: false,
    shortTitle: 'WritePretty',
    type: 'Web Application',
    title: 'WritePretty',
    summary: 'Rule-based text cleanup and formatting tool.',
    date: 'September 2026',
    focus: 'Text cleanup',
    description: 'A lightweight client-side writing cleanup tool with configurable formatting rules, optional Markdown cleanup, browser-based spellcheck, History Mode, and local autosave without AI rewriting.',
    extra: '',
    documentation: 'https://github.com/Asorajx/writepretty/blob/main/P02-writepretty.pdf',
    github: 'https://github.com/Asorajx/writepretty',
    hasVideoDemo: true,
    videoDemo: 'assets/demos/WritePretty-Demo.mp4',
    liveDemo: 'https://asorajx.github.io/writepretty/',
  },
  {
    id: 'loop',
    bookTitle: 'LOOP',
    preview: 'An interactive visualizer for exploring Python OOP execution, state, and inheritance.',
    bookSize: 'regular',
    featured: false,
    shortTitle: 'LOOP',
    type: 'Web Application',
    title: 'LOOP',
    summary: 'Interactive visualizer for learning Python OOP.',
    date: 'October 2026',
    focus: 'Python OOP learning',
    description: 'An interactive Python OOP visualizer that uses scenario-based simulations to show method execution, object interactions, state changes, inheritance, and source code in real time.',
    extra: '',
    documentation: 'https://github.com/Asorajx/LOOP/blob/main/P03-LOOP.pdf',
    github: 'https://github.com/Asorajx/LOOP',
    hasVideoDemo: true,
    videoDemo: 'assets/demos/LOOP-Demo.mp4',
    liveDemo: 'https://loop-duzg.onrender.com/',
  },
  {
    id: 'starjot',
    bookTitle: 'Starjot',
    preview: 'A browser-based workspace for notes, visual ideas, and project planning.',
    bookSize: 'regular',
    featured: true,
    shortTitle: 'Starjot',
    type: 'Web Application',
    title: 'Starjot',
    summary: 'A local workspace for notes and project planning.',
    date: 'October 2026 - November 2026',
    focus: 'Note-taking and planning',
    description: 'A browser-based workspace that brings notes and project work together. Notespace supports rich text and visual canvases, while Boardspace organises work through list, board, and timeline views. Workspace data is stored locally in the browser.',
    extra: '',
    documentation: 'https://github.com/Asorajx/starjot/blob/main/P04-starjot.pdf',
    github: 'https://github.com/Asorajx/starjot',
    hasVideoDemo: true,
    videoDemo: 'assets/demos/Starjot-Demo.mp4',
    liveDemo: 'https://asorajx.github.io/starjot/#home',
  },
]


/* =========================
   Project Section Visibility
   ========================= */

/* Shows or hides optional sections (demo, documentation, extra text, Live Demo)
   based on a project's data. Used by the projects page and the book preview. */
window.syncProjectSections = function syncProjectSections(root, project) {
  if (!root || !project) return

  const fields = {
    projectDemoSection: !!project.hasVideoDemo,
    projectDocumentation: !!project.documentation,
    projectExtra: !!project.extra,
    projectDemo: !!(project.liveDemo || project.hasVideoDemo),
  }

  Object.entries(fields).forEach(([id, visible]) => {
    const element = root.querySelector(`[id="${id}"], [data-source-id="${id}"]`)
    if (element) element.hidden = !visible
  })
}
