const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a, .button[href^="#"], .logo');
const form = document.querySelector('.lead-form');
const formMessage = document.querySelector('.form-message');
const revealElements = document.querySelectorAll('.reveal');

const toggleHeaderState = () => {
  header.classList.toggle('scrolled', window.scrollY > 12);
};

toggleHeaderState();
window.addEventListener('scroll', toggleHeaderState, { passive: true });

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) {
      return;
    }

    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    event.preventDefault();
    const offset = header.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });

    navMenu.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.18
});

revealElements.forEach((element) => revealObserver.observe(element));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (field) => {
  const value = field.value.trim();
  let isValid = value.length > 0;

  if (field.type === 'email') {
    isValid = emailPattern.test(value);
  }

  field.classList.toggle('invalid', !isValid);
  return isValid;
};

if (form) {
  const fields = Array.from(form.querySelectorAll('input[required]'));

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const isFormValid = fields.every((field) => validateField(field));

    if (!isFormValid) {
      formMessage.textContent = 'Please complete all fields with valid information.';
      formMessage.style.color = '#c43d3d';
      return;
    }

    formMessage.textContent = 'Thank you. Your request is ready for the PoC team to review.';
    formMessage.style.color = '#0f7e72';
    form.reset();
  });
}
