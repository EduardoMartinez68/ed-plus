document.addEventListener('DOMContentLoaded', () => {
  //her is for get all the products that the user has in the menu when start the website
  let originalProductHTML = '';
  const container = document.querySelector('.product-cards-point-of-sales');
  originalProductHTML = container.innerHTML;

  //this is for get the id of the branch that the user is using
  const searchInput = document.getElementById('search');
  let cards = document.querySelectorAll('.product-card-point-of-sales');
  const ID_BRANCH = document.getElementById('id_branch').value; // Get the branch ID from the hidden input
  const dictionaryIdServices = [
    { key: ".s", icon: `seleccionarOpcion('servicios')` },
    { key: ".r", icon: `seleccionarOpcion('recargas')` },

    { key: ".cfe", icon: `show_buy_services('CFE', '', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/guiacfevigente.png')` },
    { key: ".telmex", icon: `show_buy_services('Telefonia Telmex', 'S3TELEFOTELMEXMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/telmex_telefoniafija.jpg')` },
    { key: ".telecable", icon: `show_buy_services('TeleCable', 'S3TELECABLEMXN', '')` },
    { key: ".axtel", icon: `show_buy_services('TELEFONIA AXTEL', 'S3AXTELMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/axtel_telefoniafija1.jpg')` },
    { key: ".maxcom", icon: `show_buy_services('TELEFONIA MAXCOM', 'S3TELEMAXCOMMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/MAXCOM_telefoniafija.jpg')` },
    { key: ".telnor", icon: `show_buy_services('TELEFONIA TELNOR (BC)', 'S3TELEFTELNORMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/telnor_telefoniafija.jpg')` },
    { key: ".izzi", icon: `show_buy_services('IZZI', 'S3IZIMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/IZZI_televisiondepaga.jpg')` },
    { key: ".totalplay", icon: `show_buy_services('TOTAL PLAY', 'S3TOTALPLAYMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/TOTALPLAY_televisiondepaga.jpg')` },
    { key: ".vetv", icon: `show_buy_services('Ve TV', 'S3TELEVETVMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/VETV_televisiondepagaB.jpg')` },
    { key: ".dish", icon: `show_buy_services('DISH', 'S3TELEVDISHMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/DISH_televisiondepaga.jpg')` },
    { key: ".sky", icon: `show_buy_services('SKY/Vtv', 'S3TELESKYMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/SKY_televisiondepaga.jpg')` },
    { key: ".megacable", icon: `show_buy_services('MEGACABLE', 'S3TELEMEGACABMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/MEGACABLE_televisiondepaga.jpg')` },
    { key: ".cablemas", icon: `show_buy_services('CABLEMAS', 'S3CABLEMASMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/CABLEMAS_televisindepaga.jpg')` },
    { key: ".cablevision", icon: `show_buy_services('cablevision', 'S3CABLEVISIONMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/CABLEVISION_televisiondepaga.jpg')` },
    { key: ".nextel", icon: `show_buy_services('Telefonia NEXTEL', 'S3NEXTELMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/ATTNEXTEL_pagodefactura.jpg')` },
    { key: ".movistar", icon: `show_buy_services('Telefonia MOVISTAR', 'S3MOVISTARTELMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/MOVISTAR_pagodefactura.jpg')` },
    { key: ".iusacell", icon: `show_buy_services('Telefonia IUSACELL', 'S3IUSACELLMXN', 'https://ws.prontipagos.mx/siveta-mgmt-web-1.0-SNAPSHOT/icons/iusacell_pagodefactura.jpg')` },

    { key: ".tel", icon: `mostrarFormularioRecarga('Telcel', '', '')` },
    { key: ".mov", icon: `mostrarFormularioRecarga('Movistar', 'S3TAE', 'MOVIMXN')` },
    { key: ".att", icon: `mostrarFormularioRecarga('AT&T', '', '')` },
    { key: ".une", icon: `mostrarFormularioRecarga('Unefon', 'S3TAE', 'UNEFONMXN')` },
    { key: ".bait", icon: `mostrarFormularioRecarga('Bait', '', '')` },
    { key: ".fla", icon: `mostrarFormularioRecarga('Flash Mobile', 'S3TAEFLASH', 'MXN')` },
    { key: ".maz", icon: `mostrarFormularioRecarga('Maz Tiempo', 'S3TAE', 'MAZTIEMMXN')` },
  ];



  let debounceTimeout; //this is for the debounce


  function clear_the_menu() {
    // if the input is empty, we will show all the cards
    const container = document.querySelector('.product-cards-point-of-sales');
    container.innerHTML = originalProductHTML; // Reset to original HTML
  }

  //this is for the search in cellphone
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout); // restar the count of the debounce when the user is writing

    debounceTimeout = setTimeout(() => {
      const query = searchInput.value.trim();

      if (query === '') {
        // if the input is empty, we will show all the cards
        clear_the_menu();
        return;
      }

      fetch('/links/search-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_branch: ID_BRANCH,
          barcode: query
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // here you can update the UI with the products found
            updateProductCards(data.products);
          } else {
            console.error('Error en la búsqueda:', data.message);
          }
        })
        .catch(error => {
          console.error('Error en fetch:', error);
        });

    }, 400); // Wait 400ms from the last keystroke before searching
  });

  async function update_the_menu(query) {
    try {
      const response = await fetch('/links/search-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_branch: ID_BRANCH,
          barcode: query
        })
      });

      const data = await response.json();
      if (data.success) {
        updateProductCards(data.products);
      }
    } catch (error) {
      console.error('Error al buscar productos:', error);
      notificationMessageError('😬 Ups!', 'Error al buscar productos en la base de datos.');
      return;
    }
  }

