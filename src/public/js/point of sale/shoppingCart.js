const loadingOverlay = document.getElementById("loadingOverlay");
const cartItems = [];
let cartTotal = 0;


async function buy_my_car() {
    //get the price of the car with all the combo
    const cash = document.getElementById('cash').value;
    const credit = document.getElementById('credit').value;
    const debit = document.getElementById('debit').value;
    const moneyReceived=cash+credit+debit;
    const total = parseFloat(document.getElementById('total').textContent);
    const change=moneyReceived-total;

    //we will see if the user can buy all the shooping cart
    if (change>=0) {
        //we will to get the email of the client 
        //const emailClient = document.getElementById('emailClient').textContent;
        const comment='';
        
        //we will see if the user can buy all the shooping cart
        if(await send_buy_to_the_server(total,moneyReceived,change,comment)){
            //we will print ticket
            printTicket(total,moneyReceived,change,comment);
            
            //this is for delete all the shooping cart
            cartItems.splice(0, cartItems.length); 
            updateCart(); //update the UI of the shooping cart for delete all the products

            closePopSales(); //close the UI of the shooping cart for that the user get the Purchase money

            //we will playing a effect sound 
            var sound = new Audio('/effect/buy.mp3');
            sound.play();

            //we will watching if exist exchange in the buy
            var text = (change != 0) ? 'Tu Cambio es de ' + change + '💲' : 'Vuelve pronto 😄';
            confirmationMessage(text, 'Gracias por su compra ❤️');
        }
    }else{
        errorMessage('ERROR 👁️', 'El dinero no es suficiente para la compra');
    }
}

