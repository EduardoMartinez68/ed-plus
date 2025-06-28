const loadingOverlay = document.getElementById("loadingOverlay");
let cartItems = [];
window.onload = () => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
        cartItems = JSON.parse(savedCartItems);
        updateCart();
    }
}


let cartTotal = 0;

const carsInWait=[]

//update value of the cars in wait, this is for that the user can see the cars in wait after refresh the page
/*
const storedCarts = localStorage.getItem('carsInWait');
if (storedCarts) {
    carsInWait = JSON.parse(storedCarts);
    alert(`Hay ${carsInWait.length} carritos en espera`);
}
*/

async function create_a_sale_in_wait(){
    const add_product_on_backorder=document.getElementById('add_product_on_backorder');
    if(add_product_on_backorder==null){
        //if the user not have the permission to remove the product, we will send a message of warning
        if(!await this_user_is_admin('Crear Venta en espera ⌛','add_product_on_backorder')){
            warningMessage('🐣 ¡Ay, travieso!', 'Este superpoder está bloqueado para ti... por ahora.');
            return;
        }
    }

    //first we will see if exist a product in the cart
    if (cartItems.length === 0) {
        errorMessage('ERROR 👁️', 'No hay productos en el carrito para guardar en espera.');
        return;
    }

    const emailClient = document.getElementById('emailClient');
    const id_customer = emailClient.getAttribute('idClient');

    const now = new Date();
    const formattedDate = now.toLocaleString(); // Ej: "25/04/2025, 14:32:05"
    const copyCartItems = [...cartItems];


    const copyRecipe=[...information_of_recipe];
    const informationCartInWait={
        emailClient:emailClient.textContent,
        id_customer:id_customer,
        date:formattedDate,
        items:copyCartItems,
        cartTotal:cartTotal,
        recipe:copyRecipe
    };

    carsInWait.push(informationCartInWait); //add the cart to the array of cars
    localStorage.setItem('carsInWait', JSON.stringify(carsInWait)); //save the cart in the local storage

    //delete the customer
    emailClient.setAttribute('idClient', null);
    emailClient.textContent = '';

    cartItems.length = 0; //restart the cart
    information_of_recipe.length=0; //restart the recipe
    updateCart(); //update the UI of the shooping cart for delete all the products

    notificationMessage(`Nuevo carrito agregado ❤️`, 'Acabas de agregar un carrito a la lista de espera');
}


async function show_popup_cart_in_wait() {
    const view_products_on_backorder=document.getElementById('view_products_on_backorder');
    if(view_products_on_backorder==null){
        //if the user not have the permission to remove the product, we will send a message of warning
        if(!await this_user_is_admin('Ver Ventas en espera ⌛','view_products_on_backorder')){
            warningMessage('🐣 ¡Ay, travieso!', 'Este superpoder está bloqueado para ti... por ahora.');
            return;
        }
    }

    const storedCarts = localStorage.getItem('carsInWait');
    if (storedCarts) {
        carsInWait.length = 0; // vaciar el array original
        carsInWait.push(...JSON.parse(storedCarts)); // llenar con los datos del localStorage
    }

    //we will see if exist a cart in the cars in wait
    if (carsInWait.length === 0) {
        errorMessage('ERROR 👁️', 'No hay carritos en espera.');
        return;
    }

    // Elimina cualquier popup anterior
    const existingOverlay = document.querySelector('.pop-cart-wait-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'pop-cart-wait-overlay';

    overlay.innerHTML = `
        <div class="pop-cart-wait-container">
            <div class="pop-cart-wait-header">
                <span class="pop-cart-wait-title">Carritos en espera</span>
                <button class="pop-cart-wait-close">&times;</button>
            </div>
            <div class="pop-cart-wait-list">
                ${carsInWait.map((cart, index) => `
                    <div class="pop-cart-wait-item" data-index="${index}">
                        <p><i class="fa-solid fa-user"></i> <strong>Cliente:</strong> ${cart.emailClient || 'Publico General'}</p>
                        <p><i class="fa-regular fa-clock"></i> <strong>Fecha:</strong> ${cart.date}</p>
                        <p><i class="fa-solid fa-dollar-sign"></i> <strong>Total:</strong> <span class="pop-cart-wait-bold">$${cart.cartTotal.toFixed(2)}</span></p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.querySelector('.pop-cart-wait-close').addEventListener('click', () => {
        overlay.remove();
    });

    // Delegar eventos de clic
    document.querySelectorAll('.pop-cart-wait-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            overlay.remove(); // cerrar el popup
            const index = parseInt(item.getAttribute('data-index'));

            //we will see if can return the cart to the point of sale
            if(await update_cart_in_wait(index)){
                carsInWait.splice(index, 1);
                localStorage.setItem('carsInWait', JSON.stringify(carsInWait)); // actualizar localStorage
            }
        });
    });
}

