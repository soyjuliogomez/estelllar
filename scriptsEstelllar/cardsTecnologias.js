// cardsTecnologias.js - Script para animar las tarjetas tecnológicas al hacer scroll de forma gradual

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Seleccionamos los elementos principales
  const techContainer = document.querySelector('.tech-container');
  const cards = document.querySelectorAll('.tech-card');
  
  // CONFIGURACIÓN DE LA ANIMACIÓN - AJUSTA ESTOS VALORES
  const triggerStart = -200; // Cuando comienza el efecto (negativo = comienza antes de ver la sección)
  const triggerFull = 600;  // Cuando el efecto está al máximo (mayor valor = expansión más lenta)
  const offsetActivation = 400; // Ajusta este valor para controlar el punto de inicio
  
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
  
  // Función para manejar el evento de scroll
  function handleScroll() {
    const scrollPosition = window.scrollY;
    const containerPosition = techContainer.getBoundingClientRect().top + window.scrollY;
    
    // Calcular la posición relativa al contenedor con el offset
    const relativeScroll = scrollPosition - containerPosition + offsetActivation;
    
    // Calcular factor de expansión relativo a los puntos de activación
    // Para valores negativos de triggerStart, esto permitirá que el efecto comience antes
    const expandFactor = Math.min(Math.max((relativeScroll - triggerStart) / (triggerFull - triggerStart), 0), 1);
    
    // Aplicar el ancho calculado a cada tarjeta de forma gradual
    cards.forEach((card) => {
      // Obtener el ancho inicial para esta tarjeta específica
      const initialWidthPercent = getInitialWidth(card);
      
      // Ancho final es siempre 100%
      const finalWidthPercent = 100;
      
      // Interpolar entre ancho inicial y final
      const currentWidth = initialWidthPercent + ((finalWidthPercent - initialWidthPercent) * expandFactor);
      
      // Aplicar el ancho calculado
      card.style.width = `${currentWidth}%`;
      
      // Añadir efectos adicionales para móviles y tablets
      if (window.innerWidth <= 767) {
        // Para dispositivos pequeños: también animamos la opacidad y la posición Y
        const opacity = 0.8 + (0.2 * expandFactor); // De 0.8 a 1
        const translateY = 15 * (1 - expandFactor); // De 15px a 0px
        
        card.style.opacity = opacity;
        card.style.transform = `translateY(${translateY}px)`;
        
        // Si la tarjeta está completamente visible, añadimos la clase para efectos adicionales
        if (expandFactor > 0.8) {
          card.classList.add('card-in-view');
        } else {
          card.classList.remove('card-in-view');
        }
      }
    });
    
    // Comentado para producción - descomentar para depuración si es necesario
    // console.log('Relative scroll:', relativeScroll, 'Expand factor:', expandFactor.toFixed(2));
  }
  
  // Función para detectar cuando una tarjeta entra en el viewport (para móviles)
  function checkIfCardInView() {
    if (window.innerWidth <= 767) {
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isInView = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (isInView) {
          card.classList.add('card-in-view');
        }
      });
    }
  }
  
  // Asignar los manejadores de eventos - solo una vez cada uno
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('scroll', checkIfCardInView);
  window.addEventListener('resize', handleScroll); // Actualizar en cambios de tamaño
  
  // Ejecutar una vez al cargar para establecer estado inicial
  handleScroll();
  setTimeout(checkIfCardInView, 500); // Comprobar después de un breve retraso
});