async function send_buy_to_the_server(total,moneyReceived,exchange,comment){
    // Show loading overlay
    loadingOverlay.style.display = "flex";

    try {
        //we will watching if the server can complete the pay and setting the inventory
        const answerServer = await get_answer_server({products:cartItems,total:total,moneyReceived:moneyReceived,change:exchange,comment:comment},`/fud/car-post`);

        //we will see if save the commander 
        if (!isNaN(answerServer.message)) {
            return true;
        } else {
            //if the server not can complete the pay we going to send a message of error
            errorMessage('ERROR 👁️', answerServer.message + ' 👉👈');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage('ERROR ⚠️', 'Se produjo un error al procesar tu solicitud.');
        return false;
    } finally {
        // Hide loading overlay regardless of success or failure
        loadingOverlay.style.display = "none";
    }  
}

async function get_answer_server(dataToTheServer, link) {
    try {
        const url = link;
        // Configurar la solicitud
        const options = {
            method: 'POST', // Puedes usar POST en lugar de GET si necesitas enviar muchos datos
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToTheServer)
        };

        // Realizar la solicitud y esperar la respuesta
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        // Convertir la respuesta a JSON y devolverla
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function delete_all_car(total,moneyReceived,exchange,comment) {
    /*
    // Show loading overlay
    loadingOverlay.style.display = "flex";

    const combos = get_all_combo(total,moneyReceived,exchange,comment);

    try {
        //get the email and the id of the customer 
        const button = document.getElementById('emailClient');
        const idClient = button.getAttribute('idClient');

        //we will print the ticket 
        const selectElementPrinter = document.getElementById('dataPrinter');
        const ipPrinter = selectElementPrinter.value;

        //we will see if exist a ip for that not exist a error
        var link=''
        if(ipPrinter){
            link = `/fud/${idClient}/${ipPrinter}/car-post`;
        }else{
            link = `/fud/${idClient}/car-post`;
        }

        //we will watching if the server can complete the pay and setting the inventory
        const answerServer = await get_answer_server(combos,link);

        //we will see if save the commander 
        if (!isNaN(answerServer.message)) {
            //we will see if the user would like do a send to his house 
            var dataOrder = document.getElementById('customer-name').value;
            if (dataOrder !== "" && dataOrder !== null){ //we will see if exist information about the order 
                const idCommander=answerServer.message;
                const answerServerOrder=await get_answer_server_for_add_order(idCommander);
            }
            
            //we will print ticket
            printTicket(total,moneyReceived,exchange,comment);

            //restart the email of the customer
            button.innerHTML = '<i class="fi-icon fi-sr-following"></i> Buscar Cliente';
            button.setAttribute('idClient', null);

            //we will playing a effect sound 
            var sound = new Audio('/effect/buy.mp3');
            sound.play();

            var text = (exchange != 0) ? 'Tu Cambio es de ' + exchange + '💲' : 'Vuelve pronto 😄';
            confirmationMessage(text, 'Gracias por su compra ❤️'); //we will watching if exist exchange in the buy
        } else {
            //if the server not can complete the pay we going to send a message of error
            errorMessage('ERROR 👁️', answerServer.message + ' 👉👈');
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage('ERROR 👁️', 'Se produjo un error al procesar su solicitud.');
    } finally {
        // Hide loading overlay regardless of success or failure
        loadingOverlay.style.display = "none";
    }
    */

    return true;
}

async function addToCart(img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk,id_dishes_and_combos) {
    const existingItem = cartItems.find(item => item.barcode === barcode);
    if (existingItem) {
        //we will see if the product is sold in bulk
        if(this_product_is_sold_in_bulk=='true'){
            //update the cant of the product in the scale 
            document.getElementById('scales-store-weight-input').value=existingItem.quantity;
            update_weight_of_the_scale();

            //get the new cant that the user would like buy
            let quantityForSales=await open_ui_weight_scale(barcode, name, price, 0, 0, 1);

            //we will see if the user delete the product
            if(quantityForSales<=0){
                await removeItem(barcodeEditProduct);
            }
            else{
                existingItem.quantity = quantityForSales; //update the product in the cart
            }
        }else{
            existingItem.quantity += 1; //update the product in the cart
        }

        notificationMessage(`${existingItem.name} fue agregado ❤️`, 'El Producto fue agregado correctamente');
    } else {
        let quantityForSales=1; //this is for the product that are sale for unit

        //we will see if the product is sold in bulk
        if(this_product_is_sold_in_bulk=='true'){
            //if the product is sould in bulk, we will ask the user the quantity of the product
            quantityForSales=await open_ui_weight_scale(barcode, name, price, 0, 0, 1);
        }

        cartItems.push({
            img: document.getElementById(img).src,
            name,
            barcode,
            price,
            quantity: quantityForSales,
            discount: 0,
            purchaseUnit,
            this_product_is_sold_in_bulk:this_product_is_sold_in_bulk,
            id_dishes_and_combos:id_dishes_and_combos
        });

        notificationMessage(`${name} fue agregado ❤️`, 'El Producto fue agregado correctamente');
    }
    updateCart();
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        const itemTotal = (item.price - item.discount) * item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="cart-item-point-of-sales">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info-point-of-sales">
                <div class="cart-item-name-point-of-sales">${item.name}</div>
                <div class="cart-item-barcode-point-of-sales">Código: ${item.barcode}</div>
                Cant.
                <input type="button" class="cart-item-quantity-point-of-sales" value="${item.quantity}" onclick="editCant(this,'${item.barcode}')" onchange="updateItemQuantity('${item.barcode}', this.value)"> ${item.purchaseUnit}
                <br>
                Desc.
                <input type="button" class="cart-item-discount-point-of-sales" value="${item.discount}" onchange="updateItemDiscount('${item.barcode}', this.value)">
                <div class="cart-item-price-point-of-sales">Precio: $${item.price.toFixed(2)}</div> 
                <div class="cart-item-total-point-of-sales">Total: $${itemTotal.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove-point-of-sales" onclick="removeItem('${item.barcode}')">X</button>
            </div>
        `;
    });

    //her we update the price of the shopping cart
    cartTotal = cartItems.reduce((total, item) => total + (item.price - item.discount) * item.quantity, 0);
    document.getElementById('cart-total').textContent = cartTotal.toFixed(2);

    //her we update the number of product that exist in the shopping cart
    document.getElementById('products-total').textContent = cartItems.length;
}

function updateItemQuantity(barcode, quantity) {
    const item = cartItems.find(item => item.barcode === barcode);
    if (item) {
        item.quantity = parseInt(quantity);
        updateCart();
    }
}

function updateItemDiscount(barcode, discount) {
    const item = cartItems.find(item => item.barcode === barcode);
    if (item) {
        item.discount = parseFloat(discount);
        updateCart();
    }
}

async function removeItem(barcode) {
    //her we will see if the user would like delete the product
    if (await questionMessage('Eliminar Producto 🤔', '¿Estás seguro de querer eliminar este producto?')) {
        //if the user would like delete the product, we will delete the product
        const index = cartItems.findIndex(item => item.barcode === barcode);
        if (index !== -1) {
            cartItems.splice(index, 1);
            updateCart();
        }
        notificationMessage('Producto eliminado 👍', 'El Producto fue eliminado correctamente')
    }
}

function buyItems() {
    alert('Compra realizada con éxito');
    cartItems.length = 0; // Limpiar carrito
    updateCart();
}

