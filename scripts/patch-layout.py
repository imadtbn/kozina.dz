from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ADSENSE_HEAD = '''
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5656416032906373" crossorigin="anonymous"></script>
    <meta name="google-adsense-account" content="ca-pub-5656416032906373">
'''

ADS = {
    'fluid-01': '''<div class="ad-container ad-container--fluid" data-ad-priority="normal" aria-label="إعلان"><ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-fr+56+4k-d4+74" data-ad-client="ca-pub-5656416032906373" data-ad-slot="7867079394"></ins></div>''',
    'image-01': '''<div class="ad-container ad-container--secondary" data-ad-priority="low" aria-label="إعلان"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5656416032906373" data-ad-slot="3143411927" data-ad-format="auto" data-full-width-responsive="true"></ins></div>''',
    'fluid-02': '''<div class="ad-container ad-container--fluid" data-ad-priority="normal" aria-label="إعلان"><ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-h9-h+8-jr+r8" data-ad-client="ca-pub-5656416032906373" data-ad-slot="8546947691"></ins></div>''',
    'image-02': '''<div class="ad-container ad-container--secondary" data-ad-priority="low" aria-label="إعلان"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5656416032906373" data-ad-slot="1760836049" data-ad-format="auto" data-full-width-responsive="true"></ins></div>''',
    'autorelaxed': '''<div class="ad-container ad-container--autorelaxed" data-ad-priority="normal" aria-label="إعلان"><ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="ca-pub-5656416032906373" data-ad-slot="6528123169"></ins></div>''',
}


def paths_for(path: Path) -> dict[str, str]:
    if path.parent.name == 'pages' or path.parent.name == 'recipes':
        return {
            'home': '../index.html',
            'about': '../pages/about.html',
            'contact': '../pages/contact.html',
            'privacy': '../pages/privacy.html',
            'algerien': '../pages/algerien.html',
            'salads': '../pages/salads.html',
            'diet': '../pages/diet.html',
            'traditional': '../pages/traditional-desserts.html',
            'modern': '../pages/modern-desserts.html',
            'logo': '../icons/logo kozina.webp',
            'ads': '../javascript/ads.js',
            'logo_alt': 'كوزينة DZ',
        }
    return {
        'home': 'index.html',
        'about': 'pages/about.html',
        'contact': 'pages/contact.html',
        'privacy': 'pages/privacy.html',
        'algerien': 'pages/algerien.html',
        'salads': 'pages/salads.html',
        'diet': 'pages/diet.html',
        'traditional': 'pages/traditional-desserts.html',
        'modern': 'pages/modern-desserts.html',
        'logo': 'icons/logo kozina.webp',
        'ads': 'javascript/ads.js',
        'logo_alt': 'كوزينة DZ',
    }


def footer(path: Path) -> str:
    p = paths_for(path)
    return f'''<footer class="site-footer">
        <div class="footer-container">
            <div class="footer-col footer-brand">
                <img src="{p['logo']}" alt="{p['logo_alt']}" class="footer-logo" loading="lazy">
                <h3>مطبخ الجزائر</h3>
                <p>وصفات جزائرية تقليدية وعصرية، بمقادير واضحة وخطوات سهلة تناسب كل بيت.</p>
                <a class="footer-cta" href="https://forms.gle/DkJgvCXinp5bcagM7" target="_blank" rel="noopener noreferrer"><i class="fas fa-utensils" aria-hidden="true"></i> أضف وصفتك</a>
            </div>
            <div class="footer-col">
                <h3>استكشف الوصفات</h3>
                <ul>
                    <li><a href="{p['home']}">الرئيسية</a></li>
                    <li><a href="{p['algerien']}">طبخ جزائري</a></li>
                    <li><a href="{p['salads']}">سلطات صحية</a></li>
                    <li><a href="{p['diet']}">حميات غذائية</a></li>
                    <li><a href="{p['traditional']}">حلويات تقليدية</a></li>
                    <li><a href="{p['modern']}">حلويات عصرية</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>معلومات الموقع</h3>
                <ul>
                    <li><a href="{p['about']}">من نحن</a></li>
                    <li><a href="{p['contact']}">اتصل بنا</a></li>
                    <li><a href="{p['privacy']}">سياسة الخصوصية</a></li>
                </ul>
                <p class="footer-note">نحافظ على وصفات مفيدة، قراءة مريحة، وتجربة بسيطة.</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2026 كوزينة DZ. جميع الحقوق محفوظة.</p>
            <a href="{p['privacy']}">الخصوصية</a>
        </div>
    </footer>'''


def ad_script(path: Path) -> str:
    return f'<script src="{paths_for(path)["ads"]}" defer></script>'


def patch(path: Path) -> None:
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'\s*<!-- Google AdSense -->.*?<meta name="google-adsense-account"[^>]*>', '', text, flags=re.S | re.I)
    text = re.sub(r'\s*<script[^>]+pagead2\.googlesyndication\.com[^>]*></script>', '', text, flags=re.S | re.I)
    text = re.sub(r'\s*<meta name="google-adsense-account"[^>]*>', '', text, flags=re.I)
    text = re.sub(r'\s*<div class="ad-container(?: [^"]*)?"[^>]*>.*?</div>', '', text, flags=re.S | re.I)
    text = text.replace('</head>', ADSENSE_HEAD + '\n</head>', 1)

    existing_footer = re.search(r'<footer\b.*?</footer>', text, flags=re.S | re.I)
    if existing_footer:
        text = text[:existing_footer.start()] + footer(path) + text[existing_footer.end():]
    else:
        text = text.replace('</body>', footer(path) + '\n</body>', 1)

    ads_before_main_end = '\n' + ADS['fluid-02'] + '\n' + ADS['image-02'] + '\n'
    ads_before_footer = '\n' + ADS['image-01'] + '\n' + ADS['autorelaxed'] + '\n'
    main_match = re.search(r'<main\b[^>]*>', text, flags=re.I)
    if main_match:
        content_start = main_match.end()
        section_end = text.find('</section>', content_start)
        insert_at = section_end + len('</section>') if section_end != -1 else content_start
        text = text[:insert_at] + '\n' + ADS['fluid-01'] + text[insert_at:]
        text = text.replace('</main>', ads_before_main_end + '</main>', 1)
    text = text.replace('<footer class="site-footer">', ads_before_footer + '<footer class="site-footer">', 1)

    script_marker = ad_script(path)
    if script_marker not in text:
        text = text.replace('</body>', script_marker + '\n</body>', 1)
    path.write_text(text, encoding='utf-8')


pages = [ROOT / 'index.html', *sorted((ROOT / 'pages').glob('*.html')), *sorted((ROOT / 'recipes').glob('*.html'))]
for page in pages:
    patch(page)
print(f'Patched {len(pages)} HTML pages with shared footer and AdSense layout.')
