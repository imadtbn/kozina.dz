document.addEventListener('DOMContentLoaded', async function () {
  'use strict';
  const ui = window.KozinaRecipeUI;
  if (!ui) return;

  const sections = [
    ['algerien-cards', 'data/algerien.json'],
    ['salads-cards', 'data/salads.json'],
    ['diet-cards', 'data/diet.json'],
    ['traditional-desserts-cards', 'data/traditional-desserts.json'],
    ['modern-desserts-cards', 'data/modern-desserts.json'],
  ];
  const modal = document.getElementById('recipeModal');
  const closeButton = modal?.querySelector('.close-modal');
  const searchInput = document.getElementById('search-input');
  let allRecipes = [];

  function openModal(recipe) {
    if (!modal) return;
    ui.renderModal(recipe, modal);
    modal.hidden = false;
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    closeButton?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  function render(query) {
    const normalized = ui.normalizeText(query);
    sections.forEach(function ([containerId]) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.replaceChildren();
      allRecipes.filter(function (recipe) {
        return recipe.sectionId === containerId && (!normalized || ui.normalizeText([
          recipe.title,
          recipe.description,
          recipe.author,
          recipe.badge,
          ...(Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients]),
        ].join(' ')).includes(normalized));
      }).slice(0, 3).forEach(function (recipe) {
        container.appendChild(ui.createCard(recipe, { onOpen: openModal }));
      });
    });
  }

  try {
    const results = await Promise.all(sections.map(async function ([sectionId, file]) {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const recipes = await response.json();
      return recipes.map((recipe) => ({ ...recipe, sectionId }));
    }));
    allRecipes = results.flat();
    render('');
  } catch (error) {
    console.error('خطأ في تحميل الوصفات:', error);
    document.querySelectorAll('.cards-grid').forEach(function (grid) {
      grid.innerHTML = '<p class="empty-state">تعذر تحميل الوصفات حالياً. حاول تحديث الصفحة.</p>';
    });
  }

  searchInput?.addEventListener('input', function (event) {
    render(event.target.value);
  });

  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  const installButton = document.getElementById('installBtn');
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  installButton?.addEventListener('click', async function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });
});
