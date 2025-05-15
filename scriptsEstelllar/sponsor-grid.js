// ==============================================
// CONFIGURACIÓN - PUEDES EDITAR ESTA SECCIÓN
// ==============================================
// Estructura del grid: número de logos por fila
const gridStructure = [2, 4, 5, 4, 2];
const totalVisibleLogos = gridStructure.reduce((sum, count) => sum + count, 0);

// Tiempo mínimo que un logo permanece estático (en milisegundos)
const minStaticTime = 3000; // 3 segundos

// Tiempo máximo que un logo permanece estático (en milisegundos)
const maxStaticTime = 5000; // 5 segundos

// Duración de la animación de flip (en milisegundos)
const animationDuration = 900;

// ==============================================
// IMPLEMENTACIÓN - NO NECESITAS MODIFICAR ESTO
// ==============================================
// Contenedor principal (se asume que existe un elemento con id 'sponsors-container' en tu HTML)
const sponsorsContainer = document.getElementById('sponsors-container');

// Datos de todos los logos disponibles
const allLogos = [
    { id: 1, color: '#EDF3FF', imgSrc: './image/logosLenguajes/microsoft.svg', name: 'Microsoft' },
    { id: 2, color: '#EDF3FF', imgSrc: './image/logosLenguajes/logo2.svg', name: 'Webpack' },
    { id: 3, color: '#627EEA', imgSrc: './image/logosLenguajes/etherium.svg', name: 'Ethereum' },
    { id: 4, color: '#2391EE', imgSrc: './image/logosLenguajes/docker.svg', name: 'Docker' },
    { id: 5, color: '#EDF3FF', imgSrc: './image/logosLenguajes/python.svg', name: 'Python' },
    { id: 6, color: '#023430', imgSrc: './image/logosLenguajes/mongodb.svg', name: 'MongoDB' },
    { id: 7, color: '#F7DF1E', imgSrc: './image/logosLenguajes/javascript.svg', name: 'JavaScript' },
    { id: 8, color: '#EDF3FF', imgSrc: './image/logosLenguajes/webflow.svg', name: 'Webflow' },
    { id: 9, color: '#f1f1f1', imgSrc: './image/logosLenguajes/aws.svg', name: 'AWS' },
    { id: 10, color: '#FF4D00', imgSrc: './image/logosLenguajes/swift.svg', name: 'Swift' },
    { id: 11, color: '#EDF3FF', imgSrc: './image/logosLenguajes/react.svg', name: 'React' },
    { id: 12, color: '#007396', imgSrc: './image/logosLenguajes/java.svg', name: 'Java' },
    { id: 13, color: '#404EA3', imgSrc: './image/logosLenguajes/php.svg', name: 'PHP' },
    { id: 14, color: '#FFE01B', imgSrc: './image/logosLenguajes/mailchimp.svg', name: 'mailchimp' },
    { id: 15, color: '#DEA584', imgSrc: './image/logosLenguajes/rust.svg', name: 'Rust' },
    { id: 16, color: '#ffffff', imgSrc: './image/logosLenguajes/figma.svg', name: 'Figma' },
    { id: 17, color: '#FFFFEE', imgSrc: './image/logosLenguajes/gitlab.svg', name: 'Gitlab' },
    { id: 18, color: '#EDF3FF', imgSrc: './image/logosLenguajes/angular.svg', name: 'Angular' },
    { id: 19, color: '#EDF3FF', imgSrc: './image/logosLenguajes/slack.svg', name: 'slack' },
    { id: 20, color: '#f1f1f1', imgSrc: './image/logosLenguajes/salesforce.svg', name: 'salesforce' },
    { id: 21, color: '#EDF3FF', imgSrc: './image/logosLenguajes/clickup.svg', name: 'clickup' },
    { id: 22, color: '#EDF3FF', imgSrc: './image/logosLenguajes/deel.svg', name: 'deel' },
    { id: 23, color: '#6FDA44', imgSrc: './image/logosLenguajes/upwork.svg', name: 'upwork' },
    { id: 24, color: '#EDF3FF', imgSrc: './image/logosLenguajes/openai.svg', name: 'openai' },
    { id: 25, color: '#EDF3FF', imgSrc: './image/logosLenguajes/laravel.svg', name: 'Laravel' }
];

let visibleLogos = [];
let hiddenLogos = [];
let logoTimers = [];

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeLogos();
    createGridStructure();
    initializeRandomRotation();
});

