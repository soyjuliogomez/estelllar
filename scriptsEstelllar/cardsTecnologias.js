// cardsTecnologias.js - Script para animar las tarjetas tecnológicas al hacer scroll de forma gradual

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Seleccionamos los elementos principales
  const techContainer = document.querySelector('.tech-container');
  const cards = document.querySelectorAll('.tech-card');
  
  // CONFIGURACIÓN DE LA ANIMACIÓN - AJUSTA ESTOS VALORES
  // Configuración para Desktop
  const desktopConfig = {
    triggerStart: -200,        // Cuando comienza el efecto (negativo = comienza antes de ver la sección)
    triggerFull: 600,          // Cuando el efecto está al máximo (mayor valor = expansión más lenta)
    offsetActivation: 400      // Ajusta este valor para controlar el punto de inicio
  };
  
  // Configuración para Móvil
  const mobileConfig = {
    triggerStart: 1000,        // Móvil comienza el efecto más tarde (menos scroll)
    triggerFull: 4600,          // Efecto más rápido en móvil (menos scroll necesario)
    offsetActivation: 100,     // Punto de inicio diferente para móvil
    visibilityThreshold: 0.9,  // Porcentaje de pantalla donde se activa (0.9 = 90% superior)
    bottomOffset: -50,         // Cuánto puede salir por abajo y seguir siendo "visible"
    expandWidth: 100,           // Porcentaje de expansión máxima
    translateY: 0,             // Desplazamiento vertical cuando está expandido
    initialOpacity: 0.8,       // Opacidad inicial
    finalOpacity: 1            // Opacidad final
  };
  
  // Obtener el ancho inicial para cada tarjeta basado en su clase
  function getInitialWidth(card) {
    // Obtener la clase de tarjeta específica
    const cardClass = Array.from(card.classList).find(cls => cls.startsWith('card-'));
    
    // Tamaños para desktop
    if (window.innerWidth > 1024) {
      // Obtener el porcentaje inicial desde las clases CSS
      switch(cardClass) {
        case 'card-innovation': return 30;
        case 'card-machine-learning': return 20;
        case 'card-ai': return 40;
        case 'card-cybersecurity': return 10;
        case 'card-cloud': return 10;
        case 'card-blockchain': return 10;
        default: return 70; // Por defecto
      }
    } 
    // Tamaños para tablets
    else if (window.innerWidth > 600) {
      return 85; // 85% para todas las tarjetas en tablets
    } 
    // Tamaños para móviles
    else {
      return 75; // 75% para todas las tarjetas en móviles
    }
  }
  
  // Función para verificar si un elemento está visible en la ventana (configuración para móvil)
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight * mobileConfig.visibilityThreshold) &&
      rect.bottom >= mobileConfig.bottomOffset
    );
  }
  
  // Función para manejar el evento de scroll
  function handleScroll() {
    const scrollPosition = window.scrollY;
    const containerPosition = techContainer.getBoundingClientRect().top + window.scrollY;
    
    // Para dispositivos móviles y tablets pequeñas
    if (window.innerWidth <= 767) {
      // Configuración para móvil
      const config = mobileConfig;
      
      // Calcular la posición relativa al contenedor con el offset
      const relativeScroll = scrollPosition - containerPosition + config.offsetActivation;
      
      // Calcular factor de expansión para móvil
      const expandFactor = Math.min(Math.max((relativeScroll - config.triggerStart) / (config.triggerFull - config.triggerStart), 0), 1);
      
      // Aplicar estilos a cada tarjeta según su visibilidad
      cards.forEach((card) => {
        const initialWidthPercent = getInitialWidth(card);
        
        // Comprobamos si la tarjeta está visible
        if (isElementInViewport(card)) {
          // Hacer tarjeta completamente visible
          card.setAttribute('style', `
            width: ${config.expandWidth}% !important; 
            opacity: ${config.finalOpacity} !important; 
            transform: translateY(${config.translateY}px) !important; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
          `);
          card.classList.add('card-in-view');
        } else {
          // Calculamos el ancho en función del scroll
          const currentWidth = initialWidthPercent + ((config.expandWidth - initialWidthPercent) * expandFactor);
          const currentOpacity = config.initialOpacity + ((config.finalOpacity - config.initialOpacity) * expandFactor);
          const translateY = 15 * (1 - expandFactor);
          
          // Tarjeta no visible, aplicamos transición basada en scroll
          card.setAttribute('style', `
            width: ${currentWidth}% !important; 
            opacity: ${currentOpacity} !important; 
            transform: translateY(${translateY}px) !important;
          `);
          card.classList.remove('card-in-view');
        }
      });
    } 
    // Para desktop
    else {
      // Configuración para desktop
      const config = desktopConfig;
      
      // Calcular la posición relativa al contenedor con el offset
      const relativeScroll = scrollPosition - containerPosition + config.offsetActivation;
      
      // Calcular factor de expansión para desktop
      const expandFactor = Math.min(Math.max((relativeScroll - config.triggerStart) / (config.triggerFull - config.triggerStart), 0), 1);
      
      // Aplicar a cada tarjeta
      cards.forEach((card) => {
        // Obtener el ancho inicial para esta tarjeta específica
        const initialWidthPercent = getInitialWidth(card);
        
        // Ancho final es siempre 100%
        const finalWidthPercent = 100;
        
        // Interpolar entre ancho inicial y final
        const currentWidth = initialWidthPercent + ((finalWidthPercent - initialWidthPercent) * expandFactor);
        
        // Aplicar el ancho calculado
        card.style.width = `${currentWidth}%`;
      });
    }
  }
  
  // Asignar los manejadores de eventos - solo una vez cada uno
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll); // Actualizar en cambios de tamaño
  
  // Ejecutar una vez al cargar para establecer estado inicial
  handleScroll();
  
  // Verificar cada 200ms si las tarjetas están en el viewport (para móviles)
  if (window.innerWidth <= 767) {
    setInterval(handleScroll, 200);
  }
});