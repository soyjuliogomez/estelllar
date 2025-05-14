// Selecciona el formulario que contiene el botón
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form'); // Ajusta este selector si es necesario
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonIcon = submitButton.querySelector('.button-icon');
    const buttonLoading = submitButton.querySelector('.button-loading');
    
    if (form && submitButton) {
        form.addEventListener('submit', function(e) {
            // Cambiar el estado del botón
            buttonText.textContent = 'Enviando...';
            buttonIcon.style.display = 'none';
            buttonLoading.style.display = 'inline-block';
            
            // Desactivar el botón para evitar múltiples envíos
            submitButton.disabled = true;
            
            // Si estás usando AJAX para enviar el formulario, podrías manejar
            // el éxito o fracaso aquí y restaurar el botón si es necesario
            
            // Si usas el envío de formulario estándar, no es necesario hacer nada más
        });
    }
});