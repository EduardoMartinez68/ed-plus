<style>
    .foot-info-container {
        max-width: 800px;
        margin: 0 auto;
        background-color: #2E77D0; /* Color de fondo azul */
        border-radius: 15px; /* Esquinas más redondeadas */
        padding: 30px; /* Mayor espacio interno */
        color: white;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Sombra para darle profundidad */
        display: flex; /* Usar flexbox para alinear elementos */
        flex-direction: column; /* Columnas en dispositivos móviles */
        gap: 20px; /* Espacio entre elementos */
    }

    .foot-info-header {
        display: flex; /* Usar flexbox para alinear el título y botones */
        justify-content: space-between; /* Espacio entre elementos */
        align-items: center; /* Centrar verticalmente */
    }

    .foot-info-title {
        font-size: 28px; /* Tamaño de fuente más grande */
        margin: 0; /* Eliminar margen */
        font-weight: bold; /* Negrita */
    }

    .foot-info-compatibility {
        font-size: 16px; /* Aumento en el tamaño de la fuente */
        margin-bottom: 25px;
    }

    .foot-info-button {
        background-color: #008CBA; /* Color de fondo del botón */
        color: white;
        padding: 12px 24px; /* Mayor espacio interno */
        border: none;
        border-radius: 8px; /* Esquinas más redondeadas */
        text-decoration: none;
        font-size: 18px; /* Tamaño de fuente más grande */
        margin-right: 15px; /* Espacio entre botones */
        transition: background-color 0.3s, transform 0.3s; /* Transiciones para fondo y transformaciones */
    }

    .foot-info-button:hover {
        background-color: #005f7f; /* Color al pasar el ratón */
        transform: scale(1.05); /* Efecto de aumento al pasar el ratón */
    }

    .foot-info-support {
        display: block;
        margin-top: 20px;
        font-size: 16px; /* Aumento en el tamaño de la fuente */
        color: #d9d9d9;
        text-decoration: none;
        transition: color 0.3s; /* Transición para el color */
    }

    .foot-info-support:hover {
        color: white; /* Cambiar color al pasar el ratón */
    }

    /* Estilos adaptables */
    @media (max-width: 600px) {
        .foot-info-header {
            flex-direction: column; /* Cambiar a columna en móviles */
            align-items: flex-start; /* Alinear elementos a la izquierda */
        }

        .foot-info-title {
            margin-bottom: 10px; /* Espacio inferior en móviles */
        }
    }
</style>
<br><br>
<div class="foot-info-container">
    <div class="foot-info-header">
        <div class="foot-info-title">Ingresa GRATIS a ED PLUS ❤️</div>
        <div>
            <br>
            <a href="#" class="foot-info-button">Crear cuenta Aquí</a>
            <a href="#" class="foot-info-support">Solicita Soporte</a>
        </div>
    </div>
    <div class="foot-info-compatibility">No se necesita tarjeta de crédito  ✦ <br> 
    </div>
</div>
