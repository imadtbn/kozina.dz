(function () {
  'use strict';

  function getShareData() {
    const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const text = document.querySelector('meta[property="og:description"]')?.content || title;
    return { title, text, url: window.location.href };
  }

  function openShare(url) {
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const data = getShareData();
    const buttons = document.querySelectorAll('[data-share]');
    buttons.forEach(function (button) {
      button.addEventListener('click', async function () {
        const network = button.dataset.share;
        if (network === 'native') {
          if (navigator.share) {
            try {
              await navigator.share(data);
            } catch (_) {
              // إلغاء المشاركة من المستخدم ليس خطأ.
            }
          } else {
            await navigator.clipboard?.writeText(data.url);
            button.textContent = 'تم نسخ الرابط';
            window.setTimeout(() => { button.textContent = 'مشاركة'; }, 1800);
          }
          return;
        }
        if (network === 'copy') {
          try {
            await navigator.clipboard.writeText(data.url);
            button.textContent = 'تم نسخ الرابط';
            window.setTimeout(() => { button.textContent = 'نسخ الرابط'; }, 1800);
          } catch (_) {
            window.prompt('انسخ رابط الوصفة:', data.url);
          }
          return;
        }
        const encodedUrl = encodeURIComponent(data.url);
        const encodedText = encodeURIComponent(`${data.title} - ${data.text}`);
        const links = {
          whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        };
        if (links[network]) openShare(links[network]);
      });
    });
  });
})();
