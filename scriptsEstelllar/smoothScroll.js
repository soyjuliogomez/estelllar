document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const startPosition = window.pageYOffset;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 90; // Ajusta el 90 según el header
        const distance = targetPosition - startPosition;
        const duration = 300; // Duración en milisegundos (ajusta según prefieras)
        let start = null;
        
        function step(timestamp) {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percentage = Math.min(progress / duration, 1);
          
          // Función de easing cúbica - empieza lento, acelera y termina suave
          const easing = percentage < 0.5 
            ? 4 * percentage * percentage * percentage 
            : 1 - Math.pow(-2 * percentage + 2, 3) / 2;
          
          window.scrollTo(0, startPosition + distance * easing);
          
          if (progress < duration) {
            window.requestAnimationFrame(step);
          }
        }
        
        window.requestAnimationFrame(step);
      }
    });
  });