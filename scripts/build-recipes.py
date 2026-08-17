from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.parse import quote, urlparse, parse_qs

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'data'
OUT_DIR = ROOT / 'recipes'


def esc(value: object) -> str:
    return html.escape(str(value or ''), quote=True)


def image_url(value: str) -> str:
    return value if value.startswith(('http://', 'https://')) else f'../{value.lstrip("./")}'


def steps(recipe: dict) -> list[str]:
    values = recipe.get('steps') or []
    if values:
        return values
    return [recipe.get('method', '')]


def video_embed(value: str, title: str) -> str:
    if not value:
        return ''
    try:
        parsed = urlparse(value)
    except ValueError:
        return ''
    if parsed.scheme != 'https':
        return ''
    host = parsed.netloc.lower().removeprefix('www.')
    path = parsed.path
    embed_url = ''
    platform = ''
    if host in {'youtu.be', 'youtube.com', 'm.youtube.com'}:
        video_id = (path.strip('/').split('/')[0] if host == 'youtu.be' else '')
        if not video_id:
            match = re.search(r'/(?:shorts|embed)/([^/?]+)', path)
            video_id = match.group(1) if match else parse_qs(parsed.query).get('v', [''])[0]
        if video_id:
            platform, embed_url = 'YouTube', f'https://www.youtube-nocookie.com/embed/{quote(video_id)}?rel=0'
    elif host in {'facebook.com', 'fb.watch'}:
        platform, embed_url = 'Facebook', f'https://www.facebook.com/plugins/video.php?href={quote(value, safe="")}&show_text=false&width=560'
    elif host == 'tiktok.com':
        match = re.search(r'/video/(\d+)', path)
        if match:
            platform, embed_url = 'TikTok', f'https://www.tiktok.com/player/v1/{match.group(1)}?description=1&music_info=1'
    elif host == 'instagram.com':
        match = re.match(r'/(p|reel|tv)/([^/]+)', path)
        if match:
            platform, embed_url = 'Instagram', f'https://www.instagram.com/{match.group(1)}/{match.group(2)}/embed'
    elif host == 'vimeo.com':
        match = re.search(r'/([0-9]+)', path)
        if match:
            platform, embed_url = 'Vimeo', f'https://player.vimeo.com/video/{match.group(1)}'
    if not embed_url:
        return f'<p class="video-fallback"><a href="{esc(value)}" target="_blank" rel="noopener noreferrer">مشاهدة الفيديو على المنصة الأصلية</a></p>'
    return f'''<div class="video-container" data-platform="{platform.lower()}"><iframe src="{esc(embed_url)}" title="فيديو طريقة تحضير {title} على {platform}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'''


def schema(recipe: dict) -> str:
    data = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        'name': recipe['title'],
        'image': [image_url(recipe['image'])],
        'author': {'@type': 'Person', 'name': recipe.get('author') or 'كوزينة DZ'},
        'datePublished': recipe.get('date'),
        'description': recipe.get('description'),
        'recipeCategory': recipe.get('category'),
        'recipeIngredient': recipe.get('ingredients', []),
        'recipeInstructions': [
            {'@type': 'HowToStep', 'text': item} for item in steps(recipe) if item
        ],
    }
    if recipe.get('video'):
        data['video'] = {'@type': 'VideoObject', 'contentUrl': recipe['video'], 'name': recipe['title']}
    return json.dumps(data, ensure_ascii=False, separators=(',', ':'))


def render(recipe: dict) -> str:
    title = esc(recipe['title'])
    description = esc(recipe.get('description'))
    image = esc(image_url(recipe['image']))
    canonical = f'https://imadtbn.github.io/kozina.dz/recipes/{esc(recipe["slug"])}.html'
    ingredients = ''.join(f'<li>{esc(item)}</li>' for item in recipe.get('ingredients', []))
    method = ''.join(f'<li>{esc(item)}</li>' for item in steps(recipe) if item)
    video = video_embed(recipe.get('video'), title)
    return f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | كوزينة DZ</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ar_DZ">
  <meta property="og:title" content="{title} | كوزينة DZ">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{image}">
  <meta property="og:url" content="{canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} | كوزينة DZ">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image}">
  <link rel="icon" href="../icons/logo kozina.webp" type="image/webp">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style/style-main.css">
  <link rel="stylesheet" href="../style/commun-recipes-pages.css">
  <script type="application/ld+json">{schema(recipe)}</script>
