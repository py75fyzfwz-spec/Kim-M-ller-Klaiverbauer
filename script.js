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

// Contact form: sends messages via Web3Forms (https://web3forms.com).
// Paste the access key from web3forms.com here. Until then, the form opens
// the visitor's mail program with the message pre-filled instead.
const WEB3FORMS_ACCESS_KEY = '';
const CONTACT_EMAIL = 'kmt-pianos@t-online.de';

// Only present on pages that include the contact section (e.g. index.html)
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form) {
  const submitButton = form.querySelector('button[type="submit"]');

  const openMailFallback = (data) => {
    const subject = `Anfrage von ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    formNote.textContent = 'Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die Nachricht dort ab.';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    if (!WEB3FORMS_ACCESS_KEY) {
      openMailFallback(data);
      return;
    }

    data.append('access_key', WEB3FORMS_ACCESS_KEY);
    data.append('replyto', data.get('email'));
    submitButton.disabled = true;
    formNote.textContent = 'Nachricht wird gesendet …';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      formNote.textContent = 'Vielen Dank! Ich melde mich in Kürze bei Ihnen zurück.';
      form.reset();
    } catch (error) {
      formNote.innerHTML = `Das Senden hat leider nicht geklappt. Bitte schreiben Sie direkt an <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`;
    } finally {
      submitButton.disabled = false;
    }
  });
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll-reveal: fade + rise elements into view as the user scrolls
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Scroll progress bar: thin gold line filling as the page is scrolled
const scrollProgress = document.getElementById('scrollProgress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (scrollProgress) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// Hero parallax: content drifts and fades gently as the hero scrolls out of view
const heroContent = document.querySelector('.hero-content');
const heroSection = document.querySelector('.hero');

if (heroContent && heroSection && !prefersReducedMotion) {
  let ticking = false;
  const updateParallax = () => {
    const heroHeight = heroSection.offsetHeight;
    const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    heroContent.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    heroContent.style.opacity = String(1 - progress * 0.9);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateParallax();
}
