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
        <form action="/fud/${id_company}/${id_branch}/add-table-crm" method="post" enctype="multipart/form-data">
            <label for="table_name">Nombre de la tabla *</label>
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
            showConfirmButton:false,
            showCancelButton: false,
            allowOutsideClick: () => !Swal.isLoading()
        }).then(() => {
            resolve(['']);
        });
    });
}
