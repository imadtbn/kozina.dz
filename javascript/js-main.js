// js-main.js

// دالة لعرض البطاقات في حاوية محددة
function renderCards(containerId, recipes) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = recipe.id;

        // تحضير نص المكونات (مصفوفة أو نص)
        const ingredientsText = Array.isArray(recipe.ingredients) ?
            recipe.ingredients.join('، ') :
            recipe.ingredients;

        card.innerHTML = `
            <div class="card-image">
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
                <span class="card-badge">${recipe.badge || ''}</span>
            </div>
            <div class="card-content">
                <h3>${recipe.title}</h3>
                <p class="ingredients">مقادير: ${ingredientsText}</p>
                <div class="card-footer">
                    <span class="date"><i class="far fa-calendar-alt"></i> ${recipe.date}</span>
                    <span class="author">نشر: ${recipe.author}</span>
                </div>
            </div>
        `;

        // إضافة حدث النقر لفتح النافذة المنبثقة
        card.addEventListener('click', () => showModal(recipe));
        container.appendChild(card);
    });
}

// دالة عرض النافذة المنبثقة
function showModal(recipe) {
    const modal = document.getElementById('recipeModal');
    const modalBody = modal.querySelector('.modal-body');
    const videoHtml = recipe.video ? `
<div class="video-container">
<iframe width="100%" height="280" src="${recipe.video}" frameborder="0" allowfullscreen></iframe>
</div>
` : '';

    modalBody.innerHTML = `
<h2>${recipe.title}</h2>
<img src="${recipe.image}" alt="${recipe.title}" style="max-width:100%; border-radius:8px;">
<p><strong>الوصف:</strong> ${recipe.description}</p>
<p><strong>المقادير:</strong> ${recipe.ingredients}</p>
<p><strong>طريقة التحضير:</strong> ${recipe.method}</p>

${videoHtml}
<div class="author-info">
<p><strong>نشر:</strong> ${recipe.author}</p>
<p><strong>تاريخ النشر:</strong> ${recipe.date}</p>
<p><strong>رابط التواصل:</strong> <a href="${recipe.authorLink}" target="_blank">${recipe.authorLink}</a></p>
</div>
`;

    modal.style.display = 'block';
}
// إغلاق النافذة المنبثقة
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// تحميل البيانات من ملفات JSON
async function loadAllData() {
    try {
        // تحميل كل ملف JSON على حدة
        const [algerien, salads, diet, traditional, modern] = await Promise.all([
            fetch('data/algerien.json').then(res => res.json()),
            fetch('data/salads.json').then(res => res.json()),
            fetch('data/diet.json').then(res => res.json()),
            fetch('data/traditional-desserts.json').then(res => res.json()),
            fetch('data/modern-desserts.json').then(res => res.json())
        ]);

        // عرض البطاقات في كل حاوية (يكفي عرض أول 3 وصفات)
        renderCards('algerien-cards', algerien.slice(0, 3));
        renderCards('salads-cards', salads.slice(0, 3));
        renderCards('diet-cards', diet.slice(0, 3));
        renderCards('traditional-desserts-cards', traditional.slice(0, 3));
        renderCards('modern-desserts-cards', modern.slice(0, 3));

    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // يمكن إظهار رسالة للمستخدم
    }
}

// بدء التحميل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadAllData);

// وظيفة البحث المباشر
// وظيفة البحث المباشر (موسع ليشمل العنوان، المكونات، الناشر، الشارة)
document.getElementById('search-input').addEventListener('input', function(e) {
    const query = e.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // استخراج النصوص من العناصر المختلفة
        const title = card.querySelector('h3') ? .textContent.toLowerCase() || '';
        const ingredients = card.querySelector('.ingredients') ? .textContent.toLowerCase() || '';
        const author = card.querySelector('.author') ? .textContent.toLowerCase() || '';
        const badge = card.querySelector('.card-badge') ? .textContent.toLowerCase() || '';
        const description = card.querySelector('.description') ? .textContent.toLowerCase() || '';

        // دمج جميع النصوص للبحث
        const allText = `${title} ${ingredients} ${author} ${badge}  ${description}`;

        if (allText.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// قائمة البرجر للشاشات الصغيرة
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger && navLinks) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // اختياري: تغيير أيقونة البرجر
        const icon = burger.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// زر التثبيث APW

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.getElementById("installBtn");
    installBtn.style.display = "inline-flex";

    installBtn.addEventListener("click", () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
        });
    });
});