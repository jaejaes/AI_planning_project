const analyticsConfig = window.ANALYTICS_CONFIG || {};
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a, .button[href^="#"], .logo');
const form = document.querySelector('.lead-form');
const formMessage = document.querySelector('.form-message');
const revealElements = document.querySelectorAll('.reveal');
const trackedCtas = document.querySelectorAll('[data-analytics]');
const mobileTabs = document.querySelectorAll('.mobile-tab');
const mobileScreens = document.querySelectorAll('[data-mobile-screen]');
const mobileCaptionTitle = document.querySelector('#mobile-caption-title strong');
const mobileCaptionText = document.querySelector('#mobile-caption-text');

const mobileCopy = {
  dashboard: {
    title: '상환 우선순위 안내',
    text: '기관의 AI 추천이 차주에게 어떤 부채를 먼저 상환해야 하는지 분명하게 전달되는 순간입니다.'
  },
  analysis: {
    title: '이자 부담 근거 제시',
    text: '추천 이유를 숫자로 설명해 차주가 상환 순서를 납득하도록 돕는 분석 화면입니다.'
  },
  simulator: {
    title: '개인화 인센티브 체감',
    text: '금리 인하나 혜택이 실제 월 이자 절감으로 어떻게 느껴지는지 즉시 보여줍니다.'
  },
  credit: {
    title: '행동 변화의 보상 강화',
    text: '상환 이후 신용 개선과 진척도를 보여줘 우선 상환 행동이 지속되도록 만듭니다.'
  }
};

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

const setMobileScreen = (targetKey) => {
  mobileTabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.mobileTarget === targetKey);
  });

  mobileScreens.forEach((screen) => {
    screen.classList.toggle('is-active', screen.dataset.mobileScreen === targetKey);
  });

  if (mobileCopy[targetKey] && mobileCaptionTitle && mobileCaptionText) {
    mobileCaptionTitle.textContent = mobileCopy[targetKey].title;
    mobileCaptionText.textContent = mobileCopy[targetKey].text;
  }
};

mobileTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetKey = tab.dataset.mobileTarget;
    setMobileScreen(targetKey);
    trackEvent('mobile_story_tab_click', {
      mobile_story_step: targetKey
    });
  });
});

if (mobileTabs.length > 0) {
  setMobileScreen('dashboard');
}

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
      formMessage.textContent = '필수 항목을 모두 올바르게 입력해주세요.';
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

    formMessage.textContent = '요청이 접수되었습니다. PoC 검토를 위해 곧 연락드리겠습니다.';
    formMessage.style.color = '#0f7e72';
    form.reset();
  });
}
