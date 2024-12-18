//*-------------------------------DASHBOARD-------------------------------*//
async function add_table_crm(id_company, id_branch) {
    var containerHtml = `
        <style>
            .save-button {
                background-color: rgb(25, 135, 84); /* Color de fondo */
                color: white; /* Color del texto */
                padding: 10px 20px; /* Espaciado interno */
                border: none; /* Sin borde */
                border-radius: 5px; /* Bordes redondeados */
                cursor: pointer; /* Cursor al pasar */
                transition: background-color 0.3s; /* Transición suave */
            }
            
            .save-button:hover {
                background-color: #45a049; /* Color de fondo al pasar */
            }
        </style>
        <form action="/fud/${id_company}/add-table-crm" method="post" enctype="multipart/form-data">
            <label for="table_name">Nombre de la tabla *</label>
            <input id="table_name" class="swal2-input" name="id_branch" type="hidden" value="${id_branch}" required>
            <input id="table_name" class="swal2-input" placeholder="Nombre de la tabla" name="table_name" type="text" required>
            <br><br>
            <button type="submit" class="save-button">Guardar</button>
        </form>
    `;

    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Agregar nueva tabla',
            html: containerHtml,
            focusConfirm: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: () => !Swal.isLoading()
        }).then(() => {
            resolve(['']);
        });
    });
}

async function edit_name_table_crm(oldName) {
    // Contenido HTML de la ventana modal
    var containerHtml = `
        <style>
            .save-button {
                background-color: rgb(25, 135, 84); /* Color de fondo */
                color: white; /* Color del texto */
                padding: 10px 20px; /* Espaciado interno */
                border: none; /* Sin borde */
                border-radius: 5px; /* Bordes redondeados */
                cursor: pointer; /* Cursor al pasar */
                transition: background-color 0.3s; /* Transición suave */
            }
            
            .save-button:hover {
                background-color: #45a049; /* Color de fondo al pasar */
            }
        </style>
        <h2>${oldName}</h2>
        <label for="table_name">Nuevo nombre de la tabla *</label>
        <input id="table_name" class="swal2-input" placeholder="Nuevo nombre de la tabla" name="table_name" type="text" required>
        <br><br>
        <button type="button" class="save-button" id="saveButton">Guardar</button>
    `;

    // Retornar una promesa para manejar la entrada del usuario
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Cambiar nombre de la tabla',
            html: containerHtml,
            focusConfirm: false,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: () => !Swal.isLoading(),
            didOpen: () => {
                const saveButton = document.getElementById('saveButton');
                saveButton.addEventListener('click', () => {
                    const tableName = document.getElementById('table_name').value;
                    if (tableName) {
                        resolve(tableName);
                        Swal.close();
                    } else {
                        Swal.showValidationMessage('Por favor, ingrese un nombre válido');
                    }
                });
            }
        });
    });
}

//*-------------------------------WHATSAPP-------------------------------*//
async function send_to_whatsApp(idProspect,nameCustomer, emailCustomer, phoneNumber) {
    // we will see if exist the phone is empty
    if (phoneNumber.trim() === '') {
        warningMessage('Error al enviar el mensaje 👁️', 'El contacto no tiene registrado ningún número de celular. Agrégale uno para proseguir.');
        return;
    }

    // Remove the "+" symbol if it exists in the phone number
    phoneNumber = phoneNumber.replace(/\+/g, '');
    
    // get the message of the user
    const message = await show_send_message_for_whatsapp(idProspect,nameCustomer, emailCustomer, phoneNumber);
}

