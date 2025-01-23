document.addEventListener('DOMContentLoaded', () => {
        const addFieldForm = document.getElementById('addFieldForm');
        const editFieldForm = document.getElementById('editFieldForm');
        const configureSubmitForm = document.getElementById('configureSubmitForm');
        const fieldsContainer = document.getElementById('fieldsContainer');
        const formPreview = document.getElementById('formPreview').querySelector('form');
        const notificationElement = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        let fields = [];
        let editFieldIndex = null;

        // Inicializar Bootstrap Toast para notificaciones
        const toast = new bootstrap.Toast(notificationElement, { delay: 3000 });

        // Función para mostrar notificaciones
        function showNotification(message, type = 'success') {
            notificationMessage.textContent = message;
            // Cambiar el color del toast según el tipo
            if (type === 'success') {
                notificationElement.className = 'toast align-items-center text-bg-success border-0 position-fixed top-0 end-0 m-3';
            } else if (type === 'danger') {
                notificationElement.className = 'toast align-items-center text-bg-danger border-0 position-fixed top-0 end-0 m-3';
            } else {
                notificationElement.className = `toast align-items-center text-bg-${type} border-0 position-fixed top-0 end-0 m-3`;
            }
            toast.show();
        }
        
        // Función para renderizar los campos en el editor y la vista previa
        const renderFields = () => {
            fieldsContainer.innerHTML = '';
            formPreview.innerHTML = '';

            if (fields.length === 0) {
                fieldsContainer.innerHTML = '<p class="text-muted">No has agregado ningún campo.</p>';
                formPreview.innerHTML = '<p class="text-muted">Aún no has agregado campos al formulario.</p>';
                return;
            }

            fields.forEach((field, index) => {
                // Render en el Editor
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'form-field';
                fieldDiv.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${field.label}</strong> (${field.type})${field.required ? '<span class="required-asterisk">*</span>' : ''}
                            <p class="mb-0"><em>Placeholder:</em> "${field.placeholder}"${field.type === 'text' && field.maxlength ? `, <em>Máximo:</em> ${field.maxlength}` : ''}</p>
                            <p class="mb-0"><em>Obligatorio:</em> ${field.required ? 'Sí' : 'No'}</p>
                            <p class="mb-0"><em>Relacion con la base de datos: </em> ${field.relationToTheDatabase}</p>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-edit me-2 edit-btn" data-index="${index}" title="Editar Campo">✏️</button>
                            <button class="btn btn-sm btn-danger delete-btn" data-index="${index}" title="Eliminar Campo">🗑️</button>
                        </div>
                    </div>
                `;
                fieldsContainer.appendChild(fieldDiv);

                // Render en la Vista Previa
                const previewField = document.createElement('div');
                previewField.className = 'mb-3';
                const requiredAsterisk = field.required ? '<span class="required-asterisk">*</span>' : '';
                const requiredAttr = field.required ? 'required' : '';
                const maxlengthAttr = (field.type === 'text' && field.maxlength) ? `maxlength="${field.maxlength}"` : '';
                previewField.innerHTML = `
                    <label class="form-label">${field.label}${requiredAsterisk}</label>
                    <input type="${field.type}" class="form-control" placeholder="${field.placeholder}" ${maxlengthAttr} ${requiredAttr}>
                `;
                formPreview.appendChild(previewField);
            });

            // Añadir el botón de enviar al final del formulario
            const submitButtonElement = document.createElement('button');
            submitButtonElement.type = 'submit';
            submitButtonElement.className = 'btn';
            submitButtonElement.style.backgroundColor = submitButton.color;
            submitButtonElement.style.color = '#fff';
            submitButtonElement.innerHTML = submitButton.text;
            formPreview.appendChild(submitButtonElement);
        };
        
        // Manejar la adición de un nuevo campo
        addFieldForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const label = document.getElementById('fieldLabel').value.trim();
            const placeholder = document.getElementById('fieldPlaceholder').value.trim();
            const type = document.getElementById('fieldType').value;
            const maxlengthInput = document.getElementById('fieldMaxlength').value.trim();
            const maxlength = type === 'text' && maxlengthInput ? parseInt(maxlengthInput) : null;
            const required = document.getElementById('fieldRequired').checked;
            const relationToTheDatabase=document.getElementById('typeDataOfDatabaseAdd').value;
            if (label === '' || type === '') {
                showNotification('Por favor, completa todos los campos obligatorios.', 'danger');
                return;
            }

            fields.push({ label, placeholder, type, maxlength, required , relationToTheDatabase});
            addFieldForm.reset();
            document.getElementById('maxlengthContainer').classList.add('d-none');
            renderFields();
            const addFieldModal = bootstrap.Modal.getInstance(document.getElementById('addFieldModal'));
            addFieldModal.hide();
            showNotification('Campo agregado correctamente ❤️', 'success');
        });

        // Mostrar u ocultar el campo de maxlength basado en el tipo seleccionado (Agregar)
        document.getElementById('fieldType').addEventListener('change', (e) => {
            const selectedType = e.target.value;
            const maxlengthContainer = document.getElementById('maxlengthContainer');
            if (selectedType === 'text') {
                maxlengthContainer.classList.remove('d-none');
                document.getElementById('fieldMaxlength').required = false;
            } else {
                maxlengthContainer.classList.add('d-none');
                document.getElementById('fieldMaxlength').required = false;
            }
        });

        // Manejar la edición de un campo
        editFieldForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const label = document.getElementById('editFieldLabel').value.trim();
            const placeholder = document.getElementById('editFieldPlaceholder').value.trim();
            const type = document.getElementById('editFieldType').value;
            const maxlengthInput = document.getElementById('editFieldMaxlength').value.trim();
            const maxlength = type === 'text' && maxlengthInput ? parseInt(maxlengthInput) : null;
            const required = document.getElementById('editFieldRequired').checked;
            const relationToTheDatabase=document.getElementById('typeDataOfDatabaseEdit').value;

            if (label === '' || type === '') {
                showNotification('Por favor, completa todos los campos obligatorios.', 'danger');
                return;
            }

            fields[editFieldIndex] = { label, placeholder, type, maxlength, required, relationToTheDatabase };
            editFieldForm.reset();
            document.getElementById('editMaxlengthContainer').classList.add('d-none');
            renderFields();
            const editFieldModal = bootstrap.Modal.getInstance(document.getElementById('editFieldModal'));
            
            editFieldModal.hide();
            showNotification('Campo editado correctamente 😉', 'success');
        });

        // Mostrar u ocultar el campo de maxlength basado en el tipo seleccionado (Editar)
        document.getElementById('editFieldType').addEventListener('change', (e) => {
            const selectedType = e.target.value;
            const maxlengthContainer = document.getElementById('editMaxlengthContainer');
            if (selectedType === 'text') {
                maxlengthContainer.classList.remove('d-none');
                document.getElementById('editFieldMaxlength').required = false;
            } else {
                maxlengthContainer.classList.add('d-none');
                document.getElementById('editFieldMaxlength').required = false;
            }
        });

        // Delegar eventos para botones de editar y eliminar
        fieldsContainer.addEventListener('click', async (e) => {
            if (e.target.closest('.edit-btn')) {
                const index = e.target.closest('.edit-btn').getAttribute('data-index');
                editFieldIndex = index;
                const field = fields[index];
                document.getElementById('editFieldLabel').value = field.label;
                document.getElementById('editFieldPlaceholder').value = field.placeholder;
                document.getElementById('editFieldType').value = field.type;
                document.getElementById('editFieldRequired').checked = field.required;

                if (field.type === 'text' && field.maxlength) {
                    document.getElementById('editFieldMaxlength').value = field.maxlength;
                    document.getElementById('editMaxlengthContainer').classList.remove('d-none');
                } else {
                    document.getElementById('editFieldMaxlength').value = '';
                    document.getElementById('editMaxlengthContainer').classList.add('d-none');
                }

                document.getElementById('typeDataOfDatabaseEdit').value =field.relationToTheDatabase;


                const editFieldModal = new bootstrap.Modal(document.getElementById('editFieldModal'));
                editFieldModal.show();
            }

            if (e.target.closest('.delete-btn')) {
                const index = e.target.closest('.delete-btn').getAttribute('data-index');
                if (await questionMessage('⚠️ Eliminar campo ⚠️','¿Estás seguro de que deseas eliminar este campo?')) {
                    fields.splice(index, 1);
                    renderFields();
                    showNotification('Campo eliminado correctamente 😉', 'success');
                }
            }
        });

        // Configuración del Botón de Enviar
        let submitButton = {
            text: 'Enviar',
            color: '#0d6efd' // Color Bootstrap primary por defecto
        };

        // Manejar la configuración del botón de enviar
        configureSubmitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('submitButtonText').value.trim();
            const color = document.getElementById('submitButtonColor').value;

            if (text === '') {
                showNotification('Por favor, ingresa el texto del botón.', 'danger');
                return;
            }

            submitButton = { text, color };
            renderFields();
            configureSubmitForm.reset();
            const configureSubmitModal = bootstrap.Modal.getInstance(document.getElementById('configureSubmitModal'));
            configureSubmitModal.hide();
            showNotification('Botón editado correctamente 😉', 'success');
        });

        // Manejar el envío del formulario de vista previa (opcional)
        formPreview.addEventListener('submit', (e) => {
            e.preventDefault();
            // Aquí puedes agregar la lógica para manejar el envío del formulario
            showNotification('Formulario enviado correctamente.', 'success');
        });

        // Inicializar Vista Previa con Botón de Enviar por Defecto
        renderFields();
    });