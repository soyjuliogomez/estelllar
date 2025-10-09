// components/navbar.js - VERSIÓN CORREGIDA PARA EVITAR SCROLL HORIZONTAL

// ✅ MEJORADO: Función para detectar si está en móvil con mejor detección
function isMobile() {
  // Usar matchMedia para una detección más precisa
  return window.matchMedia('(max-width: 768px)').matches;
}

// ✅ CORREGIDO: Función para crear navbar móvil (solo logo) - SIN SCROLL
function createMobileNavbar(basePath) {
  return `
    <nav class="barranavegacion barranavegacion--mobile" id="barracenter">
      <a href="${basePath}index.html" class="logo-container">
        <img class="logo-barra" src="${basePath}image/estelllarconf-logo.svg" alt="logo" />
      </a>
    </nav>
  `;
}

// ✅ CORREGIDO: Función para crear navbar desktop con mejor responsive
function createDesktopNavbar(basePath, currentPage) {
  return `
    <nav class="barranavegacion barranavegacion--desktop" id="barracenter">
      <a href="${basePath}index.html" class="logo-container">
        <img class="logo-barra" src="${basePath}image/estelllarconf-logo.svg" alt="logo" />
      </a>
      
      <div class="menu">
        <a class="linksNavegacion" href="${basePath}index.html#comunidad">Porque Nosotros</a>
        <a class="linksNavegacion" href="${basePath}index.html#experienciaGuiada">¿Qué Aprenderé?</a>
        <a class="linksNavegacion" href="${basePath}index.html#dataSection">Donde Sera</a>
        <a class="linksNavegacion ${currentPage === 'mision.html' ? 'active' : ''}" href="${basePath}mision.html">Misión</a>
        
        <hr />
        <div class="botones-usuario">
          <a class="button button__primary" onclick="scrollToData()">
            Registrarme &nbsp;<i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </nav>
  `;
}

// ✅ MEJORADO: Función principal con mejor lógica de detección
function createNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  const getBasePath = () => {
    if (currentPage === 'index.html' || currentPage === '') return '';
    return './';
  };
  
  const basePath = getBasePath();
  
  // ✅ NUEVO: Usar matchMedia para detección más precisa
  if (isMobile()) {
    return createMobileNavbar(basePath);
  } else {
    return createDesktopNavbar(basePath, currentPage);
  }
}

// ✅ MEJORADO: Función para cargar la navbar con prevención de errores
function loadNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = createNavbar();
    
    // ✅ NUEVO: Asegurar que no haya scroll horizontal después de cargar
    ensureNoHorizontalScroll();
  }
}

// ✅ NUEVO: Función para prevenir scroll horizontal
function ensureNoHorizontalScroll() {
  // Verificar si hay elementos que excedan el viewport
  const body = document.body;
  const html = document.documentElement;
  
  // Forzar recálculo de layout
  setTimeout(() => {
    // Asegurar que no hay scroll horizontal
    if (body.scrollWidth > window.innerWidth) {
      console.warn('⚠️ Detectado scroll horizontal. Aplicando correcciones...');
      
      // Aplicar correcciones de emergencia
      body.style.overflowX = 'hidden';
      html.style.overflowX = 'hidden';
      
      // Buscar elementos problemáticos
      findElementsCausingOverflow();
    }
  }, 100);
}

// ✅ NUEVO: Función para encontrar elementos que causan overflow
function findElementsCausingOverflow() {
  const allElements = document.querySelectorAll('*');
  const viewportWidth = window.innerWidth;
  
  allElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    
    // Si el elemento se extiende más allá del viewport
    if (rect.right > viewportWidth) {
      console.warn('🔍 Elemento que causa overflow:', element, {
        width: rect.width,
        right: rect.right,
        viewportWidth: viewportWidth,
        overflow: rect.right - viewportWidth
      });
      
      // Aplicar corrección automática si es posible
      if (element.classList.contains('barranavegacion')) {
        element.style.maxWidth = '100vw';
        element.style.boxSizing = 'border-box';
      }
    }
  });
}

// ✅ MEJORADO: Función para manejar cambio de tamaño con mejor performance
function handleResize() {
  const navbarContainer = document.getElementById('navbar-container');
  if (!navbarContainer) return;
  
  const wasMobile = navbarContainer.querySelector('.barranavegacion--mobile') !== null;
  const isMobileNow = isMobile();
  
  // Solo regenerar si cambió de móvil a desktop o viceversa
  if (wasMobile !== isMobileNow) {
    navbarContainer.innerHTML = createNavbar();
    
    // ✅ NUEVO: Verificar scroll después del cambio
    ensureNoHorizontalScroll();
  }
}