async function show_send_message_for_whatsapp(idProspect,nameCustomer, emailCustomer, cellphone) {
    var containerHtml = `
        <style>
            .icon-container {
                text-align: center;
                margin-bottom: 15px;
            }

            .icon-container img {
                width: 50px; /* Tamaño del icono */
                height: 50px;
            }

            .send-button {
                background-color: #128C7E; /* Verde WhatsApp */
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s, transform 0.2s;
                font-size: 15px;
                margin-top: 15px;
                display: block;
                width: 100%;
            }

            .send-button:hover {
                background-color: #075E54;
                transform: scale(1.02); /* Efecto suave al pasar el ratón */
            }

            .swal2-input, .swal2-textarea {
                width: 100%;
                margin: 5px 0;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-sizing: border-box;
                font-size: 14px;
                resize: vertical; /* Permite al usuario cambiar el tamaño verticalmente */
            }

            .swal2-label {
                font-weight: bold;
                display: block;
                margin: 10px 0 5px;
            }

            .swal2-textarea {
                min-height: 100px;
                max-height: 300px;
                background-color: #f9f9f9;
                outline: none;
                transition: border-color 0.3s ease-in-out;
            }

            .swal2-textarea:focus {
                border-color: #128C7E; /* Verde WhatsApp para el borde enfocado */
                box-shadow: 0 0 5px rgba(18, 140, 126, 0.5);
            }

        </style>     
        <div class="icon-container">
            <img src="https://cdn-icons-png.flaticon.com/256/3799/3799943.png" alt="WhatsApp Icon">
        </div>

        <div class="row">
            <div class="col">
                <label class="swal2-label">Nombre del cliente:</label>
                <span>${nameCustomer}</span>        
            </div>
            <div class="col">
                <label class="swal2-label">Email del cliente:</label>
                <span>${emailCustomer}</span>
            </div>
        </div>
        <br>

        <form id="form-whatsapp">
            <label for="message" class="swal2-label">Mensaje para WhatsApp</label>
            <textarea id="message" class="swal2-textarea" placeholder="Escribe tu mensaje aquí..." rows="4" required name="comment"></textarea>
            
            <button type="button" class="send-button" onclick="sendToWhatsApp('${idProspect}','${cellphone}')">
                Enviar a WhatsApp
            </button>
        </form>
    `;

    return Swal.fire({
        title: 'Enviar WhatsApp a '+cellphone,
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        // Espera que el usuario envíe el mensaje
        return new Promise((resolve) => {
            document.querySelector('.send-button').addEventListener('click', () => {
                const message = document.getElementById('message').value;
                resolve(message);
            });
        });
    });
}

async function sendToWhatsApp(idProspect,phoneNumber) {
    phoneNumber = phoneNumber.replace(/\D/g, ''); // Solo números

    // we will see if exist the phone is empty
    if (phoneNumber.trim() === '') {
        warningMessage('Error al enviar el mensaje 👁️', 'El contacto no tiene registrado ningún número de celular. Agrégale uno para proseguir.');
        return;
    }

    // Remove the "+" symbol if it exists in the phone number
    phoneNumber = phoneNumber.replace(/\+/g, '');

    // get the message of the user
    const message = document.getElementById('message').value; 
    document.getElementById('message').value='Se envio un mensaje de whatsapp: \n'+message; //this is for update the input of the form of whatsapp
    const mesageHistory=document.getElementById('message').value; //this is for save the new message update in the form

    // Envía el mensaje si no está vacío
    if (message.trim() !== '') {
        //this is for open other window in the search for send the message to whatsapp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        //her we save the information for create a history message
        const messageHistory='Se envio un mensaje de whatsapp: \n'+message;
        await send_data_to_the_server_for_create_an_note_of_whatsapp(0,0,idProspect,mesageHistory,'');
    } else {
        Swal.fire('Por favor, escribe un mensaje antes de enviar.');
    }
}

async function send_data_to_the_server_for_create_an_note_of_whatsapp(id_company,id_branch,id_prospect,message,linkForm){
    //we will see if exist the form for send the data to the server
    const form=document.getElementById('form-whatsapp');
    if (!form) {
        notificationMessageError('Error','Formulario no encontrado 😵');
        return;
    }


    const link=`/fud/${id_company}/${id_branch}/${id_prospect}/create-message-history`;
    const linkData={
        id_company,
        id_branch,
        id_form: id_prospect
    }
    
    //we will see if can create the new appoint
    if(await send_data_to_the_server_use_message_flask(link,form,linkData)){
        //if we will can add the new appoint, show the new history message
        add_new_message_history(message,linkForm);
    }
}

