const menuToggle = document.querySelector('.menu-toggle');
const closeMenu = document.querySelector('.close-menu');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
    menu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    menu.classList.remove('active');
});

function open_menu(onLabels=false){
    const menu = document.querySelector('.menu');
    if (menu) {
        menu.classList.add('active');
    }

    const wallpaperNavbar = document.getElementById("wallpaper-navbar");
    if (wallpaperNavbar) {
        wallpaperNavbar.classList.add("active");
    }

    // Show the shortcuts labels
    if(onLabels){
        const labels = document.querySelectorAll('.shortcuts-label');
        labels.forEach(label => {
            label.style.display = 'block';
        });
    }

    const searchInput = document.getElementById("search-app");
    if (searchInput) {
        searchInput.focus();
    }
}