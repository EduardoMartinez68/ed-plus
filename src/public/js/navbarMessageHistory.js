//*---------------------------------------------------------UI--------------------------------------------------------//
/*
    in this code, We manage animation of the UI of the navbar message history for that when the user do a click in the button of the message
    we can show the message history and that the can send message when the need.
*/
//this is for hidden the chat history or show the messages
const chatIcon = document.getElementById('chatIcon');
const chatHistory = document.getElementById('chatHistory');

chatIcon.addEventListener('click', () => {
    if (chatHistory.style.display === 'block') {
        chatHistory.style.display = 'none';
    } else {
        chatHistory.style.display = 'block';
        /*
        //we will see if the user have pending messages, if not have pending messages we show the icon red
        if (iconsMessages.classList.contains('alert-message')) {
            iconsMessages.classList.remove('alert-message');
        }
        */
    }
});


function is_valid_email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
     socket.on('privateMessage', (dataMessage) => {
        //we will see if the user have pending messages, if not have pending messages we show the icon red
        if (!iconsMessages.classList.contains('alert-message')) {
            iconsMessages.classList.add('alert-message');
        }

        create_new_message(dataMessage.userId,dataMessage.message);

        // show notification in the screen
        play_sound_notification();
    });
 */
//*---------------------------------------------------------BACKEND--------------------------------------------------------//
/*
    in this code, We manage the inputs and outputs of the message and notification for the user. We will socket for read the
    the connection of the message in the users.
*/

//document.addEventListener('DOMContentLoaded', () => {
    //get the icon of new message for on or off after
    const iconsMessages=document.getElementById('icons-message-history');

    //we will see if exist the user id for save in the server socket
    const userId = document.getElementById('userIdChat').value;
    const idCompanyPackService=document.getElementById('id-company-ed-clouded').value;


    if(!(userId && idCompanyPackService)){
        infoMessagePack('Oh oh... 😅','Ups, parece que alcanzaste tu límite de dispositivos conectados. Por favor, actualiza tu membresía.')
    }

    //if(userId && idCompanyPackService){
        const socket = io('http://localhost:4000');
        socket.emit('registerUser', userId,idCompanyPackService); //send information to the server for save the socket of the user

        // this is for bloack the login of the user when is the max of devices
        socket.on('connectionRejected', (dataNotification) => {
            infoMessagePack('Oh oh... 😅',dataNotification)
        });


        //-----------------------------------NOTIFICATIONS------------------------------
        // we listen the private message of the user
        socket.on('privateNotification', (dataNotification) => {
            /*
            //we will see if the user have pending a notification, if not have pending notifications we not show the icon red
            if (!iconsMessages.classList.contains('alert-message')) {
                iconsMessages.classList.add('alert-message');
            }
            */
            console.log('dataNotification')
            console.log(dataNotification)

            //we will see read all the notification for add the UI
            create_new_notification(dataNotification.from, dataNotification.message);
            


            // show notification in the screen
            play_sound_notification();
        });

        socket.on('updateNotifications', (dataNotifications) => {
            //we will see if the user have pending a notification, if not have pending notifications we not show the icon red
            if (!iconsMessages.classList.contains('alert-message')) {
                iconsMessages.classList.add('alert-message');
            }

            //we will see read all the notification for add the UI
            dataNotifications.forEach(notification => {
                create_new_notification(notification.userId, notification.message,notification.status);
            });


            // show notification in the screen
            play_sound_notification();
        });


        function create_new_notification(userId,message,status){
            // Obtener el contenedor donde se mostrarán los mensajes
            const chatHistory = document.getElementById('chatHistory');

            // Crear un nuevo div para el mensaje
            const newMessageDiv = document.createElement('div');
            newMessageDiv.classList.add('message');

            // Crear la imagen de perfil del usuario (puedes cambiar la URL a la imagen que desees)
            const profileImage = document.createElement('img');
            profileImage.src = 'https://cdn-icons-png.flaticon.com/512/1046/1046015.png';  // Aquí puedes poner la URL de la imagen de perfil del usuario
            profileImage.alt = '';
            profileImage.classList.add('chat-history-image-profile');

            // Crear el contenedor del contenido del mensaje
            const messageContentDiv = document.createElement('div');
            messageContentDiv.classList.add('message-content');

            //we will see if the message is read or not 
            if(status=="unread"){
                messageContentDiv.classList.add('message-content-unread');
            }


            // Crear el nombre del usuario (puedes obtenerlo dinámicamente si lo tienes)
            const userNameLabel = document.createElement('label');
            userNameLabel.classList.add('chat-name');
            userNameLabel.textContent = userId || 'Usuario'; // Suponiendo que 'message.sender' contiene el nombre del remitente

            // Crear el párrafo para mostrar el mensaje
            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = message || 'Mensaje no disponible';  // Asumiendo que 'message.text' contiene el mensaje

            // Agregar todo al DOM
            messageContentDiv.appendChild(userNameLabel);
            messageContentDiv.appendChild(messageParagraph);
            newMessageDiv.appendChild(profileImage);
            newMessageDiv.appendChild(messageContentDiv);

            // Agregar el nuevo mensaje al chat
            chatHistory.appendChild(newMessageDiv);

            // Hacer scroll hacia el final para mostrar el mensaje más reciente
            chatHistory.scrollTop = chatHistory.scrollHeight;

            update_view_all_messages();
        }

        function update_view_all_messages() {
            // Eliminar el antiguo bloque de "Ver todos los mensajes"
            const oldViewAllMessages = document.querySelector('.view-all-messages');
            if (oldViewAllMessages) {
            oldViewAllMessages.remove();
            }
        
            // Crear un nuevo bloque de "Ver todos los mensajes"
            const newViewAllMessages = document.createElement('div');
            newViewAllMessages.classList.add('view-all-messages');
            
            // Crear los labels
            const topLabel = document.createElement('label');
            topLabel.textContent = "";
        
            const bottomLabel = document.createElement('label');
            bottomLabel.textContent = "";
        
            // Crear el centro con el enlace
            const center = document.createElement('center');
            const link = document.createElement('a');
            link.href = "#";
            link.textContent = "Ver todos los mensajes";
            center.appendChild(link);
        
            // Agregar los labels y el enlace al nuevo bloque
            newViewAllMessages.appendChild(topLabel);
            newViewAllMessages.appendChild(center);
            newViewAllMessages.appendChild(bottomLabel);
            
            // Agregar el nuevo bloque al final del contenedor chatHistory
            const chatHistory = document.getElementById('chatHistory');
            chatHistory.appendChild(newViewAllMessages);
        }




        //we will see if the message can be send. Get the answer of the server
        socket.on('messageStatus', (status) => {
            if (status.success) {
                //this is for show a new emoji forever 
                const emojis = ["😁", "🤗", "😄", "😊", "❤️"];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                
                notificationMessage('Exito','Mensaje enviado correctamente '+randomEmoji);
            } else {
                warningMessage('ERROR',status.message)
            }
        });

        // function for play a sound of notification
        function play_sound_notification() {
            const audio = new Audio('https://www.soundjay.com/button/beep-07.wav');
            audio.play();
        }

    //}else{
        //infoMessagePack('Oh oh... 😅','Ups, parece que alcanzaste tu límite de dispositivos conectados. Por favor, actualiza tu membresía.')
    //}

    update_view_all_messages();
    
    function infoMessagePack(title, text) {
        Swal.fire({
            title: title,
            text: text,
            icon: 'info',
        }).then((result) => {
            // Ejecutar algo después de que el mensaje se cierre
            if (result.isConfirmed || result.isDismissed) {
                window.location.href = "/links/logout";
            }
        });
    }

