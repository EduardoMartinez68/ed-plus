<link rel="stylesheet" href="css/styles.css">

<?php
    include 'partials/navbar.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ED Plus - Potencia tu negocio</title>
    <link href="https://fonts.googleapis.com/css2?family=Digital7&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Arial', sans-serif;
            background-color: #f7f9fc;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1100px;
            margin: 40px auto;
            padding: 20px;
            
            border-radius: 10px;
            
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
        }

        .header h1 {
            font-size: 28px;
            color: #4356FE;
        }

        .header h2 {
            font-size: 24px;
            color: #333;
            margin-top: 10px;
        }

        .header p {
            font-size: 16px;
            color: #555;
            margin-top: 5px;
        }

        .content {
            display: flex;
            justify-content: space-between;
            padding: 30px 0;
        }

        .product-info {
            width: 45%;
            position: relative;
        }

        .product-image {
            width: 100%;
            height: auto;
            border-radius: 8px;
            margin-top: 20px; /* Añadido espacio entre el temporizador y la imagen */
        }

        .countdown {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: transparent; /* Fondo transparente */
            color: #4356FE;
            font-size: 48px; /* Aumenté el tamaño de fuente para mayor legibilidad */
            font-family: 'Digital7', monospace; /* Usamos la fuente digital */
            display: flex;
            justify-content: space-around; /* Espacio entre elementos */
            width: 400px; /* Ajusté el ancho para acomodar el texto */
            text-align: center;
            background-color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            padding: 1rem;
        }

        .countdown div {
            display: flex;
            flex-direction: column;
            align-items: center; /* Alineación centrada */
        }

        .countdown div span {
            font-size: 14px; /* Tamaño más pequeño para las etiquetas */
            color: #aaa; /* Color más suave para las etiquetas */
        }

        .features {
            margin-top: 15px;
            list-style-type: none;
            color: #555;
        }

        .features li {
            margin-bottom: 10px;
            font-size: 16px;
        }

        .form-container {
            width: 45%;
            background-color: #fff; /* Fondo blanco */
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .form-container h3 {
            font-size: 20px;
            color: #333;
            margin-bottom: 15px;
        }

        .form-container input {
            width: 100%;
            padding: 12px; /* Tamaño reducido */
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border 0.3s;
            background-color: #f7f9fc; /* Color de fondo más claro */
        }

        .form-container input:focus {
            border: 1px solid #4356FE;
            outline: none;
        }

        .checkbox-container input {
            margin-right: 10px;
        }

        .checkbox-container a {
            color: #4356FE;
            text-decoration: none;
        }

        .checkbox-container a:hover {
            text-decoration: underline;
        }

        button {
            width: 100%;
            padding: 12px; /* Tamaño reducido */
            background-color: #4356FE;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #3344CC;
        }

        .info-section {
            padding: 20px 0;
            border-top: 1px solid #eaeaea;
            text-align: center;
        }

        .info-section h4 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #333;
        }

        .info-section ul {
            list-style-type: none;
            padding: 0;
        }

        .info-section ul li {
            font-size: 16px;
            color: #555;
            margin-bottom: 10px;
        }

        .info-section ul a {
            color: #4356FE;
            text-decoration: none;
        }

        .info-section ul a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>+30 Apps para tu empresa</h1>
            <h2>Potencia tu negocio con ED Plus</h2>
            <p>Software ERP y CRM para todo tipo de negocio.</p>
        </div>

        <div class="content">
            <div class="product-info">
                <div class="countdown" id="countdown">
                    <div>
                        <span id="days">00</span>
                        <span>Días</span>
                    </div>
                    <div>
                        <span id="hours">00</span>
                        <span>Horas</span>
                    </div>
                    <div>
                        <span id="minutes">00</span>
                        <span>Minutos</span>
                    </div>
                    <div>
                        <span id="seconds">00</span>
                        <span>Segundos</span>
                    </div>
                </div>
                <img src="img/offer.png" alt="Producto" class="product-image">
                <ul class="features">
                    <li>✓ Gestión integral de tu negocio</li>
                    <li>✓ CRM avanzado y fácil de usar</li>
                    <li>✓ Automatización de procesos</li>
                </ul>
            </div>

            <div class="form-container">
                <h1>¡Crea tu cuenta gratis!</h1>
                <form action="#" method="POST">
                    <input type="text" name="nombre_cliente" placeholder="Nombre del cliente" required>
                    <input type="text" name="nombre_empresa" placeholder="Nombre de la empresa" required>
                    <input type="number" name="numero_empleados" placeholder="Número de empleados" required>
                    <input type="tel" name="telefono" placeholder="Teléfono" required>
                    <input type="email" name="correo" placeholder="Correo electrónico" required>
                    <div>
                        <input type="checkbox" id="terms" name="terms" required>Acepto los <a href="#" target="_blank">Términos y condiciones</a>
                    </div>

                    <button type="submit">REGISTRARME GRATIS</button>
                </form>
            </div>
        </div>

        <div class="info-section">
            <h4>Algunas cosas a tener en cuenta:</h4>
            <ul>
                <li>Al finalizar el período de prueba, tú decides si continuar o no.</li>
                <li>Los precios están disponibles en la sección de <a href="#">planes y precios</a>.</li>
                <li>El soporte está incluido desde el día 0.</li>
                <li>No te pedimos los datos de tu tarjeta de crédito para empezar.</li>
            </ul>
        </div>
    </div>

    <script>
        // Configuración del temporizador (7 días)
        const countdownElement = document.getElementById('countdown');
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días a partir de ahora

        const updateCountdown = () => {
            const now = new Date();
            const timeLeft = endDate - now;

            if (timeLeft <= 0) {
                clearInterval(timer);
                countdownElement.innerHTML = "<h2>¡La oferta ha terminado!</h2>";
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById('days').innerText = String(days).padStart(2, '0');
            document.getElementById('hours').innerText = String(hours).padStart(2, '0');
            document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
            document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
        };

        const timer = setInterval(updateCountdown, 1000);
    </script>
</body>
</html>
