function show_message_pop(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function hidden_message_pop(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}