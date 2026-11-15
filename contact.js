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

/* Open the form and move keyboard focus into the dialog. */
function openContactForm(trigger) {
  if (!contactModal || contactFormOpen) return
  contactFormOpen = true
  lastContactTrigger = trigger
  contactModal.classList.add('open')
  contactModal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('popup-open')
  document.getElementById('contactName')?.focus()
}

/* Close the form and return focus to the button that opened it. */
function closeContactForm() {
  if (!contactModal || !contactFormOpen) return
  contactFormOpen = false
  contactModal.classList.remove('open')
  contactModal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('popup-open')
  lastContactTrigger?.focus()
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


/* Submit the contact form without leaving the portfolio. */
contactForm?.addEventListener('submit', async event => {
  event.preventDefault()

  const submitButton = contactForm.querySelector('.contact-submit')
  const formNote = document.getElementById('contactFormNote')

  if (submitButton.disabled) return

  /* Prepare the form and prevent duplicate submissions. */
  const formData = new FormData(contactForm)
  const originalButtonText = 'Send message'

  submitButton.disabled = true
  submitButton.textContent = 'Sending...'
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

    /* Clear the fields only after Formspree confirms success. */
    contactForm.reset()
    formNote.textContent = 'Message sent successfully! Thank you for reaching out.'
    submitButton.textContent = 'Message sent!'
  } catch (error) {
    /* Preserve the form inputs so visitors can try again. */
    formNote.textContent = 'Unable to send your message. Please try again.'
    submitButton.textContent = originalButtonText
  } finally {
    submitButton.disabled = false
  }
})
