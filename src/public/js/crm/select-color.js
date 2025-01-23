function selectColor(color) {
    document.getElementById('exampleFormControlInput1').value = color;
}

function toggleColorPicker() {
    const colorPickerContainer = document.getElementById('colorPickerContainer');
    colorPickerContainer.style.display = colorPickerContainer.style.display === 'none' ? 'block' : 'none';
}