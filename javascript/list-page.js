document.addEventListener('DOMContentLoaded', async function () {
  'use strict';
  const ui = window.KozinaRecipeUI;
  const grid = document.querySelector('.cards-grid');
  if (!grid || !ui) return;

  const fileName = window.location.pathname.split('/').pop().replace('.html', '');
  const dataFiles = {
    algerien: '../data/algerien.json',
    salads: '../data/salads.json',
    diet: '../data/diet.json',
    'traditional-desserts': '../data/traditional-desserts.json',
    'modern-desserts': '../data/modern-desserts.json',
  };
  const dataFile = dataFiles[fileName];
  if (!dataFile) return;

  const loadMoreButton = document.getElementById('loadMoreBtn');
  const searchInput = document.getElementById('search-input');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const modal = document.getElementById('recipeModal');
  const closeButton = modal?.querySelector('.close-modal');
  let recipes = [];
  let visibleCount = 4;
  let activeFilter = 'all';

  function filteredRecipes() {
    const query = ui.normalizeText(searchInput?.value || '');
    return recipes.filter(function (recipe) {
      const matchesFilter = activeFilter === 'all' || recipe.category === activeFilter;
      const matchesSearch = !query || ui.normalizeText([
        recipe.title,
        recipe.description,
        recipe.author,
        recipe.badge,
        ...(Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients]),
      ].join(' ')).includes(query);
      return matchesFilter && matchesSearch;
    });
  }

  function render() {
    const filtered = filteredRecipes();
    const visible = filtered.slice(0, visibleCount);
    grid.replaceChildren();
    visible.forEach((recipe) => grid.appendChild(ui.createCard(recipe, { onOpen: openModal })));
    if (loadMoreButton) {
      loadMoreButton.hidden = visible.length >= filtered.length;
    }
    const empty = document.getElementById('empty-state');
    if (empty) empty.hidden = filtered.length !== 0;
  }

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

  try {
    const response = await fetch(dataFile);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    recipes = await response.json();
    recipes.sort((a, b) => new Date(b.date) - new Date(a.date));
    render();
  } catch (error) {
    console.error('تعذر تحميل الوصفات:', error);
    grid.replaceChildren();
    const errorState = document.getElementById('error-state');
    if (errorState) errorState.hidden = false;
  }

  searchInput?.addEventListener('input', function () {
    visibleCount = 4;
    render();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      activeFilter = button.dataset.filter || 'all';
      visibleCount = 4;
      render();
    });
  });

  loadMoreButton?.addEventListener('click', function () {
    visibleCount += 4;
    render();
  });

  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
  });
});
