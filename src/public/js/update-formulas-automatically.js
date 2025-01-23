//get the data of the form 
const form = document.getElementById("myForm");
const btnForm= document.getElementById('btn-form-loading');


//Serializes form data to an object or string. This is for when we are going to compare if the user modified the form
function serializeForm(form) {
    const formData = new FormData(form);
    const serialized = {};
    formData.forEach((value, key) => {
        serialized[key] = value;
    });

    return serialized;
    //return JSON.stringify(serialized);
}

// save the status first of the form
let initialFormState = JSON.stringify(serializeForm(form));

let timeout;

//we will see if the user is edit the form
form.addEventListener("input", () => {
    update_container_text_description();
    
    //we will to compare if the form was edit, for can send the update to the server
    if (the_form_was_edit()) {
        //we will see if in the form button exist the class 
        if(!btnForm.classList.contains('btn-loading-off')){
            btnForm.classList.add('btn-loading-off');
            btnForm.disabled = true;
        }

        // Cancels any previously scheduled saves
        clearTimeout(timeout);

        //Schedule a save after of X seconds of inactivity
        const seconds=5;
        timeout = setTimeout(() => {
            send_the_form_automatically_to_the_server();
        }, 1000*seconds);
    }else{
        off_button_loading();
    }
});

async function send_the_form_automatically_to_the_server(){
    //we will see if the user edit the form for send to the server
    if (the_form_was_edit()) {
        /*
        this function will be added after in the form for send the data that 
        need the server for update the data in the database
        */
        await update_the_form_in_the_server();
    }else{
        off_button_loading();
    }
}

/*
async function update_the_form_in_the_server(){
    await send_form_data(idCompany, idBranch, idCustomer);
}
*/

function the_form_was_edit(){
    //Serializes the current state of the form
    const currentFormState = serializeForm(form);
    return JSON.stringify(currentFormState) !== initialFormState;
}

function off_button_loading(){
    //when the form is equal, we will cancel the animation button 
    btnForm.classList.remove('btn-loading-off');
    btnForm.disabled = false;
}

function message_flask(){
    notificationMessage('Notificación','Base de datos actualizada');
}

async function send_to_server(link,linkData) {
    //const loadingOverlay = document.getElementById("loadingOverlay");
    //loadingOverlay.style.display = "flex"; // Show loading overlay

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
    } catch (error) {
        //show the error that the server send
        notificationMessageError('Error',error);
        console.error('Error al enviar formulario:', error);
    }finally{
        off_button_loading();
        //loadingOverlay.style.display = "none"; // hidden loading overlay

        //we will save the new form edit for compare it later
        initialFormState = JSON.stringify(serializeForm(form));
    }
}
