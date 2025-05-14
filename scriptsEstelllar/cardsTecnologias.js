// cardsTecnologias.js - Script para animar las tarjetas tecnológicas al hacer scroll

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Seleccionamos los elementos principales
  const techContainer = document.querySelector('.tech-container');
  const cards = document.querySelectorAll('.tech-card');
  
  // Puntos de activación para el scroll
  const triggerStart = 100; // Cuando comienza el efecto
  const triggerFull = 500;  // Cuando el efecto está al máximo
  
  // Función para manejar el evento de scroll
  function handleScroll() {
    const scrollPosition = window.scrollY;
    
    // Si hemos pasado el punto de inicio del trigger
    if (scrollPosition > triggerStart) {
      // Calcular factor de escala basado en la posición del scroll
      const scaleFactor = Math.min((scrollPosition - triggerStart) / (triggerFull - triggerStart), 1);
      
      // Aplicar transformación a cada tarjeta
      cards.forEach(card => {
        // Escala base + factor adicional según scroll
        const scale = 0.9 + (0.1 * scaleFactor);
        card.style.transform = `scale(${scale})`;
        
        // Mantener el tamaño de fuente en las tarjetas
        const h3Element = card.querySelector('h3');
        if (h3Element) {
          h3Element.style.fontSize = '18px';
        }
      });
      
      // Añadir clase para otras transiciones si es necesario
      if (scaleFactor >= 0.8) {
        techContainer.classList.add('scrolled');
      } else {
        techContainer.classList.remove('scrolled');
      }
    } else {
      // Restablecer a valores iniciales si estamos por encima del punto inicial
      cards.forEach(card => {
        card.style.transform = 'scale(0.9)';
        
        const h3Element = card.querySelector('h3');
        if (h3Element) {
          h3Element.style.fontSize = '18px';
        }
      });
      
      techContainer.classList.remove('scrolled');
    }
  }
  
  // Aplicar estado inicial a las tarjetas
  cards.forEach(card => {
    card.style.transform = 'scale(0.9)';
    
    const h3Element = card.querySelector('h3');
    if (h3Element) {
      h3Element.style.fontSize = '18px';
    }
  });
  
  // Asignar el manejador de eventos
  window.addEventListener('scroll', handleScroll);
  
  // Ejecutar una vez al cargar para establecer estado inicial
  handleScroll();
});