// تحميل بيانات JSON وعرض البطاقات
let recipesData = [];

let visibleCount = 4;     // عدد الوصفات المعروضة أولاً
const step = 4;           // عدد الوصفات التي تظهر عند الضغط

async function loadRecipes() {
    try {
        const response = await fetch('../data/modern-desserts.json'); // تأكد من المسار الصحيح
        recipesData = await response.json();
        
                // ترتيب الوصفات حسب التاريخ (الأحدث أولاً)
        recipesData.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderCards('all');
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // يمكن عرض رسالة للمستخدم
    }
}

function renderCards(filter) {

    const container = document.getElementById('modern-desserts-cards');
    container.innerHTML = '';

    const filtered = filter === 'all'
        ? recipesData
        : recipesData.filter(r => r.category === filter);

    const visibleRecipes = filtered.slice(0, visibleCount);

    visibleRecipes.forEach(recipe => {

        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = recipe.id;
        card.dataset.category = recipe.category;

        card.innerHTML = `
        <div class="card-image">
            <img src="${recipe.image}" alt="${recipe.title}">
            <span class="card-badge modern-desserts-${recipe.category}">${recipe.badge}</span>
        </div>

        <div class="card-content">
            <h3>${recipe.title}</h3>
            <p class="ingredients">مقادير: ${recipe.ingredients.join('، ')}</p>

            <div class="card-footer">
                <span class="date"><i class="far fa-calendar-alt"></i> ${recipe.date}</span>
                <span class="author">نشر: ${recipe.author}</span>
            </div>
        </div>
        `;

        card.addEventListener('click', () => showModal(recipe));

        container.appendChild(card);
    });

    // إخفاء زر المزيد إذا انتهت الوصفات
    const loadBtn = document.getElementById('loadMoreBtn');
    if (visibleCount >= filtered.length) {
        loadBtn.style.display = "none";
    } else {
        loadBtn.style.display = "block";
    }
}

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
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('recipeModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// أزرار التصفية
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards(btn.dataset.filter);
    });
});

    // تفعيل زر "المزيد من الوصفات"
    
    document.getElementById("loadMoreBtn").addEventListener("click", () => {

    visibleCount += step;

    const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;

    renderCards(activeFilter);

});

// بدء التحميل
loadRecipes()