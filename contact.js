/* =========================
   Contact Form
   ========================= */

const contactModal = document.getElementById('contactModal')
const contactDialog = document.getElementById('contactDialog')
const contactClose = document.getElementById('contactClose')
const contactForm = document.getElementById('contactForm')
const contactOpeners = document.querySelectorAll('[data-open-contact]')
let contactFormOpen = false
let lastContactTrigger
let contactResetTimer = 0
let contactSentTimer = 0

/* Open the form and move keyboard focus into the dialog. */
function openContactForm(trigger) {
  if (!contactModal || contactFormOpen) return
  contactFormOpen = true
  lastContactTrigger = trigger
  clearTimeout(contactResetTimer)

  /* The form grows out of the button or link that opened it. */
  const origin = trigger?.getBoundingClientRect()

  /* The starting position is set without a transition, so it is there before the form opens. */
  contactDialog.style.transition = 'none'

  if (origin) {
    contactDialog.style.setProperty('--from-x', `${Math.round(origin.left + origin.width / 2 - window.innerWidth / 2)}px`)
    contactDialog.style.setProperty('--from-y', `${Math.round(origin.top + origin.height / 2 - window.innerHeight / 2)}px`)
  }
  void contactDialog.offsetWidth
  contactDialog.style.transition = ''
  contactModal.classList.add('open')
  contactModal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')

  /* The first field is focused once the form is visible. */
  setTimeout(() => document.getElementById('contactName')?.focus({ preventScroll: true }), 80)
}

/* Close the form and return focus to the button that opened it. */
function closeContactForm() {
  if (!contactModal || !contactFormOpen) return
  contactFormOpen = false
  contactModal.classList.remove('open')
  contactModal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('popup-open')
  lastContactTrigger?.focus()

  /* After it has folded away, the note and button go back to normal. */
  contactResetTimer = setTimeout(() => {
    resetSendButton()
    contactForm?.querySelectorAll('input, textarea').forEach(field => setFieldError(field, ''))
    document.getElementById('contactFormNote').textContent = 'Your message will be sent directly through this form.'
    document.getElementById('contactFormNote').classList.remove('is-error')
  }, 500)
}

/* The send button returns to its usual look. */
function resetSendButton() {
  const button = contactForm?.querySelector('.contact-submit')

  if (!button) return
  clearTimeout(contactSentTimer)
  button.disabled = false
  button.classList.remove('is-sent')
  button.removeAttribute('aria-busy')
  button.textContent = 'Send message'
}

contactOpeners.forEach(button => {
  button.addEventListener('click', () => openContactForm(button))
})

/* Contact Nav: jump to the contact section, then open the form. */
document.querySelectorAll('[data-contact-nav]').forEach(link => {
  link.addEventListener('click', () => {
    if (contactModal) {
      setTimeout(() => openContactForm(link), 450)
      return
    }
    try { sessionStorage.setItem('portfolio-open-contact', 'ready') } catch {}
  })
})

try {
  if (contactModal && sessionStorage.getItem('portfolio-open-contact')) {
    sessionStorage.removeItem('portfolio-open-contact')
    setTimeout(() => openContactForm(document.querySelector('[data-contact-nav]')), 700)
  }
} catch {}

contactClose?.addEventListener('click', closeContactForm)

contactModal?.addEventListener('click', event => {
  if (event.target === contactModal) closeContactForm()
})

contactDialog?.addEventListener('click', event => event.stopPropagation())

/* Escape closes the form too. */
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && contactFormOpen) closeContactForm()
})

/* Keep Tab focus inside the open contact dialog. */
contactDialog?.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return

  const focusable = [
    ...contactDialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]',
    ),
  ]

  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
})


/* Show or clear the message under a field. */
function setFieldError(field, message) {
  const label = field.closest('.contact-field')
  const error = label?.querySelector('.contact-error')

  if (!error) return
  error.textContent = message
  error.hidden = !message
  label.classList.toggle('has-error', !!message)
  field.setAttribute('aria-invalid', message ? 'true' : 'false')
}

/* Every field is required, and each missing one gets its own message. */
const contactRules = {
  name: value => (value.trim() ? '' : 'Please enter your name.'),
  email: value => {
    if (!value.trim()) return 'Please enter your email address.'
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'That email address doesn\u2019t look right.'
  },
  message: value => (value.trim() ? '' : 'Please write a message.'),
}

function validateContactForm() {
  let firstInvalid = null

  Object.entries(contactRules).forEach(([name, check]) => {
    const field = contactForm.elements[name]
    const message = check(field.value)

    setFieldError(field, message)
    if (message && !firstInvalid) firstInvalid = field
  })

  firstInvalid?.focus()
  return !firstInvalid
}

/* A message goes away as soon as its field is being fixed. */
contactForm?.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => setFieldError(field, ''))
})

/* Submit the contact form without leaving the portfolio. */
contactForm?.addEventListener('submit', async event => {
  event.preventDefault()

  const submitButton = contactForm.querySelector('.contact-submit')
  const formNote = document.getElementById('contactFormNote')

  if (submitButton.disabled || !validateContactForm()) return

  /* Prepare the form and prevent duplicate submissions. */
  const formData = new FormData(contactForm)

  submitButton.disabled = true
  submitButton.setAttribute('aria-busy', 'true')
  submitButton.textContent = 'Sending...'
  formNote.classList.remove('is-error')
  formNote.textContent = 'Sending your message...'

  try {
    /* Send the message to Formspree in the background. */
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Form submission failed')
    }

    /* Clear the fields only after Formspree confirms success. The button says so for a moment, then goes back. */
    contactForm.reset()
    submitButton.removeAttribute('aria-busy')
    submitButton.classList.add('is-sent')
    submitButton.textContent = 'Message sent'
    formNote.textContent = 'Thank you for reaching out.'
    contactSentTimer = setTimeout(resetSendButton, 3500)
  } catch (error) {
    /* Preserve the form inputs so visitors can try again. */
    resetSendButton()
    formNote.classList.add('is-error')
    formNote.textContent = 'Unable to send your message. Please try again.'
  }
})
