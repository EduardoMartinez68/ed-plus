<style>
    .web-price-container {
        width: 90%;
        max-width: 1200px;
        margin: 50px auto;
        text-align: center;
    }

    .web-price-h1 {
        color: #4356FE;
        margin-bottom: 20px;
        font-size: 2.5em;
    }

    /* Switch Container */
    .web-price-switch-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 40px;
        gap: 10px;
    }

    .web-price-switch-label {
        font-weight: bold;
        color: #555;
    }

    /* Switch Styling */
    .web-price-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .web-price-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .web-price-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
    }

    .web-price-slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    .web-price-switch input:checked+.web-price-slider {
        background-color: #4356FE;
    }

    .web-price-switch input:checked+.web-price-slider:before {
        transform: translateX(26px);
    }

    .web-price-discount-label {
        color: #4356FE;
        font-weight: bold;
        font-size: 1em;
    }

    /* Pricing Cards */
    .web-price-pricing-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
    }

    .web-price-card {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        width: 280px;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: transform 0.3s, box-shadow 0.3s;
    }

    .web-price-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .web-price-highlight {
        border: 2px solid #4356FE;
        box-shadow: 0 0 10px rgba(67, 86, 254, 0.5);
    }

    .web-price-highlight::before {
        content: "Más Popular";
        position: absolute;
        top: -10px;
        right: -10px;
        background-color: #4356FE;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
    }

    .web-price-package-name {
        font-size: 1.5em;
        margin: 15px 0;
        color: #4356FE;
    }

    .web-price-price {
        font-size: 2em;
        margin: 10px 0;
        color: #333;
    }

    .web-price-price-year {
        font-size: 1em;
        color: #555;
        margin-bottom: 10px;
    }

    .web-price-old-price {
        text-decoration: line-through;
        color: #888;
        font-size: 0.9em;
        margin-bottom: 10px;
    }

    .web-price-users {
        font-weight: bold;
        color: #4356FE;
        margin-bottom: 10px;
    }

    .web-price-description {
        margin: 15px 0;
        color: #555;
        flex-grow: 1;
    }

    .web-price-features {
        text-align: left;
        list-style: none;
        padding: 0;
        max-height: 150px;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }

    .web-price-features.expanded {
        max-height: 1000px;
    }

    .web-price-features li {
        margin: 10px 0;
        padding-left: 20px;
        position: relative;
    }

    .web-price-features li::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #4356FE;
    }

    .web-price-toggle-btn {
        background-color: transparent;
        border: none;
        color: #4356FE;
        cursor: pointer;
        font-weight: bold;
        margin-top: 10px;
        align-self: flex-start;
    }

    .web-price-btn-select {
        background-color: #4356FE;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
        transition: background-color 0.3s;
        width: 100%;
    }

    .web-price-btn-select:hover {
        background-color: #3048c9;
    }

    @media (max-width: 1200px) {
        .web-price-pricing-cards {
            gap: 15px;
        }

        .web-price-card {
            width: 45%;
        }
    }

    @media (max-width: 768px) {
        .web-price-pricing-cards {
            flex-direction: column;
            align-items: center;
        }

        .web-price-card {
            width: 90%;
        }
    }
