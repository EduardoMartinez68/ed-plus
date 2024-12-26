document.getElementById('create-pdf').addEventListener('click', async () => {
    // import jsPDF
    const { jsPDF } = window.jspdf;

    // create a instance of jsPDF
    //const doc = new jsPDF();
    const doc = new jsPDF('p','mm','letter');
    let currentY = 10; //this is for save the current position of the cursor of the PDF
    save_the_information_of_the_invoice(doc,currentY);

    //add the icon company
    const hiddenImage = document.getElementById('icon-pdf');
    let imageUrl = hiddenImage ? hiddenImage.src : ''; //get the path of the image. Check if element exists before accessing src

    //if the image is not found, we will use a default image
    if (!imageUrl || imageUrl === 'undefined' || imageUrl === '') {
        imageUrl = '/img/your_logo.png';
    }
    currentY=add_image(doc,imageUrl,10,currentY,50,25);
    currentY=save_data_of_export(doc,currentY);


    //create the title of the tables 
    doc.setFontSize(20);
    doc.setTextColor(7, 93, 168);
    doc.text('Formulario de Cotización', 14, currentY);
    doc.setTextColor(0, 0, 0);
    currentY+=10;

    //create the table of the container
    doc.setFontSize(12);
    currentY=create_table_products(doc,currentY);

    const total=document.getElementById('total-general').value;
    currentY=draw_the_total(doc,total,14,currentY);
    
    currentY=create_table_products(doc,currentY);
    currentY=draw_the_total(doc,total,14,currentY);

    const paymentTerm=document.getElementById('payment-term').value;
    doc.setFontSize(10);
    doc.text("Plazo de pago: "+paymentTerm, 14, currentY);
    currentY+=20;

    doc.setDrawColor(7, 93, 168); // Color azul (#075DA8)
    doc.setLineWidth(1); // Grosor de la línea
    doc.line(10, currentY, 200, currentY);
    currentY+=10;

    
    doc.setFontSize(15);
    doc.text("Terminos y condiciones", 14, currentY);
    currentY+=10;

    //Save the termitions and conditions 
    currentY=await save_termitions_and_conditions(doc, 14, currentY, 500);


    // download the file
    doc.save("ventas.pdf");
});


function save_data_of_export(doc,currentY){
    //add the information of the company 
    const expiration=document.getElementById('expiration').value;
    const quoteDate=document.getElementById('quote-date').value;

    currentY+=10;
    doc.text("Expiración: "+expiration, 100, currentY);
    doc.text("Fecha de Cotización: "+quoteDate, 150, currentY);

    return currentY+20;
}

function save_the_information_of_the_invoice(doc,currentY){
    //add the information of the company 
    const nameCompany=document.getElementById('name-branch-pdf').value;
    const emailCompany=document.getElementById('email-branch-pdf').value;

    doc.text(nameCompany, 100, currentY);
    doc.setFontSize(10);
    doc.text(emailCompany, 100, currentY+5);

    currentY += 15;
    const customer=document.getElementById('customer').value;
    doc.text(customer, 100, currentY);


    currentY += 10;
    const address=document.getElementById('address').value;
    doc.text('Dirección: '+address, 100, currentY);

    currentY += 8;
    const deliveryAddress=document.getElementById('delivery-address').value;
    doc.text('Dirección de Entrega: '+deliveryAddress, 100, currentY);

    return currentY;
}


