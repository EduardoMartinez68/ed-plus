function showSection(sectionId, button) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Eliminar la clase activa de todos los botones
    const buttons = document.querySelectorAll('.btn-select');
    buttons.forEach(btn => btn.classList.remove('btn-active'));
    
    // Añadir la clase activa al botón actual
    button.classList.add('btn-active');

    // Mostrar la sección seleccionada
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.add('active');
    }
}

