/* مدير إعلانات كوزينة DZ: تركيب موحّد، تحميل كسول، ومنع التهيئة المكررة */
(function () {
    'use strict';

    var ADS_CLIENT = 'ca-pub-5656416032906373';
    var ADS = {
        homeFluid: {
            kind: 'in-feed',
            format: 'fluid',
            layoutKey: '-fr+56+4k-d4+74',
            slot: '7867079394',
        },
        listingFluid: {
            kind: 'in-feed',
            format: 'fluid',
            layoutKey: '-h9-h+8-jr+r8',
            slot: '8546947691',
        },
        infoFluid: {
            kind: 'in-feed',
            format: 'fluid',
            layoutKey: '-h6-l+d-jc+qd',
            slot: '6152718642',
        },
        displayPrimary: {
            kind: 'display',
            format: 'auto',
            responsive: true,
            slot: '3143411927',
        },
        displaySecondary: {
            kind: 'display',
            format: 'auto',
            responsive: true,
            slot: '1760836049',
        },
        displayTertiary: {
            kind: 'display',
            format: 'auto',
            responsive: true,
            slot: '5508509362',
        },
        articlePrimary: {
            kind: 'in-article',
            layout: 'in-article',
            format: 'fluid',
            slot: '6118497380',
        },
        articleSecondary: {
            kind: 'in-article',
            layout: 'in-article',
            format: 'fluid',
            slot: '7319898418',
        },
        multiplex: {
            kind: 'multiplex',
            format: 'autorelaxed',
            slot: '6528123169',
        },
    };

    function makeSlot(config) {
        var wrapper = document.createElement('section');
        var ad = document.createElement('ins');

        wrapper.className = 'ad-slot ad-slot--' + config.kind;
        wrapper.setAttribute('aria-label', 'إعلان');
        wrapper.setAttribute('data-ad-kind', config.kind);
        wrapper.setAttribute('data-ad-slot', config.slot);
        wrapper.setAttribute('aria-live', 'polite');

        ad.className = 'adsbygoogle';
        ad.style.display = 'block';
        ad.setAttribute('data-ad-client', ADS_CLIENT);
        ad.setAttribute('data-ad-slot', config.slot);
        ad.setAttribute('data-ad-format', config.format);

        if (config.layoutKey) {
            ad.setAttribute('data-ad-layout-key', config.layoutKey);
        }
        if (config.layout) {
            ad.setAttribute('data-ad-layout', config.layout);
        }
        if (config.responsive) {
            ad.setAttribute('data-full-width-responsive', 'true');
        }

        wrapper.appendChild(ad);
        return wrapper;
    }

    function insert(anchor, position, config) {
        if (!anchor || !anchor.parentNode) return null;
        var slot = makeSlot(config);
        if (position === 'before') {
            anchor.parentNode.insertBefore(slot, anchor);
        } else if (position === 'inside') {
            anchor.appendChild(slot);
        } else {
            anchor.parentNode.insertBefore(slot, anchor.nextSibling);
        }
        return slot;
    }

    function beforeFooter(config) {
        return insert(document.querySelector('.site-footer'), 'before', config);
    }

    function mountPageAds() {
        var page = document.body && document.body.dataset.adsPage;
        var sections = Array.prototype.slice.call(document.querySelectorAll('main > .section'));
        var grid = document.querySelector('.cards-grid');
        var description = document.querySelector('.recipe-description');
        var method = document.querySelector('.recipe-method');

        if (page === 'home') {
            insert(sections[0], 'after', ADS.homeFluid);
            insert(sections[sections.length - 1], 'after', ADS.displayPrimary);
            beforeFooter(ADS.multiplex);
        } else if (page === 'listing') {
            insert(grid, 'after', ADS.listingFluid);
            beforeFooter(ADS.displaySecondary);
            beforeFooter(ADS.multiplex);
        } else if (page === 'recipe') {
            insert(description, 'after', ADS.articlePrimary);
            insert(method, 'after', ADS.articleSecondary);
            beforeFooter(ADS.displayTertiary);
        } else {
            beforeFooter(ADS.infoFluid);
            beforeFooter(ADS.multiplex);
        }
    }

    function markReady(slot) {
        window.requestAnimationFrame(function () {
            slot.classList.add('is-ready');
            slot.classList.remove('is-loading');
        });
    }

    function loadSlot(slot) {
        if (!slot || slot.dataset.adsLoaded === 'true') return;

        var ad = slot.querySelector('ins.adsbygoogle');
        if (!ad) return;

        slot.dataset.adsLoaded = 'true';
        slot.classList.add('is-loading');
        ad.dataset.adsInitialized = 'true';

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            markReady(slot);
            window.setTimeout(function () {
                if (ad.getAttribute('data-ad-status') === 'unfilled') {
                    slot.classList.add('is-empty');
                    slot.classList.remove('is-ready');
                }
            }, 3500);
        } catch (error) {
            slot.dataset.adsLoaded = 'error';
            slot.classList.add('is-empty');
            slot.classList.remove('is-loading');
        }
    }

    function observeSlots() {
        var slots = Array.prototype.slice.call(document.querySelectorAll('.ad-slot'));
        if (!slots.length) return;

        if (!('IntersectionObserver' in window)) {
            slots.forEach(loadSlot);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                loadSlot(entry.target);
                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: '700px 0px',
            threshold: 0.01,
        });

        slots.forEach(function (slot) {
            observer.observe(slot);
        });
    }

    function boot() {
        if (!document.body || document.body.dataset.adsBooted === 'true') return;
        document.body.dataset.adsBooted = 'true';
        mountPageAds();
        window.setTimeout(observeSlots, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
}());
