// Configuración de offsets personalizados para cada dispositivo
const SCROLL_OFFSETS = {
    mobile: 80,   // Ajusta este valor para mobile
    desktop: 110  // Ajusta este valor para desktop
  };
  
  function scrollToData(device = 'desktop') {
    const dataSection = document.querySelector('.data');
    
    if (dataSection) {
      // Obtener el offset según el dispositivo
      const offset = SCROLL_OFFSETS[device] || 110;
      
      // Calcular la posición final
      const targetPosition = dataSection.offsetTop - offset;
      
      // Desplazarse suavemente
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
  
  // Sincronización de los 3 inputs de email
  const emailMobile = document.getElementById('email-mobile');
  const emailDesktop = document.getElementById('email-desktop');
  const emailFinal = document.getElementById('email-final');
  
  function syncAllEmails(event) {
    const value = event.target.value;
    
    // Sincronizar todos los campos con el valor actual
    if (event.target === emailMobile) {
      emailDesktop.value = value;
      emailFinal.value = value;
    } else if (event.target === emailDesktop) {
      emailMobile.value = value;
      emailFinal.value = value;
    } else if (event.target === emailFinal) {
      emailMobile.value = value;
      emailDesktop.value = value;
    }
  }
  
  // Escuchar cambios en todos los campos
  emailMobile.addEventListener('input', syncAllEmails);
  emailDesktop.addEventListener('input', syncAllEmails);
  emailFinal.addEventListener('input', syncAllEmails);