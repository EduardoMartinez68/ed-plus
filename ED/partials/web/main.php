    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Iconos de Font Awesome (opcional) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        integrity="sha512-Fo3rlrZj/k7ujTnH1zR2EN7V2x8ePuQ0VbTk8+Bmx6jtVUxdR2gWzTsTQNlZ4QZm6tF/6ss4RtGfB9WW7oZIeg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
        /* Reset de Estilos */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
    </style>
    <link rel="stylesheet" href="../../css/styles.css">

    <!-- Navbar -->
    <nav class="web-main-navbar">
        <a href="#" class="web-main-logo">MiEmpresa</a>
        <div class="web-main-nav-links">
            <a href="#precios">Precios</a>
            <a href="#iniciar-sesion">Iniciar Sesión</a>
            <a href="#crear-cuenta" class="web-main-btn-crear-cuenta">Crear Cuenta Gratis</a>
        </div>
        <div class="web-main-hamburger" id="hamburger">
            <div class="web-main-bar1"></div>
            <div class="web-main-bar2"></div>
            <div class="web-main-bar3"></div>
        </div>
    </nav>

    <!-- Menú Móvil -->
    <div class="web-main-nav-active" id="mobile-menu">
        <a href="#precios">Precios</a>
        <a href="#iniciar-sesion">Iniciar Sesión</a>
        <a href="#crear-cuenta" class="web-main-btn-crear-cuenta">Crear Cuenta Gratis</a>
    </div>

    <!-- Hero Section -->
    <section class="web-main-hero">
        <div class="web-main-hero-container">
            <div class="web-main-hero-text">
                <h1 class="web-main-hero-text-h1">TODO TU NEGOCIO EN UNA SOLA PLATAFORMA</h1>
                <p class="web-main-hero-text-p">Más de 30 apps para tu empresa.</p>
                <a href="#explorar" class="web-main-btn-explore">💪 Explorar Ahora</a>
            </div>
            <div class="web-main-hero-image">
                <img src="img/offer.png" alt="Ilustración de Software">
            </div>
        </div>
    </section>

    <!-- JavaScript para el Menú Móvil -->
    <script>
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');

        hamburger.addEventListener('click', () => {
            mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
            hamburger.classList.toggle('web-main-toggle');
        });

        // Cerrar el menú móvil al hacer clic en un enlace
        const navLinks = document.querySelectorAll('.web-main-nav-active a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.style.display = 'none';
                hamburger.classList.remove('web-main-toggle');
            });
        });
    </script>
