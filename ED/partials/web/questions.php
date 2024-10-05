<style>
    .questions-container {
        max-width: 70%;
        margin: 0 auto;
        border-radius: 8px;
        padding: 20px;
    }

    .questions-title {
        font-size: 28px;
        color: black;
        text-align: center;
        margin-bottom: 10px;
    }

    .questions-description {
        font-size: 16px;
        text-align: center;
        margin-bottom: 20px;
    }

    .questions-list {
        list-style: none;
        padding: 0;
    }

    .questions-item {
        margin-bottom: 12px;
        padding: 10px 0;
        border-bottom: 1px solid #ddd;
        cursor: pointer; /* Indica que se puede hacer clic */
    }

    .questions-item:last-child {
        border-bottom: none;
    }

    .questions-question {
        font-weight: bold;
        color: rgba(0,0,0,.8);
        display: block;
    }

    .questions-answer {
        margin-top: 5px;
        font-size: 14px;
        color: #555;
        display: none; /* Ocultar respuesta por defecto */
    }
</style>

<div class="questions-container">
    <h1 class="questions-title">¿Tienes preguntas?</h1>
    <p class="questions-description">Si la respuesta a su pregunta no está en esta página, contacte a nuestro Gerentes de cuenta</p>
    <ul class="questions-list">
        <li class="questions-item">
            <span class="questions-question">¿En serio puedo acceder a cientos de aplicaciones y módulos por un solo precio?</span>
            <p class="questions-answer">¡Así es, no estás soñando 😍!</p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Qué incluye la suscripción?</span>
            <p class="questions-answer">La suscripcion de "Negocios" incluye un paquete de apps para cualquier area de tu negocio para ser usada por ti y tus usuarios. La suscripcion de "Empresa" incluye todas las apps de ED para ti y tus usuarios</p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Qué es ED Studio?</span>
            <p class="questions-answer">Una aplicacion hecha para que tu puedas crear tus propias apps para tu empresa y personalizar mejor tu trabajo.</p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Dónde puedo obtener servicios de implementación y cuánto cuestan?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Multi-empresa o Studio están disponibles en el plan de una aplicación gratis?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Por qué tengo varias aplicaciones con el plan de una aplicación gratis?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Cómo cambiar un plan gratuito de una sola aplicación a un plan estándar o personalizado?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Cuál es la diferencia entre el plan estándar y el plan personalizado?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Cómo se define un usuario de pago?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Puedo cambiar de un plan de alojamiento (Odoo en línea) a Odoo Enterprise y vice versa?</span>
            <p class="questions-answer"></p>
        </li>
        <li class="questions-item">
            <span class="questions-question">¿Qué es una API externa?</span>
            <p class="questions-answer"></p>
        </li>
    </ul>
</div>

<script>
    const questionsItems = document.querySelectorAll('.questions-item');

    questionsItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.questions-answer');
            answer.style.display = answer.style.display === 'none' ? 'block' : 'none'; // Alternar la visibilidad de la respuesta
        });
    });
</script>
