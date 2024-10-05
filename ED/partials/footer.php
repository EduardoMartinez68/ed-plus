<!-- Footer -->
<footer class="footer">
    <div class="footer-container">
        <p class="footer-thanks">¡Gracias por visitar nuestra página!</p>
        <p class="footer-copyright">
            &copy; <span id="footer-year"></span> {ED} Software. Todos los derechos reservados.
        </p>
        <p class="footer-contact">
            Contáctanos: 
            <a href="https://wa.me/524443042129?text=Me%20gustaría%20obtener%20más%20información%20de%20ED%20Plus" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="footer-whatsapp">
               +52 444 304 2129
            </a>
        </p>
        <div class="footer-links">
            <a href="#sobre-nosotros">Sobre Nosotros</a>
            <a href="#precios">Precios</a>
            <a href="#contacto">Contactarnos</a>
        </div>
    </div>
</footer>

<!-- JavaScript para actualizar el año automáticamente -->
<script>
    // Actualiza el año automáticamente
    document.getElementById('footer-year').textContent = new Date().getFullYear();
</script>

<!-- Estilos CSS -->
<style>
    /* Footer */
    .footer {
        background-color: #ffffff; /* Color de fondo blanco */
        color: #333333; /* Color del texto gris oscuro */
        padding: 20px 0; /* Espaciado */
        text-align: center; /* Centrar texto */
        font-family: 'Arial', sans-serif; /* Tipo de letra */
        border-top: 1px solid #ececec; /* Línea superior sutil */
    }

    .footer-container {
        max-width: 800px; /* Limitar el ancho */
        margin: 0 auto; /* Centrar el contenedor */
        padding: 0 15px; /* Espaciado interno */
    }

    .footer-thanks {
        font-size: 1.2em; /* Tamaño de fuente */
        margin-bottom: 10px; /* Espaciado inferior */
        font-weight: 600; /* Texto en negrita */
    }

    .footer-copyright, .footer-contact {
        font-size: 0.9em; /* Tamaño de fuente más pequeño */
        margin: 5px 0; /* Espaciado vertical */
    }

    .footer-whatsapp {
        color: #4356FE; /* Color de la compañía */
        text-decoration: none; /* Sin subrayado */
        font-weight: bold; /* Texto en negrita */
    }

    .footer-whatsapp:hover {
        text-decoration: underline; /* Subrayado al pasar el mouse */
    }

    /* Enlaces Rápidos */
    .footer-links {
        display: flex; /* Usar flexbox para alinear los enlaces */
        justify-content: center; /* Centrar horizontalmente */
        gap: 30px; /* Espaciado entre enlaces */
        margin-top: 15px; /* Espaciado superior */
        flex-wrap: wrap; /* Permitir envoltura */
    }

    .footer-links a {
        color: #333333; /* Color del texto */
        text-decoration: none; /* Sin subrayado */
        transition: color 0.3s; /* Transición suave */
        font-size: 0.9em; /* Tamaño de fuente */
    }

    .footer-links a:hover {
        color: #4356FE; /* Color de la compañía al hacer hover */
    }

    /* Responsividad */
    @media (max-width: 768px) {
        .footer-thanks {
            font-size: 1em; /* Reducir tamaño en dispositivos móviles */
        }

        .footer-contact {
            font-size: 0.8em; /* Reducir tamaño en móviles */
        }

        .footer-links {
            flex-direction: column; /* Colocar enlaces en columna en móviles */
            align-items: center; /* Centrar elementos */
        }
    }
</style>
