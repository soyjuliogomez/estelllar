/**
 * Auto-centrado inteligente para sponsors - SIN SCROLL HORIZONTAL
 * Versión corregida que elimina completamente el parpadeo y scroll
 */

class SponsorsAutoCenter {
    constructor() {
        this.isInitialized = false;
        this.resizeTimeout = null;
        this.animationFrameId = null;
        this.init();
    }

    init() {
        // ✅ MEJORADO: Esperar completamente a que todo esté cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // ✅ Esperar que las imágenes y CSS estén completamente cargados
                window.addEventListener('load', () => {
                    this.animationFrameId = requestAnimationFrame(() => {
                        setTimeout(() => this.setupSponsors(), 100);
                    });
                });
            });
        } else {
            // Si ya está cargado, esperar un poco más para asegurar estabilidad
            setTimeout(() => {
                this.animationFrameId = requestAnimationFrame(() => {
                    this.setupSponsors();
                });
            }, 150);
        }
    }

    setupSponsors() {
        const sponsorsGrid = document.querySelector('.sponsors-grid');
        if (!sponsorsGrid) {
            console.warn('⚠️ No se encontró .sponsors-grid');
            return;
        }

        // ✅ CRÍTICO: Establecer estilos de prevención antes de cualquier manipulación
        this.applyPreventionStyles(sponsorsGrid);

        const sponsorItems = sponsorsGrid.querySelectorAll('.sponsor-item');
        const totalSponsors = sponsorItems.length;

        if (totalSponsors === 0) {
            console.warn('⚠️ No se encontraron sponsor items');
            return;
        }

        // ✅ MEJORADO: Aplicar lógica sin causar layout shifts
        this.applyCenteringLogicSafe(sponsorsGrid, totalSponsors);
        this.setupResponsiveObserver(sponsorsGrid, totalSponsors);
        
        this.isInitialized = true;
        console.log(`✅ Auto-centrado aplicado para ${totalSponsors} sponsors (sin scroll)`);
    }

    // ✅ NUEVO: Aplicar estilos de prevención más agresivos
    applyPreventionStyles(grid) {
        // ✅ CRÍTICO: Forzar dimensiones estables
        const rect = grid.getBoundingClientRect();
        
        // Aplicar estilos de forma que no cause reflow
        const styles = {
            'overflow-x': 'hidden',
            'max-width': '100%',
            'width': '100%',
            'box-sizing': 'border-box',
            'contain': 'layout style',
            'will-change': 'auto'
        };

        Object.entries(styles).forEach(([prop, value]) => {
            grid.style.setProperty(prop, value, 'important');
        });

        // ✅ PREVENIR que el contenedor padre cause problemas
        const sponsors = grid.closest('.sponsors');
        const sponsorsContent = grid.closest('.sponsors-content') || sponsors;
        
        [sponsors, sponsorsContent].forEach(container => {
            if (container) {
                container.style.setProperty('overflow-x', 'hidden', 'important');
                container.style.setProperty('max-width', '100vw', 'important');
                container.style.setProperty('box-sizing', 'border-box', 'important');
            }
        });

        // ✅ PREVENIR que items individuales causen overflow
        const items = grid.querySelectorAll('.sponsor-item');
        items.forEach(item => {
            item.style.setProperty('max-width', '100%', 'important');
            item.style.setProperty('box-sizing', 'border-box', 'important');
            item.style.setProperty('min-width', '0', 'important');
        });
    }

    // ✅ MEJORADO: Aplicar centrado sin layout shifts
    applyCenteringLogicSafe(grid, total) {
        // ✅ NO tocar transiciones que puedan causar reflow
        // grid.style.transition = 'none'; // ❌ ELIMINAR ESTO
        
        // Limpiar clases previas de forma segura
        const classesToRemove = ['single-last', 'double-last', 'triple-last'];
        classesToRemove.forEach(className => {
            if (grid.classList.contains(className)) {
                grid.classList.remove(className);
            }
        });

        // Determinar cuántos elementos hay en la última fila
        const columns = this.getCurrentColumns();
        const remainder = total % columns;

        // ✅ SOLO aplicar clases, no modificar estilos inline
        switch (remainder) {
            case 1:
                grid.classList.add('single-last');
                break;
            case 2:
                grid.classList.add('double-last');
                break;
            case 3:
                grid.classList.add('triple-last');
                break;
        }

        // Agregar data attributes de forma segura
        grid.setAttribute('data-total-sponsors', total);
        grid.setAttribute('data-last-row-count', remainder || columns);
        grid.setAttribute('data-columns', columns);
        
        // ✅ NO reactivar transiciones
        // requestAnimationFrame(() => { grid.style.transition = ''; }); // ❌ ELIMINAR
    }

    setupResponsiveObserver(grid, total) {
        // ✅ MEJORADO: Debounce más agresivo
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                if (!this.isInitialized) return;
                
                // ✅ DEBOUNCE más largo para evitar múltiples cambios
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.updateResponsiveCenteringSafe(grid, total);
                }, 250); // Aumentado de 100ms a 250ms
            });
            
            // ✅ OBSERVAR solo el viewport, no el body
            resizeObserver.observe(document.documentElement);
        } else {
            this.setupMediaQueryObserver(grid, total);
        }

        // Aplicar centrado inicial
        this.updateResponsiveCenteringSafe(grid, total);
    }

    setupMediaQueryObserver(grid, total) {
        const mediaQueryLists = [
            window.matchMedia('(max-width: 480px)'),
            window.matchMedia('(max-width: 768px)'),
            window.matchMedia('(max-width: 1024px)'),
        ];

        mediaQueryLists.forEach(mql => {
            mql.addEventListener('change', () => {
                if (!this.isInitialized) return;
                
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.updateResponsiveCenteringSafe(grid, total);
                }, 250);
            });
        });
    }

    // ✅ NUEVO: Actualización responsiva más segura
    updateResponsiveCenteringSafe(grid, total) {
        const currentColumns = parseInt(grid.getAttribute('data-columns')) || 4;
        const newColumns = this.getCurrentColumns();
        
        // ✅ PREVENIR cambios innecesarios más estrictamente
        if (currentColumns === newColumns) {
            return;
        }

        const remainder = total % newColumns;

        // ✅ NO modificar transiciones inline
        // grid.style.transition = 'none'; // ❌ ELIMINAR
        
        // Actualizar SOLO atributos, no estilos
        grid.setAttribute('data-columns', newColumns);
        grid.setAttribute('data-current-remainder', remainder);

        // ✅ Verificar overflow de forma no intrusiva
        this.checkOverflowSafe(grid);
    }

    getCurrentColumns() {
        const width = window.innerWidth;
        
        if (width <= 480) return 2;
        if (width <= 768) return 2;
        if (width <= 1024) return 3;
        return 4;
    }

    // ✅ NUEVO: Verificación de overflow sin modificar estilos
    checkOverflowSafe(grid) {
        // ✅ Solo verificar, no aplicar correcciones automáticas
        const containerWidth = grid.parentElement ? grid.parentElement.offsetWidth : window.innerWidth;
        const gridWidth = grid.scrollWidth;
        
        if (gridWidth > containerWidth) {
            console.warn('⚠️ Detectado overflow en sponsors:', {
                containerWidth,
                gridWidth,
                difference: gridWidth - containerWidth
            });
            
            // ✅ Solo registrar, no modificar estilos automáticamente
            // Esto permite debug sin causar layout shifts
        }
    }

    // ✅ MEJORADO: Agregar sponsors sin causar layout shifts
    addSponsor(sponsorData) {
        const grid = document.querySelector('.sponsors-grid');
        if (!grid) return;

        // ✅ NO modificar transiciones
        // grid.style.transition = 'none'; // ❌ ELIMINAR

        const sponsorHTML = `
            <div class="sponsor-item" style="opacity: 0; transform: translateY(10px);">
                <a href="${sponsorData.url}" target="_blank" rel="noopener noreferrer" 
                   class="sponsor-link" aria-label="Visitar sitio web de ${sponsorData.name}">
                    <div class="sponsor-logo">
                        <img src="${sponsorData.defaultImage}" 
                             alt="${sponsorData.name}" 
                             class="sponsor-img sponsor-img--default"
                             loading="lazy">
                        <img src="${sponsorData.hoverImage}" 
                             alt="${sponsorData.name}" 
                             class="sponsor-img sponsor-img--hover"
                             loading="lazy">
                    </div>
                </a>
            </div>
        `;

        grid.insertAdjacentHTML('beforeend', sponsorHTML);
        
        // ✅ Animar de forma más suave
        const newItem = grid.lastElementChild;
        this.animateItemIn(newItem);
        
        // Recalcular centrado
        const newTotal = grid.querySelectorAll('.sponsor-item').length;
        this.applyCenteringLogicSafe(grid, newTotal);
        
        console.log(`➕ Sponsor agregado: ${sponsorData.name} (Total: ${newTotal})`);
    }

    // ✅ NUEVO: Animación de entrada más controlada
    animateItemIn(item) {
        // Usar Web Animations API si está disponible
        if (item.animate) {
            item.animate([
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 300,
                easing: 'ease',
                fill: 'forwards'
            });
        } else {
            // Fallback
            requestAnimationFrame(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            });
        }
    }

    removeSponsor(index) {
        const grid = document.querySelector('.sponsors-grid');
        if (!grid) return;

        const sponsors = grid.querySelectorAll('.sponsor-item');
        if (sponsors[index]) {
            const item = sponsors[index];
            
            // ✅ Usar Web Animations API
            if (item.animate) {
                const animation = item.animate([
                    { opacity: 1, transform: 'translateY(0)' },
                    { opacity: 0, transform: 'translateY(-10px)' }
                ], {
                    duration: 300,
                    easing: 'ease'
                });
                
                animation.addEventListener('finish', () => {
                    item.remove();
                    const newTotal = grid.querySelectorAll('.sponsor-item').length;
                    this.applyCenteringLogicSafe(grid, newTotal);
                    console.log(`➖ Sponsor removido en índice ${index} (Total: ${newTotal})`);
                });
            } else {
                // Fallback
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    item.remove();
                    const newTotal = grid.querySelectorAll('.sponsor-item').length;
                    this.applyCenteringLogicSafe(grid, newTotal);
                    console.log(`➖ Sponsor removido en índice ${index} (Total: ${newTotal})`);
                }, 300);
            }
        }
    }

    getInfo() {
        const grid = document.querySelector('.sponsors-grid');
        if (!grid) return null;

        const total = grid.querySelectorAll('.sponsor-item').length;
        const columns = this.getCurrentColumns();
        const remainder = total % columns;
        
        return {
            total,
            columns,
            remainder,
            lastRowCount: remainder || columns,
            isLastRowComplete: remainder === 0,
            hasOverflow: grid.scrollWidth > grid.offsetWidth,
            containerWidth: grid.parentElement ? grid.parentElement.offsetWidth : window.innerWidth,
            gridWidth: grid.scrollWidth
        };
    }

    // ✅ NUEVO: Método para limpiar recursos
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }
}

