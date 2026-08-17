(function () {
  'use strict';

  function loadAd(ad) {
    if (ad.dataset.adsLoaded === 'true') return;
    ad.dataset.adsLoaded = 'true';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      ad.dataset.adsLoaded = 'error';
      console.warn('تعذر تحميل إعلان AdSense:', error);
    }
  }

  function observeAds() {
    const ads = Array.from(document.querySelectorAll('.adsbygoogle'));
    if (!ads.length) return;
    if (!('IntersectionObserver' in window)) {
      ads.forEach(loadAd);
      return;
    }
    const observer = new IntersectionObserver(function (entries, instance) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadAd(entry.target);
          instance.unobserve(entry.target);
        }
      });
    }, { rootMargin: '500px 0px' });
    ads.forEach((ad) => observer.observe(ad));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAds, { once: true });
  } else {
    observeAds();
  }
})();
