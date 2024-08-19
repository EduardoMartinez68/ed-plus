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