</style>

    <div class="web-price-container">
        <h1 class="web-price-h1">¿Listo para comenzar?</h1>
        <span class="web-price-discount-label">30% de descuento</span>
        <span class="web-price-switch-label">+ 1 usuario gratis</span>
        <br><br>
        <div class="web-price-switch-container">
            <label class="web-price-switch">
                <input type="checkbox" id="priceToggle">
                <span class="web-price-slider"></span>
            </label>
        </div>

        <div class="web-price-pricing-cards" id="pricingCards">
            <!-- Cards will be injected here by JavaScript -->
        </div>
    </div>

    <script>
        const pricingData = {
            mensual: [
                {
                    name: "Gratis",
                    price: "$0",
                    oldPrice: null,
                    users: "1",
                    description: "Acceso limitado a nuestras funciones básicas por TODO UN MES GRATIS.",
                    features: [
                        "1 Empresa",
                        "1 Sucursal",
                        "Todas las apps de ED",
                        "1 usuario gratis"
                    ]
                },
                {
                    name: "Negocios",
                    price: "$600/mes",
                    oldPrice: "$729/mes",
                    users: "4",
                    description: "Ideal para pequeñas y medianas empresas.",
                    features: [
                        "1 Empresa",
                        "1 Sucursal",
                        "1 paquete de apps de ED software",
                        "Soporte técnico 24/7",
                        "Reportes personalizados",
                        "La app de ED studio",
                    ]
                },
                {
                    name: "Empresas",
                    price: "$1,000/mes",
                    oldPrice: "$1,275/mes",
                    users: "5",
                    description: "Solución completa para grandes empresas.",
                    features: [
                        "1 Empresa",
                        "Sucursales ilimitadas",
                        "Todas las apps de ED software",
                        "Todos tus negocios en un mismo lugar",
                        "Soporte técnico 24/7",
                        "Reportes personalizados",
                        "La app de ED studio",
                        "Automatizaciones",
                        "Gestión de múltiples equipos",
                        "Tienda web gratis",
                        "Personalización de empresa"
                    ]
                },
                {
                    name: "Usuario Extra",
                    price: "$200/mes",
                    oldPrice: "$255/mes",
                    users: "Extra",
                    description: "Añade usuarios adicionales a tu plan.",
                    features: [
                        "Añade un usuario extra a tu empresa",
                        "Acceso a todas las funciones de tu empresa",
                        "Soporte estándar",
                        "Reportes básicos"
                    ]
                }
            ],
            anual: [
                {
                    name: "Gratis",
                    price: "$0",
                    oldPrice: null,
                    users: "1",
                    description: "Acceso limitado a nuestras funciones básicas por TODO UN MES GRATIS.",
                    features: [
                        "1 Empresa",
                        "1 Sucursal",
                        "Todas las apps de ED",
                        "1 usuario gratis"
                    ]
                },
                {
                    name: "Negocios",
                    price: "$480/mes",
                    oldPrice: "$7,680/año",
                    priceYear: "$5,760/año",
                    users: "5",
                    description: "Ideal para pequeñas y medianas empresas.",
                    features: [
                        "1 Empresa",
                        "1 Sucursal",
                        "1 paquete de apps de ED software",
                        "Todos tu negocio en un mismo lugar",
                        "Soporte técnico 24/7",
                        "Reportes personalizados",
                        "La app de ED studio",
                    ]
                },
                {
                    name: "Empresas",
                    price: "$720/mes",
                    oldPrice: "$11,520/año",
                    priceYear: "$8,640/año",
                    users: "6",
                    description: "Solución completa para grandes empresas.",
                    features: [
                        "1 Empresa",
                        "Sucursales ilimitadas",
                        "Todas las apps de ED software",
                        "Todos tus negocios en un mismo lugar",
                        "Soporte técnico 24/7",
                        "Reportes personalizados",
                        "La app de ED studio",
                        "Automatizaciones",
                        "Gestión de múltiples equipos",
                        "Tienda web gratis",
                        "Personalización de empresa"
                    ]
                },
                {
                    name: "Usuario Extra",
                    price: "$160/mes",
                    priceYear: "$1,920/año",
                    oldPrice: "$2,448/año",
                    users: "Extra",
                    description: "Añade usuarios adicionales a tu plan.",
                    features: [
                        "Añade un usuario extra a tu empresa",
                        "Acceso a todas las funciones de tu empresa",
                        "Soporte estándar",
                        "Reportes básicos"
                    ]
                }
            ]
        };

        const pricingCardsContainer = document.getElementById('pricingCards');
        const priceToggle = document.getElementById('priceToggle');

        // Inicialmente mostrar precios mensuales
        let currentPricing = 'mensual';

        function renderCards() {
            pricingCardsContainer.innerHTML = '';
            pricingData[currentPricing].forEach((plan) => {
                // Crear tarjeta
                const card = document.createElement('div');
                card.classList.add('web-price-card');
                if (plan.name === "Empresas") {
                    card.classList.add('web-price-highlight');
                }

                // Nombre del paquete
                const packageName = document.createElement('div');
                packageName.classList.add('web-price-package-name');
                packageName.textContent = plan.name;
                card.appendChild(packageName);

                // Precio
                const price = document.createElement('div');
                price.classList.add('web-price-price');
                price.textContent = plan.price;
                card.appendChild(price);

                // Precio anual si está disponible
                if (currentPricing === 'anual' && plan.priceYear) {
                    const priceYear = document.createElement('div');
                    priceYear.classList.add('web-price-price-year');
                    priceYear.textContent = plan.priceYear;
                    card.appendChild(priceYear);
                }

                // Precio antiguo
                if (plan.oldPrice) {
                    const oldPrice = document.createElement('div');
                    oldPrice.classList.add('web-price-old-price');
                    oldPrice.textContent = plan.oldPrice;
                    card.appendChild(oldPrice);
                }

                // Usuarios
                if (plan.users) {
                    const users = document.createElement('div');
                    users.classList.add('web-price-users');
                    users.textContent = `${plan.users} usuario${plan.users !== "Extra" && plan.users !== "1" ? 's' : ''}`;
                    card.appendChild(users);
                }

                // Descripción
                const description = document.createElement('div');
                description.classList.add('web-price-description');
                description.textContent = plan.description;
                card.appendChild(description);

                // Características
                const featuresList = document.createElement('ul');
                featuresList.classList.add('web-price-features');
                const initialFeatures = plan.features.slice(0, 5);
                initialFeatures.forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = feature;
                    featuresList.appendChild(li);
                });

                // Agregar características adicionales si existen
                if (plan.features.length > 5) {
                    const extraFeatures = plan.features.slice(5);
                    extraFeatures.forEach(feature => {
                        const li = document.createElement('li');
                        li.textContent = feature;
                        li.classList.add('extra');
                        featuresList.appendChild(li);
                    });
                }

                card.appendChild(featuresList);

                // Botón Leer más / Leer menos
                if (plan.features.length > 5) {
                    const toggleBtn = document.createElement('button');
                    toggleBtn.classList.add('web-price-toggle-btn');
                    toggleBtn.textContent = 'Leer más';
                    toggleBtn.addEventListener('click', () => {
                        const isExpanded = featuresList.classList.toggle('expanded');
                        toggleBtn.textContent = isExpanded ? 'Leer menos' : 'Leer más';
                    });
                    card.appendChild(toggleBtn);
                }

                // Botón Seleccionar
                const selectBtn = document.createElement('button');
                selectBtn.classList.add('web-price-btn-select');
                selectBtn.textContent = 'Seleccionar';
                // Aquí puedes agregar eventos al botón según tus necesidades
                card.appendChild(selectBtn);

                pricingCardsContainer.appendChild(card);
            });
        }

        // Renderizar tarjetas al cargar la página
        renderCards();

        // Escuchar cambios en el switch
        priceToggle.addEventListener('change', () => {
            currentPricing = priceToggle.checked ? 'anual' : 'mensual';
            renderCards();
        });
    </script>