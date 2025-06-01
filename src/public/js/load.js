const loadingScreen = document.getElementById('loading-screen-load');
loadingScreen.style.opacity = '0'; // Desvanece la pantalla de carga

// Espera un tiempo para asegurarse de que el fade-out se complete
setTimeout(() => {
    loadingScreen.style.display = 'none'; // Luego oculta la pantalla de carga
}, 500); // Coincide con la duración de la transición de opacidad


//------------this script is for that the user not can edit the code of the web------------//
/*
// Prevent right click on page
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Avoid certain key combinations (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
document.addEventListener('keydown', function(event) {
    if (event.keyCode === 123 || // F12
        (event.ctrlKey && event.shiftKey && event.keyCode === 73) || // Ctrl+Shift+I
        (event.ctrlKey && event.shiftKey && event.keyCode === 74) || // Ctrl+Shift+J
        (event.ctrlKey && event.keyCode === 85) // Ctrl+U
    ) {
        event.preventDefault();
    }
});
*/