// ✅ CSS CORREGIDO - MÁS ESTRICTO CONTRA OVERFLOW
const additionalCSS = `
    /* ✅ PREVENCIÓN ESTRICTA DE OVERFLOW */
    html, body {
        overflow-x: hidden !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
    }
    
    /* ✅ CONTENEDORES SPONSORS - ANTI-OVERFLOW */
    .sponsors,
    .sponsors-content,
    .sponsors-grid {
        overflow-x: hidden !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        contain: layout style;
    }
    
    /* ✅ GRID ESTABLE - SIN LAYOUT SHIFTS */
    .sponsors-grid {
        width: 100% !important;
        will-change: auto;
        transform: translateZ(0); /* Forzar GPU layer */
    }
    
    /* ✅ ITEMS CONTROLADOS */
    .sponsor-item {
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        will-change: auto;
        contain: layout style;
    }
    
    /* ✅ LINKS SIN OVERFLOW EN HOVER */
    .sponsor-link {
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        
        /* ✅ HOVER MÁS CONTROLADO */
        transition: transform 0.2s ease !important;
    }
    
    .sponsor-link:hover {
        /* ✅ SCALE MÁS PEQUEÑO PARA EVITAR OVERFLOW */
        transform: translateY(-1px) scale(1.01) !important;
    }
    
    /* ✅ CENTRADO SIN PROBLEMAS */
    .sponsors-grid[data-last-row-count="1"] .sponsor-item:last-child {
        grid-column: 2 / 4;
        justify-self: center;
        max-width: 200px; /* ✅ LIMITAR ANCHO */
    }
    
    .sponsors-grid[data-last-row-count="2"] .sponsor-item:nth-last-child(-n+2) {
        justify-self: center;
    }
    
    .sponsors-grid[data-last-row-count="3"] {
        justify-items: center;
    }
    
    /* ✅ RESPONSIVE MÁS ESTRICTO */
    @media (max-width: 1024px) {
        .sponsors-grid[data-columns="3"][data-current-remainder="1"] .sponsor-item:last-child {
            grid-column: 2 / 3;
            justify-self: center;
            max-width: 180px;
        }
    }
    
    @media (max-width: 768px) {
        .sponsors-grid[data-columns="2"][data-current-remainder="1"] .sponsor-item:last-child {
            grid-column: 1 / 3;
            justify-self: center;
            max-width: 160px;
        }
    }
    
    /* ✅ MÓVIL - MÁXIMA PREVENCIÓN */
    @media (max-width: 480px) {
        .sponsors-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        
        .sponsor-item {
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
        }
        
        .sponsor-link:hover {
            transform: none !important; /* ✅ SIN HOVER EN MÓVIL */
        }
    }
    
    /* ✅ DEBUGGING */
    .debug-sponsors-overflow .sponsor-item {
        outline: 1px solid rgba(255, 0, 0, 0.3) !important;
    }
    
    .debug-sponsors-overflow .sponsors-grid {
        background: rgba(0, 255, 0, 0.1) !important;
    }
`;

