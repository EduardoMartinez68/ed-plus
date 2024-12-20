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

// function for play a sound of notification
function play_sound_notification() {
    const audio = new Audio('https://www.soundjay.com/button/beep-07.wav');
    audio.play();
}

function show_send_message_to_user(){
    const message="hola"
    const toUserId =2;
    socket.emit('sendMessageToUser', { toUserId , message });
}
}

