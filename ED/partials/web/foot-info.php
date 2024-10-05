<style>
    .commercial-container {
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
        padding: 20px;
    }

    .commercial-title {
        font-size: 28px;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .commercial-subtitle {
        font-size: 16px;
        margin-bottom: 30px;
    }

    .commercial-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .commercial-item {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s, color 0.3s;
        cursor: pointer;
    }

    .commercial-item:hover {
        transform: scale(1.1);
        color: #4356FE; /* Color de la empresa al pasar el ratón */
    }

    .commercial-item img {
        width: 50px; /* Ajusta el tamaño del icono */
        margin-bottom: 10px;
    }

    .commercial-item p {
        margin: 0;
        font-size: 14px;
    }
</style>
<br><br>
<div class="commercial-container">
    <div class="commercial-title">Compatible con <span style="color: #4356FE;">cualquier Giro Comercial</span></div>
    <div class="commercial-subtitle">ED PLUS se adapta con facilidad a tu empresa y te ayuda con tarreas como: Finanzas, Inventario, Restaurantes, refaccionarias y muchos más.</div>
    <div class="commercial-grid">
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/1074/1074584.png" alt="Abarrotes">
            <p>Abarrotes</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/4320/4320357.png" alt="Farmacias">
            <p>Farmacias</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/4682/4682602.png" alt="Ferreterías">
            <p>Restaurantes</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/6235/6235266.png" alt="Papelería">
            <p>Dentistas</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/3063/3063176.png" alt="Licoería">
            <p>Hospitales</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/2847/2847143.png" alt="Carnicería">
            <p>Ecommerce</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/9706/9706729.png" alt="Refaccionarias">
            <p>Recursos Humanos</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/4472/4472550.png" alt="Boutique">
            <p>Escuelas</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/5706/5706401.png" alt="Mueblería">
            <p>CRM</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/5024/5024206.png" alt="Zapatería">
            <p>Marketing</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/10849/10849147.png" alt="Supermercado">
            <p>Inventarios</p>
        </div>
        <div class="commercial-item">
            <img src="https://cdn-icons-png.flaticon.com/512/226/226974.png" alt="Más Giros">
            <p>Más Negocios</p>
        </div>
    </div>
</div>
