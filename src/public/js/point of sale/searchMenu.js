document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const cards = document.querySelectorAll('.product-card-point-of-sales');
    const dictionaryIdServices = [
        { key: ".s", icon: `seleccionarOpcion('servicios')` },
        { key: ".r", icon: `seleccionarOpcion('recargas')` },

        { key: ".cfe", icon: `show_buy_services('CFE')` },
        { key: ".telmex", icon: `show_buy_services('Telmex')` },
        { key: ".sky", icon: `show_buy_services('Sky')` },
        { key: ".dis", icon: `show_buy_services('Dish')` },
        { key: ".tot", icon: `show_buy_services('Totalplay')` },
        { key: ".izz", icon: `show_buy_services('Izzi')` },
        { key: ".meg", icon: `show_buy_services('Megacable')` },
        { key: ".vet", icon: `show_buy_services('VeTV')` },
        { key: ".agua", icon: `show_buy_services('Agua y Drenaje')` },
        { key: ".inf", icon: `show_buy_services('Infonavit')` },
        { key: ".sat", icon: `show_buy_services('SAT / Impuestos')` },
        { key: ".cop", icon: `show_buy_services('Coppel Servicios')` },
        { key: ".nor", icon: `show_buy_services('Telnor')` },


        { key: ".tel", icon: `mostrarFormularioRecarga('Telcel')` },
        { key: ".mov", icon: `mostrarFormularioRecarga('Movistar')` },
        { key: ".att", icon: `mostrarFormularioRecarga('AT&T')` },
        { key: ".une", icon: `mostrarFormularioRecarga('Unefon')` },
        { key: ".bait", icon: `mostrarFormularioRecarga('Bait')` },
        { key: ".pil", icon: `mostrarFormularioRecarga('PilloFon')` },
        { key: ".fre", icon: `mostrarFormularioRecarga('FreedomPop')` },
        { key: ".fla", icon: `mostrarFormularioRecarga('Flash Mobile')` },
        { key: ".dir", icon: `mostrarFormularioRecarga('Diri')` },
        { key: ".oui", icon: `mostrarFormularioRecarga('Oui')` },
        { key: ".wma", icon: `mostrarFormularioRecarga('Walmart Bodega Aurrera (Bait)')` },
        { key: ".maz", icon: `mostrarFormularioRecarga('Maz Tiempo')` },
        { key: ".her", icon: `mostrarFormularioRecarga('Her Mobile')` },
        { key: ".wib", icon: `mostrarFormularioRecarga('Wibo')` },
        { key: ".ald", icon: `mostrarFormularioRecarga('Aldi')` },
        { key: ".wee", icon: `mostrarFormularioRecarga('Weex')` },
        { key: ".net", icon: `mostrarFormularioRecarga('Netwey')` },
        { key: ".sim", icon: `mostrarFormularioRecarga('Simplii')` }
    ];


    //this is for the search in cellphone
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        cards.forEach(card => {
            const barcode = card.id.toLowerCase();
            if (barcode.includes(query) || query === '') {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    //we will see if the user did enter and the input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            //we will see the barcode that the user would like search
            const valueInputBarcode = searchInput.value.toLowerCase();
            let barcodeInput = valueInputBarcode; //save the barcode that the user would like search

            //firs we will see if the user write a key of a services for open the pop
            const idService = dictionaryIdServices.find(item => item.key === barcodeInput);
            if (idService) {
                searchInput.value = ""; //delete the value of the input

                //Execute the function that is as a string
                eval(idService.icon);
                return;
            }

            //if the user not would like open a service, we will next with the code of search for products
            /*
            ----now this is for know if the user write a barcode and a number----
                    example: milk*10
            */
            // Expression regular for know the format "text*number"
            const match = valueInputBarcode.split('*') //valueInputBarcode.match(/(.+)\*(\d+)$/);
            let repeatCount = 1; // value predetermined

            //we will see if exist a cant that the user would add to the card
            if (match) {
                barcodeInput = match[0]; // Extract the text before that the asterisk 

                //we will see if exist a cant that the user would add to the card
                const cant = match[1];
                if (cant) {
                    repeatCount = parseInt(match[1], 10); //Extract and convert the number after the asterisk
                }
            }


            //now we will to search the product that the user need add to the card
            let cardProduct = null;

            //we will to read all the card of the menu
            cards.forEach(card => {
                const barcode = card.id.toLowerCase();
                card.style.display = ''; //show all the card

                //if we found the product, save his exist 
                if (barcode == barcodeInput) {
                    cardProduct = card;
                }
            });

            //we will see if we found the products for add to the card
            if (cardProduct) {
                // get all the data that need for add the product to the card
                const productId = cardProduct.getAttribute('id-product');
                const productName = cardProduct.querySelector('.product-name-point-of-sales').textContent.trim();
                const purchaseUnit = cardProduct.getAttribute('purchase_unit');
                const productPrice1 = parseFloat(cardProduct.querySelector('.card-text').textContent.trim().replace('$', '').replace(',', ''));
                const productPrice2 = cardProduct.getAttribute('data-price-2') || '0';
                const productPrice3 = cardProduct.getAttribute('data-price-3') || '0';
                const typeProduct = cardProduct.getAttribute('this_product_is_sold_in_bulk');
                const id_dishes_and_combos = cardProduct.getAttribute('id_dishes_and_combos');

                //we will see if the product that the user would like add to the card is a product is sold in bulk
                if (typeProduct == 'true') {
                    //update the cant in the scale
                    repeatCount = parseFloat(match[1], 10); //this is for get decimals
                    document.getElementById('scales-store-weight-input').value = repeatCount;
                    update_weight_of_the_scale();

                    
                    addToCart('product-' + productId, productName, barcodeInput, productPrice1, purchaseUnit, typeProduct,id_dishes_and_combos) 
                } else {
                    //if exist a cant that the user would add of the product, we use a loop "for" for add the product to the card
                    for (let i = 0; i < repeatCount; i++) {
                        // call to the function addFish with the product data
                        const idImagen = 'product-' + productId;
                        addToCart(idImagen, productName, barcodeInput, productPrice1, purchaseUnit,typeProduct,id_dishes_and_combos);
                    }
                }

                searchInput.value = ""; //delete the value of the input
            } else {
                notificationMessageError('😬 Ups!', 'Este articulo no se encuentra en el menu.');
            }
        }
    });
});