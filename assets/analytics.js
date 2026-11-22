(() => {
  'use strict';

  if (window.top !== window.self) {
    document.querySelector('.site-privacy-link')?.remove();
    return;
  }

  const measurementId = 'G-70FW0Z6CGP';
  const optOut = `ga-disable-${measurementId}`;
  const preferenceKey = 'andyeconlab.analytics-preference';
  const settings = document.querySelector('[data-analytics-settings]');
  const liveSite = location.protocol === 'https:' &&
    ['andyeconlab.com', 'www.andyeconlab.com'].includes(location.hostname);
  let tagLoaded = false;
  let preference = null;

  try {
    const saved = localStorage.getItem(preferenceKey);
    if (saved === 'allow' || saved === 'decline') preference = saved;
  } catch {
    // A choice still works on the current page when browser storage is unavailable.
  }

  const prompt = document.createElement('section');
  prompt.className = 'site-analytics-prompt';
  prompt.setAttribute('aria-label', 'Optional website analytics');
  prompt.innerHTML = `
    <p>Allow Google Analytics to measure site visits and clicks on CV and paper links?
      <a>Privacy details</a></p>
    <div class="site-analytics-actions">
      <button type="button" data-choice="allow">Allow analytics</button>
      <button type="button" data-choice="decline">Decline</button>
    </div>`;
  const privacyLink = document.querySelector('.site-privacy-link a');
  if (!settings && privacyLink) prompt.querySelector('a').href = privacyLink.href;

  function startAnalytics() {
    if (tagLoaded) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(tag);
    tagLoaded = true;
  }

  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_[a-z0-9_]+)?$/i.test(name)) continue;
      const expired = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;
      document.cookie = expired;
      document.cookie = `${expired}; Domain=andyeconlab.com`;
    }
  }

  function applyPreference() {
    if (liveSite) {
      window[optOut] = preference !== 'allow';
      if (preference === 'allow') startAnalytics();
      else clearAnalyticsCookies();
    }
    prompt.hidden = preference !== null;
    if (settings) {
      const status = {
        allow: 'Analytics allowed in this browser.',
        decline: 'Analytics declined in this browser.'
      };
      settings.querySelector('[role="status"]').textContent = status[preference] || 'Analytics is off until you allow it.';
    }
  }

  const controls = settings || prompt;
  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-choice]');
    if (!button) return;
    preference = button.dataset.choice;
    try {
      localStorage.setItem(preferenceKey, preference);
    } catch {
      // Browser storage is optional for the current page.
    }
    applyPreference();
    if (!settings) privacyLink?.focus({ preventScroll: true });
  });
  window.addEventListener('storage', event => {
    if (event.key !== preferenceKey && event.key !== null) return;
    preference = event.newValue === 'allow' || event.newValue === 'decline' ? event.newValue : null;
    applyPreference();
  });

  applyPreference();
  if (settings) settings.hidden = false;
  else document.body.append(prompt);
})();
