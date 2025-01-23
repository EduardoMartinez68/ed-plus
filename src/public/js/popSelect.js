
const viewMenuButton = document.getElementById("modal-pop-select-view-menu-button");
const menuContainer = document.getElementById("modal-pop-select-menu-container");
const productSearch = document.getElementById("modal-pop-select-pop-select-search");
const addButton = document.getElementById("modal-pop-select-add-button");
menuContainer.style.display = "none";

let selectedItem = null;

// show the menu
viewMenuButton.addEventListener("click", () => {
    menuContainer.style.display = "flex";
});

// hidden the menu when the user did a click outside of the container
menuContainer.addEventListener("click", (event) => {
    if (event.target === menuContainer) {
        restart_of_menu();
    }
});


function hidenMenu(){
    if (selectedItem) {
        console.log("Producto seleccionado:", selectedItem);
        select_item_in_menu();
        restart_of_menu();
    } else {
        //if the user did not select a item
        errorMessage('Mucho Ojo 👁️','Por favor, selecciona un objeto primero.');
    }
}

function restart_of_menu(){
    menuContainer.style.display = "none"; //hidden the menu
    productSearch.value=''; //restart the search bar
    selectedItem=null; //restart the item selected

    // restart the border of the items and show all the items
    document.querySelectorAll(".modal-pop-select-pop-select").forEach(product => {
        product.style.border = "1px solid #ddd";
        product.style.display =  "flex" ;
    });
}

// filter the items by name or barcode
productSearch.addEventListener("input", (e) => {
    const filter = e.target.value.toLowerCase(); //get the value of the search bar

    //we will read all the items and we will check if the name or barcode contains the filter
    document.querySelectorAll(".modal-pop-select-pop-select").forEach(product => {
        const name = product.querySelector("p:nth-child(2)").textContent.toLowerCase();
        const barcode = product.querySelector("p:nth-child(3)").textContent;
        product.style.display = name.includes(filter) || barcode.includes(filter) ? "flex" : "none";
    });
});

// select a product
document.querySelectorAll(".modal-pop-select-pop-select").forEach(product => {
    //we will add a click event to each item
    product.addEventListener("click", () => {
        update_select_item(product); ///this function be create in the script of the view where the user use the popSelect
        //restart the border of the items and set the border to the item selected
        document.querySelectorAll(".modal-pop-select-pop-select").forEach(p => p.style.border = "1px solid #ddd");
        product.style.border = "2px solid #4CAF50";
    });
});


/*
EXAMPLE OF THE FUNCTION update_select_item(item).
this function is use for get the value of the item that the programmer will use after in other functions. 
This function change the value of the variable forever in a new script. Remember add this function in the script of the view where the user use the popSelect

function update_select_item(item){
    //get the value of the item selected for can use after
    selectedItem = {
        id:  item.getAttribute('id-item'),
        name: item.querySelector("p:nth-child(2)").textContent,
        barcode: item.querySelector("p:nth-child(3)").textContent
    };
}
*/


/*
EXAMPLE OF THE FUNCTION select_item_in_menu().
this function is use for that the programmer can do other algorithms with the item selected. 
This function is for know the next step after of selected a item.
Remember add this function in the script of the view where the user use the popSelect. 

function select_item_in_menu(){
    agregarFila();
}
*/