//});

    /**** */
    function show_send_message_to_user(){
        var containerHtml = `
        <style>
            .swal2-textarea {
                width: 50%;
                min-height: 100px;
                max-height: 300px;
                background-color: #f9f9f9;
                outline: none;
                transition: border-color 0.3s ease-in-out;
            }
            .swal2-container {
                font-family: Arial, sans-serif;
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
        </style>
    
        <div class="row">
            <div class="col-3">
                <label for="email">Para: </label>
            </div>
            <div class="col">
                <input type="email" class="email-flask-input" id="email-to-message" name="email" placeholder="Introduce el email para enviar el mensaje" required>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="grades">Mensaje</label>
                    <textarea class="form-control" id="text-to-message" rows="3" name="notes" placeholder="Escribe un mensaje"></textarea>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <button type="submit" class="btn btn-success" onclick="send_message_to_user()">Enviar mensaje <i class="fi fi-rs-paper-plane"></i></button>
                </div>
            </div>
        </div>
        `;
    
        return Swal.fire({
            title: 'Enviar mensaje 💬',
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
    
    function send_message_to_user(){
        //we will see if exist the email and the message
        const userId = document.getElementById('userIdChat').value;
        const toUserId = document.getElementById('email-to-message').value;
        const message=document.getElementById('text-to-message').value;
    
        //we will see if the email is success
        if(toUserId && is_valid_email(toUserId)){
            if(message){
                socket.emit('sendMessageToUser', { userId, toUserId , message });
            }else{
                warningMessage('ERROR','Necesitamos que ingreses un mensaje valido 👁️')
            }
        }
        else{
            warningMessage('ERROR','Necesitamos que ingreses un email valido 👁️')
        }
    }