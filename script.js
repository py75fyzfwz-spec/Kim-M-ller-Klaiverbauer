// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Contact form (client-side only — wire up to a backend or mail service as needed)
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formNote.textContent = 'Vielen Dank! Ich melde mich in Kürze bei Ihnen zurück.';
  form.reset();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
