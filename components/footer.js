/**
 * Footer Component - EstelllarConf (Escalable)
 * Componente reutilizable para todas las páginas
 * Uso: <script src="./js/footer.js"></script>
 */

class EstelllarFooter {
    constructor() {
        this.config = {
            companyName: 'EstelllarConf',
            logoSrc: './image/logo-footer.svg',
            logoAlt: 'EstelllarConf - Conferencia de Innovación Digital',
            socialMedia: [
                {
                    platform: 'facebook',
                    name: 'Facebook',
                    url: 'https://www.facebook.com/estelllar',
                    normalIcon: '../image/social-media/socialMediaFacebook.svg',
                    hoverIcon: '../image/social-media/socialMediaFacebookHover.svg'
                },
                {
                    platform: 'twitter', 
                    name: 'X (Twitter)',
                    url: 'https://x.com/estelllarec',
                    normalIcon: '../image/social-media/socialMediaX.svg',
                    hoverIcon: '../image/social-media/socialMediaXHover.svg'
                },
                {
                    platform: 'instagram',
                    name: 'Instagram', 
                    url: 'https://www.instagram.com/estelllarconf/',
                    normalIcon: '../image/social-media/socialMediaInstagram.svg',
                    hoverIcon: '../image/social-media/socialMediaInstagramHover.svg'
                },
                {
                    platform: 'linkedin',  // ✅ CORREGIDO: era 'instagram'
                    name: 'LinkedIn', 
                    url: 'https://www.linkedin.com/company/estelllar/',
                    normalIcon: '../image/social-media/socialMediaLinkedIn.svg',
                    hoverIcon: '../image/social-media/socialMediaLinkedInHover.svg'
                }
                // ✅ FÁCIL AGREGAR MÁS:
                /*
                {
                    platform: 'youtube',
                    name: 'YouTube',
                    url: 'https://www.youtube.com/@estelllar',
                    normalIcon: '../image/social-media/socialMediaYouTube.svg',
                    hoverIcon: '../image/social-media/socialMediaYouTubeHover.svg'
                },
                {
                    platform: 'tiktok',
                    name: 'TikTok',
                    url: 'https://www.tiktok.com/@estelllar',
                    normalIcon: '../image/social-media/socialMediaTikTok.svg',
                    hoverIcon: '../image/social-media/socialMediaTikTokHover.svg'
                }
                */
            ]
        };
        
        this.init();
    }

    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    // Generar el HTML del footer (mejorado y escalable)
    generateFooterHTML() {
        const socialMediaHTML = this.config.socialMedia.map((social, index) => `
            <div class="social-container" data-platform="${social.platform}">
                <div class="glow-element ${social.platform}-glow"></div>
                <a 
                    href="${social.url}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="social ${social.platform}"
                    aria-label="Síguenos en ${social.name}"
                    title="${this.config.companyName} en ${social.name}"
                    itemprop="sameAs"
                    data-platform="${social.platform}"
                    data-index="${index}"
                    style="background-image: url('${social.normalIcon}')"
                ></a>
            </div>
        `).join('');
    
        return `
            <img 
                class="logo-footer" 
                src="${this.config.logoSrc}" 
                alt="${this.config.logoAlt}" 
                itemprop="logo"
            />
            
            <div class="footer-social-media">
                ${socialMediaHTML}
            </div>
            
            <p class="footerCopy" itemprop="copyrightNotice">
                Copyright © 
                <span itemprop="name">${this.config.companyName}</span> 
                <span id="currentYear">${new Date().getFullYear()}</span>. 
                Todos los derechos reservados.
            </p>
        `;
    }

    // Generar CSS dinámico para todas las redes sociales
    generateDynamicCSS() {
        let css = '';
        
        this.config.socialMedia.forEach(social => {
            css += `
                .social.${social.platform} {
                    background-image: url('${social.normalIcon}');
                }
                
                .social-container:hover .social.${social.platform} {
                    background-image: url('${social.hoverIcon}');
                }
            `;
        });
        
        return css;
    }

    // Inyectar CSS dinámico
    injectDynamicCSS() {
        // Remover CSS dinámico anterior si existe
        const existingStyle = document.getElementById('footer-dynamic-css');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Crear nuevo CSS dinámico
        const style = document.createElement('style');
        style.id = 'footer-dynamic-css';
        style.textContent = this.generateDynamicCSS();
        document.head.appendChild(style);
    }

