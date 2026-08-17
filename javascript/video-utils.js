(function () {
  'use strict';

  function parseVideoUrl(value) {
    if (!value) return null;
    let url;
    try {
      url = new URL(value);
    } catch (_) {
      return null;
    }
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const path = url.pathname;
    let embedUrl = '';
    let platform = '';

    if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com') {
      const id = host === 'youtu.be'
        ? path.split('/').filter(Boolean)[0]
        : (path.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1] || url.searchParams.get('v'));
      if (id) {
        platform = 'YouTube';
        embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`;
      }
    } else if (host === 'facebook.com' || host === 'fb.watch') {
      platform = 'Facebook';
      embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.href)}&show_text=false&width=560`;
    } else if (host === 'tiktok.com') {
      const id = path.match(/\/video\/(\d+)/)?.[1];
      if (id) {
        platform = 'TikTok';
        embedUrl = `https://www.tiktok.com/player/v1/${id}?description=1&music_info=1`;
      }
    } else if (host === 'instagram.com') {
      const match = path.match(/^\/(p|reel|tv)\/([^/]+)/);
      if (match) {
        platform = 'Instagram';
        embedUrl = `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
      }
    } else if (host === 'vimeo.com') {
      const id = path.match(/\/(\d+)/)?.[1];
      if (id) {
        platform = 'Vimeo';
        embedUrl = `https://player.vimeo.com/video/${id}`;
      }
    }

    return embedUrl ? { platform, embedUrl, originalUrl: url.href } : null;
  }

  function createEmbed(value, title) {
    const parsed = parseVideoUrl(value);
    if (!parsed) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'video-container';
    wrapper.dataset.platform = parsed.platform.toLowerCase();
    const iframe = document.createElement('iframe');
    iframe.src = parsed.embedUrl;
    iframe.title = `فيديو ${title || 'الوصفة'} على ${parsed.platform}`;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    wrapper.appendChild(iframe);
    return wrapper;
  }

  window.KozinaVideo = { parseVideoUrl, createEmbed };
})();
