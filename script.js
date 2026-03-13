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
const formSourceInput = document.querySelector('input[name="form_source"]');
const replyToInput = document.querySelector('input[name="_replyto"]');

const mobileCopy = {
  dashboard: {
    title: '부채 구조 확인',
    text: '고객이 자신의 부채 구조를 이해하고 현재 상태를 파악하는 단계입니다.'
  },
  analysis: {
    title: '상환 전략 추천',
    text: 'AI가 어떤 채무를 먼저 상환해야 하는지 우선순위를 제안하는 단계입니다.'
  },
  simulator: {
    title: '이자 절감 검증',
    text: '전략 적용 전후를 비교해 고객이 절감 효과를 수치로 확인하는 단계입니다.'
  },
  credit: {
    title: '행동 전환 확인',
    text: '무작위 상환에서 전략형 상환으로 전환되는 행동 변화를 확인하는 단계입니다.'
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
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
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
    if (!target || !header) {
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
    const ctaName = cta.dataset.analytics || '';
    trackEvent('cta_click', {
      cta_name: ctaName,
      cta_text: cta.textContent.trim()
    });

    if (formSourceInput && ctaName.startsWith('cta_')) {
      formSourceInput.value = ctaName;
    }
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
  let isValid = true;

  if (field.type === 'checkbox') {
    isValid = field.checked;
  } else {
    const value = field.value.trim();
    isValid = value.length > 0;
    if (field.type === 'email') {
      isValid = emailPattern.test(value);
    }
  }

  field.classList.toggle('invalid', !isValid);
  return isValid;
};

const setFormSubmitting = (isSubmitting) => {
  if (!form) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) {
    return;
  }

  const defaultLabel = submitButton.dataset.defaultLabel || '전략 요청';
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? '전송 중...' : defaultLabel;
};

if (form) {
  const endpoint = form.getAttribute('action');
  const requiredFields = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]'));
  const honeypotField = form.querySelector('input[name="_gotcha"]');
  const emailField = form.querySelector('input[name="email"]');

  requiredFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) {
        validateField(field);
      }
    });
    if (field.type === 'checkbox') {
      field.addEventListener('change', () => validateField(field));
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isFormValid = requiredFields.every((field) => validateField(field));
    if (!isFormValid) {
      formMessage.textContent = '필수 항목을 모두 올바르게 입력해주세요.';
      formMessage.style.color = '#c43d3d';
      trackEvent('lead_form_validation_error', { form_name: 'request_poc' });
      return;
    }

    if (honeypotField && honeypotField.value.trim() !== '') {
      formMessage.textContent = '제출이 차단되었습니다. 다시 시도해주세요.';
      formMessage.style.color = '#c43d3d';
      trackEvent('lead_form_submit_error', {
        form_name: 'request_poc',
        error_type: 'honeypot_triggered'
      });
      return;
    }

    if (replyToInput && emailField) {
      replyToInput.value = emailField.value.trim();
    }

    setFormSubmitting(true);
    formMessage.textContent = '문의 내용을 전송하고 있습니다...';
    formMessage.style.color = '#50617d';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: new FormData(form)
      });

      if (response.ok) {
        trackEvent('generate_lead', {
          form_name: 'request_poc',
          lead_type: 'customer_strategy_request',
          form_source: formSourceInput?.value || 'direct_contact'
        });
        formMessage.textContent = '요청이 접수되었습니다. 입력하신 정보를 바탕으로 전략 안내를 준비하고 있습니다.';
        formMessage.style.color = '#0f7e72';
        form.reset();
        if (formSourceInput) {
          formSourceInput.value = 'direct_contact';
        }
        return;
      }

      if (response.status === 429) {
        formMessage.textContent = '요청이 많습니다. 잠시 후 다시 시도해주세요.';
        formMessage.style.color = '#c43d3d';
        trackEvent('lead_form_rate_limited', { form_name: 'request_poc' });
        return;
      }

      formMessage.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      formMessage.style.color = '#c43d3d';
      trackEvent('lead_form_submit_error', {
        form_name: 'request_poc',
        http_status: String(response.status)
      });
    } catch (error) {
      formMessage.textContent = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      formMessage.style.color = '#c43d3d';
      trackEvent('lead_form_submit_error', {
        form_name: 'request_poc',
        error_type: 'network_error'
      });
    } finally {
      setFormSubmitting(false);
    }
  });
}
