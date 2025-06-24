/**
 * Auto-centrado inteligente para sponsors
 * Detecta automáticamente cuántos sponsors hay y los centra apropiadamente
 */

class SponsorsAutoCenter {
    constructor() {
        this.init();
    }

    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSponsors());
        } else {
            this.setupSponsors();
        }
    }

    setupSponsors() {
        const sponsorsGrid = document.querySelector('.sponsors-grid');
        if (!sponsorsGrid) {
            console.warn('⚠️ No se encontró .sponsors-grid');
            return;
        }

        const sponsorItems = sponsorsGrid.querySelectorAll('.sponsor-item');
        const totalSponsors = sponsorItems.length;

        this.applyCenteringLogic(sponsorsGrid, totalSponsors);
        this.setupResponsiveObserver(sponsorsGrid, totalSponsors);
        
        console.log(`✅ Auto-centrado aplicado para ${totalSponsors} sponsors`);
    }

    applyCenteringLogic(grid, total) {
        // Limpiar clases previas
        grid.classList.remove('single-last', 'double-last', 'triple-last');

        // Determinar cuántos elementos hay en la última fila
        const remainder = total % 4;

        switch (remainder) {
            case 1:
                grid.classList.add('single-last');
                console.log('📍 Aplicando centrado para 1 elemento en última fila');
                break;
            case 2:
                grid.classList.add('double-last');
                console.log('📍 Aplicando centrado para 2 elementos en última fila');
                break;
            case 3:
                grid.classList.add('triple-last');
                console.log('📍 Aplicando centrado para 3 elementos en última fila');
                break;
            case 0:
                console.log('📍 Todas las filas están completas (4 elementos)');
                break;
        }

        // Agregar data attribute para CSS adicional
        grid.setAttribute('data-total-sponsors', total);
        grid.setAttribute('data-last-row-count', remainder || 4);
    }

    setupResponsiveObserver(grid, total) {
        // Observar cambios de tamaño de pantalla
        const mediaQueryLists = [
            window.matchMedia('(max-width: 480px)'),   // 1 columna
            window.matchMedia('(max-width: 768px)'),   // 2 columnas  
            window.matchMedia('(max-width: 1024px)'),  // 3 columnas
        ];

        mediaQueryLists.forEach(mql => {
            mql.addEventListener('change', () => {
                this.updateResponsiveCentering(grid, total);
            });
        });

        // Aplicar centrado inicial
        this.updateResponsiveCentering(grid, total);
    }

    updateResponsiveCentering(grid, total) {
        const isMobile = window.matchMedia('(max-width: 480px)').matches;
        const isTablet = window.matchMedia('(max-width: 768px)').matches;
        const isSmallDesktop = window.matchMedia('(max-width: 1024px)').matches;

        let columns, remainder;

        if (isMobile) {
            columns = 1;
            remainder = 0; // En 1 columna todo está centrado
        } else if (isTablet) {
            columns = 2;
            remainder = total % 2;
        } else if (isSmallDesktop) {
            columns = 3;
            remainder = total % 3;
        } else {
            columns = 4;
            remainder = total % 4;
        }

        // Actualizar atributos
        grid.setAttribute('data-columns', columns);
        grid.setAttribute('data-current-remainder', remainder);

        console.log(`📱 Responsive: ${columns} columnas, ${remainder} en última fila`);
    }

    // Método público para agregar sponsors dinámicamente
    addSponsor(sponsorData) {
        const grid = document.querySelector('.sponsors-grid');
        if (!grid) return;

        const sponsorHTML = `
            <div class="sponsor-item">
                <a href="${sponsorData.url}" target="_blank" rel="noopener noreferrer" 
                   class="sponsor-link" aria-label="Visitar sitio web de ${sponsorData.name}">
                    <div class="sponsor-logo">
                        <img src="${sponsorData.defaultImage}" 
                             alt="${sponsorData.name}" 
                             class="sponsor-img sponsor-img--default">
                        <img src="${sponsorData.hoverImage}" 
                             alt="${sponsorData.name}" 
                             class="sponsor-img sponsor-img--hover">
                    </div>
                </a>
            </div>
        `;

        grid.insertAdjacentHTML('beforeend', sponsorHTML);
        
        // Recalcular centrado
        const newTotal = grid.querySelectorAll('.sponsor-item').length;
        this.applyCenteringLogic(grid, newTotal);
        
        console.log(`➕ Sponsor agregado: ${sponsorData.name} (Total: ${newTotal})`);
    }

    // Método público para remover sponsor
    removeSponsor(index) {
        const grid = document.querySelector('.sponsors-grid');
        if (!grid) return;

        const sponsors = grid.querySelectorAll('.sponsor-item');
        if (sponsors[index]) {
            sponsors[index].remove();
            
            // Recalcular centrado
            const newTotal = grid.querySelectorAll('.sponsor-item').length;
            this.applyCenteringLogic(grid, newTotal);
            
            console.log(`➖ Sponsor removido en índice ${index} (Total: ${newTotal})`);
        }
    }

    // Método público para obtener información actual
    getInfo() {
        const grid = document.querySelector('.sponsors-grid');
        if (!grid) return null;

        const total = grid.querySelectorAll('.sponsor-item').length;
        const remainder = total % 4;
        
        return {
            total,
            remainder,
            lastRowCount: remainder || 4,
            isLastRowComplete: remainder === 0
        };
    }
}

// CSS adicional inyectado por JavaScript
const additionalCSS = `
    /* Centrado automático inteligente */
    .sponsors-grid[data-last-row-count="1"] .sponsor-item:last-child {
        grid-column: 2 / 4;
    }
    
    .sponsors-grid[data-last-row-count="2"] .sponsor-item:nth-last-child(-n+2) {
        justify-self: center;
    }
    
    .sponsors-grid[data-last-row-count="3"] .sponsor-item:nth-last-child(-n+3):first-of-type {
        margin-left: 0.5fr;
    }
    
    /* Animación suave al cambiar layout */
    .sponsor-item {
        transition: all 0.3s ease;
    }
    
    /* Responsive adjustments */
    @media (max-width: 1024px) {
        .sponsors-grid[data-columns="3"][data-current-remainder="1"] .sponsor-item:last-child {
            grid-column: 2 / 3;
        }
    }
    
    @media (max-width: 768px) {
        .sponsors-grid[data-columns="2"][data-current-remainder="1"] .sponsor-item:last-child {
            grid-column: 1 / 3;
        }
    }
`;

// Inyectar CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Auto-inicializar
const sponsorsAutoCenter = new SponsorsAutoCenter();

// Exponer métodos globalmente
window.SponsorsManager = {
    add: (sponsorData) => sponsorsAutoCenter.addSponsor(sponsorData),
    remove: (index) => sponsorsAutoCenter.removeSponsor(index),
    info: () => sponsorsAutoCenter.getInfo()
};

// Ejemplos de uso:
/*
// Agregar un sponsor
window.SponsorsManager.add({
    name: 'Nuevo Sponsor',
    url: 'https://nuevosponsor.com',
    defaultImage: './image/sponsors/nuevo-default.svg',
    hoverImage: './image/sponsors/nuevo-color.svg'
});

// Remover sponsor por índice (empezando en 0)
window.SponsorsManager.remove(2);

// Obtener información actual
console.log(window.SponsorsManager.info());
*/