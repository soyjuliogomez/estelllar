// components/navbar.js
function createNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Determinar la ruta base según la página actual
    const getBasePath = () => {
      if (currentPage === 'index.html' || currentPage === '') return '';
      return './'; // Para páginas en subdirectorios o páginas secundarias
    };
    
    const basePath = getBasePath();
    
    const navbarHTML = `
      <nav class="barranavegacion" id="barracenter">
        <a href="${basePath}index.html">
  <img class="logo-barra" src="${basePath}image/estelllarconf-logo.svg" alt="logo" />
</a>
        
        <div class="menu">
          <a class="linksNavegacion" href="${basePath}index.html#comunidad">Porque Nosotros</a>
          <a class="linksNavegacion" href="${basePath}index.html#experienciaGuiada">¿Qué Aprenderé?</a>
          <a class="linksNavegacion" href="${basePath}index.html#dataSection">Donde Sera</a>
          <a class="linksNavegacion ${currentPage === 'mision.html' ? 'active' : ''}" href="${basePath}mision.html">Misión</a>
          
          <hr />
          <div class="botones-usuario">
            <a class="button button__primary" onclick="scrollToData()">Registrarme &nbsp;<i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </nav>
    `;
    
    return navbarHTML;
  }
  
  // Función para cargar la navbar
  function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
      navbarContainer.innerHTML = createNavbar();
    }
  }
  
  // Cargar la navbar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', loadNavbar);