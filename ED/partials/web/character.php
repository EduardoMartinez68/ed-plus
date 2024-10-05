<style>
    .character-container {
        max-width: 100%;
        background-color: #4356FE;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        text-align: center;
    }

    .character-header {
        margin-bottom: 30px;
    }

    .character-header h1 {
        font-size: 28px;
        color: white;
        margin-bottom: 10px;
    }

    .character-header h2 {
        font-size: 22px;
        color: white;
        margin-bottom: 20px;
    }

    .character-header p {
        font-size: 18px;
        color: white;
        margin-bottom: 40px;
    }

    .character-columns {
        display: flex;
        justify-content: space-between;
        gap: 20px;
    }

    .character-column {
        flex: 1;
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    }

    .character-column h3 {
        font-size: 20px;
        color: #333;
        margin-bottom: 15px;
    }

    .character-column img {
        width: 100%;
        border-radius: 10px;
        margin-bottom: 20px;
    }

    @media (max-width: 768px) {
        .character-columns {
            flex-direction: column;
        }
    }
</style>


<div class="character-container">
    <br><br>
    <div class="character-header">
        <h1><b>Mejora la calidad de tu trabajo</b></h1>
        <h2>Imagina una gran variedad de aplicaciones empresariales a tu alcance.</h2>
        <p>¿Quieres mejorar algo? Hay una aplicación justo para eso. Sin complicaciones, fácil, rápido y puedes
            instalarla con un solo clic.</p>
    </div>

    <div class="character-columns">
        <div class="character-column">
            <h3>Optimizado para mejorar la productividad</h3>
            <img src="https://via.placeholder.com/300x200" alt="Productividad">
        </div>
        <div class="character-column">
            <h3>Toda la tecnología en una sola plataforma</h3>
            <img src="https://via.placeholder.com/300x200" alt="Plataforma">
        </div>
        <div class="character-column">
            <h3>Una aplicación para cada necesidad</h3>
            <img src="https://via.placeholder.com/300x200" alt="Aplicaciones">
        </div>
    </div>
    <br><br>
</div>