// ✅ MEJORADO: Debounce más eficiente
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ✅ NUEVO: Función para aplicar estilos críticos de emergencia
function applyCriticalMobileStyles() {
  // Verificar si ya existen los estilos
  if (document.getElementById('critical-mobile-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'critical-mobile-styles';
  style.textContent = `
    /* ✅ PREVENCIÓN DE SCROLL HORIZONTAL - CRÍTICO */
    html, body {
      overflow-x: hidden !important;
      max-width: 100vw !important;
      box-sizing: border-box !important;
    }
    
    /* ✅ NAVBAR MÓVIL - CORRECCIONES CRÍTICAS */
    .barranavegacion--mobile {
      width: calc(100vw - 1rem) !important;
      max-width: calc(100vw - 1rem) !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      padding: 0 0.5rem !important;
      box-sizing: border-box !important;
      justify-content: center !important;
    }
    
    .barranavegacion--mobile .logo-container {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      max-width: 100% !important;
    }
    
    .barranavegacion--mobile .logo-barra {
      height: 24px !important;
      width: auto !important;
      max-width: 200px !important;
    }
    
    /* ✅ NAVBAR DESKTOP - OCULTAR EN MÓVIL */
    @media (max-width: 768px) {
      .barranavegacion--desktop {
        display: none !important;
      }
      
      .barranavegacion--desktop .menu {
        display: none !important;
      }
    }
    
    /* ✅ CORRECCIÓN PARA ELEMENTOS PRINCIPALES */
    @media (max-width: 768px) {
      #navbar-container {
        width: 100% !important;
        max-width: 100vw !important;
        overflow: hidden !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
      
      /* ✅ ASEGURAR QUE TODOS LOS ELEMENTOS SE AJUSTEN */
      * {
        max-width: 100vw !important;
        box-sizing: border-box !important;
      }
      
      /* ✅ ELEMENTOS ESPECÍFICOS QUE PUEDEN CAUSAR PROBLEMAS */
      .gradient-1,
      .first-data,
      .avatarImageCards,
      .tech-container,
      .degradadoAtras {
        max-width: 100vw !important;
        overflow-x: hidden !important;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// ✅ MEJORADO: Función para estilos dinámicos más robusta
function addMobileNavbarStyles() {
  // Aplicar estilos críticos primero
  applyCriticalMobileStyles();
  
  const style = document.createElement('style');
  style.id = 'mobile-navbar-styles';
  style.textContent = `
    /* ✅ ESTILOS ADICIONALES PARA NAVBAR */
    .barranavegacion--mobile {
      transition: all 0.3s ease;
    }
    
    .barranavegacion--mobile:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    
    .logo-container:hover {
      transform: scale(1.05);
      transition: transform 0.2s ease;
    }
    
    /* ✅ MEJOR PERFORMANCE EN MÓVIL */
    @media (max-width: 768px) {
      .barranavegacion {
        will-change: transform;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
    }
  `;
  
  if (!document.getElementById('mobile-navbar-styles')) {
    document.head.appendChild(style);
  }
}

// ✅ NUEVO: Función para monitorear scroll horizontal
function monitorHorizontalScroll() {
  let isMonitoring = false;
  
  function checkScroll() {
    if (document.body.scrollWidth > window.innerWidth) {
      console.warn('⚠️ Scroll horizontal detectado:', {
        bodyWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth,
        difference: document.body.scrollWidth - window.innerWidth
      });
      
      // Aplicar corrección inmediata
      ensureNoHorizontalScroll();
    }
  }
  
  // Verificar periódicamente solo en desarrollo
  if (!isMonitoring && window.location.hostname === 'localhost') {
    isMonitoring = true;
    setInterval(checkScroll, 2000);
  }
}

// ✅ NUEVO: Función de inicialización completa
function initializeNavbar() {
  // 1. Aplicar estilos críticos inmediatamente
  applyCriticalMobileStyles();
  
  // 2. Cargar navbar
  loadNavbar();
  
  // 3. Verificar scroll horizontal
  ensureNoHorizontalScroll();
  
  // 4. Iniciar monitoreo (solo en desarrollo)
  monitorHorizontalScroll();
}

// ✅ EVENTOS MEJORADOS
document.addEventListener('DOMContentLoaded', () => {
  addMobileNavbarStyles();
  initializeNavbar();
});

// ✅ RESIZE OPTIMIZADO
window.addEventListener('resize', debounce(() => {
  handleResize();
  ensureNoHorizontalScroll();
}, 250));

// ✅ NUEVO: Listener para orientación en móviles
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    handleResize();
    ensureNoHorizontalScroll();
  }, 500);
});

// ✅ FUNCIONES UTILITARIAS PÚBLICAS
window.forceNavbarUpdate = loadNavbar;
window.checkHorizontalScroll = ensureNoHorizontalScroll;
window.findOverflowElements = findElementsCausingOverflow;

// ✅ OPCIONAL: Menú hamburguesa mejorado (sin overflow)
function createHamburgerMenu(basePath, currentPage) {
  return `
    <nav class="barranavegacion barranavegacion--mobile-menu" id="barracenter">
      <a href="${basePath}index.html" class="logo-container">
        <img class="logo-barra" src="${basePath}image/estelllarconf-logo.svg" alt="logo" />
      </a>
      
      <button class="hamburger-btn" onclick="toggleMobileMenu()">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div class="mobile-menu" id="mobile-menu">
        <a class="mobile-link" href="${basePath}index.html#comunidad">Porque Nosotros</a>
        <a class="mobile-link" href="${basePath}index.html#experienciaGuiada">¿Qué Aprenderé?</a>
        <a class="mobile-link" href="${basePath}index.html#dataSection">Donde Sera</a>
        <a class="mobile-link ${currentPage === 'mision.html' ? 'active' : ''}" href="${basePath}mision.html">Misión</a>
        <a class="button button__primary mobile-button" onclick="scrollToData()">
          Registrarme &nbsp;<i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </nav>
  `;
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('mobile-menu--open');
    
    // ✅ NUEVO: Verificar que el menú no cause overflow
    setTimeout(ensureNoHorizontalScroll, 100);
  }
}