//*-------------------------------APPOINTMENT FORM-------------------------------*//
//this is for save appointment  create_an_appointment
async function show_appointment(idCompany,idBranch,idProspects,idEmployee){
    var containerHtml = `
    <style>
        .swal2-textarea {
            min-height: 100px;
            max-height: 300px;
            background-color: #f9f9f9;
            outline: none;
            transition: border-color 0.3s ease-in-out;
        }
    </style>

    <form action="/fud/${idCompany}/${idBranch}/${idProspects}/create-appointment" method="post">
        <input type="hidden" required readonly name="idEmployee" value="${idEmployee}">
        <div class="row">
            <div class="col-3">
                <div class="form-group">
                    <label for="meeting_date">Etiqueta</label>
                    <input type="color" class="form-control" name="color" required value="#007bff">
                </div>
            </div>
            <div class="col">
            </div>
        </div>
        <div class="form-group">
            <label for="affair">Asunto</label>
            <input type="text" class="form-control" id="affair" placeholder="Introduce el asunto" required name="affair">
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Fecha y Hora Inicial</label>
                    <input type="datetime-local" class="form-control" id="meeting_date" name="date" placeholder="Selecciona la fecha y hora" required>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="duration">Fecha y Hora Final</label>
                    <input type="datetime-local" class="form-control" id="duration" name="duration" placeholder="Selecciona la fecha y hora" required>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="location">Ubicación</label>
            <input type="text" class="form-control" id="location" name="ubication" placeholder="Introduce la ubicación">
        </div>
        <div class="form-group">
            <label for="grades">Notas</label>
            <textarea class="form-control" id="grades" rows="3" name="notes" placeholder="Notas adicionales"></textarea>
        </div>
        <button type="submit" class="btn btn-success">Guardar Cita 💾</button>
    </form>
    `;

    return Swal.fire({
        title: 'Reservar una cita 📅',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        // Espera que el usuario envíe el mensaje
        return new Promise((resolve) => {
            document.querySelector('.send-button').addEventListener('click', () => {
                const message = document.getElementById('message').value;
                resolve(message);
            });
        });
    });
}

async function show_edit_appointment(idCompany,idBranch,idProspects,idAppointment,idEmployees,prospectName,prospectEmail,affair,color,dateStart,dateEnd,ubication,notes){
    var containerHtml = `
    <style>
        .swal2-textarea {
            min-height: 100px;
            max-height: 300px;
            background-color: #f9f9f9;
            outline: none;
            transition: border-color 0.3s ease-in-out;
        }
    </style>

    <form action="/fud/${idCompany}/${idBranch}/${idProspects}/${idAppointment}/edit-appointment" method="post">
        <input type="hidden" required readonly name="idEmployee" value="${idEmployees}">
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Nombre:<br> ${prospectName}</label>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Email:<br> ${prospectEmail}</label>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-3">
                <div class="form-group">
                    <label for="meeting_date">Etiqueta</label>
                    <input type="color" class="form-control" name="color" required value="${color}">
                </div>
            </div>
            <div class="col">
            </div>
        </div>
        <div class="form-group">
            <label for="affair">Asunto</label>
            <input type="text" class="form-control" id="affair" placeholder="Introduce el asunto" required name="affair" value="${affair}">
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Fecha y Hora Inicial</label>
                    <input type="datetime-local" class="form-control" id="meeting_date" name="date" placeholder="Selecciona la fecha y hora" required value="${dateStart}">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="duration">Fecha y Hora Final</label>
                    <input type="datetime-local" class="form-control" id="duration" name="duration" placeholder="Selecciona la fecha y hora" required value="${dateEnd}">
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="location">Ubicación</label>
            <input type="text" class="form-control" id="location" name="ubication" placeholder="Introduce la ubicación" value="${ubication}">
        </div>
        <div class="form-group">
            <label for="grades">Notas</label>
            <textarea class="form-control" id="grades" rows="3" name="notes" placeholder="Notas adicionales">${notes}</textarea>
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <button type="submit" class="btn btn-success">Actualizar Cita 💾</button>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <button type="submit" class="btn btn-danger" onclick="delete_appointment(${idCompany},${idBranch},${idAppointment})">Eliminar Cita 🗑️</button>
                </div>
            </div>
        </div>
    </form>
    `;

    return Swal.fire({
        title: 'Editar esta cita 📅',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        // Espera que el usuario envíe el mensaje
        return new Promise((resolve) => {
            document.querySelector('.send-button').addEventListener('click', () => {
                const message = document.getElementById('message').value;
                resolve(message);
            });
        });
    });
}