function initializeLogos() {
    const initialLogos = [];
    const availableLogos = [...allLogos];
    for (let i = 0; i < totalVisibleLogos; i++) {
        const randomIndex = Math.floor(Math.random() * availableLogos.length);
        initialLogos.push(availableLogos.splice(randomIndex, 1)[0]);
    }
    visibleLogos = initialLogos;
    hiddenLogos = availableLogos;
}

// Crear estructura HTML del grid
function createGridStructure() {
    let logoIndex = 0;
    sponsorsContainer.innerHTML = '';

    gridStructure.forEach((logosInRow, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'sponsors-row';
        rowElement.id = `row-${rowIndex + 1}`;

        for (let i = 0; i < logosInRow; i++) {
            const logo = visibleLogos[logoIndex++];
            const logoHtml = `
                <div class="logo-perspective" data-index="${logoIndex - 1}">
                    <div class="logo-card" data-id="${logo.id}">
                        <div class="logo-front" style="background-color: ${logo.color};">
                            <img src="${logo.imgSrc}" alt="${logo.name}">
                        </div>
                        <div class="logo-back" style="background-color: ${logo.color};">
                            <img src="${logo.imgSrc}" alt="${logo.name}">
                        </div>
                    </div>
                </div>
            `;
            rowElement.innerHTML += logoHtml;
        }
        sponsorsContainer.appendChild(rowElement);
    });
}

// Función para obtener un tiempo aleatorio
function getRandomTime() {
    return Math.floor(Math.random() * (maxStaticTime - minStaticTime + 1)) + minStaticTime;
}

// Inicializar la rotación aleatoria para cada logo
function initializeRandomRotation() {
    const logoPerspectives = document.querySelectorAll('.logo-perspective');
    logoPerspectives.forEach((perspective, index) => {
        scheduleLogoRotation(perspective, index);
    });
}

// Programar la rotación de un logo específico
function scheduleLogoRotation(perspective, index) {
    if (logoTimers[index]) {
        clearTimeout(logoTimers[index]);
    }

    const randomTime = getRandomTime();
    logoTimers[index] = setTimeout(() => {
        rotateLogoAndUpdate(perspective, index);
    }, randomTime);
}

function rotateLogoAndUpdate(perspective, index) {
    const logoCard = perspective.querySelector('.logo-card');
    const currentVisibleLogo = visibleLogos[index];

    // Función para obtener un logo oculto diferente al actual y a los visibles
    function getUniqueHiddenLogo(currentVisible, currentVisibleList) {
        const availableHidden = hiddenLogos.filter(hidden =>
            hidden.id !== currentVisible.id && !currentVisibleList.some(visible => visible.id === hidden.id)
        );
        if (availableHidden.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableHidden.length);
            return availableHidden[randomIndex];
        }
        return null;
    }

    const newVisibleLogo = getUniqueHiddenLogo(currentVisibleLogo, visibleLogos);

    if (newVisibleLogo) {
        // Remover el logo seleccionado de los ocultos
        const hiddenIndex = hiddenLogos.findIndex(logo => logo.id === newVisibleLogo.id);
        if (hiddenIndex > -1) {
            hiddenLogos.splice(hiddenIndex, 1);
        }

        // Actualizar la cara trasera antes de la animación
        const back = logoCard.querySelector('.logo-back');
        back.style.backgroundColor = newVisibleLogo.color;
        back.querySelector('img').src = newVisibleLogo.imgSrc;
        back.querySelector('img').alt = newVisibleLogo.name;

        logoCard.classList.add('flipping');

        setTimeout(() => {
            // Intercambiar los logos
            visibleLogos[index] = newVisibleLogo;
            hiddenLogos.push(currentVisibleLogo);

            // Actualizar la cara frontal después de la mitad de la animación
            const front = logoCard.querySelector('.logo-front');
            front.style.backgroundColor = newVisibleLogo.color;
            front.querySelector('img').src = newVisibleLogo.imgSrc;
            front.querySelector('img').alt = newVisibleLogo.name;
            logoCard.dataset.id = newVisibleLogo.id;

            setTimeout(() => {
                logoCard.classList.remove('flipping');
                scheduleLogoRotation(perspective, index);
            }, animationDuration / 2 + 50);
        }, animationDuration / 2);
    } else {
        // Si no se encuentra un logo oculto único (situación muy rara)
        scheduleLogoRotation(perspective, index);
    }
}