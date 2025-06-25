// Selecciona el formulario que contiene el botón
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonIcon = submitButton.querySelector('.button-icon');
    const buttonLoading = submitButton.querySelector('.button-loading');
    
    // Quitar el style inline del HTML para que el CSS tome control
    if (buttonLoading) {
        buttonLoading.removeAttribute('style');
    }
    
    if (form && submitButton) {
        form.addEventListener('submit', function(e) {
            // Cambiar el estado del botón
            buttonText.textContent = 'Enviando...';
            
            // Mostrar spinner y ocultar flecha
            buttonLoading.style.display = 'inline-block';
            buttonLoading.style.opacity = '1';
            buttonLoading.style.visibility = 'visible';
            
            // Ocultar la flecha completamente
            buttonIcon.style.display = 'none';
            
            // Desactivar el botón para evitar múltiples envíos
            submitButton.disabled = true;
        });
    }
});