async function show_edit_appointment_crm(idCompany,idBranch,idProspects,idAppointment,idEmployees,prospectName,prospectEmail,affair,color,dateStart,dateEnd,ubication,notes){
    var containerHtml = `
    <style>
        .swal2-textarea {
            min-height: 100px;
            max-height: 300px;
            background-color: #f9f9f9;
            outline: none;
            transition: border-color 0.3s ease-in-out;
        }
    </style>

    <form action="/fud/${idCompany}/${idBranch}/${idProspects}/${idAppointment}/edit-appointment-crm" method="post">
        <input type="hidden" required readonly name="idEmployee" value="${idEmployees}">
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Nombre:<br> ${prospectName}</label>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Email:<br> ${prospectEmail}</label>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-3">
                <div class="form-group">
                    <label for="meeting_date">Etiqueta</label>
                    <input type="color" class="form-control" name="color" required value="${color}">
                </div>
            </div>
            <div class="col">
            </div>
        </div>
        <div class="form-group">
            <label for="affair">Asunto</label>
            <input type="text" class="form-control" id="affair" placeholder="Introduce el asunto" required name="affair" value="${affair}">
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Fecha y Hora Inicial</label>
                    <input type="datetime-local" class="form-control" id="meeting_date" name="date" placeholder="Selecciona la fecha y hora" required value="${dateStart}">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="duration">Fecha y Hora Final</label>
                    <input type="datetime-local" class="form-control" id="duration" name="duration" placeholder="Selecciona la fecha y hora" required value="${dateEnd}">
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="location">Ubicación</label>
            <input type="text" class="form-control" id="location" name="ubication" placeholder="Introduce la ubicación" value="${ubication}">
        </div>
        <div class="form-group">
            <label for="grades">Notas</label>
            <textarea class="form-control" id="grades" rows="3" name="notes" placeholder="Notas adicionales">${notes}</textarea>
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <button type="submit" class="btn btn-success">Actualizar Cita 💾</button>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <button type="submit" class="btn btn-danger" onclick="delete_appointment(${idCompany},${idBranch},${idAppointment})">Eliminar Cita 🗑️</button>
                </div>
            </div>
        </div>
    </form>
    `;

    return Swal.fire({
        title: 'Editar esta cita 📅',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        // Espera que el usuario envíe el mensaje
        return new Promise((resolve) => {
            document.querySelector('.send-button').addEventListener('click', () => {
                const message = document.getElementById('message').value;
                resolve(message);
            });
        });
    });
}

async function delete_appointment(id_company,id_branch,id_appointment){
    if(await questionMessage('😰 Eliminar cita','¿Deseas eliminar esta reunión con este cliente?')){
        const thisIsCRM=document.getElementById('thisIsTheCrm')
        if(thisIsCRM){
            window.location.href = `/links/${id_company}/${id_branch}/${id_appointment}/delete-appointment-crm`;
        }else{
            window.location.href = `/links/${id_company}/${id_branch}/${id_appointment}/delete-appointment`;
        }
    }
}


//*-------------------------------APPOINTMENT FLASK-------------------------------*//
//this is for create a appoint when the user is edit a customer. 
// This send the form data to the server for that the user not waste time updating the page
async function create_an_appointment(idCompany,idBranch,idProspects,idEmployee){
    var containerHtml = `
    <style>
        .swal2-textarea {
            min-height: 100px;
            max-height: 300px;
            background-color: #f9f9f9;
            outline: none;
            transition: border-color 0.3s ease-in-out;
        }
    </style>

    <form method="post" id="form-appoint">
        <input type="hidden" required readonly name="idEmployee" value="${idEmployee}">
        <div class="row">
            <div class="col-3">
                <div class="form-group">
                    <label for="meeting_date">Etiqueta</label>
                    <input type="color" class="form-control" name="color" required value="#007bff">
                </div>
            </div>
            <div class="col">
            </div>
        </div>
        <div class="form-group">
            <label for="affair">Asunto</label>
            <input type="text" class="form-control" id="affair" placeholder="Introduce el asunto" required name="affair">
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="meeting_date">Fecha y Hora Inicial</label>
                    <input type="datetime-local" class="form-control" id="meeting_date" name="date" placeholder="Selecciona la fecha y hora" required>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="duration">Fecha y Hora Final</label>
                    <input type="datetime-local" class="form-control" id="duration" name="duration" placeholder="Selecciona la fecha y hora" required>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="location">Ubicación</label>
            <input type="text" class="form-control" id="location" name="ubication" placeholder="Introduce la ubicación">
        </div>
        <div class="form-group">
            <label for="grades">Notas</label>
            <textarea class="form-control" id="grades" rows="3" name="notes" placeholder="Notas adicionales"></textarea>
        </div>
        <button type="button" class="btn btn-success" onclick="send_data_to_the_server_for_create_an_appoint(${idCompany},${idBranch},${idProspects})">Guardar Cita 💾</button>
    </form>
    `;

    return Swal.fire({
        title: 'Reservar una cita 📅',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading()
    }).then(() => {
        // Aquí puedes configurar un evento al mostrar el modal
        document.getElementById('btn-save-appointment').addEventListener('click', async () => {
            await send_data_to_the_server_for_create_an_appoint(idCompany, idBranch, idProspects);
        });
    });
}