    // Generar structured data para SEO
    generateStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": this.config.companyName,
            "url": window.location.origin,
            "logo": `${window.location.origin}/${this.config.logoSrc}`,
            "sameAs": this.config.socialMedia.map(social => social.url),
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["Spanish", "English"]
            }
        };

        // Agregar structured data al head si no existe
        if (!document.querySelector('script[type="application/ld+json"]')) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData, null, 2);
            document.head.appendChild(script);
        }
    }

    // Renderizar el footer
    render() {
        // Buscar el contenedor específico del footer
        const footerContainer = document.getElementById('footer-container');
        if (!footerContainer) {
            console.error('❌ Error: No se encontró el elemento con id="footer-container"');
            return;
        }

        // Generar e inyectar CSS dinámico
        this.injectDynamicCSS();

        // Generar el HTML del footer
        const footerHTML = this.generateFooterHTML();
        
        // Insertar el footer en el contenedor
        footerContainer.innerHTML = footerHTML;

        // Agregar structured data
        this.generateStructuredData();

        // Inicializar funcionalidades
        this.initializeFeatures();

        console.log(`✅ EstelllarFooter loaded with ${this.config.socialMedia.length} social networks`);
    }

    // Inicializar características del footer
    initializeFeatures() {
        this.updateCurrentYear();
        this.setupAccessibility();
        this.setupAnalytics();
        this.setupHoverEffects();
    }

    // Configurar accesibilidad (mejorado)
    setupAccessibility() {
        const socialLinks = document.querySelectorAll('.footer-social-media .social');
        
        socialLinks.forEach(link => {
            link.addEventListener('focus', (e) => {
                e.target.closest('.social-container').classList.add('focused');
            });
            
            link.addEventListener('blur', (e) => {
                e.target.closest('.social-container').classList.remove('focused');
            });

            // Mejorar navegación por teclado
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }

    // Setup de analytics escalable para cualquier red social
    setupAnalytics() {
        const socialLinks = document.querySelectorAll('.footer-social-media .social');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = e.target.dataset.platform;
                const socialConfig = this.config.socialMedia.find(s => s.platform === platform);
                const platformName = socialConfig ? socialConfig.name : platform;
                
                // Google Analytics event (si está disponible)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'social_click', {
                        'social_platform': platformName,
                        'social_url': e.target.href,
                        'page_location': window.location.href
                    });
                }
                
                // Console log para debugging
                console.log(`📊 Social click tracked: ${platformName} (${platform})`);
                
                // Custom event para otros trackers
                window.dispatchEvent(new CustomEvent('footerSocialClick', {
                    detail: {
                        platform: platform,
                        name: platformName,
                        url: e.target.href,
                        timestamp: new Date().toISOString()
                    }
                }));
            });
        });
    }

    // Setup de efectos hover dinámicos
    setupHoverEffects() {
        const socialContainers = document.querySelectorAll('.social-container');
        
        socialContainers.forEach(container => {
            const socialLink = container.querySelector('.social');
            const platform = socialLink.dataset.platform;
            const socialConfig = this.config.socialMedia.find(s => s.platform === platform);
            
            if (socialConfig) {
                container.addEventListener('mouseenter', () => {
                    socialLink.style.backgroundImage = `url('${socialConfig.hoverIcon}')`;
                });
                
                container.addEventListener('mouseleave', () => {
                    socialLink.style.backgroundImage = `url('${socialConfig.normalIcon}')`;
                });
            }
        });
    }

    // Actualizar año automáticamente
    updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // =========================================
    // MÉTODOS PÚBLICOS PARA GESTIÓN DINÁMICA
    // =========================================

    // Agregar nueva red social dinámicamente
    addSocialNetwork(socialData) {
        // Validar datos requeridos
        const requiredFields = ['platform', 'name', 'url', 'normalIcon', 'hoverIcon'];
        const missingFields = requiredFields.filter(field => !socialData[field]);
        
        if (missingFields.length > 0) {
            console.error(`❌ Faltan campos requeridos: ${missingFields.join(', ')}`);
            return false;
        }

        // Verificar si ya existe la plataforma
        const existingIndex = this.config.socialMedia.findIndex(s => s.platform === socialData.platform);
        
        if (existingIndex !== -1) {
            console.warn(`⚠️ La plataforma '${socialData.platform}' ya existe. Actualizando...`);
            this.config.socialMedia[existingIndex] = socialData;
        } else {
            this.config.socialMedia.push(socialData);
            console.log(`✅ Nueva red social agregada: ${socialData.name}`);
        }

        // Re-renderizar footer
        this.render();
        return true;
    }

    // Remover red social
    removeSocialNetwork(platform) {
        const initialLength = this.config.socialMedia.length;
        this.config.socialMedia = this.config.socialMedia.filter(s => s.platform !== platform);
        
        if (this.config.socialMedia.length < initialLength) {
            console.log(`✅ Red social removida: ${platform}`);
            this.render();
            return true;
        } else {
            console.warn(`⚠️ No se encontró la plataforma: ${platform}`);
            return false;
        }
    }

    // Obtener todas las redes sociales
    getSocialNetworks() {
        return [...this.config.socialMedia]; // Retorna copia para evitar mutación
    }

    // Actualizar configuración de red social específica
    updateSocialNetwork(platform, updates) {
        const socialIndex = this.config.socialMedia.findIndex(s => s.platform === platform);
        
        if (socialIndex !== -1) {
            this.config.socialMedia[socialIndex] = {
                ...this.config.socialMedia[socialIndex],
                ...updates
            };
            console.log(`✅ Red social actualizada: ${platform}`);
            this.render();
            return true;
        } else {
            console.warn(`⚠️ No se encontró la plataforma: ${platform}`);
            return false;
        }
    }

    // Método público para actualizar configuración completa
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.render();
    }

    // Método público para obtener configuración actual
    getConfig() {
        return { ...this.config }; // Retorna copia para evitar mutación
    }

    // Validar configuración
    validateConfig() {
        const errors = [];
        
        if (!this.config.companyName) errors.push('companyName es requerido');
        if (!this.config.logoSrc) errors.push('logoSrc es requerido');
        if (!Array.isArray(this.config.socialMedia)) errors.push('socialMedia debe ser un array');
        
        this.config.socialMedia.forEach((social, index) => {
            const requiredFields = ['platform', 'name', 'url', 'normalIcon', 'hoverIcon'];
            requiredFields.forEach(field => {
                if (!social[field]) {
                    errors.push(`socialMedia[${index}].${field} es requerido`);
                }
            });
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Auto-inicializar el componente
window.EstelllarFooter = new EstelllarFooter();

// =========================================
// API PÚBLICA GLOBAL EXPANDIDA
// =========================================

// Métodos existentes
window.updateFooterConfig = (config) => window.EstelllarFooter.updateConfig(config);
window.getFooterConfig = () => window.EstelllarFooter.getConfig();

// Nuevos métodos para gestión de redes sociales
window.addSocialNetwork = (socialData) => window.EstelllarFooter.addSocialNetwork(socialData);
window.removeSocialNetwork = (platform) => window.EstelllarFooter.removeSocialNetwork(platform);
window.updateSocialNetwork = (platform, updates) => window.EstelllarFooter.updateSocialNetwork(platform, updates);
window.getSocialNetworks = () => window.EstelllarFooter.getSocialNetworks();
window.validateFooterConfig = () => window.EstelllarFooter.validateConfig();

// =========================================
// EJEMPLOS DE USO
// =========================================

/*
// Agregar YouTube
window.addSocialNetwork({
    platform: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@estelllar',
    normalIcon: '../image/social-media/socialMediaYouTube.svg',
    hoverIcon: '../image/social-media/socialMediaYouTubeHover.svg'
});

// Agregar TikTok
window.addSocialNetwork({
    platform: 'tiktok',
    name: 'TikTok',
    url: 'https://www.tiktok.com/@estelllar',
    normalIcon: '../image/social-media/socialMediaTikTok.svg',
    hoverIcon: '../image/social-media/socialMediaTikTokHover.svg'
});

// Remover una red social
window.removeSocialNetwork('twitter');

// Actualizar URL de una red social
window.updateSocialNetwork('facebook', {
    url: 'https://www.facebook.com/nueva-url'
});

// Ver todas las redes sociales
console.log(window.getSocialNetworks());

// Validar configuración
console.log(window.validateFooterConfig());
*/