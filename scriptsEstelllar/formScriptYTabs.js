// ===== MAIN APP CONTROLLER =====
const StellarApp = {
    // Configuration
    config: {
        apiBaseUrl: 'https://api.estelllar.com',
        redirectDelay: 1500, // Aumentado para mostrar mensaje breve
        verificationDelay: 1000,
        successMessageDelay: 800 // Nuevo: tiempo para mostrar mensaje rápido
    },

    // Almacenamiento local para emails registrados (sincronizado)
    registeredEmails: new Set([
        'juan.perez@email.com',
        'maria.garcia@gmail.com',
        'carlos.rodriguez@yahoo.com',
        'ana.martinez@hotmail.com'
    ]),

    // DOM elements cache
    elements: {},

    // Initialize the application
    init() {
        this.cacheElements();
        this.initCardsScrolling();
        this.initTabs();
        this.initForms();
        this.loadIndustries();
        this.loadRegisteredEmails(); // Cargar emails del almacenamiento local
    },

    // Cache DOM elements to avoid repeated queries
    cacheElements() {
        this.elements = {
            // Cards scrolling
            cardsContainer: document.querySelector('.avatarImageCards'),
            
            // Tabs
            tabButtons: document.querySelectorAll('.tab-button'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Forms
            registrationForm: document.getElementById('registrationForm'),
            verificationForm: document.getElementById('verificationForm'),
            
            // Buttons
            submitButton: document.getElementById('submitButton'),
            verifyButton: document.getElementById('verifyButton'),
            
            // Messages
            verificationMessage: document.getElementById('verificationMessage'),
            messageContainer: document.getElementById('messageContainer'),
            messageContent: document.getElementById('messageContent'),
            spinner: document.getElementById('spinner'),
            
            // Inputs
            selectElement: document.querySelector('.select.padding_select'),
            verificationEmailInput: document.getElementById('verificationEmailInput'),
            registrationEmailInput: document.getElementById('input2')
        };
    },

    // ===== CARDS SCROLLING FUNCTIONALITY =====
    initCardsScrolling() {
        const { cardsContainer } = this.elements;
        
        if (!cardsContainer) return;

        let isDragging = false;
        let startX;
        let scrollLeft;

        cardsContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - cardsContainer.offsetLeft;
            scrollLeft = cardsContainer.scrollLeft;
            cardsContainer.style.cursor = 'grabbing';
        });

        cardsContainer.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                cardsContainer.style.cursor = 'grab';
            }
        });

        cardsContainer.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                cardsContainer.style.cursor = 'grab';
            }
        });

        cardsContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - cardsContainer.offsetLeft;
            const walk = (x - startX) * 2;
            cardsContainer.scrollLeft = scrollLeft - walk;
        });
    },

    // ===== TABS FUNCTIONALITY =====
    initTabs() {
        const { tabButtons, tabContents } = this.elements;

        if (!tabButtons.length) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                e.target.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Hide verification message when switching tabs
                this.hideVerificationMessage();

                // Reset buttons to default state when switching tabs
                this.resetAllButtons();

                // Auto-fill verification email from registration
                if (targetTab === 'verificacion') {
                    this.copyEmailToVerification();
                }
            });
        });
    },

    // ===== FORMS FUNCTIONALITY =====
    initForms() {
        this.initRegistrationForm();
        this.initVerificationForm();
        this.initRealTimeVerification();
    },

    initRegistrationForm() {
        const { registrationForm, submitButton } = this.elements;
        
        if (!registrationForm) return;

        const buttonController = this.createButtonController(submitButton);

        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            buttonController.start('Registrando...');
            this.hideVerificationMessage();

            try {
                const formData = new FormData(registrationForm);
                const data = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    dateOfBirth: formData.get('dateOfBirth'),
                    industryId: formData.get('industryId')
                };

                // Verificar si el email ya está registrado
                const isEmailRegistered = this.isEmailRegistered(data.email);
                
                if (isEmailRegistered) {
                    // Cambiar al tab de verificación
                    this.switchToVerificationTab(data.email);
                    buttonController.stop('Inscríbete Hoy');
                    return;
                }

                // Simular llamada a la API (reemplazar con API real)
                await this.simulateApiCall();

                // Agregar email a la lista de registrados
                this.addRegisteredEmail(data.email);

                // Mostrar mensaje de éxito rápido
                this.showVerificationMessage('success', '¡Registro exitoso!');
                
                // Reset form
                registrationForm.reset();
                buttonController.stop('Inscríbete Hoy');

                // Redireccionar después de mostrar mensaje breve
                setTimeout(() => {
                    window.location.href = 'registro.html';
                }, this.config.successMessageDelay);

            } catch (error) {
                console.error('Registration error:', error);
                this.showVerificationMessage('error', 'Ocurrió un error durante el registro. Por favor, inténtalo nuevamente.');
                buttonController.stop('Inscríbete Hoy');
            }
        });
    },

    initVerificationForm() {
        const { verificationForm, verifyButton } = this.elements;
        
        if (!verificationForm) return;

        const buttonController = this.createButtonController(verifyButton);

        verificationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            buttonController.start('Verificando...');
            this.hideVerificationMessage();

            try {
                const formData = new FormData(verificationForm);
                const email = formData.get('verificationEmail');

                if (!email) {
                    this.showVerificationMessage('error', 'Por favor, ingresa un correo electrónico válido.');
                    buttonController.stop('Verificación');
                    return;
                }

                // Simular delay de API
                await new Promise(resolve => setTimeout(resolve, 500));

                const isRegistered = this.isEmailRegistered(email);

                if (isRegistered) {
                    this.showVerificationMessage('success', '¡Este correo está registrado! Tu lugar está confirmado para el evento.');
                } else {
                    // Mostrar mensaje y luego cambiar al tab de registro
                    this.showVerificationMessage('info', 'Este correo no está registrado. Te llevaremos al registro...');
                    
                    // Esperar 1.5 segundos y cambiar al tab de registro
                    setTimeout(() => {
                        this.switchToRegistrationTab(email);
                    }, 1500);
                }

                buttonController.stop('Verificación');

            } catch (error) {
                console.error('Verification error:', error);
                this.showVerificationMessage('error', 'Ocurrió un error durante la verificación. Por favor, inténtalo nuevamente.');
                buttonController.stop('Verificación');
            }
        });
    },

    initRealTimeVerification() {
        const { verificationEmailInput } = this.elements;
        
        if (!verificationEmailInput) return;

        let verificationTimeout;

        verificationEmailInput.addEventListener('input', (e) => {
            const email = e.target.value.trim();
            
            clearTimeout(verificationTimeout);
            this.hideVerificationMessage();

            if (this.isValidEmail(email)) {
                verificationTimeout = setTimeout(() => {
                    const isRegistered = this.isEmailRegistered(email);
                    
                    if (isRegistered) {
                        this.showVerificationMessage('success', '✓ Este correo está registrado.');
                    } else {
                        this.showVerificationMessage('info', 'ℹ Este correo no está registrado aún.');
                    }
                }, this.config.verificationDelay);
            }
        });
    },

    // ===== HELPER FUNCTIONS =====
    createButtonController(button) {
        if (!button) return { start: () => {}, stop: () => {} };

        const buttonText = button.querySelector('.button-text');
        const buttonIcon = button.querySelector('.button-icon');
        const buttonLoading = button.querySelector('.button-loading');
        
        // Remove inline style that prevents CSS from working
        if (buttonLoading) {
            buttonLoading.removeAttribute('style');
        }
        
        return {
            start: (text = 'Enviando...') => {
                if (buttonText) buttonText.textContent = text;
                if (buttonLoading) {
                    buttonLoading.style.display = 'flex';
                    buttonLoading.style.opacity = '1';
                    buttonLoading.style.visibility = 'visible';
                }
                if (buttonIcon) buttonIcon.style.display = 'none';
                button.disabled = true;
            },
            stop: (text = 'Inscríbete Hoy') => {
                if (buttonText) buttonText.textContent = text;
                if (buttonLoading) {
                    buttonLoading.style.display = 'none';
                    buttonLoading.style.opacity = '0';
                    buttonLoading.style.visibility = 'hidden';
                }
                if (buttonIcon) buttonIcon.style.display = 'inline-flex';
                button.disabled = false;
            }
        };
    },

    // Nueva función: resetear todos los botones a su estado por defecto
    resetAllButtons() {
        const { submitButton, verifyButton } = this.elements;
        
        // Resetear botón de registro
        if (submitButton) {
            const submitController = this.createButtonController(submitButton);
            submitController.stop('Inscríbete Hoy');
        }
        
        // Resetear botón de verificación
        if (verifyButton) {
            const verifyController = this.createButtonController(verifyButton);
            verifyController.stop('Verificación');
        }
    },

    // Nueva función: cambiar al tab de registro cuando email no existe
    switchToRegistrationTab(email) {
        const { tabButtons, tabContents, registrationEmailInput } = this.elements;
        
        // Encontrar y activar el tab de registro
        const registrationTab = Array.from(tabButtons).find(btn => 
            btn.getAttribute('data-tab') === 'registro'
        );
        
        if (registrationTab) {
            // Remover clase active de todos los tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar tab de registro
            registrationTab.classList.add('active');
            const registrationContent = document.getElementById('registro-content');
            if (registrationContent) {
                registrationContent.classList.add('active');
            }
            
            // Llenar el email en el input de registro
            if (registrationEmailInput) {
                registrationEmailInput.value = email;
                // Hacer focus en el email para mejor UX
                registrationEmailInput.focus();
            }
            
            // Mostrar mensaje motivacional después del cambio
            setTimeout(() => {
                this.showVerificationMessage('info', '¡Completa tu registro con este correo!');
            }, 300);
        }
    },

    // Nueva función: cambiar al tab de verificación cuando email ya existe
    switchToVerificationTab(email) {
        const { tabButtons, tabContents, verificationEmailInput } = this.elements;
        
        // Encontrar y activar el tab de verificación
        const verificationTab = Array.from(tabButtons).find(btn => 
            btn.getAttribute('data-tab') === 'verificacion'
        );
        
        if (verificationTab) {
            // Remover clase active de todos los tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar tab de verificación
            verificationTab.classList.add('active');
            const verificationContent = document.getElementById('verificacion-content');
            if (verificationContent) {
                verificationContent.classList.add('active');
            }
            
            // Llenar el email en el input de verificación
            if (verificationEmailInput) {
                verificationEmailInput.value = email;
            }
            
            // Mostrar mensaje de que ya está registrado
            setTimeout(() => {
                this.showVerificationMessage('success', '¡Este correo ya está registrado! Tu lugar está confirmado para el evento.');
            }, 300);
        }
    },

    // Nueva función: verificar si email está registrado (consistente)
    isEmailRegistered(email) {
        return this.registeredEmails.has(email.toLowerCase().trim());
    },

    // Nueva función: agregar email registrado
    addRegisteredEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        this.registeredEmails.add(normalizedEmail);
        this.saveRegisteredEmails();
    },

    // Nueva función: validar formato de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Nueva función: simular llamada a API
    async simulateApiCall() {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En producción, reemplazar con:
        // const response = await fetch(`${this.config.apiBaseUrl}/register`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // if (!response.ok) throw new Error('Error en el registro');
        // return await response.json();
    },

    // Nueva función: cargar emails del localStorage
    loadRegisteredEmails() {
        try {
            const stored = localStorage.getItem('registeredEmails');
            if (stored) {
                const emails = JSON.parse(stored);
                emails.forEach(email => this.registeredEmails.add(email));
            }
        } catch (error) {
            console.log('No se pudieron cargar emails almacenados:', error);
        }
    },

    // Nueva función: guardar emails en localStorage
    saveRegisteredEmails() {
        try {
            const emails = Array.from(this.registeredEmails);
            localStorage.setItem('registeredEmails', JSON.stringify(emails));
        } catch (error) {
            console.log('No se pudieron guardar emails:', error);
        }
    },

    async loadIndustries() {
        const { selectElement } = this.elements;
        
        if (!selectElement) return;

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/industry-interests`);
            
            if (!response.ok) {
                throw new Error('Error al obtener las industrias de interés');
            }

            const industryInterests = await response.json();

            industryInterests.forEach(industry => {
                const option = document.createElement('option');
                option.value = industry.id;
                option.textContent = industry.name;
                option.classList.add('options');
                selectElement.appendChild(option);
            });

        } catch (error) {
            console.error('Industries loading error:', error);
            // Optionally show user-friendly error message
        }
    },

    showVerificationMessage(type, message) {
        const { verificationMessage } = this.elements;
        
        if (!verificationMessage) return;

        const messageContent = verificationMessage.querySelector('.message-text');
        if (messageContent) {
            messageContent.textContent = message;
        }
        
        // Remove all type classes (incluyendo la nueva clase)
        verificationMessage.classList.remove('msg-success', 'msg-error', 'msg-info');
        
        // Mapear tipos a nombres de clases específicos
        const classMap = {
            'success': 'msg-success',
            'error': 'msg-error', 
            'info': 'msg-info'
        };
        
        verificationMessage.classList.add(classMap[type]);
        verificationMessage.style.display = 'block';
        
        // Auto-hide después de 3 segundos (reducido para mensajes más rápidos)
        setTimeout(() => {
            this.hideVerificationMessage();
        }, 3000);
    },

    hideVerificationMessage() {
        const { verificationMessage } = this.elements;
        if (verificationMessage) {
            verificationMessage.style.display = 'none';
        }
    },

    showLoadingSpinner() {
        const { messageContainer, spinner, messageContent } = this.elements;
        
        if (messageContainer) messageContainer.style.display = 'block';
        if (spinner) spinner.style.display = 'block';
        if (messageContent) messageContent.innerHTML = '';
    },

    hideLoadingSpinner() {
        const { messageContainer, spinner } = this.elements;
        
        if (messageContainer) messageContainer.style.display = 'none';
        if (spinner) spinner.style.display = 'none';
    },

    copyEmailToVerification() {
        const { registrationEmailInput, verificationEmailInput } = this.elements;
        
        if (!registrationEmailInput || !verificationEmailInput) return;

        const registrationEmail = registrationEmailInput.value.trim();
        if (registrationEmail && this.isValidEmail(registrationEmail)) {
            verificationEmailInput.value = registrationEmail;
        }
    }
};

// ===== INITIALIZE APP WHEN DOM IS READY =====
document.addEventListener('DOMContentLoaded', () => {
    StellarApp.init();
});