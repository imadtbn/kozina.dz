import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const recipeFiles = fs.readdirSync(dataDir).filter((file) => file.endsWith('.json'));
const recipes = recipeFiles.flatMap((file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')));
const failures = [];

const slugs = new Set();
for (const recipe of recipes) {
  for (const field of ['id', 'title', 'image', 'ingredients', 'method', 'description', 'author', 'date', 'slug', 'steps']) {
    if (recipe[field] === undefined || recipe[field] === null || recipe[field] === '') {
      failures.push(`${recipe.id}: missing ${field}`);
    }
  }
  if (slugs.has(recipe.slug)) failures.push(`duplicate slug: ${recipe.slug}`);
  slugs.add(recipe.slug);
  if (!Array.isArray(recipe.ingredients)) failures.push(`${recipe.slug}: ingredients must be an array`);
  if (!Array.isArray(recipe.steps)) failures.push(`${recipe.slug}: steps must be an array`);
}

const pages = [
  'index.html',
  'pages/algerien.html',
  'pages/salads.html',
  'pages/diet.html',
  'pages/traditional-desserts.html',
  'pages/modern-desserts.html',
  'pages/about.html',
  'pages/contact.html',
  'pages/privacy.html',
];
for (const page of pages) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  if ((html.match(/meta name="description"/gi) || []).length !== 1) failures.push(`${page}: expected one description`);
  if (!/rel="canonical"/.test(html)) failures.push(`${page}: missing canonical`);
  if ((html.match(/href="#"/g) || []).length) failures.push(`${page}: placeholder link`);
  if ((html.match(/<section\b/g) || []).length !== (html.match(/<\/section>/g) || []).length) failures.push(`${page}: unbalanced sections`);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const slug of slugs) {
  const expected = `recipes/${slug}.html`;
  if (!sitemap.includes(expected)) failures.push(`sitemap missing ${expected}`);
  if (!fs.existsSync(path.join(root, expected))) failures.push(`missing page ${expected}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Site validation passed: ${recipes.length} recipes, ${slugs.size} unique slugs.`);