async function send_data_to_the_server_for_create_an_appoint(id_company,id_branch,id_prospect){
    //we will see if exist the form for send the data to the server
    const form=document.getElementById('form-appoint');
    if (!form) {
        notificationMessageError('Error','Formulario no encontrado 😵');
        return;
    }


    const link=`/fud/${id_company}/${id_branch}/${id_prospect}/create-appointment-server`;
    const linkData={
        id_company,
        id_branch,
        id_form: id_prospect
    }

    //we will see if can create the new appoint
    if(await send_data_to_the_server_use_message_flask(link,form,linkData)){
        //if we will can add the new appoint, show the new history message
        add_new_message_history('Se creó una cita con el cliente','');
    }
}



//*-------------------------------MESSAGE HISTORY-------------------------------*//
function add_new_message_history(message,link){
    //get the data of add the information of the new message history
    const container=document.getElementById('container-history');

    //her we will see if exist the container-history. If not exist, we know that the user is in the dashboard CRM
    if(!container){
        return;
    }

    //if we are not in the dashboard CRM, It means we are in the editing interface and get the data of the form for add a message history
    const userName=document.getElementById('user-name-id').value;
    const userPhoto=document.getElementById('user-photo-id').value;

    // Create the new HTML element for the message
    const messageHistory = document.createElement('div');
    messageHistory.className = 'message-history';

    //Generate content dynamically based on the `newMessage` object
    messageHistory.innerHTML = `
        <div class="row">
            <div class="col-2">
                <img src="${userPhoto || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'}"
                    class="img-history-sales">
            </div>
            <div class="col">
                <label class="title-history">${userName}</label>
                <label for="">-Ahora mismo</label>
                <a href="${link || '#'}">${link || ''}</a>
                <div class="container-message-history">
                    ${message}
                </div>
            </div>
        </div>
    `;

    // add the new message to the principle of the container
    container.insertBefore(messageHistory, container.firstChild);
}

async function send_data_to_the_server_use_message_flask(link,form,linkData){
    //on the loading tab for that the user not can edit the form
    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "flex"; // Show loading overlay

    const formData=serializeForm(form); //get the new form updated

    //we will see if can edit the form in the server or exist a error
    try {
        //make the solicitude for send the data to the server
        const response = await fetch(link, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({formData, linkData}), // send the data how JSON
        });

        //we will see if the answer of the server was success
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        //we will show the anser of the server
        const data = await response.json();
        notificationMessage('Notificación',data.message);

        return true;
    } catch (error) {
        //show the error that the server send
        notificationMessageError('Error',error);
        console.error('Error al enviar formulario:', error);
    }finally{
        loadingOverlay.style.display = "none"; // hidden loading overlay
    }

    return false;
}


