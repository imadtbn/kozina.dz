document.addEventListener('DOMContentLoaded', async function () {
  'use strict';
  const slug = new URLSearchParams(window.location.search).get('slug');
  const files = [
    '../data/algerien.json',
    '../data/salads.json',
    '../data/diet.json',
    '../data/traditional-desserts.json',
    '../data/modern-desserts.json',
  ];

  if (!slug) {
    document.getElementById('title').textContent = 'لم يتم تحديد الوصفة';
    return;
  }

  try {
    const results = await Promise.all(files.map(async (file) => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }));
    const recipe = results.flat().find((item) => item.slug === slug);
    if (!recipe) throw new Error('Recipe not found');
    renderRecipe(recipe);
    addSchema(recipe);
  } catch (error) {
    console.error('تعذر تحميل الوصفة:', error);
    document.getElementById('title').textContent = 'تعذر العثور على الوصفة';
    document.getElementById('description').textContent = 'تحقق من الرابط أو عد إلى الصفحة الرئيسية.';
  }

  function renderRecipe(recipe) {
    document.title = `${recipe.title} | كوزينة DZ`;
    document.getElementById('meta-description').content = recipe.description || '';
    document.getElementById('title').textContent = recipe.title;
    document.getElementById('description').textContent = recipe.description || '';
    document.getElementById('recipe-meta').textContent = `نشر: ${recipe.author || 'كوزينة DZ'} · ${recipe.date || ''}`;

    const image = document.getElementById('image');
    image.src = recipe.image;
    image.alt = recipe.title;

    const ingredients = document.getElementById('ingredients');
    ingredients.replaceChildren();
    (Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients]).filter(Boolean).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      ingredients.appendChild(li);
    });

    const method = document.getElementById('method');
    method.replaceChildren();
    const steps = Array.isArray(recipe.steps) && recipe.steps.length ? recipe.steps : [recipe.method];
    steps.filter(Boolean).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      method.appendChild(li);
    });
  }

  function addSchema(recipe) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.title,
      image: [recipe.image],
      author: { '@type': 'Person', name: recipe.author || 'كوزينة DZ' },
      datePublished: recipe.date,
      description: recipe.description,
      recipeIngredient: recipe.ingredients,
      recipeInstructions: (recipe.steps || [recipe.method]).filter(Boolean).map((text) => ({ '@type': 'HowToStep', text })),
    });
    document.head.appendChild(script);
  }
});