// ✅ INYECCIÓN DE CSS MÁS SEGURA
function injectCSSSafe() {
    // Verificar si ya existe
    const existingStyle = document.getElementById('sponsors-auto-center-styles');
    if (existingStyle) {
        return; // No re-inyectar
    }
    
    const style = document.createElement('style');
    style.id = 'sponsors-auto-center-styles';
    style.textContent = additionalCSS;
    
    // Insertar al principio del head para mayor prioridad
    const firstStyle = document.head.querySelector('style');
    if (firstStyle) {
        document.head.insertBefore(style, firstStyle);
    } else {
        document.head.appendChild(style);
    }
}

// ✅ INICIALIZACIÓN MÁS ROBUSTA
function initializeSponsors() {
    // Inyectar CSS de forma segura
    injectCSSSafe();
    
    // Esperar un frame para asegurar que el CSS se aplicó
    requestAnimationFrame(() => {
        const sponsorsAutoCenter = new SponsorsAutoCenter();
        
        // Exponer métodos globalmente
        window.SponsorsManager = {
            add: (sponsorData) => sponsorsAutoCenter.addSponsor(sponsorData),
            remove: (index) => sponsorsAutoCenter.removeSponsor(index),
            info: () => sponsorsAutoCenter.getInfo(),
            debug: () => {
                const info = sponsorsAutoCenter.getInfo();
                console.table(info);
                if (info?.hasOverflow) {
                    console.warn('⚠️ Se detectó overflow horizontal');
                    document.body.classList.add('debug-sponsors-overflow');
                }
                return info;
            },
            destroy: () => sponsorsAutoCenter.destroy()
        };
        
        return sponsorsAutoCenter;
    });
}