//create note message
async function create_new_note(idCompany,idBranch,idProspects,idEmployee){
    var containerHtml = `
    <style>
        .swal2-textarea {
            min-height: 100px;
            max-height: 300px;
            background-color: #f9f9f9;
            outline: none;
            transition: border-color 0.3s ease-in-out;
        }
    </style>

    <form action="/fud/${idCompany}/${idBranch}/${idProspects}/create-message-history" method="post" id="form-message-history">
        <input type="hidden" required readonly name="idEmployee" value="${idEmployee}">
        <div class="form-group">
            <label for="grades">Notas</label>
            <textarea class="form-control" rows="3" name="comment" placeholder="Notas adicionales" id="notes-message-history"></textarea>
        </div>
        <div class="form-group">
            <label for="affair">Link</label>
            <input type="text" class="form-control" id="link-message-history" placeholder="Introduce un enlace" name="link">
        </div>
        <br>
        <button type="button" class="btn btn-success" onclick="send_data_to_the_server_for_create_an_note(${idCompany},${idBranch},${idProspects})">Guardar Nota 💾</button>
    </form>
    `;

    return Swal.fire({
        title: 'Crear un Nota 📝',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {

    });
}

async function send_data_to_the_server_for_create_an_note(id_company,id_branch,id_prospect){
    //we will see if exist the form for send the data to the server
    const form=document.getElementById('form-message-history');
    if (!form) {
        notificationMessageError('Error','Formulario no encontrado 😵');
        return;
    }


    const link=`/fud/${id_company}/${id_branch}/${id_prospect}/create-message-history`;
    const linkData={
        id_company,
        id_branch,
        id_form: id_prospect
    }

    //get the information that the user would like add
    const message=document.getElementById('notes-message-history').value;
    const linkForm=document.getElementById('link-message-history').value;
    
    //we will see if can create the new appoint
    if(await send_data_to_the_server_use_message_flask(link,form,linkData)){
        //if we will can add the new appoint, show the new history message
        add_new_message_history(message,linkForm);
    }
}


//*-------------------------------EMAILS-------------------------------*//
async function show_message_email(idProspect,email,customerName) {
    const containerHtml = `
        <style>
            .swal2-popup {
                width: 80% !important; /* Ajusta el ancho, puedes usar 90% o lo que prefieras */
                max-width: none !important; /* Evita límites predeterminados */
                height: auto !important; /* Permite que el contenido ajuste la altura */
                max-height: 90vh; /* Asegura que no exceda el 90% del alto de la ventana */
                padding: 20px !important; /* Agrega espacio interno adicional si es necesario */
            }

            .swal2-html-container {
                max-height: 80vh; /* Ajusta el área de contenido interno */
                overflow-y: auto; /* Habilita el scroll si el contenido excede el tamaño */
            }
                
            .swal2-container {
                font-family: Arial, sans-serif;
            }
            .email-container {
                display: flex;
                gap: 20px;
            }
            .preview {
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
                padding: 15px;
                overflow-y: auto;
                max-height: 400px;
            }
            .preview h4 {
                font-size: 18px;
                color: #333;
                margin-bottom: 10px;
            }
            .form {
                width:100%;
            }

            .form-group {
                margin-bottom: 15px;
            }
            .email-flask-input, .email-flask-select {
                border-radius: 5px;
                border: 1px solid #ced4da;
                padding: 8px;
                width: 100%;
                font-size: 14px;
            }
            .email-flask-input:focus, .email-flask-select:focus {
                border-color: #80bdff;
                outline: none;
                box-shadow: 0 0 5px rgba(128, 189, 255, 0.5);
            }
            .email-flask-btn {
                display: inline-block;
                background-color: #007bff;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            .email-flask-btn:hover {
                background-color: #0056b3;
            }
            .template-preview {
                background-color: #fff;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }

            #templatePreview {
                max-height: 300px; /* Ajusta esta altura según tus necesidades */
                overflow-y: auto; /* Habilita el scroll vertical si el contenido excede la altura */
                padding: 10px; /* Opcional: agrega un poco de espacio interno */
                border: 1px solid #ddd; /* Opcional: agrega un borde para delimitar la sección */
                background-color: #f9f9f9; /* Opcional: color de fondo */
                border-radius: 5px; /* Opcional: esquinas redondeadas */
            }
        </style>

        <div class="email-container">


            <!-- Formulario -->
            <div class="form">
                <form id="emailForm">

                    <div class="row">
                        <div class="col-1">
                            <label for="email">Para: </label>
                        </div>
                        <div class="col">
                            <input type="email" class="email-flask-input" id="email" name="email" placeholder="Introduce el email del cliente" required value="${email}">
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="col-1">
                            <label for="email">Asunto: </label>
                        </div>
                        <div class="col">
                            <input type="text" class="email-flask-input" id="subject" name="subject" placeholder="Introduce el asunto" required autofocus>
                        </div>
                    </div>
                    <br>

                    <div class="row">
                        <div class="col-1">
                            <label for="template">Selecciona una plantilla</label>
                        </div>
                        <div class="col-3">
                            <select class="email-flask-select" id="template" name="template">
                                <option value="" disabled selected>Elige una plantilla</option>
                                <option value="template1">Plantilla 1: Bienvenida</option>
                                <option value="template2">Plantilla 2: Promoción</option>
                                <option value="template3">Plantilla 3: Seguimiento</option>
                            </select>
                        </div>

                        <div class="col-1">
                            <label for="">Subir plantilla personalizada: </label>
                        </div>
                        <div class="col-3">
                            <input type="file" class="email-flask-input" id="customTemplate" name="customTemplate" accept=".html">
                        </div>
                    </div>
                    <br>

                    <!-- Previsualización -->
                    <div class="preview" id="emailPreview">
                        <h4>Previsualización del Email</h4>
                        <div id="templatePreview" class="template-preview">
                            Selecciona una plantilla para ver la previsualización aquí.
                        </div>
                    </div>
                    <br>

                    <button type="submit" class="email-flask-btn">Enviar</button>
                </form>
            </div>
        </div>
    `;

    Swal.fire({
        title: 'Enviar un email 📧',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading(),
        didRender: () => {
            const templatePreview = document.getElementById('templatePreview');
            const customTemplateInput = document.getElementById('customTemplate');

            // Plantillas HTML prediseñadas
            const templates = {
                template1: `<h2 style="color: #007bff;">Bienvenido/a</h2><p>¡Gracias por unirte a nuestra comunidad! Estamos emocionados de tenerte aquí.</p>`,
                template2: `<h2 style="color: #28a745;">Promoción Especial</h2><p>¡Aprovecha nuestra promoción especial del 20% de descuento por tiempo limitado!</p>`,
                template3: `<h2 style="color: #ffc107;">Seguimiento</h2><p>Hola, solo queremos recordarte que estamos aquí para ayudarte en lo que necesites.</p>`,
            };

            // Actualizar previsualización al seleccionar plantilla
            document.getElementById('template').addEventListener('change', (event) => {
                const selectedTemplate = event.target.value;
                templatePreview.innerHTML = templates[selectedTemplate] || 'Selecciona una plantilla para ver la previsualización aquí.';
            });


            // Manejar subida de plantilla personalizada
            customTemplateInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const customTemplate = e.target.result;
                        templatePreview.innerHTML = customTemplate;
                    };
                    reader.readAsText(file);
                }
            });

            // Manejar el envío del formulario
            document.getElementById('emailForm').addEventListener('submit', (event) => {
                event.preventDefault();

                const email = document.getElementById('email').value;
                const subject = document.getElementById('subject').value;
                const selectedTemplate = document.getElementById('template').value;
                const message = document.getElementById('message').value;
                const customTemplate = templatePreview.innerHTML;

                const finalEmailContent = `
                    <div>${customTemplate}</div>
                    <div>${message}</div>
                `;

                // Simular envío del email
                console.log('Para:', email);
                console.log('Asunto:', subject);
                console.log('Contenido del Email:', finalEmailContent);

                Swal.fire('Éxito', 'El email ha sido enviado correctamente.', 'success');
            });
        }
    });
}


