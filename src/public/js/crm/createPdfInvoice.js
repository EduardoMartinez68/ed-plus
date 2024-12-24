document.getElementById('create-pdf').addEventListener('click', () => {
    // import jsPDF
    const { jsPDF } = window.jspdf;

    // create a instance of jsPDF
    const doc = new jsPDF();
    let currentY = 10; //this is for save the current position of the cursor of the PDF
    add_image(doc,'http://localhost:4000/img/logo.png',10,currentY,100,100);

    currentY=80;
    currentY=create_table_products(doc,currentY);
    currentY=create_table_products(doc,currentY);

    // download the file
    doc.save("ventas.pdf");
});


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

    return tablePDF.lastAutoTable.finalY + 10;
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
            const i = uInt8Array.length;
            const binaryString = String.fromCharCode.apply(null, uInt8Array);
            const base64String = window.btoa(binaryString);
            resolve(base64String);
        };

        xhr.onerror = function () {
            reject("Error al cargar la imagen.");
        };

        xhr.send();
    });
}

function add_image(doc, imageUrl, xPosition, yPosition, width, height) {
    urlToBase64(imageUrl).then(base64Image => {
        // Usamos 'PNG' si la imagen es PNG. Si es JPEG, usa 'JPEG'.
        doc.addImage(base64Image, 'PNG', xPosition, yPosition, width, height);
        console.log('IMAGEN CARGADA Y AGREGADA AL PDF');
    }).catch(error => {
        console.error("Error al convertir la imagen:", error);
    });
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