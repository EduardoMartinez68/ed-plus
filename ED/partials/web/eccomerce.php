<style>
    .ecommerce-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 50px auto;
        background-color: #fff;
        padding: 30px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }

    .ecommerce-text-content {
        flex: 1;
        padding-right: 20px;
    }

    .ecommerce-text-content h1 {
        font-size: 28px;
        color: #333;
        margin-bottom: 15px;
    }

    .ecommerce-text-content p {
        font-size: 18px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 20px;
    }

    .ecommerce-text-content ul {
        list-style-type: none;
        padding: 0;
    }

    .ecommerce-text-content ul li {
        font-size: 18px;
        color: #333;
        margin-bottom: 10px;
        position: relative;
        padding-left: 20px;
    }

    .ecommerce-text-content ul li::before {
        content: "✔";
        color: #4356FE;
        font-size: 20px;
        position: absolute;
        left: 0;
        top: 0;
    }

    .ecommerce-image-content {
        flex: 1;
    }

    .ecommerce-image-content img {
        width: 100%;
        border-radius: 10px;
    }

    @media (max-width: 768px) {
        .ecommerce-container {
            flex-direction: column;
            padding: 20px;
        }

        .ecommerce-text-content,
        .ecommerce-image-content {
            flex: unset;
            padding-right: 0;
        }

        .ecommerce-image-content img {
            margin-top: 20px;
        }
    }
</style>


<div class="ecommerce-container">
    <div class="ecommerce-text-content">
        <h1>Crea tu tienda en línea en cuestión de minutos</h1>
        <p>Facilita las compras para tus clientes y aumenta tus ventas con la versatilidad de tener una tienda física y
            en línea en un solo sistema. Descubre la potencia de nuestro punto de venta, llevando tu negocio más allá de
            los límites tradicionales.</p>
        <ul>
            <li><span style="color: #4356FE;">Catálogo en Línea:</span> Tus clientes podrán consultar los productos que tengas disponibles.</li>
            <li><span style="color: #4356FE;">Accede Fácilmente:</span> Podrán acceder desde cualquier dispositivo con conexión a internet.</li>
        </ul>
    </div>

    <div class="ecommerce-image-content">
        <img src="https://www.sicarx.com/images/new/tienda-linea01.webp" alt="Tienda en línea">
    </div>
</div>