async function show_message_email2() {
    const containerHtml = `
        <style>
            .swal2-popup {
                width: 80% !important; /* Ajusta el ancho, puedes usar 90% o lo que prefieras */
                max-width: none !important; /* Evita límites predeterminados */
                height: auto !important; /* Permite que el contenido ajuste la altura */
                max-height: 90vh; /* Asegura que no exceda el 90% del alto de la ventana */
                padding: 20px !important; /* Agrega espacio interno adicional si es necesario */
            }

            .swal2-html-container {
                max-height: 80vh; /* Ajusta el área de contenido interno */
                overflow-y: auto; /* Habilita el scroll si el contenido excede el tamaño */
            }
                
            .swal2-container {
                font-family: Arial, sans-serif;
            }
            .email-container {
                display: flex;
                gap: 20px;
            }
            .preview {
                width: 50%;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
                padding: 15px;
                overflow-y: auto;
                max-height: 400px;
            }
            .preview h4 {
                font-size: 18px;
                color: #333;
                margin-bottom: 10px;
            }
            .form {
                width: 50%;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .email-flask-input, .email-flask-select {
                border-radius: 5px;
                border: 1px solid #ced4da;
                padding: 8px;
                width: 100%;
                font-size: 14px;
            }
            .email-flask-input:focus, .email-flask-select:focus {
                border-color: #80bdff;
                outline: none;
                box-shadow: 0 0 5px rgba(128, 189, 255, 0.5);
            }
            .email-flask-btn {
                display: inline-block;
                background-color: #007bff;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            .email-flask-btn:hover {
                background-color: #0056b3;
            }
            .template-preview {
                background-color: #fff;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
        </style>

        <div class="email-container">
            <!-- Previsualización -->
            <div class="preview" id="emailPreview">
                <h4>Previsualización del Email</h4>
                <div id="templatePreview" class="template-preview">
                    Selecciona una plantilla para ver la previsualización aquí.
                </div>
                <div id="additionalMessagePreview" style="margin-top: 15px; color: #666;">
                    <!-- Mensaje adicional -->
                </div>
            </div>

            <!-- Formulario -->
            <div class="form">
                <form id="emailForm">
                    <div class="form-group">
                        <label for="email">Para (Email del cliente)</label>
                        <input type="email" class="email-flask-input" id="email" name="email" placeholder="Introduce el email del cliente" required>
                    </div>
                    <div class="form-group">
                        <label for="subject">Asunto</label>
                        <input type="text" class="email-flask-input" id="subject" name="subject" placeholder="Introduce el asunto" required>
                    </div>
                    <div class="form-group">
                        <label for="template">Selecciona una plantilla</label>
                        <select class="email-flask-select" id="template" name="template">
                            <option value="" disabled selected>Elige una plantilla</option>
                            <option value="template1">Plantilla 1: Bienvenida</option>
                            <option value="template2">Plantilla 2: Promoción</option>
                            <option value="template3">Plantilla 3: Seguimiento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Mensaje adicional</label>
                        <textarea class="email-flask-input" id="message" name="message" rows="3" placeholder="Escribe un mensaje adicional..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="customTemplate">Subir plantilla personalizada</label>
                        <input type="file" class="email-flask-input" id="customTemplate" name="customTemplate" accept=".html">
                    </div>
                    <button type="submit" class="email-flask-btn">Enviar Email 📧</button>
                </form>
            </div>
        </div>
    `;

    Swal.fire({
        title: 'Enviar un email 📧',
        html: containerHtml,
        focusConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: () => !Swal.isLoading(),
        didRender: () => {
            const templatePreview = document.getElementById('templatePreview');
            const additionalMessagePreview = document.getElementById('additionalMessagePreview');
            const messageInput = document.getElementById('message');
            const customTemplateInput = document.getElementById('customTemplate');

            // Plantillas HTML prediseñadas
            const templates = {
                template1: `<h2 style="color: #007bff;">Bienvenido/a</h2><p>¡Gracias por unirte a nuestra comunidad! Estamos emocionados de tenerte aquí.</p>`,
                template2: `<h2 style="color: #28a745;">Promoción Especial</h2><p>¡Aprovecha nuestra promoción especial del 20% de descuento por tiempo limitado!</p>`,
                template3: `<h2 style="color: #ffc107;">Seguimiento</h2><p>Hola, solo queremos recordarte que estamos aquí para ayudarte en lo que necesites.</p>`,
            };

            // Actualizar previsualización al seleccionar plantilla
            document.getElementById('template').addEventListener('change', (event) => {
                const selectedTemplate = event.target.value;
                templatePreview.innerHTML = templates[selectedTemplate] || 'Selecciona una plantilla para ver la previsualización aquí.';
            });

            // Actualizar previsualización del mensaje adicional
            messageInput.addEventListener('input', () => {
                additionalMessagePreview.textContent = messageInput.value.trim();
            });

            // Manejar subida de plantilla personalizada
            customTemplateInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const customTemplate = e.target.result;
                        templatePreview.innerHTML = customTemplate;
                    };
                    reader.readAsText(file);
                }
            });

            // Manejar el envío del formulario
            document.getElementById('emailForm').addEventListener('submit', (event) => {
                event.preventDefault();

                const email = document.getElementById('email').value;
                const subject = document.getElementById('subject').value;
                const selectedTemplate = document.getElementById('template').value;
                const message = document.getElementById('message').value;
                const customTemplate = templatePreview.innerHTML;

                const finalEmailContent = `
                    <div>${customTemplate}</div>
                    <div>${message}</div>
                `;

                // Simular envío del email
                console.log('Para:', email);
                console.log('Asunto:', subject);
                console.log('Contenido del Email:', finalEmailContent);

                Swal.fire('Éxito', 'El email ha sido enviado correctamente.', 'success');
            });
        }
    });
}
