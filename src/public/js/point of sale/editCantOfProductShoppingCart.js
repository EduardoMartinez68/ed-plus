let quantity = 1; // Valor inicial de cantidad
let buttonEditProduct = null;
let barcodeEditProduct = null;

async function editCant(button, barcode) {
    //save the information of the UI for edit the cant of the product
    buttonEditProduct = button; //her we will save the button that the user did click for edit his cant after
    barcodeEditProduct = barcode; //her we will save the barcode of the product that the user would like edit his cant

    //get the product in the list of the shopping cart
    const existingItem = cartItems.find(item => item.barcode === barcode);

    //we will see if the product is sold in bulk 
    if (existingItem.this_product_is_sold_in_bulk == 'true') {
        //update the information of the scale
        document.getElementById('scales-store-weight-input').value = existingItem.quantity;
        update_weight_of_the_scale();

        //if the product is sould in bulk, we will ask the user the quantity of the product
        quantity = await open_ui_weight_scale(barcode, existingItem.name, existingItem.price, 0, 0, 1);
        updateQuantity();
    } else {
        quantity = parseInt(buttonEditProduct.value); //we will save the cant of the product that the user would like edit;

        //her we will show the modal for edit the cant of the product
        document.getElementById("modal").style.display = "flex";
        document.getElementById("quantity").value = quantity;
    }
}

function closeModal() {
    quantity = 1; //reset the value of the quantity
    document.getElementById("modal").style.display = "none";
}

function changeQuantity(change) {
    quantity += change;
    if (quantity < 0) quantity = 0; //Avoid amounts less than 1
    document.getElementById("quantity").value = quantity; //update the value of the quantity
}

async function updateQuantity() {
    //we will see if exist a button that the user did click for edit the cant of the product
    if (buttonEditProduct != null) {
        //we will see if the quantity is equal to cero for know if the user would like delete the product
        if (quantity <= 0) {
            await removeItem(barcodeEditProduct); //her we will see if the user would like delete the product
        }
        else {
            //if the cant that the user would like edit is different to cero, we will update the cant of the product in the list of the shopping car
            const existingItem = cartItems.find(item => item.barcode === barcodeEditProduct); //get the product in the list of the shopping cart
            existingItem.quantity = quantity; //update the cant of the product

            //reset the variable 
            buttonEditProduct = null;
            barcodeEditProduct = null;

            //update the shopping cart and the prices
            updateCart();

            notificationMessage(`${existingItem.name}❤️`, 'El Producto fue actualizado correctamente');
        }
    }

    closeModal();
}


closeModal();
