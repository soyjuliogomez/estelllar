// ===== MAIN APP CONTROLLER =====
const StellarApp = {
    // Configuration
    config: {
        apiBaseUrl: 'https://api.estelllar.com',
        redirectDelay: 1500,
        verificationDelay: 1000,
        successMessageDelay: 800,
        // NUEVO: Endpoints configurables
        endpoints: {
            register: '/register',
            verifyEmail: '/verify', // NUEVO: Endpoint real de verificación
            industries: '/industry-interests'
        }
    },

    // Almacenamiento local para emails registrados (sincronizado)
    registeredEmails: new Set([
        'juan.perez@email.com',
        'maria.garcia@gmail.com',
        'carlos.rodriguez@yahoo.com',
        'ana.martinez@hotmail.com'
    ]),

    // Cache de verificaciones para evitar múltiples peticiones
    verificationCache: new Map(),

    // DOM elements cache
    elements: {},

    // Initialize the application
    init() {
        this.cacheElements();
        this.initCardsScrolling();
        this.initTabs();
        this.initForms();
        this.loadIndustries();
        this.loadRegisteredEmails();
        this.initEmailSync();
        // DESACTIVADO: No verificar en tiempo real para evitar registros falsos
        // this.initRegistrationEmailVerification();
    },

    // Cache DOM elements to avoid repeated queries
    cacheElements() {
        this.elements = {
            // Cards scrolling
            cardsContainer: document.querySelector('.avatarImageCards'),
            
            // Tabs
            tabButtons: document.querySelectorAll('.tab-button'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Forms - Compatible con ambos HTMLs
            registrationForm: document.getElementById('registrationForm') || document.querySelector('#registro-content form'),
            verificationForm: document.getElementById('verificationForm') || document.querySelector('#verificacion-content form'),
            
            // Buttons
            submitButton: document.getElementById('submitButton'),
            verifyButton: document.getElementById('verifyButton'),
            
            // Messages - Compatible con ambos HTMLs
            verificationMessage: document.getElementById('verificationMessage'),
            messageContainer: document.getElementById('messageContainer'),
            messageContent: document.getElementById('messageContent'),
            spinner: document.getElementById('spinner'),
            
            // Inputs
            selectElement: document.querySelector('select[name="industryId"]') || document.querySelector('.select.padding_select'),
            verificationEmailInput: document.querySelector('input[name="verificationEmail"]') || document.getElementById('verificationEmailInput'),
            registrationEmailInput: document.getElementById('input2'),
            heroEmailInput: document.getElementById('input1')
        };
    },

    // ===== EMAIL SYNC FUNCTIONALITY =====
    initEmailSync() {
        const { heroEmailInput, registrationEmailInput } = this.elements;
        
        if (!heroEmailInput || !registrationEmailInput) return;

        heroEmailInput.addEventListener('input', () => {
            registrationEmailInput.value = heroEmailInput.value;
        });

        registrationEmailInput.addEventListener('input', () => {
            heroEmailInput.value = registrationEmailInput.value;
        });
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
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                e.target.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                this.hideVerificationMessage();
                this.resetAllButtons();

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
        const { registrationForm, submitButton, messageContainer, messageContent, spinner } = this.elements;
        
        if (!registrationForm) {
            console.log('Registration form not found');
            return;
        }

        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            console.log('🚀 Formulario enviado');

            // Obtener valores
            const formData = new FormData(registrationForm);
            const firstName = formData.get('firstName')?.trim();
            const lastName = formData.get('lastName')?.trim();
            const email = formData.get('email')?.trim().toLowerCase();
            const phone = formData.get('phone')?.trim();
            const dateOfBirth = formData.get('dateOfBirth');
            const industryIdValue = formData.get('industryId');

            console.log('📝 Valores:', { firstName, lastName, email, phone, dateOfBirth, industryIdValue });

            // Validaciones
            if (!firstName || !lastName || !email || !phone || !dateOfBirth || !industryIdValue) {
                this.showMessage('error', 'Por favor, completa todos los campos correctamente.');
                return;
            }

            const industryId = parseInt(industryIdValue);
            if (isNaN(industryId)) {
                this.showMessage('error', 'Por favor, selecciona una industria válida.');
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showMessage('error', 'Por favor, ingresa un correo electrónico válido.');
                return;
            }

            const data = {
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth,
                industryId
            };

            // Control de UI - Compatible con ambos sistemas
            if (submitButton) {
                const buttonText = submitButton.querySelector('.button-text');
                const buttonIcon = submitButton.querySelector('.button-icon');
                const buttonLoading = submitButton.querySelector('.button-loading');
                
                if (buttonText) buttonText.textContent = 'Registrando...';
                if (buttonLoading) buttonLoading.style.display = 'flex';
                if (buttonIcon) buttonIcon.style.display = 'none';
                submitButton.disabled = true;
            }

            // Sistema de mensajes del HTML simple
            if (messageContainer) messageContainer.style.display = 'block';
            if (spinner) spinner.style.display = 'block';
            if (messageContent) messageContent.innerHTML = '';

            console.log('📤 Enviando:', data);

                            try {
                // NO verificar antes de registrar - solo intentar registrar directamente
                // Si el email existe, la API devolverá error
                
                console.log('🌐 POST a:', `${this.config.apiBaseUrl}${this.config.endpoints.register}`);
                
                const response = await fetch(`${this.config.apiBaseUrl}${this.config.endpoints.register}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                console.log('📥 Status:', response.status);

                const result = await response.json();
                console.log('📥 Resultado:', result);

                if (spinner) spinner.style.display = 'none';

                if (response.ok) {
                    console.log('✅ Registro exitoso');
                    
                    this.addRegisteredEmail(email);
                    this.showMessage('success', result.message || '¡Registro exitoso! Redirigiendo...');
                    
                    if (messageContent) {
                        messageContent.innerHTML = `<p class="success-message">${result.message || '¡Registro exitoso!'}</p>`;
                    }
                    
                    registrationForm.reset();
                    
                    setTimeout(() => {
                        window.location.href = 'registro.html';
                    }, 1000);
                } else {
                    console.error('❌ Error:', result);
                    const errorMsg = result.error || result.message || 'Error al registrar';
                    this.showMessage('error', errorMsg);
                    
                    if (messageContent) {
                        messageContent.innerHTML = `<p class="error-message">${errorMsg}</p>`;
                    }
                }

            } catch (error) {
                console.error('💥 Error:', error);
                if (spinner) spinner.style.display = 'none';
                
                const errorMsg = error.message || 'Ocurrió un error durante el registro.';
                this.showMessage('error', errorMsg);
                
                if (messageContent) {
                    messageContent.innerHTML = `<p class="error-message">${errorMsg}</p>`;
                }
            } finally {
                this.resetButton(submitButton);
            }
        });
    },

    initVerificationForm() {
        const { verificationForm, verifyButton } = this.elements;
        
        if (!verificationForm) {
            console.log('Verification form not found (normal si no hay tabs)');
            return;
        }

        verificationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const email = document.querySelector('input[name="verificationEmail"]')?.value.trim().toLowerCase();

            if (!email) {
                this.showMessage('error', 'Por favor, ingresa un correo electrónico.');
                return;
            }

            if (verifyButton) {
                const buttonText = verifyButton.querySelector('.button-text');
                const buttonIcon = verifyButton.querySelector('.button-icon');
                const buttonLoading = verifyButton.querySelector('.button-loading');
                
                if (buttonText) buttonText.textContent = 'Verificando...';
                if (buttonLoading) buttonLoading.style.display = 'flex';
                if (buttonIcon) buttonIcon.style.display = 'none';
                verifyButton.disabled = true;
            }

            try {
                const response = await fetch(`${this.config.apiBaseUrl}${this.config.endpoints.verifyEmail}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    
                    if (result.registered === true) {
                        this.showMessage('success', '¡Este correo está registrado! Tu lugar está confirmado.');
                    } else if (result.registered === false) {
                        this.showMessage('info', 'Este correo no está registrado. Te llevaremos al registro...');
                        setTimeout(() => {
                            this.switchToRegistrationTab(email);
                        }, 1500);
                    }
                } else {
                    this.showMessage('error', 'Error al verificar el correo.');
                }
            } catch (error) {
                console.error('Error:', error);
                this.showMessage('error', 'Error al verificar el correo.');
            } finally {
                this.resetButton(verifyButton);
            }
        });
    },

    initRealTimeVerification() {
        const { verificationEmailInput } = this.elements;
        
        if (!verificationEmailInput) {
            console.log('Verification email input not found (normal si no hay tab de verificación)');
            return;
        }

        // DESACTIVADO: La verificación en tiempo real crea registros falsos
        console.log('⚠️ Verificación en tiempo real DESACTIVADA para evitar registros falsos en la BD');
        
        // Solo mostrar mensaje informativo cuando escriban
        verificationEmailInput.addEventListener('input', (e) => {
            const email = e.target.value.trim();
            
            if (this.isValidEmail(email)) {
                this.showMessage('info', 'ℹ Haz clic en "Verificación" para comprobar tu registro.');
            } else {
                this.hideVerificationMessage();
            }
        });
    },

    // NUEVO: Verificación en tiempo real para el formulario de REGISTRO
    initRegistrationEmailVerification() {
        const { registrationEmailInput } = this.elements;
        
        if (!registrationEmailInput) return;

        let verificationTimeout;

        registrationEmailInput.addEventListener('input', (e) => {
            const email = e.target.value.trim();
            
            clearTimeout(verificationTimeout);
            
            // Limpiar mensajes previos
            this.hideVerificationMessage();
            this.removeEmailIndicator(registrationEmailInput);

            if (this.isValidEmail(email)) {
                // Verificar si ya tenemos este email en caché
                if (this.verificationCache.has(email)) {
                    const cachedResult = this.verificationCache.get(email);
                    console.log('📦 Usando caché para email en registro:', email, cachedResult);
                    
                    this.removeEmailIndicator(registrationEmailInput);
                    
                    if (cachedResult.exists) {
                        this.showMessage('error', '⚠️ Este correo ya está registrado.');
                        this.addEmailIndicator(registrationEmailInput, 'error', '✗ Ya registrado');
                    } else {
                        this.showMessage('success', '✓ Correo disponible.');
                        this.addEmailIndicator(registrationEmailInput, 'success', '✓ Disponible');
                    }
                    return;
                }
                
                this.addEmailIndicator(registrationEmailInput, 'loading', '🔍 Verificando...');
                
                verificationTimeout = setTimeout(async () => {
                    try {
                        console.log('🔍 Verificando email en registro:', email);
                        
                        // Intentar registrar con datos falsos
                        const testData = {
                            firstName: 'Test',
                            lastName: 'Verification',
                            email: email,
                            phone: '0000000000',
                            dateOfBirth: '1990-01-01',
                            industryId: 1
                        };
                        
                        const response = await fetch(`${this.config.apiBaseUrl}${this.config.endpoints.register}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(testData)
                        });
                        
                        const responseText = await response.text();
                        console.log('📥 Status:', response.status, 'Response:', responseText);
                        
                        let result;
                        try {
                            result = JSON.parse(responseText);
                        } catch (e) {
                            result = { error: responseText };
                        }
                        
                        this.removeEmailIndicator(registrationEmailInput);
                        
                        const errorMessage = (result.error || result.message || '').toLowerCase();
                        console.log('🔍 Mensaje de error registro:', errorMessage);
                        
                        // Detectar si el email ya existe
                        const emailExists = response.status === 409 || 
                            (errorMessage.includes('correo') || errorMessage.includes('email')) && (
                                errorMessage.includes('en uso') ||
                                errorMessage.includes('está en uso') ||
                                errorMessage.includes('uso') ||
                                errorMessage.includes('existe') ||
                                errorMessage.includes('registrado') ||
                                errorMessage.includes('duplicate') ||
                                errorMessage.includes('already') ||
                                errorMessage.includes('taken')
                            );
                        
                        if (emailExists) {
                            // Email YA REGISTRADO
                            console.log('⚠️ Email ya registrado');
                            
                            // Guardar en caché
                            this.verificationCache.set(email, { exists: true });
                            
                            this.showMessage('error', '⚠️ Este correo ya está registrado.');
                            this.addEmailIndicator(registrationEmailInput, 'error', '✗ Ya registrado');
                        } else {
                            // Email DISPONIBLE
                            console.log('✅ Email disponible');
                            
                            // Guardar en caché
                            this.verificationCache.set(email, { exists: false });
                            
                            this.showMessage('success', '✓ Correo disponible.');
                            this.addEmailIndicator(registrationEmailInput, 'success', '✓ Disponible');
                        }
                    } catch (error) {
                        console.log('Error verificación email registro:', error);
                        this.removeEmailIndicator(registrationEmailInput);
                    }
                }, this.config.verificationDelay);
            }
        });
    },

    // NUEVO: Agregar indicador visual al input
    addEmailIndicator(input, type, text) {
        this.removeEmailIndicator(input);
        
        const indicator = document.createElement('span');
        indicator.className = `email-indicator email-indicator--${type}`;
        indicator.textContent = text;
        indicator.style.cssText = `
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.875rem;
            font-weight: 600;
            pointer-events: none;
            z-index: 10;
            padding: 4px 8px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            white-space: nowrap;
        `;
        
        if (type === 'error') {
            indicator.style.color = '#ff4757';
            indicator.style.background = 'rgba(255, 71, 87, 0.1)';
        } else if (type === 'success') {
            indicator.style.color = '#2ed573';
            indicator.style.background = 'rgba(46, 213, 115, 0.1)';
        } else if (type === 'loading') {
            indicator.style.color = '#ffa502';
            indicator.style.background = 'rgba(255, 165, 2, 0.1)';
        }
        
        // Buscar el contenedor más cercano que sea el wrapper del input
        let parent = input.parentElement;
        
        // Si el padre directo no es adecuado, buscar el contenedor correcto
        while (parent && !parent.classList.contains('username-nombres') && !parent.classList.contains('username') && parent !== document.body) {
            parent = parent.parentElement;
        }
        
        // Si encontramos el contenedor correcto
        if (parent && parent !== document.body) {
            const currentPosition = window.getComputedStyle(parent).position;
            if (currentPosition === 'static') {
                parent.style.position = 'relative';
            }
            parent.appendChild(indicator);
        } else {
            // Fallback: usar el padre directo del input
            const directParent = input.parentElement;
            if (directParent) {
                const currentPosition = window.getComputedStyle(directParent).position;
                if (currentPosition === 'static') {
                    directParent.style.position = 'relative';
                }
                directParent.appendChild(indicator);
            }
        }
    },

    // NUEVO: Remover indicador visual
    removeEmailIndicator(input) {
        if (!input) return;
        
        // Buscar en el padre directo y en el contenedor padre
        let parent = input.parentElement;
        
        // Buscar hasta 3 niveles arriba
        for (let i = 0; i < 3 && parent; i++) {
            const existingIndicator = parent.querySelector('.email-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
                return;
            }
            parent = parent.parentElement;
        }
    },

    // ===== HELPER FUNCTIONS =====
    resetButton(button) {
        if (!button) return;
        
        const buttonText = button.querySelector('.button-text');
        const buttonIcon = button.querySelector('.button-icon');
        const buttonLoading = button.querySelector('.button-loading');
        
        if (buttonText) {
            buttonText.textContent = button.id === 'verifyButton' ? 'Verificación' : 'Inscríbete Hoy';
        }
        if (buttonLoading) buttonLoading.style.display = 'none';
        if (buttonIcon) buttonIcon.style.display = 'inline-flex';
        button.disabled = false;
    },

    resetAllButtons() {
        this.resetButton(this.elements.submitButton);
        this.resetButton(this.elements.verifyButton);
    },

    switchToRegistrationTab(email) {
        const { tabButtons, tabContents, registrationEmailInput } = this.elements;
        
        const registrationTab = Array.from(tabButtons).find(btn => 
            btn.getAttribute('data-tab') === 'registro'
        );
        
        if (registrationTab) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            registrationTab.classList.add('active');
            const registrationContent = document.getElementById('registro-content');
            if (registrationContent) {
                registrationContent.classList.add('active');
            }
            
            if (registrationEmailInput) {
                registrationEmailInput.value = email;
                registrationEmailInput.focus();
            }
            
            setTimeout(() => {
                this.showMessage('info', '¡Completa tu registro con este correo!');
            }, 300);
        }
    },

    switchToVerificationTab(email) {
        const { tabButtons, tabContents, verificationEmailInput } = this.elements;
        
        const verificationTab = Array.from(tabButtons).find(btn => 
            btn.getAttribute('data-tab') === 'verificacion'
        );
        
        if (verificationTab) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            verificationTab.classList.add('active');
            const verificationContent = document.getElementById('verificacion-content');
            if (verificationContent) {
                verificationContent.classList.add('active');
            }
            
            if (verificationEmailInput) {
                verificationEmailInput.value = email;
            }
            
            setTimeout(() => {
                this.showMessage('success', '¡Este correo ya está registrado! Tu lugar está confirmado.');
            }, 300);
        }
    },

    isEmailRegistered(email) {
        return this.registeredEmails.has(email.toLowerCase().trim());
    },

    addRegisteredEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        this.registeredEmails.add(normalizedEmail);
        this.saveRegisteredEmails();
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    loadRegisteredEmails() {
        try {
            const stored = localStorage.getItem('registeredEmails');
            if (stored) {
                const emails = JSON.parse(stored);
                emails.forEach(email => this.registeredEmails.add(email));
            }
        } catch (error) {
            console.log('No se pudieron cargar emails:', error);
        }
    },

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
        
        if (!selectElement) {
            console.error('Select element not found');
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}${this.config.endpoints.industries}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener industrias');
            }

            const industryInterests = await response.json();

            selectElement.innerHTML = '<option value="">Selecciona una industria</option>';

            industryInterests.forEach(industry => {
                const option = document.createElement('option');
                option.value = industry.id;
                option.textContent = industry.name;
                option.classList.add('options');
                selectElement.appendChild(option);
            });

        } catch (error) {
            console.error('Error cargando industrias:', error);
            
            selectElement.innerHTML = `
                <option value="">Selecciona una industria</option>
                <option value="1">Desarrollo de Software</option>
                <option value="2">Inteligencia Artificial</option>
                <option value="3">Ciberseguridad</option>
                <option value="4">Cloud Computing</option>
                <option value="5">Data Science</option>
            `;
        }
    },

    showMessage(type, message) {
        const { verificationMessage } = this.elements;
        
        if (!verificationMessage) {
            console.log(message);
            return;
        }

        const messageText = verificationMessage.querySelector('.message-text');
        const messageIcon = verificationMessage.querySelector('.message-icon');
        
        if (messageText) {
            messageText.textContent = message;
        }
        
        if (messageIcon) {
            const icons = {
                'success': 'fa-circle-check',
                'error': 'fa-circle-exclamation',
                'info': 'fa-circle-info'
            };
            messageIcon.className = `message-icon fa-solid ${icons[type]}`;
        }
        
        verificationMessage.classList.remove('msg-success', 'msg-error', 'msg-info');
        
        const classMap = {
            'success': 'msg-success',
            'error': 'msg-error', 
            'info': 'msg-info'
        };
        
        verificationMessage.classList.add(classMap[type]);
        verificationMessage.style.display = 'block';
        
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