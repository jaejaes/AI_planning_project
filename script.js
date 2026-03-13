const analyticsConfig = window.ANALYTICS_CONFIG || {};
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a, .button[href^="#"], .logo');
const form = document.querySelector('.lead-form');
const formMessage = document.querySelector('.form-message');
const revealElements = document.querySelectorAll('.reveal');
const trackedCtas = document.querySelectorAll('[data-analytics]');

const loadScript = (src) => {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const initGA4 = () => {
  const measurementId = analyticsConfig.ga4MeasurementId;
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true
  });

  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
};

const initContentsquare = () => {
  const tagId = analyticsConfig.contentsquareTagId;
  if (!tagId || tagId === 'YOUR_CONTENTSQUARE_TAG_ID') {
    return;
  }

  window._uxa = window._uxa || [];

  if (typeof window.CS_CONF === 'undefined') {
    window._uxa.push([
      'setPath',
      window.location.pathname + window.location.hash.replace('#', '?__')
    ]);

    const csScript = document.createElement('script');
    csScript.type = 'text/javascript';
    csScript.async = true;
    csScript.src = `https://t.contentsquare.net/uxa/${encodeURIComponent(tagId)}.js`;
    document.head.appendChild(csScript);
  } else {
    window._uxa.push([
      'trackPageview',
      window.location.pathname + window.location.hash.replace('#', '?__')
    ]);
  }
};

const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

initGA4();
initContentsquare();

const toggleHeaderState = () => {
  header.classList.toggle('scrolled', window.scrollY > 12);
};

toggleHeaderState();
window.addEventListener('scroll', toggleHeaderState, { passive: true });

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    trackEvent('mobile_nav_toggle', { menu_state: isOpen ? 'open' : 'closed' });
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

trackedCtas.forEach((cta) => {
  cta.addEventListener('click', () => {
    trackEvent('cta_click', {
      cta_name: cta.dataset.analytics,
      cta_text: cta.textContent.trim()
    });
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
      trackEvent('lead_form_validation_error', {
        form_name: 'request_poc'
      });
      return;
    }

    trackEvent('generate_lead', {
      form_name: 'request_poc',
      lead_type: 'poc_request'
    });

    formMessage.textContent = 'Thank you. Your request is ready for the PoC team to review.';
    formMessage.style.color = '#0f7e72';
    form.reset();
  });
}