function updateProductCards(products) {
  const container = document.querySelector('.product-cards-point-of-sales');
  container.innerHTML = ''; // Limpiar tarjetas anteriores

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card-point-of-sales';
    card.id = product.barcode;
    card.setAttribute('id-product', product.id);
    card.setAttribute('data-price-1', product.price_1);
    card.setAttribute('data-price-2', product.price_2);
    card.setAttribute('data-price-3', product.price_3);
    card.setAttribute('purchase_unit', product.purchase_unit);
    card.setAttribute('this_product_is_sold_in_bulk', product.this_product_is_sold_in_bulk);
    card.setAttribute('id_dishes_and_combos', product.id_dishes_and_combos);

    card.setAttribute('onclick', `
      addToCart(
        'product-${product.id}', 
        '${product.name}', 
        '${product.barcode}', 
        ${product.price_1}, 
        '${product.purchase_unit}', 
        '${product.this_product_is_sold_in_bulk}', 
        '${product.id_dishes_and_combos}', 
        true, 
        '${product.this_product_need_recipe}'
      )
    `);

    const imgSrc = product.img ? product.img : '/img/icons_first/product.webp';

    card.innerHTML = `
      <img src="${imgSrc}" alt="Producto" id="product-${product.id}" loading="lazy">
      <br>
      <label class="card-text">$${product.price_1}</label>
      <div class="product-name-point-of-sales">${product.name}</div>
      <div class="product-barcode-point-of-sales">${product.barcode}</div>
      <input type="hidden" class="this_product_is_sold_in_bulk" value="${product.this_product_is_sold_in_bulk}">
    `;

    // --- Procesar lotes de manera universal (PG o SQLite/MySQL) ---
    let lots = [];

    try {
      if (Array.isArray(product.lots)) {
        lots = product.lots;
      } else if (typeof product.lots === 'string' && product.lots.trim().length > 0) {
        lots = JSON.parse(product.lots);
      }
    } catch (err) {
      console.warn('Error al procesar lots:', err);
    }

    // Filtrar lotes válidos (que tengan un id no nulo)
    const validLots = Array.isArray(lots)
      ? lots.filter(lot => lot.id !== null && lot.id !== undefined)
      : [];

    // Si hay lotes válidos, agregarlos
    if (validLots.length > 0) {
      const lotsDiv = document.createElement('div');
      lotsDiv.className = 'lots-info';
      lotsDiv.innerHTML = `
        <strong>Lotes:</strong>
        <ul class="lot-list">
          ${validLots.map(lot => `
            <li class="lot-item"
                data-lot-number="${lot.number_lote}"
                data-current-existence="${lot.current_existence}"
                data-manufacture-date="${lot.date_of_manufacture}"
                data-expiration-date="${lot.expiration_date}"
                data-lot-id="${lot.id}">
                
                <strong>Lote:</strong> ${lot.number_lote} <br>
                <strong>Existencia:</strong> ${lot.current_existence} <br>
                <strong>Fabricado:</strong> ${lot.date_of_manufacture} <br>
                <strong>Expira:</strong> ${lot.expiration_date} <br>
                <strong>Id:</strong> ${lot.id} <br>
            </li>
          `).join('')}
        </ul>
      `;
      card.appendChild(lotsDiv);
    }

    // Íconos: receta o lote válido
    if (product.this_product_need_recipe === true || product.this_product_need_recipe === 'true') {
      const icon = document.createElement('i');
      icon.className = 'fi fi-ss-pharmacy icon-lot';
      card.appendChild(icon);
    } else if (validLots.length > 0) {
      const icon = document.createElement('i');
      icon.className = 'fi fi-ss-dolly-flatbed icon-lot';
      card.appendChild(icon);
    }

    container.appendChild(card);
  });
}



  function updateProductCardsViejo(products) {
    const container = document.querySelector('.product-cards-point-of-sales');
    container.innerHTML = ''; // Limpiar tarjetas anteriores

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card-point-of-sales';
      card.id = product.barcode;
      card.setAttribute('id-product', product.id);
      card.setAttribute('data-price-1', product.price_1);
      card.setAttribute('data-price-2', product.price_2);
      card.setAttribute('data-price-3', product.price_3);
      card.setAttribute('purchase_unit', product.purchase_unit);
      card.setAttribute('this_product_is_sold_in_bulk', product.this_product_is_sold_in_bulk);
      card.setAttribute('id_dishes_and_combos', product.id_dishes_and_combos);

      card.setAttribute('onclick', `
            addToCart(
              'product-${product.id}', 
              '${product.name}', 
              '${product.barcode}', 
              ${product.price_1}, 
              '${product.purchase_unit}', 
              '${product.this_product_is_sold_in_bulk}', 
              '${product.id_dishes_and_combos}', 
              true, 
              '${product.this_product_need_recipe}'
            )
          `);

      const imgSrc = product.img ? product.img : '/img/icons_first/product.webp';

      // Estructura principal del HTML
      card.innerHTML = `
            <img src="${imgSrc}" alt="Producto" id="product-${product.id}" loading="lazy">
            <br>
            <label for="" class="card-text">$${product.price_1}</label>
            <div class="product-name-point-of-sales">${product.name}</div>
            <div class="product-barcode-point-of-sales">${product.barcode}</div>
            <input type="hidden" class="this_product_is_sold_in_bulk" value="${product.this_product_is_sold_in_bulk}">
          `;

      // Si hay lotes, agregarlos
      if (product.lots && product.lots.length > 0) {
        const lotsDiv = document.createElement('div');
        lotsDiv.className = 'lots-info';
        lotsDiv.innerHTML = `
              <strong>Lotes:</strong>
              <ul class="lot-list">
                ${product.lots.map(lot => `
                  <li class="lot-item"
                      data-lot-number="${lot.number_lote}"
                      data-current-existence="${lot.current_existence}"
                      data-manufacture-date="${lot.date_of_manufacture}"
                      data-expiration-date="${lot.expiration_date}"
                      data-lot-id="${lot.id}">
                      
                      <strong>Lote:</strong> ${lot.number_lote} <br>
                      <strong>Existencia:</strong> ${lot.current_existence} <br>
                      <strong>Fabricado:</strong> ${lot.date_of_manufacture} <br>
                      <strong>Expira:</strong> ${lot.expiration_date} <br>
                      <strong>Id:</strong> ${lot.id} <br>
                  </li>
                `).join('')}
              </ul>
            `;
        card.appendChild(lotsDiv);
      }

      // Íconos dependiendo si necesita receta o tiene lotes
      if (product.this_product_need_recipe === true || product.this_product_need_recipe === 'true') {
        const icon = document.createElement('i');
        icon.className = 'fi fi-ss-pharmacy icon-lot';
        card.appendChild(icon);
      } else if (product.lots && product.lots.length > 0) {
        const icon = document.createElement('i');
        icon.className = 'fi fi-ss-dolly-flatbed icon-lot';
        card.appendChild(icon);
      }

      container.appendChild(card);
    });
  }

  //we will see if the user did enter and the input
  searchInput.addEventListener('keydown', async (event) => {
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


      //when get the product that the user would like add to the card, we will see if the user write a barcode and a number
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

      //first we will see if the products exist in the database
      await update_the_menu(barcodeInput);

      //we will to read all the card of the menu
      cards = document.querySelectorAll('.product-card-point-of-sales');
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


          addToCart('product-' + productId, productName, barcodeInput, productPrice1, purchaseUnit, typeProduct, id_dishes_and_combos)
        } else {
          //if exist a cant that the user would add of the product, we use a loop "for" for add the product to the card
          for (let i = 0; i < repeatCount; i++) {
            // call to the function addFish with the product data
            const idImagen = 'product-' + productId;
            addToCart(idImagen, productName, barcodeInput, productPrice1, purchaseUnit, typeProduct, id_dishes_and_combos);
          }
        }

        searchInput.value = ""; //delete the value of the input
        clear_the_menu(); //clear the menu for show all the products again
      } else {
        notificationMessageError('😬 Ups!', 'Este articulo no se encuentra en el menu.');
        await search_product_in_my_api(barcodeInput); //show the form for add a new product
      }
    }
  });
});