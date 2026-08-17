from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import requests

BASE = 'http://localhost:8000/'
ROOT = Path(__file__).resolve().parents[1]

pages = [
    '', 'pages/algerien.html', 'pages/salads.html', 'pages/diet.html',
    'pages/traditional-desserts.html', 'pages/modern-desserts.html',
    'pages/about.html', 'pages/contact.html', 'pages/privacy.html',
]

sitemap = ET.parse(ROOT / 'sitemap.xml').getroot()
ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
for loc in sitemap.findall('sm:url/sm:loc', ns):
    url = loc.text.replace('https://imadtbn.github.io/kozina.dz/', BASE)
    if url not in [BASE + page for page in pages]:
        pages.append(url.removeprefix(BASE))

failures = []
for page in pages:
    response = requests.get(BASE + page, timeout=10)
    if response.status_code != 200:
        failures.append(f'{page}: HTTP {response.status_code}')
        continue
    text = response.text
    if page.startswith('recipes/'):
        for required in ['application/ld+json', 'share-box', 'meta name="description"', 'rel="canonical"']:
            if required not in text:
                failures.append(f'{page}: missing {required}')
    elif page in ['', 'pages/algerien.html', 'pages/salads.html', 'pages/diet.html', 'pages/traditional-desserts.html', 'pages/modern-desserts.html']:
        if 'recipe-ui.js' not in text and page == '':
            failures.append(f'{page}: missing recipe-ui.js')
        if 'canonical' not in text:
            failures.append(f'{page}: missing canonical')

if failures:
    print('\n'.join(failures))
    sys.exit(1)
print(f'Smoke test passed: {len(pages)} pages returned HTTP 200 and required markers were found.')
