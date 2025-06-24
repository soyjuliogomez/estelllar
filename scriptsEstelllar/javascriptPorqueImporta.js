// ========================================
// MENÚ INTERACTIVO CON AUTO-ROTATE
// ========================================

class InteractiveMenu {
    constructor() {
      this.currentTab = 0;
      this.totalTabs = 3;
      this.autoRotateInterval = null;
      this.pauseTimeout = null;
      this.isUserInteracting = false;
      this.isDestroyed = false;
      
      // Elementos del DOM
      this.menuItems = null;
      this.tabImages = null;
      this.section = null;
      
      this.init();
    }
    
    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    init() {
      this.cacheDOMElements();
      
      if (this.validateElements()) {
        this.bindEvents();
        this.startAutoRotate();
        console.log('InteractiveMenu inicializado correctamente');
      } else {
        console.warn('InteractiveMenu: No se encontraron los elementos necesarios');
      }
    }
    
    cacheDOMElements() {
      this.section = document.querySelector('.importance-section');
      this.menuItems = document.querySelectorAll('.menu-item');
      this.tabImages = document.querySelectorAll('.tab-image');
    }
    
    validateElements() {
      return this.section && this.menuItems.length > 0 && this.tabImages.length > 0;
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    bindEvents() {
      // Click en items del menú
      this.menuItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleUserClick(index);
        });
      });
      
      // Visibilidad de la página (pausar cuando no está visible)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAutoRotate();
        } else if (!this.isUserInteracting) {
          this.resumeAutoRotate();
        }
      });
      
      // Pausar en móvil cuando se hace scroll (opcional)
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768 && !this.isUserInteracting) {
          this.pauseAutoRotate();
          
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            if (!this.isUserInteracting) {
              this.resumeAutoRotate();
            }
          }, 2000);
        }
      });
    }
    
    // ========================================
    // MANEJO DE INTERACCIONES
    // ========================================
    
    handleUserClick(index) {
      if (this.isDestroyed) return;
      
      this.setActiveTab(index, false); // Sin animación de progreso
      this.pauseAutoRotate();
      
      console.log(`Usuario seleccionó tab ${index + 1}`);
      
      // Esperar 10 segundos antes de reanudar
      this.pauseTimeout = setTimeout(() => {
        if (!this.isDestroyed) {
          this.resumeAutoRotate();
        }
      }, 10000);
    }
    
    setActiveTab(index, showProgress = true) {
      if (this.isDestroyed || index < 0 || index >= this.totalTabs) return;
      
      // Limpiar estado anterior
      this.menuItems.forEach(item => {
        item.classList.remove('active');
        const progressFill = item.querySelector('.progress-fill');
        if (progressFill) {
          progressFill.style.animation = 'none';
          progressFill.offsetHeight; // Trigger reflow
        }
      });
      
      this.tabImages.forEach(image => {
        image.classList.remove('active');
      });
      
      // Activar nuevo tab
      if (this.menuItems[index]) {
        this.menuItems[index].classList.add('active');
        
        if (showProgress) {
          const progressFill = this.menuItems[index].querySelector('.progress-fill');
          if (progressFill) {
            progressFill.style.animation = 'fillProgress 4s linear forwards';
          }
        }
      }
      
      if (this.tabImages[index]) {
        this.tabImages[index].classList.add('active');
      }
      
      this.currentTab = index;
    }
    
    nextTab() {
      if (this.isDestroyed) return;
      
      const nextIndex = (this.currentTab + 1) % this.totalTabs;
      this.setActiveTab(nextIndex, true); // Con animación de progreso
    }
    
    // ========================================
    // AUTO-ROTATE CONTROL
    // ========================================
    
    startAutoRotate() {
      if (this.isDestroyed) return;
      
      this.clearAutoRotate();
      
      this.autoRotateInterval = setInterval(() => {
        if (!this.isUserInteracting && !this.isDestroyed) {
          this.nextTab();
        }
      }, 4000); // 4 segundos
      
      // Iniciar animación de progreso en el tab actual
      this.setActiveTab(this.currentTab, true);
    }
    
    pauseAutoRotate() {
      this.isUserInteracting = true;
      this.clearAutoRotate();
      this.clearPauseTimeout();
    }
    
    resumeAutoRotate() {
      if (this.isDestroyed) return;
      
      this.isUserInteracting = false;
      this.clearPauseTimeout();
      this.startAutoRotate();
    }
    
    clearAutoRotate() {
      if (this.autoRotateInterval) {
        clearInterval(this.autoRotateInterval);
        this.autoRotateInterval = null;
      }
    }
    
    clearPauseTimeout() {
      if (this.pauseTimeout) {
        clearTimeout(this.pauseTimeout);
        this.pauseTimeout = null;
      }
    }
    
    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================
    
    // Ir a un tab específico
    goToTab(index) {
      if (index >= 0 && index < this.totalTabs) {
        this.handleUserClick(index);
      }
    }
    
    // Pausar manualmente
    pause() {
      this.pauseAutoRotate();
    }
    
    // Reanudar manualmente
    resume() {
      this.resumeAutoRotate();
    }
    
    // Obtener tab actual
    getCurrentTab() {
      return this.currentTab;
    }
    
    // ========================================
    // CLEANUP
    // ========================================
    
    destroy() {
      this.isDestroyed = true;
      this.clearAutoRotate();
      this.clearPauseTimeout();
      
      console.log('InteractiveMenu destruido');
    }
  }
  
  // ========================================
  // UTILIDADES PARA IMÁGENES
  // ========================================
  
  // Función para precargar imágenes
  function preloadImages(imagePaths) {
    imagePaths.forEach(path => {
      const img = new Image();
      img.src = path;
    });
  }
  
  // Función para actualizar imagen de un tab específico
  function updateTabImage(tabIndex, imageSrc, altText) {
    const tabImage = document.querySelector(`[data-tab="${tabIndex}"]`);
    if (tabImage) {
      const existingImg = tabImage.querySelector('.tab-img');
      const placeholder = tabImage.querySelector('.image-placeholder');
      
      if (existingImg) {
        existingImg.src = imageSrc;
        existingImg.alt = altText;
      } else if (placeholder) {
        // Reemplazar placeholder con imagen real
        placeholder.outerHTML = `<img src="${imageSrc}" alt="${altText}" class="tab-img">`;
      }
    }
  }
  
  // ========================================
  // INICIALIZACIÓN AUTOMÁTICA
  // ========================================
  
  let interactiveMenuInstance = null;
  
  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que el CSS esté cargado
    setTimeout(() => {
      interactiveMenuInstance = new InteractiveMenu();
      
      // Precargar imágenes (opcional)
      preloadImages([
        './image/diversity-team.jpg',
        './image/innovation-lab.jpg',
        './image/results-dashboard.jpg'
      ]);
    }, 100);
  });
  
  // Limpiar al salir de la página
  window.addEventListener('beforeunload', () => {
    if (interactiveMenuInstance) {
      interactiveMenuInstance.destroy();
    }
  });
  
  // ========================================
  // API GLOBAL (opcional)
  // ========================================
  
  // Exponer funciones globales para control externo
  window.InteractiveMenuAPI = {
    goToTab: (index) => {
      if (interactiveMenuInstance) {
        interactiveMenuInstance.goToTab(index);
      }
    },
    
    pause: () => {
      if (interactiveMenuInstance) {
        interactiveMenuInstance.pause();
      }
    },
    
    resume: () => {
      if (interactiveMenuInstance) {
        interactiveMenuInstance.resume();
      }
    },
    
    getCurrentTab: () => {
      return interactiveMenuInstance ? interactiveMenuInstance.getCurrentTab() : 0;
    },
    
    updateImage: updateTabImage
  };
  
  // ========================================
  // EJEMPLO DE USO
  // ========================================
  
  /*
  // Ejemplos de cómo usar la API:
  
  // Ir a un tab específico
  InteractiveMenuAPI.goToTab(1);
  
  // Pausar el auto-rotate
  InteractiveMenuAPI.pause();
  
  // Reanudar el auto-rotate
  InteractiveMenuAPI.resume();
  
  // Obtener el tab actual
  console.log('Tab actual:', InteractiveMenuAPI.getCurrentTab());
  
  // Actualizar imagen de un tab
  InteractiveMenuAPI.updateImage(0, './image/new-image.jpg', 'Nueva imagen');
  */