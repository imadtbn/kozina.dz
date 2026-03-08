
            // تحميل بيانات JSON وعرض البطاقات
            let recipesData = [];

            async function loadRecipes() {
                try {
                    const response = await fetch('../data/diet.json'); // تأكد من المسار الصحيح
                    recipesData = await response.json();
                    renderCards('all');
                } catch (error) {
                    console.error('خطأ في تحميل البيانات:', error);
                    // يمكن عرض رسالة للمستخدم
                }
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

            // بدء التحميل
            loadRecipes();
