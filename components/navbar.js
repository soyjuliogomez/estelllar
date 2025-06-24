// components/navbar.js

// ➕ AGREGADO: Función para detectar si está en móvil
function isMobile() {
  return window.innerWidth <= 768;
}

// ➕ AGREGADO: Función para crear navbar móvil (solo logo)
function createMobileNavbar(basePath) {
  return `
    <nav class="barranavegacion barranavegacion--mobile" id="barracenter">
      <a href="${basePath}index.html" class="logo-container">
        <img class="logo-barra" src="${basePath}image/estelllarconf-logo.svg" alt="logo" />
      </a>
    </nav>
  `;
}

// ➕ AGREGADO: Función para crear navbar desktop (completa)
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

// ➕ MODIFICADO: Función principal que decide qué navbar mostrar
function createNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Determinar la ruta base según la página actual
  const getBasePath = () => {
    if (currentPage === 'index.html' || currentPage === '') return '';
    return './'; // Para páginas en subdirectorios o páginas secundarias
  };
  
  const basePath = getBasePath();
  
  // ➕ NUEVO: Detectar tamaño de pantalla y generar HTML apropiado
  if (isMobile()) {
    return createMobileNavbar(basePath);
  } else {
    return createDesktopNavbar(basePath, currentPage);
  }
}

// Función para cargar la navbar
function loadNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = createNavbar();
  }
}

// ➕ AGREGADO: Función para manejar cambio de tamaño de ventana
function handleResize() {
  // Regenerar navbar si el tamaño cambia de móvil a desktop o viceversa
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    const currentHTML = navbarContainer.innerHTML;
    const newHTML = createNavbar();
    
    // Solo actualizar si el HTML cambió (evita parpadeo innecesario)
    if (currentHTML !== newHTML) {
      navbarContainer.innerHTML = newHTML;
    }
  }
}

// ➕ AGREGADO: Debounce para optimizar el resize
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

// Cargar la navbar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadNavbar);

// ➕ AGREGADO: Escuchar cambios de tamaño de ventana
window.addEventListener('resize', debounce(handleResize, 250));

// ➕ AGREGADO: Función para forzar actualización (útil para debugging)
function forceNavbarUpdate() {
  loadNavbar();
}

// ➕ AGREGADO: Funciones utilitarias para CSS dinámico
function addMobileNavbarStyles() {
  const style = document.createElement('style');
  style.id = 'mobile-navbar-styles';
  style.textContent = `
    .barranavegacion--mobile {
      justify-content: center !important;
      padding: 0 1rem !important;
    }
    
    .barranavegacion--mobile .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    
    .barranavegacion--desktop .menu {
      display: flex;
    }
    
    @media (max-width: 768px) {
      .barranavegacion--desktop .menu {
        display: none !important;
      }
    }
  `;
  
  // Solo agregar si no existe
  if (!document.getElementById('mobile-navbar-styles')) {
    document.head.appendChild(style);
  }
}

// ➕ AGREGADO: Inicializar estilos dinámicos
document.addEventListener('DOMContentLoaded', () => {
  addMobileNavbarStyles();
  loadNavbar();
});

// ➕ OPCIONAL: Función para menú hamburguesa (si la quieres agregar después)
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

// ➕ OPCIONAL: Función para toggle del menú móvil
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('mobile-menu--open');
  }
}