async function save_termitions_and_conditions(doc, x, y, width) {
    doc.setFontSize(5);

    // get the container in HTML
    const content = quill.root.innerHTML;

    // create a container for show the HTML
    const canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${width}px`; // get the width of the container
    canvasContainer.innerHTML = content;

    document.body.appendChild(canvasContainer); // add to DOM for measure and render

    //Using jsPDF to render HTML content
    await doc.html(canvasContainer, {
        x: x,
        y: y,
        html2canvas: {
            scale: 0.25 //Adjust the scale if the content is too large
        },
        callback: function () {
            document.body.removeChild(canvasContainer); // delete the container temporary
        }
    });

    // return the new position in Y
    const textHeight = canvasContainer.offsetHeight;
    return y + textHeight+25;
}

function create_table_products(doc,currentY){
    // add a title
    doc.text("Lista de Pedidos", 14, currentY);
    currentY += 10;

    // data of the table
    const headers = [["Producto", "Descripción", "Cant.","UdM","Paquete","Precio Unitario","Impuestos","Descuento %","Subtotal"]];

    //get the table
    const table = document.getElementById("tabla-productos");
    const rows = table.querySelectorAll("tbody tr");
    const data = [];
    let firtsRow=true;

    //get all the data of the table
    rows.forEach((row) => {
        //we will see if is the first row. This is for not save a space empty
        if(firtsRow){
            firtsRow=false;
        }else{
            //get the cell
            const cell = row.querySelectorAll("td");
            const rowData = []; //this is for save the data of the row
      
            //we will read all the cell of the row
            cell.forEach((cell, index) => {
      
              // Exclude last column(index 9, "Buttons")
              if (index < 9) {
      
                  //we will get the select and checkbox
                  if(index==3 || index==4){
                      const select = cell.querySelector("select");
                      const checkbox = cell.querySelector("input[type='checkbox']");
      
                      if (select) {
                          rowData.push(select.value);
                      } 
                      else if (checkbox) {
                          rowData.push(checkbox.checked ? "✓" : "X");
                      }
                  }else{
                      //we will get all the inputs
                      const input = cell.querySelector("input").value;
                      rowData.push(input || "0");
                  }
              }
            });
            
            //save the data of the cell
            data.push(rowData);
        }
    });

    // add the table to PDF
    const tablePDF = doc.autoTable({
      head: headers,
      body: data,
      startY: currentY,
       bodyStyles: {
            halign: 'center'  // Center data cells
        }
    });



    const total=document.getElementById('total-general').value;
    const width=14;
    return tablePDF.lastAutoTable.finalY + 10;
}

function draw_the_total(doc,total,x,y){
    const fee=document.getElementById('fee').value;
    doc.setTextColor(7, 93, 168);
    doc.text('TOTAL GENERAL:', x, y);
    doc.setTextColor(0, 0, 0);
    doc.text('$'+total+' '+fee, x+38, y);

    return y+20;
}

function create_optional_products_table(doc,currentY){
    // add a title
    doc.text("Productos opcionales", 14, currentY);
    currentY += 10;

    // data of the table
    const headers = [["Producto", "Descripción", "Cant.","UdM","Paquete","Precio Unitario","Impuestos","Descuento %","Subtotal"]];

    //get the table
    const table = document.getElementById("tabla-productos");
    const rows = table.querySelectorAll("tbody tr");
    const data = [];
    let firtsRow=true;

    //get all the data of the table
    rows.forEach((row) => {
        //we will see if is the first row. This is for not save a space empty
        if(firtsRow){
            firtsRow=false;
        }else{
            //get the cell
            const cell = row.querySelectorAll("td");
            const rowData = []; //this is for save the data of the row
      
            //we will read all the cell of the row
            cell.forEach((cell, index) => {
      
              // Exclude last column(index 9, "Buttons")
              if (index < 9) {
      
                  //we will get the select and checkbox
                  if(index==3 || index==4){
                      const select = cell.querySelector("select");
                      const checkbox = cell.querySelector("input[type='checkbox']");
      
                      if (select) {
                          rowData.push(select.value);
                      } 
                      else if (checkbox) {
                          rowData.push(checkbox.checked ? "✓" : "X");
                      }
                  }else{
                      //we will get all the inputs
                      const input = cell.querySelector("input").value;
                      rowData.push(input || "0");
                  }
              }
            });
            
            //save the data of the cell
            data.push(rowData);
        }
    });

    // add the table to PDF
    const tablePDF = doc.autoTable({
      head: headers,
      body: data,
      startY: currentY,
    });

    return tablePDF.lastAutoTable.finalY + 10;
}

function urlToBase64(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function () {
            const uInt8Array = new Uint8Array(xhr.response);
            const binaryString = String.fromCharCode.apply(null, uInt8Array);
            const base64String = window.btoa(binaryString);
            console.log("Base64 de la imagen:", base64String);  // Verifica la conversión
            resolve(base64String);
        };

        xhr.onerror = function () {
            reject("Error al cargar la imagen.");
        };

        xhr.send();
    });
}

function add_image(doc, imageUrl, xPosition, yPosition, width, height) {
    doc.addImage(imageUrl, 'PNG', xPosition, yPosition, width, height);
    return yPosition+height+10;
}


function fileToBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);  // Leer el archivo como una URL de datos base64

    reader.onload = function () {
        callback(reader.result);  // Llamar a la función callback con la cadena base64
    };

    reader.onerror = function (error) {
        console.error('Error leyendo archivo:', error);
    };
}