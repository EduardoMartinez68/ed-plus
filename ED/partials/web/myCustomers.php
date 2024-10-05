<style>
    .carousel-header {
        text-align: center;
        margin-bottom: 20px;
    }

    .carousel-header h1 {
        font-size: 32px;
        margin: 0;
    }

    .carousel-header p {
        font-size: 18px;
        margin: 5px 0 20px;
        color: #555;
    }

    .carousel-container {
        display: flex;
        overflow: hidden;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px 0;
        position: relative;
    }

    .carousel-wrapper {
        display: flex;
        animation: scroll 30s linear infinite;
    }

    .carousel-app-card {
        min-width: 150px;
        margin: 0 10px;
        background: white;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s;
    }

    .carousel-app-card:hover {
        transform: scale(1.05);
    }

    .carousel-app-card img {
        width: 50px;
        height: 50px;
        margin-bottom: 10px;
    }

    .carousel-button {
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #4356FE;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .carousel-button:hover {
        background-color: #3448db;
    }

    @keyframes scroll {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-100%);
        }
    }

    .carousel-container:hover .carousel-wrapper {
        animation-play-state: paused;
    }
</style>
<center>
    <br><br>
<div class="carousel-header">
    <div class="commercial-title">Las Apps más importantes para <span style="color: #4356FE;">TU NEGOCIO</span></div>
    <p>Todo en una sola plataforma.</p>
</div>

<div class="carousel-container">
    <div class="carousel-wrapper">
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3501/3501843.png" alt="App 2">
            <p>Calendario de contenido</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/2721/2721298.png alt="App 3">
            <p>Objetivos</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/5305/5305244.png" alt="App 5">
            <p>Ventas</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/7021/7021224.png" alt="App 5">
            <p>Inventario</p>
        </div>
        <!-- Repetir los mismos ítems para efecto de bucle infinito -->
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/256/13462/13462033.png" alt="App 1">
            <p>Producto</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/6260/6260788.png" alt="App 2">
            <p>Papeleria</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/5706/5706401.png" alt="App 5">
            <p>CRM</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/5024/5024206.png" alt="App 5">
            <p>Marketing</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/10256/10256085.png" alt="App 5">
            <p>Archivos</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/686/686379.png" alt="App 5">
            <p>Clientes</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3349/3349308.png" alt="App 1">
            <p>Proyectos de clientes</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/6073/6073874.png" alt="App 5">
            <p>Empleados</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3094/3094956.png" alt="App 5">
            <p>Horarios de empleados</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/4245/4245736.png" alt="App 5">
            <p>Tarreas</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/10365/10365210.png" alt="App 5">
            <p>Nomina de Empleados</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/6784/6784466.png" alt="App 5">
            <p>Reportes</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.freepik.com/512/9532/9532571.png" alt="App 5">
            <p>Ecommerce</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-N0J7r5cmVJFnlWV_2KX7zuow_5U5O5B3zA&s" alt="App 5">
            <p>Recursos Humanos</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/6188/6188898.png" alt="App 5">
            <p>Gestion de Talentos</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/6352/6352845.png" alt="App 5">
            <p>Oportunidades de ventas</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://i.pinimg.com/originals/28/e2/ff/28e2ff1e9f9f1154b083429ab7e8d8eb.png" alt="App 5">
            <p>Finanzas</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/785/785767.png" alt="App 5">
            <p>Whatsapp Marketing</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/4616/4616073.png" alt="App 5">
            <p>Email Marketing</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/4682/4682602.png" alt="App 4">
            <p>Restaurante</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/433/433087.png" alt="App 5">
            <p>Menu Digital</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/1147/1147832.png" alt="App 3">
            <p>Insumos</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/6626/6626465.png" alt="App 4">
            <p>Combos</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/1198/1198348.png" alt="App 5">
            <p>Franquicias</p>
        </div>
        <div class="carousel-app-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3904/3904299.png" alt="App 5">
            <p>ED Studio</p>
        </div>
    </div>
</div>

<button class="carousel-button">Empezar ahora 💪</button>
</center>
