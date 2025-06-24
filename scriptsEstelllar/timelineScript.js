
// ========== CONFIGURACIÓN DE EVENTOS ========== 
const eventsConfig = {
    // Tipos de eventos (fácil de modificar)
    eventTypes: {
        virtual: {
            className: 'event-virtual',
            label: 'Evento Virtual'
        },
        presencial: {
            className: 'event-presencial',
            label: 'Evento Presencial'
        }
    },

    // Lista de eventos (fácil de agregar/editar)
    events: [
        {
            date: '31',
            day: 'Sabado',
            month: 'Mayo',
            time: '19:30',
            type: 'virtual',
            title: 'Webinar sobre mejorar tu CV en Ingenieria Informática',
            speaker: {
                name: 'Ivan Vera',
                position: 'Gerente de IT en Vidanova',
                initials: 'MS',
                image: './image/eventosImagenes/speaker1.png' // Imagen del orador
            },
            attendees: 10,
            image: './image/eventosImagenes/eventoCover1.png' // Placeholder para imagen eventoCover1
        },
        {
            date: '23',
            day: 'Lunes',
            month: 'Junio',
            time: '19:30',
            type: 'virtual',
            title: 'Cómo llegar a 100.000 seguidores en Instagram en 6 meses',
            speaker: {
                name: 'Cristian Zorrilla',
                position: 'Creador de Contenido en Instagram',
                initials: 'AR',
                image: './image/eventosImagenes/speaker2.png' // Imagen del orador
            },
            attendees: 150,
            image: './image/eventosImagenes/eventoCover2.png'
        },
        {
            date: '6',
            day: 'Sabado',
            month: 'Septiembre',
            time: '14:30',
            type: 'presencial',
            title: 'Conferencia EstelllarConf Etapa 2 Nebula',
            speaker: {
                name: 'Marcos Saldaña',
                position: 'Web Developer',
                initials: 'MS',
                image: './image/eventosImagenes/speaker3.png' // Imagen del orador
            },
            attendees: 10,
            image: './image/eventosImagenes/eventoCover3.png'
        }
    ]
};

// ========== GENERADOR DE EVENTOS ==========
class EventsTimeline {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.init();
    }

    init() {
        this.render();
        this.adjustSegments();
    }

    // Función corregida para perfecta alineación y conexión
    adjustSegments() {
        setTimeout(() => {
            const items = this.container.querySelectorAll('.timeline-item');

            items.forEach((item, index) => {
                const segment = item.querySelector('.timeline-segment');
                const dateHeader = item.querySelector('.event-date-header');
                const circle = item.querySelector('.timeline-circle');

                if (segment && dateHeader && circle) {
                    // 1. POSICIONAR CÍRCULO: Alineado horizontalmente con la fecha
                    const dateRect = dateHeader.getBoundingClientRect();
                    const itemRect = item.getBoundingClientRect();
                    const circlePosition = (dateRect.top - itemRect.top) + (dateRect.height / 2);

                    circle.style.top = `${circlePosition}px`;

                    // 2. POSICIONAR Y DIMENSIONAR SEGMENTO DE LÍNEA
                    if (index < items.length - 1) {
                        // NO es el último: conectar con el siguiente evento
                        const nextItem = items[index + 1];
                        const nextDateHeader = nextItem.querySelector('.event-date-header');
                        const nextItemRect = nextItem.getBoundingClientRect();
                        const nextDateRect = nextDateHeader.getBoundingClientRect();

                        // Calcular posición del próximo círculo
                        const nextCirclePosition = (nextDateRect.top - nextItemRect.top) + (nextDateRect.height / 2);

                        // Calcular distancia total entre elementos
                        const itemGap = nextItemRect.top - itemRect.top;
                        const totalHeight = itemGap + nextCirclePosition;

                        // Posicionar segmento desde este círculo hasta el siguiente
                        segment.style.top = `${circlePosition}px`;
                        segment.style.height = `${totalHeight - circlePosition}px`;
                    } else {
                        // ES el último: línea desde círculo hasta final del card
    const card = item.querySelector('.event-card');
    const cardRect = card.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    
    const cardBottom = cardRect.bottom - itemRect.top;
    const segmentHeight = cardBottom - circlePosition + 20; // +20px extra
    
    segment.style.top = `${circlePosition}px`;
    segment.style.height = `${segmentHeight}px`;
                    }
                }
            });
        }, 150); // Más tiempo para asegurar renderizado completo
    }

    createEventHTML(event, index, total) {
        const eventType = this.config.eventTypes[event.type];
        const attendeesAvatars = this.generateAttendeesAvatars(event.attendees);

        return `
                    <div class="timeline-item">
                        <!-- Segmento de línea individual -->
                        <div class="timeline-segment"></div>
                        
                        <!-- Un solo círculo por evento -->
                        <div class="timeline-circle"></div>
                        
                        <div class="event-date-header">
                            <div class="date-circle">
                                <span class="date-month">${event.month.toUpperCase()}</span>
                                <div class="date-number">${event.date}</div>
                                <div class="date-day">${event.day}</div>
                            </div>
                        </div>
                        
                        <div class="event-card ${eventType.className}">
                            <div class="event-info">
                                <div class="event-header">
                                    <div class="event-time">${event.time}</div>
                                </div>
                                
                                <span class="event-badge">${eventType.label}</span>
                                
                                <h3 class="event-title">${event.title}</h3>
                                
                                <div class="event-speaker">
                                    <div class="speaker-avatar">
    ${event.speaker.image ?
                `<img src="${event.speaker.image}" alt="${event.speaker.name}">` :
                `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
                color: white; font-weight: 600; font-size: 0.875rem;">${event.speaker.initials}</div>`
            }
