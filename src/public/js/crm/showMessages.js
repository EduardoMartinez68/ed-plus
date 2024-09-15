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

async function show_send_message_for_whatsapp(nameCustomer, emailCustomer, cellphone) {
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

        <label for="message" class="swal2-label">Mensaje para WhatsApp</label>
        <textarea id="message" class="swal2-textarea" placeholder="Escribe tu mensaje aquí..." rows="4" required></textarea>
        
        <button type="button" class="send-button" onclick="sendToWhatsApp('${cellphone}')">
            Enviar a WhatsApp
        </button>
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

async function send_to_whatsApp(nameCustomer, emailCustomer, phoneNumber) {
    // Verifica si el número de teléfono está vacío
    if (phoneNumber.trim() === '') {
        warningMessage('Error al enviar el mensaje 👁️', 'El contacto no tiene registrado ningún número de celular. Agrégale uno para proseguir.');
        return;
    }

    // Elimina el símbolo "+" si existe en el número de teléfono
    phoneNumber = phoneNumber.replace(/\+/g, '');

    // Obtiene el mensaje del usuario
    const message = await show_send_message_for_whatsapp(nameCustomer, emailCustomer, phoneNumber);

    // Envía el mensaje si no está vacío
    if (message.trim() !== '') {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    } else {
        Swal.fire('Por favor, escribe un mensaje antes de enviar.');
    }
}

async function sendToWhatsApp(phoneNumber) {
    // Verifica si el número de teléfono está vacío
    if (phoneNumber.trim() === '') {
        warningMessage('Error al enviar el mensaje 👁️', 'El contacto no tiene registrado ningún número de celular. Agrégale uno para proseguir.');
        return;
    }


    // Elimina el símbolo "+" si existe en el número de teléfono
    phoneNumber = phoneNumber.replace(/\+/g, '');

    // Elimina los espacios en blanco del número de teléfono
    phoneNumber = phoneNumber.replace(/\s+/g, '');

    // Obtiene el mensaje del usuario
    const message = document.getElementById('message').value;

    // Envía el mensaje si no está vacío
    if (message.trim() !== '') {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    } else {
        Swal.fire('Por favor, escribe un mensaje antes de enviar.');
    }
}

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
        <button type="submit" class="btn btn-success">Actualizar Cita 💾</button>
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