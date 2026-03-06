// فتح وإغلاق القائمة في الشاشات الصغيرة
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// إغلاق القائمة عند النقر على رابط
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});





const searchInput = document.getElementById("recipeSearch");

searchInput.addEventListener("keyup", function () {

    const searchValue = this.value.toLowerCase();

    const filtered = saladsData.filter(recipe => {

        return (
            recipe.name.toLowerCase().includes(searchValue) ||
            recipe.publisher.toLowerCase().includes(searchValue) ||
            recipe.category.toLowerCase().includes(searchValue) ||
            recipe.ingredients.join(" ").toLowerCase().includes(searchValue)
        );

    });

    renderCards(filtered);

});