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

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function startAnalytics() {
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    // Apply analytics cookies automatically to U.S. traffic. Keep the default cookieless elsewhere.
    gtag('consent', 'default', { analytics_storage: 'granted', region: ['US'] });
    if (preference === 'allow') gtag('consent', 'update', { analytics_storage: 'granted' });
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
      window[optOut] = preference === 'decline';
      if (preference === 'decline') clearAnalyticsCookies();
      else if (!tagLoaded) startAnalytics();
      else if (preference === 'allow') gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (settings) {
      const status = {
        allow: 'Analytics allowed in this browser.',
        decline: 'Analytics declined in this browser.'
      };
      settings.querySelector('[role="status"]').textContent = status[preference] || 'Using the default settings described above.';
    }
  }

  settings?.addEventListener('click', event => {
    const button = event.target.closest('button[data-choice]');
    if (!button) return;
    preference = button.dataset.choice;
    try {
      localStorage.setItem(preferenceKey, preference);
    } catch {
      // Browser storage is optional for the current page.
    }
    applyPreference();
  });
  window.addEventListener('storage', event => {
    if (event.key !== preferenceKey && event.key !== null) return;
    preference = event.newValue === 'allow' || event.newValue === 'decline' ? event.newValue : null;
    applyPreference();
  });

  applyPreference();
  if (settings) settings.hidden = false;
})();
