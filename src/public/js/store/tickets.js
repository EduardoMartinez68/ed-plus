let lastTicket='';
const selectPrinter=document.getElementById('dataPrinter');
const apiRouther="http://127.0.0.1:5656/";

const get_all_my_printers=()=>{
    PrinterEscPos.getPrinters().then(response=>{
        if(response.status=='OK'){
            response.listPrinter.forEach(namePrinter=>{
                //we will create the option of the printer
                const option=document.createElement('option');
                option.value=option.text=namePrinter;

                //add the printer the select
                selectPrinter.appendChild(option);
            });
        }
    });

    console.log('printer get')
};


get_all_my_printers();

print_the_last_ticket = () => {
    try {
        var printer = new PrinterEscPos(apiRouther);
        printer.printerIn(lastTicket);
        regularMessage('Impresión con éxito 😁', 'El último ticket fue impreso con éxito.');
        console.log('Contenido del ticket:\n', lastTicket);
    } catch (error) {
        console.error('Error al imprimir el ticket:', error);
        notificationMessageError('👁️ Error al imprimir el Ticket', error);
    }
};



//get the information of the company and of the employee
//const urlIconCompany=document.getElementById('path-icon-company').value;
const companyName=document.getElementById('name-company').value;

const printTicket=(total, receivedMoney,exchange,comment)=>{
    try {
        
        const employeeName=document.getElementById('employee-name').textContent;
        const dateTicket=getCurrentDateTime();

        var printer = new PrinterEscPos(apiRouther);

        // Variable para almacenar todo el contenido del ticket
        let ticketContent = '';
    
        // Encabezado del ticket
        ticketContent += '---------- Ticket ----------\n';
        ticketContent += `${companyName}\n`;
        ticketContent += `Fecha: ${dateTicket}\n`;
        ticketContent += `Vendedor: ${employeeName}\n`;
        ticketContent += '----------------------------\n\n';
    
        printer.setText('---------- Ticket ----------\n');
        printer.setConfigure('center', 'b', true);
        printer.setText(`${companyName}\n`);
        printer.setText(`Fecha: ${dateTicket}\n`);
        printer.setText(`Vendedor: ${employeeName}\n`);
        printer.setText('----------------------------\n\n');
    
        // Agregar encabezados de la tabla
        ticketContent += 'Cant.   Producto           Precio    Subtotal\n';
        ticketContent += '---------------------------------------------\n';

        printer.setText('Cant.   Producto           Precio    Subtotal\n');
        printer.setText('---------------------------------------------\n');

        // Extraer datos de la tabla
        const bodyTable = tabla.getElementsByTagName("tbody")[0];
        const rows = bodyTable.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++) {
            const cols = rows[i].getElementsByTagName("td");
            const producto = cols[0].innerText; // Nombre del producto
            const cantidad = cols[2].innerText; // Cantidad
            const precio = cols[1].innerText; // Precio unitario
            const subtotal = cols[3].innerText; // Subtotal
    
            // Formatear las columnas para que queden alineadas
            const line = `${cantidad.padEnd(6)} ${producto.padEnd(18)} $${precio.padEnd(8)} $${subtotal}\n`;
            ticketContent += line;
    
            printer.setConfigure('left', 'a', false);
            printer.setText(line);
        }
    
        // Agregar total, dinero recibido y comentario
        ticketContent += '\n----------------------------\n';
        ticketContent += `Total: $${total}\n`;
        ticketContent += `Recibido: $${receivedMoney}\n`;
        ticketContent += `Cambio: $${(receivedMoney - total).toFixed(2)}\n`;
        if (comment) {
            ticketContent += `Comentario: ${comment}\n`;
        }
        ticketContent += '----------------------------\n';
        ticketContent += 'Gracias por su compra\n\n';
    
        printer.setText('\n----------------------------\n');
        printer.setText(`Total: $${total}\n`);
        printer.setText(`Recibido: $${receivedMoney}\n`);
        printer.setText(`Cambio: $${(receivedMoney - total).toFixed(2)}\n`);
        if (comment) {
            printer.setText(`Comentario: ${comment}\n`);
        }
        printer.setText('----------------------------\n');
        printer.setText('Gracias por su compra\n\n');
        
        lastTicket = ticketContent; //update the last ticket

        // Enviar a la impresora
        printer.printerIn(selectPrinter.value);
    
        // Imprimir el contenido del ticket en consola
        console.log('Contenido del ticket:\n', ticketContent);
    
        console.log('Ticket impreso correctamente.');
    } catch (error) {
        console.error('Error al imprimir el ticket:', error);
        notificationMessageError('👁️ Error al imprimir el Ticket', error);
    }
}


function getCurrentDateTime() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0'); // Día con dos dígitos
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes (0 indexado, por eso +1)
    const year = now.getFullYear(); // Año completo

    const hours = String(now.getHours()).padStart(2, '0'); // Horas con dos dígitos
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutos con dos dígitos
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Segundos con dos dígitos

    // Formatear en DD/MM/YYYY HH:mm:ss
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