</div>
                                    <div class="speaker-info">
                                        <h4>${event.speaker.name}</h4>
                                        <p>${event.speaker.position}</p>
                                    </div>
                                </div>
                                
                                <div class="event-attendees">
                                    <span>Más de ${event.attendees}</span>
                                    <div class="attendees-avatars">
                                        ${attendeesAvatars}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="event-image">
                                ${event.image ? `<img src="${event.image}" alt="${event.title}">` : '<span>Imagen del evento</span>'}
                            </div>
                        </div>
                    </div>
                `;
    }

    generateAttendeesAvatars(count) {
        const maxAvatars = 4;
        let avatars = '';

        for (let i = 0; i < Math.min(count, maxAvatars); i++) {
            const initials = String.fromCharCode(65 + i) + String.fromCharCode(65 + i + 1);
            avatars += `<div class="attendee-avatar">${initials}</div>`;
        }

        return avatars;
    }

    render() {
        const eventsHTML = this.config.events
            .map((event, index) => this.createEventHTML(event, index, this.config.events.length))
            .join('');

        this.container.innerHTML = eventsHTML;

        // Ajustar segmentos después del renderizado
        this.adjustSegments();
    }

    // Método mejorado para agregar un nuevo evento
    addEvent(eventData) {
        this.config.events.push(eventData);
        this.render(); // render() ya incluye adjustSegments()
    }

    // Método para agregar múltiples eventos
    addEvents(eventsArray) {
        this.config.events.push(...eventsArray);
        this.render();
    }

    // Método para agregar un nuevo tipo de evento
    addEventType(key, typeConfig) {
        this.config.eventTypes[key] = typeConfig;
    }
}

// ========== INICIALIZACIÓN ==========
const timeline = new EventsTimeline('eventsTimeline', eventsConfig);

// Reajustar segmentos cuando cambie el tamaño de ventana
window.addEventListener('resize', () => {
    timeline.adjustSegments();
});

// ========== EJEMPLO DE CÓMO AGREGAR EVENTOS DINÁMICAMENTE ==========

// Ejemplo 1: Agregar un solo evento
/* setTimeout(() => {
    timeline.addEvent({
        date: '15',
        day: 'Lunes',
        month: 'Agosto',
        time: '14:00',
        type: 'presencial',
        title: 'Workshop de JavaScript Avanzado',
        speaker: {
            name: 'Ana García',
            position: 'Senior Developer',
            initials: 'AG'
        },
        attendees: 25,
        image: null
    });
}, 2000); */ // Se agrega después de 2 segundos

// Ejemplo 2: Agregar múltiples eventos
// timeline.addEvents([
//     {
//         date: '22',
//         day: 'Martes',
//         month: 'Agosto',
//         time: '10:00',
//         type: 'virtual',
//         title: 'Evento Virtual de Prueba',
//         speaker: { name: 'Test Speaker', position: 'Test', initials: 'TS' },
//         attendees: 15,
//         image: null
//     }
// ]);
