# portfolio
A collection of my experiences and interests.


## Shared project-page skeleton

The bookshelf preview is built from the real `projects.html` header and project
content, using `projects.css` and the shared `project-data.js` entries.
`project-preview.js` strips media and simplifies content, while
`project-preview.css` adds only the skeleton styling. Section visibility
(video demos, documentation, extra descriptions, and Live Demo actions)
is shared between `projects.js` and the book preview through
`syncProjectSections` in `project-data.js`, so each project displays only
the sections it actually has. Changing the project page's HTML layout
or CSS will also update the book preview (the page is re-read on the next
visit). The book page is laid out at viewport width, so the camera zoom lands
exactly on the full-size preview. On arrival, `projects.html` masks its own
real content with the same skeleton rules and fades the text in place.

**Local preview:** Run a local web server (for example,
`python -m http.server 8000` in the `Portfolio` folder) rather than
double-clicking `index.html`, since browsers usually block fetching
`projects.html` from `file://` pages. Without it the book page stays blank.
