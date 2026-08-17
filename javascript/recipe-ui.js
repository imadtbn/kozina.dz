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
    image.src = safeUrl(src, ['http:', 'https:']) || (window.location.pathname.includes('/pages/') ? '../images/couscous.jpg' : 'images/couscous.jpg');
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
    card.setAttribute('aria-label', `عرض ملخص وصفة ${recipe.title}`);

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

  function getRecipePageUrl(recipe) {
    const relativePath = window.location.pathname.includes('/pages/')
      ? `../recipes/${recipe.slug}.html`
      : `recipes/${recipe.slug}.html`;
    return new URL(relativePath, window.location.href).href;
  }

  function renderModal(recipe, modal) {
    if (!modal) return;
    const body = modal.querySelector('.modal-body');
    if (!body) return;
    body.replaceChildren();
    modal.setAttribute('aria-labelledby', 'modal-recipe-title');

    const header = makeElement('div', 'modal-recipe-header');
    header.appendChild(makeElement('span', 'modal-kicker', recipe.badge || 'وصفة جزائرية'));
    header.appendChild(makeElement('h2', '', recipe.title));
    header.lastChild.id = 'modal-recipe-title';
    header.appendChild(makeElement('p', 'modal-meta', `نشر: ${recipe.author || 'كوزينة DZ'} · ${recipe.date || ''}`));
    body.appendChild(header);

    const image = createImage(recipe.image, recipe.title, 'modal-recipe-image');
    body.appendChild(image);

    const description = String(recipe.description || '').trim();
    if (description) {
      body.appendChild(makeElement('p', 'modal-summary', description.length > 190 ? `${description.slice(0, 187)}...` : description));
    }

    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.filter(Boolean) : [recipe.ingredients].filter(Boolean);
    if (ingredients.length) {
      const ingredientBox = makeElement('section', 'modal-ingredients');
      ingredientBox.appendChild(makeElement('h3', '', 'أهم المقادير'));
      const list = makeElement('ul', 'ingredients-list');
      ingredients.slice(0, 6).forEach((item) => list.appendChild(makeElement('li', '', item)));
      ingredientBox.appendChild(list);
      if (ingredients.length > 6) ingredientBox.appendChild(makeElement('p', 'modal-more-note', `و ${ingredients.length - 6} مقادير أخرى في الصفحة الكاملة`));
      body.appendChild(ingredientBox);
    }

    const actions = makeElement('div', 'modal-actions');
    const moreLink = document.createElement('a');
    moreLink.className = 'more-recipe-btn';
    moreLink.href = getRecipePageUrl(recipe);
    moreLink.target = '_blank';
    moreLink.rel = 'noopener noreferrer';
    moreLink.textContent = 'المزيد من الوصفة والفيديو';
    actions.appendChild(moreLink);
    const closeLink = makeElement('button', 'modal-secondary-btn', 'متابعة التصفح');
    closeLink.type = 'button';
    closeLink.addEventListener('click', () => modal.querySelector('.close-modal')?.click());
    actions.appendChild(closeLink);
    body.appendChild(actions);
  }

  window.KozinaRecipeUI = {
    createCard,
    renderModal,
    normalizeText,
    safeUrl,
  };
})();