// ✅ AUTO-INICIALIZAR MÁS SEGURO
let sponsorsInstance = null;

// Usar evento más específico
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSponsors);
} else {
    // Si ya está cargado, inicializar inmediatamente
    initializeSponsors();
}

// ✅ DEBUGGING MEJORADO
window.debugSponsorsOverflow = function() {
    const grid = document.querySelector('.sponsors-grid');
    if (!grid) {
        console.warn('❌ No se encontró .sponsors-grid');
        return;
    }
    
    const info = {
        'Grid scrollWidth': grid.scrollWidth,
        'Grid offsetWidth': grid.offsetWidth,
        'Grid clientWidth': grid.clientWidth,
        'Window innerWidth': window.innerWidth,
        'Has overflow': grid.scrollWidth > grid.offsetWidth,
        'Overflow amount': Math.max(0, grid.scrollWidth - grid.offsetWidth) + 'px'
    };
    
    console.table(info);
    
    // Encontrar elementos problemáticos
    const items = grid.querySelectorAll('.sponsor-item');
    const problematicItems = [];
    
    items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        
        if (rect.right > gridRect.right + 1) { // +1 para tolerancia
            problematicItems.push({
                index,
                itemRight: rect.right,
                gridRight: gridRect.right,
                overflow: rect.right - gridRect.right
            });
        }
    });
    
    if (problematicItems.length > 0) {
        console.warn('⚠️ Items que causan overflow:', problematicItems);
        // Activar modo debug visual
        document.body.classList.add('debug-sponsors-overflow');
    } else {
        console.log('✅ No se encontraron items problemáticos');
        document.body.classList.remove('debug-sponsors-overflow');
    }
    
    return { info, problematicItems };
};