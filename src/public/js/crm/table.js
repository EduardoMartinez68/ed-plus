//*----------------------------OPTIONS----------------------------------*/
/*
    This function is for modify the table of the CRM. Example add a prospect, 
    edit a prospect, delete row , edit row or delete a row
*/
//const loadingScreen=document.getElementById('loading-screen');
const loadingScreen = document.getElementById('loadingOverlay');

async function delete_prospect(id_company, id_prospect) {
    if (await questionMessage('Eliminar oportunidad 😱', `¿Deseas eliminar esta oportunidad?`)) {
        const id_branch = document.getElementById('id_branch').value;

        //we will see if the user would like delete the stage
        if (id_branch) {
            window.location.href = `/links/${id_company}/${id_branch}/${id_prospect}/delete-prospect`;
        } else {
            window.location.href = `/links/${id_company}/${id}/delete-prospect`;
        }
    }
}

async function edit_name(id) {
    const nameH = document.getElementById('h4-name-' + id); //get the h4 of the column
    const newName = await edit_name_table_crm(nameH.textContent);

    //we will see if the new name no is null
    if (newName) {
        const columnId = document.getElementById('stage-' + id); //get the id of the column

        //we will see if this name not exist in the database
        const container = document.getElementById('container-column'); //get the container column
        const columns = Array.from(container.children);
        const order = columns.map(col => col.getAttribute('nameStage'));
        let repeat = false;
        for (var i = 0; i < order.length; i++) {
            if (order[i] == newName) {
                repeat = true;
                break;
            }
        }

        //if the new name not exist in the database, we will update
        if (!repeat) {
            nameH.textContent = newName;
            columnId.setAttribute('nameStage', newName); //update the name
            await updateOrderInBackend() //update the information in the database
        } else {
            warningMessage('Error al actualizar el nombre', 'El nombre que intentaste ingresar ya existe en alguna tabla');
        }
    } else {
        warningMessage('Error al actualizar el nombre', 'El nombre que intentaste ingresar no es correcto');
    }
}

function nextStage(id) {
    const columnId = document.getElementById('stage-' + id); //get the id of the column
    const container = document.getElementById('container-column'); //get the container column
    const columns = Array.from(container.children); //get all the columns of the column column
    const index = columns.indexOf(columnId); //get the index of the column in the array
    const newIndex = index + 1;

    //we will see if can move the column 
    if (newIndex < columns.length) {
        //save both columns for use after
        container.insertBefore(columns[newIndex], columns[index]);
    }
}

function backStage(id) {
    const columnId = document.getElementById('stage-' + id); //get the id of the column
    const container = document.getElementById('container-column'); //get the container column
    const columns = Array.from(container.children); //get all the columns of the column column
    const index = columns.indexOf(columnId); //get the index of the column in the array
    const newIndex = index - 1;

    //we will see if can move the column 
    if (newIndex > -1) {
        //save both columns for use after
        container.insertBefore(columns[index], columns[newIndex]);
    }
}

async function deleteStage(id, id_company, name) {
    // get all the prospects
    const divTasks = document.querySelectorAll('.task');

    // we will see if a prospect have the equal `stageId` that the `id` of the stage you want to remove
    const hasTasks = Array.from(divTasks).some(task => task.getAttribute('stageId') === id.toString());

    if (hasTasks) {
        errorMessage('MUCHO OJO 👁️', `No se puede eliminar la etapa de venta '${name}' porque tiene ventas asociadas.`);
        return; // Stop function if there are associated tasks
    }

    if (await questionMessage('Eliminar etapa de venta 😱', `¿Deseas eliminar la etapa de venta '${name}'?`)) {
        const id_branch = document.getElementById('id_branch').value;

        //we will see if the user would like delete the stage
        if (id_branch) {
            window.location.href = `/fud/${id_company}/${id_branch}/${id}/delete-table-crm`;
        } else {
            window.location.href = `/fud/${id_company}/${id}/delete-table-crm`;
        }
    }
}

//*----------------------------TASK----------------------------------*/
/*
    this is for update and organize the Task when the user enter the page
*/
async function updateOrderInBackend() {
    //this is for get the new name of the columns
    const container = document.getElementById('container-column');
    const columns = Array.from(container.children);
    const order = columns.map(col => col.getAttribute('nameStage'));

    //this is for get the id of the columns
    const ids = columns.map(col => col.getAttribute('idStage'));

    //get all the task for update 
    const divTasks = document.querySelectorAll('.task');
    let prospects = []
    for (var i = 0; i < divTasks.length; i++) {
        const divTank = divTasks[i]
        const idProspects = divTank.getAttribute('idTask');
        const idStage = divTank.getAttribute('stageId');
        prospects.push([idProspects, idStage]);
    }

    //create the body that send to the server
    const requestBody = {
        order: order,
        ids: ids,
        dataProspects: prospects
    };

    //show the load window
    loadingScreen.style.display = 'flex';
    try {
        const response = await fetch('/fud/update-stage-columns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        //we will see if the answer of th server
        if (response.ok) {
            const responseData = await response.json();
            notificationMessage('CRM actualizado con éxito', 'Tus propuestas fueron actualizadas con éxito');
        } else {
            errorMessage('Error al actualizar CRM', 'Hubo un error al intentar actualizar tus propuestas');
        }
    } catch (error) {
        errorMessage('Error al actualizar CRM', 'Hubo un error al intentar actualizar tus propuestas');
    } finally {
        // hidden the load window
        loadingScreen.style.display = 'none';
    }
}

function organizeTasksIntoStages() {
    // Obtén todas las tareas
    const tasks = document.querySelectorAll('.task');

    // Recorre cada tarea
    tasks.forEach(task => {
        // Obtén el stageId de la tarea
        const stageId = task.getAttribute('stageId');

        // Busca la columna correspondiente usando el id del stage
        const column = document.querySelector(`#stage-${stageId}`);

        // Si encontramos la columna, mueve la tarea dentro de la columna
        if (column) {
            column.appendChild(task);
        }
    });
}

//Call the function to arrange tasks after the content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    organizeTasksIntoStages();
});


//*----------------------------STARTS----------------------------------*/
/*
    her we will to on all the starts of the task. 
*/
document.addEventListener('DOMContentLoaded', () => {
    // get all the container of tha stars
    const starsContainers = document.querySelectorAll('.stark');

    starsContainers.forEach(container => {
        //Get the priority value of the data-priority attribute
        const priority = parseInt(container.getAttribute('priority'), 10);

        //Limit priority value to 3 if mayor
        const starCount = Math.min(priority, 3);

        //clean the container of the starts
        container.innerHTML = '';

        //this loop for is for add the number of stars that is on
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('i');
            star.className = 'fi fi-sr-star';
            container.appendChild(star);
        }

        //this loop for is for add the number of stars that is off
        const startOff = starCount - 3; //We subtract the number of lit stars
        if (startOff < 0) {
            for (let i = 0; i > startOff; i--) {
                const star = document.createElement('i');
                star.className = 'fi fi-rr-star';
                container.appendChild(star);
            }
        }
    });
});



//*----------------------------APPOINTMENT----------------------------------*/
/*
    This script is to activate the first button and return the interface to its default form. 
    We must first activate the interface where the calendar is so that it loads correctly, 
    then we can deactivate it.
*/
    document.addEventListener('DOMContentLoaded', function () {
        // Simulates the click on the first button when loading the page
        document.querySelector('.btn-select').click();
    });