</head>
<body>
  <header class="sub-header">
    <nav class="navbar" aria-label="التنقل الرئيسي">
      <a class="logo" href="../index.html"><img src="../icons/logo kozina.webp" alt="كوزينة DZ" class="logo-img"><span class="logo-title">المطبخ الجزائري</span></a>
      <ul class="nav-links">
        <li><a href="../index.html">الرئيسية</a></li>
        <li><a href="../pages/algerien.html">طبخ جزائري</a></li>
        <li><a href="../pages/salads.html">السلطات</a></li>
        <li><a href="../pages/diet.html">حميات غذائية</a></li>
        <li><a href="../pages/traditional-desserts.html">حلويات تقليدية</a></li>
        <li><a href="../pages/modern-desserts.html">حلويات عصرية</a></li>
        <li><a href="../pages/about.html">من نحن</a></li>
        <li><a href="../pages/contact.html">اتصل بنا</a></li>
      </ul>
      <button class="burger" type="button" aria-label="فتح قائمة التنقل" aria-expanded="false"><i class="fas fa-bars" aria-hidden="true"></i></button>
    </nav>
    <div class="page-title"><h1>{title}</h1><p>وصفة جزائرية من كوزينة DZ</p></div>
  </header>
  <div class="top-bar">
    <div class="search-container"><label class="sr-only" for="search-input">بحث</label><input type="search" id="search-input" placeholder="ابحث عن وصفة / مقادير، عنوان، ناشر..." aria-label="بحث"><i class="fas fa-search" aria-hidden="true"></i></div>
    <a href="https://forms.gle/DkJgvCXinp5bcagM7" target="_blank" rel="noopener noreferrer" class="btn-submit"><i class="fas fa-utensils" aria-hidden="true"></i> نشر- إضافة وصفة</a>
  </div>
  <main class="recipe-page">
    <article class="recipe" itemscope itemtype="https://schema.org/Recipe">
      <header class="recipe-header"><h2 itemprop="name">{title}</h2><p class="recipe-meta">نشر: {esc(recipe.get('author') or 'كوزينة DZ')} · {esc(recipe.get('date'))}</p></header>
      <figure class="recipe-media"><img src="{image}" alt="{title}" itemprop="image" width="800" height="500"></figure>
      <div class="recipe-layout">
        <div class="recipe-primary">
          <section class="recipe-description"><h2>عن الوصفة</h2><p itemprop="description">{description}</p></section>
          <section class="recipe-method"><h2>طريقة التحضير</h2><ol itemprop="recipeInstructions">{method}</ol></section>
{video}
        </div>
        <aside class="recipe-sidebar">
          <section class="recipe-ingredients"><h2>المقادير</h2><ul itemprop="recipeIngredient">{ingredients}</ul></section>
          <section class="share-box" aria-labelledby="share-title"><h2 id="share-title">شارك الوصفة</h2><div class="share-actions"><button type="button" data-share="native">مشاركة</button><button type="button" data-share="whatsapp">واتساب</button><button type="button" data-share="facebook">فيسبوك</button><button type="button" data-share="telegram">تلغرام</button><button type="button" data-share="copy">نسخ الرابط</button></div></section>
        </aside>
      </div>
      <p class="recipe-back"><a class="back-link" href="../index.html">العودة إلى الوصفات</a></p>
    </article>
  </main>
  <footer><div class="footer-container"><div class="footer-col footer-brand"><img src="../icons/logo kozina.webp" alt="كوزينة DZ" class="footer-logo"><h3>مطبخ الجزائر</h3><p>موقع يقدم أشهى الوصفات الجزائرية التقليدية والعصرية، مع خيارات صحية تلائم جميع الأنظمة الغذائية.</p></div><div class="footer-col"><h3>روابط سريعة</h3><ul><li><a href="../index.html">الرئيسية</a></li><li><a href="../pages/about.html">من نحن</a></li><li><a href="../pages/contact.html">اتصل بنا</a></li><li><a href="../pages/privacy.html">سياسة الخصوصية</a></li></ul></div></div><div class="copyright"><p>© 2026 كوزينة DZ. جميع الحقوق محفوظة.</p></div></footer>
  <script src="../javascript/commun.js"></script>
  <script src="../javascript/video-utils.js"></script>
  <script src="../javascript/share.js"></script>
</body>
</html>
'''

recipes = []
for path in sorted(DATA_DIR.glob('*.json')):
    recipes.extend(json.loads(path.read_text(encoding='utf-8')))

for recipe in recipes:
    (OUT_DIR / f"{recipe['slug']}.html").write_text(render(recipe), encoding='utf-8')

print(f'Generated {len(recipes)} static recipe pages.')