async function show_popup_ticket_history() {
    // Validar permisos (opcional)
    /*
    if (!await this_user_is_admin('Ver historial de tickets 📄', 'view_ticket_history')) {
        warningMessage('🕵️‍♂️ ¡Acceso denegado!', 'No tienes permiso para ver el historial de tickets.');
        return;
    }
        */

    if (!listTicket || listTicket.length === 0) {
        errorMessage('Sin Tickets 😅', 'No hay tickets guardados para mostrar.');
        return;
    }

    // Elimina cualquier popup anterior
    const existingOverlay = document.querySelector('.pop-ticket-history-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'pop-ticket-history-overlay';

    overlay.innerHTML = `
        <div class="pop-ticket-history-container">
            <div class="pop-ticket-history-header">
                <span class="pop-ticket-history-title">Historial de Tickets</span>
                <button class="pop-ticket-history-close">&times;</button>
            </div>
            <div class="pop-ticket-history-list">
                ${listTicket.map((ticket, index) => `
                    <div class="pop-ticket-history-item" data-index="${index}">
                        <p><i class="fa-regular fa-clock"></i> <strong>Guardado:</strong> ${ticket.fecha || 'Sin fecha'}</p>
                        <p><i class="fa-solid fa-receipt"></i> <strong>Vista previa:</strong> <span class="pop-ticket-history-preview">${(ticket.texto || ticket).substring(0, 50)}...</span></p>
                        <button class="btn-reprint-ticket" data-index="${index}"><i class="fa-solid fa-print"></i> Reimprimir</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.querySelector('.pop-ticket-history-close').addEventListener('click', () => {
        overlay.remove();
    });

    // Botones de reimpresión
    document.querySelectorAll('.btn-reprint-ticket').forEach(btn => {
        btn.addEventListener('click',async (e) => {
            const index = parseInt(btn.getAttribute('data-index'));
            overlay.remove();

            const ticket = listTicket[index];
            await sned_information_to_the_server_for_print_the_ticket(ticket.texto || ticket,true); // Usa tu función de impresión aquí
        });
    });
}


async function update_cart_in_wait(index) {  
    const select_product_on_backorder=document.getElementById('select_product_on_backorder');
    if(select_product_on_backorder==null){
        //if the user not have the permission to remove the product, we will send a message of warning
        if(!await this_user_is_admin('Seleccionar Venta en espera ⌛','select_product_on_backorder')){
            warningMessage('🐣 ¡Ay, travieso!', 'Este superpoder está bloqueado para ti... por ahora.');
            return;
        }
    }

    //first we will see if exist a product in the cart 
    if (cartItems.length > 0) {
        //we will see if the user would like delete the product
        if (!await questionMessage('Tienes productos en este carrito 🛒','¿Estás seguro de querer eliminar el carrito actual?')) {
            return false; //if the user not would like delete the product, we will return false
        }
    }

    //if the user would like delete the product, we will delete the product
    const cart = carsInWait[index];
    emailClient.setAttribute('idClient', cart.id_customer);
    emailClient.textContent = cart.emailClient;

    cartItems = [...cart.items]; //copy the cart to the cart of the point of sale
    cartTotal=cart.cartTotal;

    information_of_recipe=[...cart.recipe]; //copy the recipe to the recipe of the point of sale

    updateCart(); //update the UI of the shooping cart for delete all the products

    notificationMessage(`Carrito recuperado ❤️`, 'Acabas de recuperar una compra de la lista de espera');
    return true;
}



async function buy_my_car() {
    //get the price of the car with all the combo
    const cash = parseFloat(document.getElementById('cash').value) || 0;
    const credit = parseFloat(document.getElementById('credit').value) || 0;
    const debit = parseFloat(document.getElementById('debit').value) || 0;
    const moneyReceived = (cash + credit + debit).toFixed(2);
    const total = parseFloat(document.getElementById('total').textContent);
    const change = moneyReceived - total;

    //we will see if the user can buy all the shooping cart
    if (change >= 0) {
        //we will to get the email of the client 
        const comment = document.getElementById('comment-sales').value;
        const emailClient = document.getElementById('emailClient');
        const id_customer = emailClient.getAttribute('idClient');

        //we will see if the user can buy all the shooping cart
        if (await send_buy_to_the_server(total, moneyReceived, change, comment, id_customer, cash, credit, debit)) {
            await update_the_lots_of_the_product_in_the_car(id_customer);

            //we will print ticket
            await print_ticket(total, moneyReceived, change, comment);

            //this is for delete all the shooping cart
            cartItems.splice(0, cartItems.length);
            updateCart(); //update the UI of the shooping cart for delete all the products

            //delete the customer
            emailClient.setAttribute('idClient', null);
            emailClient.textContent = '';
            document.getElementById('comment-sales').value = ''; //delete the comment

            closePopSales(); //close the UI of the shooping cart for that the user get the Purchase money

            //we will playing a effect sound 
            var sound = new Audio('/effect/buy.mp3');
            sound.play();

            //we will watching if exist exchange in the buy
            var text = (change != 0) ? 'Tu Cambio es de ' + change + '💲' : 'Vuelve pronto 😄';
            confirmationMessage(text, 'Gracias por su compra ❤️');
        }
    } else {
        errorMessage('ERROR 👁️', 'El dinero no es suficiente para la compra');
    }
}

async function save_the_recipe_in_the_database(lotId,id_customer){
    //her we will save the recipe in the database
    const answerServer = await get_answer_server(information_of_recipe_for_sned_to_the_server, `/fud/recipe-post`);

    selectedLots=[] //this is for remove all the lot of the product in the cart
    information_of_recipe_for_sned_to_the_server=[] //this is for remove all the recipe in the cart
}

async function send_buy_to_the_server(total, moneyReceived, exchange, comment, id_customer, cash, credit, debit) {
    // Show loading overlay
    loadingOverlay.style.display = "flex";

    try {
        //we will watching if the server can complete the pay and setting the inventory
        const answerServer = await get_answer_server({ products: cartItems, total: total, moneyReceived: moneyReceived, change: exchange, comment: comment, id_customer: id_customer, cash, credit, debit }, `/fud/car-post`);

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

async function update_the_lots_of_the_product_in_the_car(id_customer) {

    const existProductThatNeedPrescription = information_of_recipe.length > 0;
    for (let lotElement of document.querySelectorAll('.lot-item')) { // Usar 'for...of' en lugar de 'forEach'
        let lotId = lotElement.getAttribute('data-lot-id'); // ID del lote en el DOM
        
        let foundLot = selectedLots.find(lot => lot.idLot == lotId); // Buscar en la lista de lotes seleccionados
        if (foundLot) {
            let currentExistence = parseInt(lotElement.getAttribute('data-current-existence'), 10);
            
            if (!isNaN(currentExistence)) { // Asegurar que sea un número válido
                let newQuantity = foundLot.quantity //currentExistence - foundLot.quantity;

                // Evitar valores negativos
                newQuantity = newQuantity < 0 ? 0 : newQuantity;
                
                // Llamar a la función asíncrona
                await get_answer_server_for_lot({newQuantity:newQuantity}, `/links/${lotId}/update-lot-quantity-for-sale`);

                // Actualizar el atributo y mostrar en el HTML
                //lotElement.setAttribute('data-current-existence', newQuantity);
                
                //we will see if exist product that need prescription in the cart
                if (existProductThatNeedPrescription) {
                    //her we will know if the product need presciption
                    const newPrescription=update_the_prescription_for_save_after(foundLot.barcode, lotId, foundLot.quantity, id_customer);
                    if(newPrescription){ //her know will see if the product need a recipe
                        information_of_recipe_for_sned_to_the_server.push(newPrescription);
                    }
                }
            } else {
                console.warn(`Error: El lote con ID ${lotId} no tiene una existencia válida.`);
            }
        }
    }


    //we will see if exist product that need prescription in the cart
    if (existProductThatNeedPrescription) {
        await save_the_recipe_in_the_database(); //if exist product that need recipe, send the information to the server
    }
}

function update_the_prescription_for_save_after(barcode, newIdLot, newAmount, newIdCustomer) {
    for (let i = 0; i < information_of_recipe.length; i++) {
        let recipe = information_of_recipe[i];
        
        if (recipe.barcode === barcode) {
            let newRecipe = {
                id_dishes_and_combos: recipe.id_dishes_and_combos,
                barcode: recipe.barcode,
                recipeId: recipe.recipeId,
                doctorLicense: recipe.doctorLicense,
                doctorName: recipe.doctorName,
                prescriptionDate: recipe.prescriptionDate,
                retained: recipe.retained,
                comments: recipe.comments,
                id_lot: newIdLot,
                amount: newAmount,
                id_customer: newIdCustomer
            };

            return newRecipe; // Retorna el objeto actualizado y sale del bucle
        }
    }
    return false;
}

async function get_answer_server_for_lot(dataToTheServer, link) {
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

async function delete_all_car(total, moneyReceived, exchange, comment) {
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

async function addToCart(img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk, id_dishes_and_combos,thisIsProductWithLot=true,this_product_need_a_recipe=false) {
    //her we will see if exist a product in the cart
    const existingItem = cartItems.find(item => item.barcode === barcode);

    //now her, we will see if the product is sale for lot
    let lotsInfo = get_the_lot_of_the_product(barcode) // get the lot of the product

    //we will see if exit lot of the product
    if (lotsInfo && thisIsProductWithLot) {
        if(existingItem){
            warningMessage('Mucho Ojo 👁️','Para agregar más cantidad de este producto, debes eliminarlo y volver a seleccionar los lotes.')
            return;
        }

        //her we will see if the product need a recipe 
        if (this_product_need_a_recipe=='true' || this_product_need_a_recipe=='1' || this_product_need_a_recipe=='on') {
            show_recipe(img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk, id_dishes_and_combos,thisIsProductWithLot,this_product_need_a_recipe); //this is for show the message pop for get the data of the recipe
            return;
        }

        show_all_the_lot_of_the_product(lotsInfo,img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk, id_dishes_and_combos);
        return;
    }

    //we will see if exist this item in the cart for add a new quantity 
    if (existingItem) {
        //we will see if the product is sold in bulk
        if (this_product_is_sold_in_bulk == 'true' || this_product_is_sold_in_bulk == '1' || this_product_is_sold_in_bulk=='on') {
            //update the cant of the product in the scale 
            document.getElementById('scales-store-weight-input').value = existingItem.quantity;
            update_weight_of_the_scale();

            //get the new cant that the user would like buy
            let quantityForSales = await open_ui_weight_scale(barcode, name, price, 0, 0, 1);

            //we will see if the user delete the product
            if (quantityForSales <= 0) {
                await removeItem(barcodeEditProduct);
            }
            else {
                existingItem.quantity = quantityForSales; //update the product in the cart
            }
        } else {
            //if not exist lot of the product, we will add a new product to the cart
            existingItem.quantity += 1; //update the product in the cart
        }

        notificationMessage(`${existingItem.name} fue agregado ❤️`, 'El Producto fue agregado correctamente');
    } else {
        let quantityForSales = 1; //this is for the product that are sale for unit

        //we will see if the product is sold in bulk
        if (this_product_is_sold_in_bulk == 'true' || this_product_is_sold_in_bulk == '1' || this_product_is_sold_in_bulk == 'on') {
            //if the product is sould in bulk, we will ask the user the quantity of the product
            quantityForSales = await open_ui_weight_scale(barcode, name, price, 0, 0, 1);
        }
        
        //add a new product to the cart
        cartItems.push({
            img: document.getElementById(img).src,
            name,
            barcode,
            price,
            quantity: quantityForSales,
            discount: 0,
            purchaseUnit,
            this_product_is_sold_in_bulk: this_product_is_sold_in_bulk,
            id_dishes_and_combos: id_dishes_and_combos
        });

        //show a new notification
        notificationMessage(`${name} fue agregado ❤️`, 'El Producto fue agregado correctamente');
    
    }

    //update the cart
    updateCart(lotsInfo);
    
}

function remove_all_the_item_in_the_cart_that_not_exist_in_the_array_of_the_recipe(){
    //her code is for that not exist a product in the cart that not exist in the array of the recipe. 
    //This is for not save recipe that the user no have in the cart
    information_of_recipe = information_of_recipe.filter(recipe => 
        cartItems.some(item => item.barcode === recipe.barcode)
    );

    information_of_recipe_for_sned_to_the_server = information_of_recipe_for_sned_to_the_server.filter(recipe => 
        cartItems.some(item => item.barcode === recipe.barcode)
    );
}

function get_the_lot_of_the_product(barcode) {
    // search the product in the menu
    let productElement = document.getElementById(barcode);

    if (!productElement) {
        return null;
    }

    //we will see if the product have lot
    let lotsInfo = productElement.querySelector(".lots-info");
    return lotsInfo;
}

function show_all_the_lot_of_the_product(lotsInfo,img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk, id_dishes_and_combos) {
    // get all the lots
    let lots = [];
    let lotElements = lotsInfo.querySelectorAll("li");

    //in this for we will get all the information of the lot
    lotElements.forEach(lotElement => {
        let idLot = lotElement.getAttribute('data-lot-id');
        let lotNumber = lotElement.getAttribute('data-lot-number');
        let existence = parseInt(lotElement.getAttribute('data-current-existence'), 10);
        let manufactureDate = lotElement.getAttribute('data-manufacture-date');
        let expirationDate = lotElement.getAttribute('data-expiration-date');
    
        lots.push({
            id: idLot,
            nombre: lotNumber,
            fechaInicio: manufactureDate,
            fechaFinal: expirationDate,
            existencia: existence
        });
    });

    // open the popup and show the lot
    openLotPopup(lots,img, name, barcode, price, purchaseUnit, this_product_is_sold_in_bulk, id_dishes_and_combos);
}
//promotionsList
function updateCart2(lotsInfo=null) {
    remove_all_the_item_in_the_cart_that_not_exist_in_the_array_of_the_recipe(); //clear the list

    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        
        const itemTotal = (item.price - item.discount) * item.quantity;
        if(lotsInfo){
            cartItemsContainer.innerHTML += `
            <div class="cart-item-point-of-sales">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info-point-of-sales">
                <div class="cart-item-name-point-of-sales">${item.name}</div>
                <div class="cart-item-barcode-point-of-sales">Código: ${item.barcode}</div>
                Cant.
                <input type="button" class="cart-item-quantity-point-of-sales" value="${item.quantity}"> ${item.purchaseUnit}
                <br>
                Desc.
                <input type="button" class="cart-item-discount-point-of-sales" value="${item.discount}">
                <div class="cart-item-price-point-of-sales">Precio: $${item.price.toFixed(2)}</div> 
                <div class="cart-item-total-point-of-sales">Total: $${itemTotal.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove-point-of-sales" onclick="removeItem('${item.barcode}')">X</button>
            </div>
        `;
        }else{
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
        }

    });

    //her we update the price of the shopping cart
    cartTotal = cartItems.reduce((total, item) => total + (item.price - item.discount) * item.quantity, 0);
    document.getElementById('cart-total').textContent = cartTotal.toFixed(2);

    //her we update the number of product that exist in the shopping cart
    document.getElementById('products-total').textContent = cartItems.length;
}

function getAllPromotions() {
    const promotionsList = [];
    
    document.querySelectorAll('.div-promotions').forEach(div => {
        const promotion = {
            id: div.getAttribute('id_promotion'),
            id_dishes_and_combos: div.getAttribute('id_dishes_and_combos'),
            id_dish_and_combo_features: div.getAttribute('id_dish_and_combo_features'),
            active_promotion: div.getAttribute('active_promotion') === "true", // Convertir a booleano
            name_promotion: div.getAttribute('name_promotion'),
            fromTime: div.getAttribute('fromTime'),
            toTime: div.getAttribute('toTime'),
            promotions_from: parseFloat(div.getAttribute('promotions_from')),
            promotions_to: parseFloat(div.getAttribute('promotions_to')),
            discount_percentage: parseFloat(div.getAttribute('discount_percentage')),
            date_from: div.getAttribute('date_from'),
            date_to: div.getAttribute('date_to')
        };

        promotionsList.push(promotion);
    });

    return promotionsList;
}

const promotionsList=getAllPromotions();

function updateCart(lotsInfo = null) {
    remove_all_the_item_in_the_cart_that_not_exist_in_the_array_of_the_recipe(); // Limpiar lista

    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Obtener fecha actual (YYYY-MM-DD)
    const currentTime = now.toTimeString().split(' ')[0]; // Obtener hora actual (HH:MM:SS)

    cartItems.forEach(item => {
        let discount = 0;
        // Buscar promociones aplicables
        const applicablePromotions = promotionsList.filter(promo => {
            // Convertir fechas a objetos Date para comparación
            const promoDateFrom = promo.date_from ? new Date(promo.date_from) : null;
            const promoDateTo = promo.date_to ? new Date(promo.date_to) : null;

            // Convertir horas a minutos totales
            const promoFromTime = promo.fromTime ? parseInt(promo.fromTime.split(':')[0]) * 60 + parseInt(promo.fromTime.split(':')[1]) : null;
            const promoToTime = promo.toTime ? parseInt(promo.toTime.split(':')[0]) * 60 + parseInt(promo.toTime.split(':')[1]) : null;

            //first we will see if the promotion need a quantity equal how 3,6,9,12,
            if(promo.promotions_from==promo.promotions_to){
                return (
                    //her is for know if the product is the promotion
                    promo.id_dishes_and_combos === item.id_dishes_and_combos &&
    
                    //her is for know if the quantity is the success
                    item.quantity % promo.promotions_from== 0 &&
    
                    //her is for know the date and hour of the promotion
                    (promoDateFrom === null || promoDateFrom <= now) &&
                    (promoDateTo === null || promoDateTo >= now) &&
                    (promoFromTime === null || promoFromTime <= currentTime) &&
                    (promoToTime === null || promoToTime >= currentTime)
                );               
            }
            
            return (
                //her is for know if the product is the promotion
                promo.id_dishes_and_combos === item.id_dishes_and_combos &&

                //her is for know if the quantity is the success
                item.quantity >= promo.promotions_from &&
                (item.quantity <= promo.promotions_to || promo.promotions_to===null) &&

                //her is for know the date and hour of the promotion
                (promoDateFrom === null || promoDateFrom <= now) &&
                (promoDateTo === null || promoDateTo >= now) &&
                (promoFromTime === null || promoFromTime <= currentTime) &&
                (promoToTime === null || promoToTime >= currentTime)
            );
        });

        // Aplicar el mayor descuento disponible

        if (applicablePromotions.length > 0) {
            discount = Math.max(...applicablePromotions.map(promo => promo.discount_percentage));
        }

        item.discount = (item.price * discount) / 100; // Calcular descuento
        const itemTotal = (item.price - item.discount) * item.quantity;

        // Crear la estructura HTML
        if(lotsInfo){
            cartItemsContainer.innerHTML += `
            <div class="cart-item-point-of-sales">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info-point-of-sales">
                <div class="cart-item-name-point-of-sales">${item.name}</div>
                <div class="cart-item-barcode-point-of-sales">Código: ${item.barcode}</div>
                Cant.
                <input type="button" class="cart-item-quantity-point-of-sales" value="${item.quantity}"> ${item.purchaseUnit}
                <br>
                Desc.
                <input type="button" class="cart-item-discount-point-of-sales" value="${discount.toFixed(2)}">
                <div class="cart-item-price-point-of-sales">Precio: $${item.price.toFixed(2)}</div> 
                <div class="cart-item-total-point-of-sales">Total: $${itemTotal.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove-point-of-sales" onclick="removeItem('${item.barcode}')">X</button>
            </div>
        `;
        }else{
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
                    <input type="button" class="cart-item-discount-point-of-sales" value="${discount.toFixed(2)}" onchange="updateItemDiscount('${item.barcode}', this.value)">
                    <div class="cart-item-price-point-of-sales">Precio: $${item.price.toFixed(2)}</div> 
                    <div class="cart-item-total-point-of-sales">Total: $${itemTotal.toFixed(2)}</div>
                    </div>
                    <button class="cart-item-remove-point-of-sales" onclick="removeItem('${item.barcode}')">X</button>
                </div>
            `;
        }
        
    });

    // Actualizar el total del carrito
    cartTotal = cartItems.reduce((total, item) => total + (item.price - item.discount) * item.quantity, 0);
    document.getElementById('cart-total').textContent = cartTotal.toFixed(2);

    // Actualizar número de productos en el carrito
    document.getElementById('products-total').textContent = cartItems.length;


    //save the data of the cart in the local storage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
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



async function get_the_key_of_the_admin(title) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html: `
                <p style="margin-bottom: 10px;">Solicita este permiso a un admin</p>
                <input id="admin-username" class="swal2-input" placeholder="Usuario del admin">
                <input id="admin-password" class="swal2-input" type="password" placeholder="Contraseña del admin">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const username = Swal.getPopup().querySelector('#admin-username').value.trim();
                const password = Swal.getPopup().querySelector('#admin-password').value.trim();

                if (!username || !password) {
                    Swal.showValidationMessage('¡No te me escapas! Ambos campos son obligatorios 😜');
                    return false;
                }

                return [username, password];
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(result.value);
            } else {
                resolve(null); // Por si cancela, puedes manejarlo como gustes
            }
        });
    });
}

async function removeItem(barcode) {
    const remove_product_for_sale = document.getElementById('remove_product_for_sale');
    if(remove_product_for_sale==null){
        //if the user not have the permission to remove the product, we will send a message of warning
        if(!await this_user_is_admin('Eliminar producto 🗑️','delete_the_shopping_cart')){
            warningMessage('🐣 ¡Ay, travieso!', 'Este superpoder está bloqueado para ti... por ahora.');
            return;
        }
    }

    //her we will see if the user would like delete the product
    if (await questionMessage('Eliminar Producto 🤔', '¿Estás seguro de querer eliminar este producto?')) {
        //if the user would like delete the product, we will delete the product
        const index = cartItems.findIndex(item => item.barcode === barcode);
        if (index !== -1) {
            cartItems.splice(index, 1);
            updateCart();
        }

        //delete all the data of the lot
        selectedLots = selectedLots.filter(lot => lot.barcode !== barcode);
        notificationMessage('Producto eliminado 👍', 'El Producto fue eliminado correctamente')
    }
}

async function this_user_is_admin(title,permissionToCheck) {
    const credentials = await get_the_key_of_the_admin(title);

    if (!credentials || !credentials[0] || !credentials[1]) {
        warningMessage('Cancelado', 'No se ingresaron credenciales 😅');
        return false;
    }

    const [username, password] = credentials;

    try {
        const response = await fetch('/links/this_user_is_admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                permission: permissionToCheck
            })
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud al servidor');
        }

        const result = await response.json();

        if (result.isAuthorized) {
            return true;
        } else {
            //result.message
            return false;
        }
    } catch (error) {
        console.error('Error al verificar permisos del admin:', error);
        errorMessage('Error', 'Algo salió mal al verificar el permiso 😓');
        return false;
    }
}


function buyItems() {
    alert('Compra realizada con éxito');
    cartItems.length = 0; // Limpiar carrito
    updateCart();
}

