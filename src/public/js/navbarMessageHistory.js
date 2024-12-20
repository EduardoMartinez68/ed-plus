//---------------------------------------------------------UI--------------------------------------------------------//
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
    }
});


//---------------------------------------------------------BACKEND--------------------------------------------------------//
/*
    in this code, We manage the inputs and outputs of the message and notification for the user. We will socket for read the
    the connection of the message in the users.
*/

//get the icon of new message for on or off after
const iconsMessages=document.getElementById('icons-message-history');

//we will see if exist the user id for save in the server socket
const userId = document.getElementById('userIdChat').value;

if(userId){
const socket = io('http://localhost:4000');
socket.emit('registerUser', userId); //send information to the server for save the socket of the user

// we listen the private message of the user
socket.on('privateMessage', (message) => {
    console.log('Mensaje privado recibido:', message);

    //we will see if the user have pending messages, if not have pending messages we show the icon red
    if (!iconsMessages.classList.contains('alert-message')) {
        iconsMessages.classList.add('alert-message');
    }

    // show notification in the screen
    play_sound_notification();
});

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
    const toUserId = document.getElementById('email-to-message').value;
    const message=document.getElementById('text-to-message').value;
    if(toUserId){
        if(message){
            socket.emit('sendMessageToUser', { toUserId , message });
        }else{
            warningMessage('ERROR','Necesitamos que ingreses un mensaje valido 👁️')
        }
    }
    else{
        warningMessage('ERROR','Necesitamos que ingreses un email valido 👁️')
    }
}
}

