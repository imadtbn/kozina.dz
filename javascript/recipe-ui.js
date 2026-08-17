(function () {
  'use strict';

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  function safeUrl(value, allowedProtocols) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      if (allowedProtocols.includes(url.protocol)) return url.href;
    } catch (_) {
      return '';
    }
    return '';
  }

  function normalizeText(value) {
    return String(value || '')
      .toLocaleLowerCase('ar-DZ')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function createImage(src, alt, className) {
    const image = makeElement('img', className);
    image.src = safeUrl(src, ['http:', 'https:']) || 'images/couscous.jpg';
    image.alt = alt || 'صورة وصفة';
    image.loading = 'lazy';
    image.width = 640;
    image.height = 420;
    image.addEventListener('error', function () {
      if (!image.dataset.fallback) {
        image.dataset.fallback = 'true';
        image.src = window.location.pathname.includes('/pages/') ? '../images/couscous.jpg' : 'images/couscous.jpg';
      }
    });
    return image;
  }

  function recipeText(recipe) {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join('، ') : recipe.ingredients;
    return [recipe.title, ingredients, recipe.description, recipe.author, recipe.badge, recipe.category].join(' ');
  }

  function createCard(recipe, options) {
    const opts = options || {};
    const card = makeElement('article', 'card');
    card.dataset.id = recipe.id;
    card.dataset.category = recipe.category || '';
    card.dataset.search = normalizeText(recipeText(recipe));
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `عرض وصفة ${recipe.title}`);

    const imageBox = makeElement('div', 'card-image');
    imageBox.appendChild(createImage(recipe.image, recipe.title));
    if (recipe.badge) imageBox.appendChild(makeElement('span', 'card-badge', recipe.badge));

    const content = makeElement('div', 'card-content');
    content.appendChild(makeElement('h3', '', recipe.title));
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.join('، ') : (recipe.ingredients || '');
    content.appendChild(makeElement('p', 'ingredients', `مقادير: ${ingredients}`));

    const footer = makeElement('div', 'card-footer');
    const date = makeElement('span', 'date');
    date.appendChild(makeElement('i', 'far fa-calendar-alt'));
    date.appendChild(document.createTextNode(` ${recipe.date || ''}`));
    footer.appendChild(date);
    footer.appendChild(makeElement('span', 'author', `نشر: ${recipe.author || 'كوزينة DZ'}`));
    content.appendChild(footer);

    card.appendChild(imageBox);
    card.appendChild(content);

    const open = function () {
      if (typeof opts.onOpen === 'function') opts.onOpen(recipe);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
    return card;
  }

  function renderModal(recipe, modal) {
    if (!modal) return;
    const body = modal.querySelector('.modal-body');
    if (!body) return;
    body.replaceChildren();

    const title = makeElement('h2', '', recipe.title);
    body.appendChild(title);
    body.appendChild(createImage(recipe.image, recipe.title));
    body.appendChild(makeElement('p', '', `الوصف: ${recipe.description || ''}`));

    const ingredientTitle = makeElement('h3', '', 'المقادير');
    body.appendChild(ingredientTitle);
    const ingredientsList = makeElement('ul', 'ingredients-list');
    (Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients]).filter(Boolean).forEach(function (item) {
      ingredientsList.appendChild(makeElement('li', '', item));
    });
    body.appendChild(ingredientsList);

    const methodTitle = makeElement('h3', '', 'طريقة التحضير');
    body.appendChild(methodTitle);
    const methodList = makeElement('ol', 'method-list');
    const steps = Array.isArray(recipe.steps) && recipe.steps.length ? recipe.steps : [recipe.method];
    steps.filter(Boolean).forEach(function (step) {
      methodList.appendChild(makeElement('li', '', step));
    });
    body.appendChild(methodList);

    if (recipe.video) {
      const video = safeUrl(recipe.video, ['https:']);
      if (video) {
        const videoContainer = makeElement('div', 'video-container');
        const iframe = document.createElement('iframe');
        iframe.src = video;
        iframe.width = '100%';
        iframe.height = '280';
        iframe.loading = 'lazy';
        iframe.title = `فيديو طريقة تحضير ${recipe.title}`;
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        videoContainer.appendChild(iframe);
        body.appendChild(videoContainer);
      }
    }

    const info = makeElement('div', 'author-info');
    info.appendChild(makeElement('p', '', `نشر: ${recipe.author || 'كوزينة DZ'}`));
    info.appendChild(makeElement('p', '', `تاريخ النشر: ${recipe.date || ''}`));
    if (recipe.slug) {
      const link = document.createElement('a');
      const recipePath = window.location.pathname.includes('/pages/') ? `../recipes/${recipe.slug}.html` : `recipes/${recipe.slug}.html`;
      link.href = new URL(recipePath, window.location.href).href;
      link.textContent = 'فتح صفحة الوصفة ومشاركتها';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      info.appendChild(link);
    }
    body.appendChild(info);
  }

  window.KozinaRecipeUI = {
    createCard,
    renderModal,
    normalizeText,
    safeUrl,
  };
})();
