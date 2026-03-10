// ========== وظيفة البحث المباشر ==========
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
            const titleEl = card.querySelector('h3');
            const title = titleEl ? titleEl.textContent.toLowerCase() : '';

            const ingredientsEl = card.querySelector('.ingredients');
            const ingredients = ingredientsEl ? ingredientsEl.textContent.toLowerCase() : '';

            const authorEl = card.querySelector('.author');
            const author = authorEl ? authorEl.textContent.toLowerCase() : '';

            const badgeEl = card.querySelector('.card-badge');
            const badge = badgeEl ? badgeEl.textContent.toLowerCase() : '';

            const descEl = card.querySelector('.description');
            const description = descEl ? descEl.textContent.toLowerCase() : '';

            const allText = `${title} ${ingredients} ${author} ${badge} ${description}`;

            card.style.display = allText.includes(query) ? 'block' : 'none';
        });
    });
}

// ========== قائمة البرجر للشاشات الصغيرة ==========
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger && navLinks) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = burger.querySelector('i');
        if (icon) {
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = burger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// ========== فلترة البطاقات ==========
const filterButtons = document.querySelectorAll('.filter-btn');

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.dataset.filter;
            const cards = document.querySelectorAll('.card');

            cards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    card.style.display = card.dataset.category === filterValue ? 'block' : 'none';
                }
            });
        });
    });
}