// ========================================
// STACKING CARDS EFFECT - VERSIÓN REESCRITA Y ANALIZADA
// ========================================

class StackingCards {
  constructor() {
      this.cards = document.querySelectorAll('.stacking-card');
      this.container = document.querySelector('.stacking-container');
      this.progressDots = document.querySelectorAll('.progress-dot');
      this.totalCards = this.cards.length;
      this.isDestroyed = false;
      this.isPaused = false;
      this.containerHeight = 0;
      this.windowHeight = 0;
      this.lastCard = -1; // Para el debug
      this.isContainerInView = false; // Nuevo: rastrea si el contenedor está en vista

      // ====================================================================
      // CONTROL DE SCROLL POR TARJETA: DEFINIR LAS DISTANCIAS
      // ====================================================================
      // Este array define la cantidad de scroll (en píxeles) que debe transcurrir
      // para que la tarjeta siguiente comience su animación después de que la
      // tarjeta actual ha "terminado" su fase de fijación/apilamiento.
      //
      // Importante:
      // - `scrollDurations[0]` controlará la distancia entre Card 1 y Card 2.
      // - `scrollDurations[1]` controlará la distancia entre Card 2 y Card 3.
      // - `scrollDurations[2]` controlará la distancia entre Card 3 y Card 4.
      // ... y así sucesivamente.
      //
      // Puedes usar valores en píxeles fijos o porcentajes de windowHeight.
      // Ejemplo: [200, 350, 150] significa:
      // - 200px para Card 1 -> Card 2
      // - 350px para Card 2 -> Card 3
      // - 150px para Card 3 -> Card 4
      //
      // PRUEBA AJUSTANDO ESTOS VALORES:
      this.scrollDurations = [
          window.innerHeight * 0.8, // Scroll para Card 1 a Card 2 (ej: 80% de la ventana)
          window.innerHeight * 0.5, // Scroll para Card 2 a Card 3 (ej: 50% de la ventana)
          window.innerHeight * 0.5, // Scroll para Card 3 a Card 4 (ej: 70% de la ventana)
          // Añade más valores si tienes más tarjetas
      ];
      // ====================================================================


      console.log('StackingCards: Inicializando con', this.totalCards, 'cards');

      this.init();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  init() {
      if (!this.validateElements()) {
          console.error('StackingCards: Elementos requeridos no encontrados');
          return;
      }

      this.updateDimensions();
      this.setupInitialState();
      this.bindEvents();
      this.setupIntersectionObserver(); // Nuevo: Configurar el IntersectionObserver
      this.updateProgress(); // Inicializar los dots
      this.handleScroll();   // Asegurar el estado inicial correcto basado en el scroll
  }

  validateElements() {
      if (!this.container) {
          console.error('StackingCards: .stacking-container no encontrado.');
          return false;
      }
      if (this.cards.length === 0) {
          console.error('StackingCards: No se encontraron elementos .stacking-card.');
          return false;
      }
      return true;
  }

  updateDimensions() {
      this.windowHeight = window.innerHeight;
      this.containerHeight = this.container.offsetHeight;
      console.log('Dimensions updated: containerHeight=', this.containerHeight, 'windowHeight=', this.windowHeight);

      // Advertencia si la altura del contenedor es muy pequeña
      const requiredMinHeight = (this.windowHeight * 0.5) + this.scrollDurations.reduce((sum, duration) => sum + duration, 0) + (this.windowHeight * 0.5);
      if (this.containerHeight < requiredMinHeight) {
          console.warn(`StackingCards: containerHeight es potencialmente demasiado pequeño (${this.containerHeight}px). Se recomienda al menos ${requiredMinHeight.toFixed(0)}px para el efecto completo.`);
      }
  }

  setupInitialState() {
      this.cards.forEach((card, index) => {
          card.style.position = 'absolute';
          card.style.top = '50%';
          card.style.left = '50%';
          // Posición inicial antes de que la sección entre en vista
          // La Card 1 puede estar un poco visible, las demás fuera
          if (index === 0) {
              card.style.transform = `translate(-50%, -50%) translateY(0px) scale(1)`;
              card.style.zIndex = '1';
              card.style.opacity = '1';
              card.style.pointerEvents = 'auto';
          } else {
              card.style.transform = `translate(-50%, -50%) translateY(${this.windowHeight * 0.7}px) scale(0.9)`;
              card.style.zIndex = String(index + 1);
              card.style.opacity = '0';
              card.style.pointerEvents = 'none';
          }
      });
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  bindEvents() {
      let ticking = false;

      window.addEventListener('scroll', () => {
          if (!ticking && !this.isDestroyed && !this.isPaused && this.isContainerInView) { // Solo si el contenedor está en vista
              requestAnimationFrame(() => {
                  this.handleScroll();
                  ticking = false;
              });
              ticking = true;
          }
      });

      if (this.progressDots.length > 0) {
          this.progressDots.forEach((dot, index) => {
              dot.addEventListener('click', () => {
                  this.goToCard(index);
              });
          });
      }

      let resizeTimer;
      window.addEventListener('resize', () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
              this.updateDimensions();
              this.setupInitialState();
              this.handleScroll(); // Recalcular después del redimensionamiento
          }, 250);
      });

      document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
              this.pause();
          } else {
              this.resume();
          }
      });
  }

  // ========================================
  // INTERSECTION OBSERVER SETUP (Nuevo)
  // ========================================

  setupIntersectionObserver() {
      const options = {
          // root: null, // el viewport
          rootMargin: `-${this.windowHeight * 0.25}px 0px -${this.windowHeight * 0.25}px 0px`, // Ajusta para que entre en vista cuando el centro del contenedor se acerque
          threshold: 0 // Cuando al menos 0% del target es visible
      };

      this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              this.isContainerInView = entry.isIntersecting;
              if (this.isContainerInView) {
                  console.log('StackingCards: Contenedor entró en vista.');
                  this.handleScroll(); // Forzar una actualización cuando entra en vista
              } else {
                  console.log('StackingCards: Contenedor salió de vista.');
                  this.resetCards(); // Restablecer las tarjetas cuando sale de vista
              }
          });
      }, options);

      this.observer.observe(this.container);
  }

  // ========================================
  // LÓGICA PRINCIPAL DEL SCROLL
  // ========================================

  handleScroll() {
      if (this.isDestroyed || this.isPaused) return;

      const scrollY = window.scrollY;
      const containerTop = this.container.offsetTop;
      const windowHeight = this.windowHeight;

      // ====================================================================
      // PUNTO CLAVE: CALCULAR EL SCROLL RELATIVO AL INICIO DEL EFECTO
      // ====================================================================
      // Definir dónde queremos que la animación *realmente* empiece en el viewport.
      // Por ejemplo, cuando la parte superior del contenedor está en el 20% del viewport.
      const effectActivationPointInViewport = windowHeight * 0.2; // La Card 1 se "fija" cuando está a 20% del top del viewport.

      // El scroll real del documento donde el efecto debería activarse
      // Ajuste para que el efecto empiece cuando el contenedor está centrado en la pantalla (aproximadamente)
      const actualEffectStartScroll = containerTop - (windowHeight - this.container.offsetHeight) / 2;

      // El scroll relativo es cuánto hemos avanzado desde el punto de activación
      let relativeScroll = Math.max(0, scrollY - actualEffectStartScroll);

      // Si el usuario scrollea por encima del contenedor, resetear (o mantener el estado inicial)
      if (scrollY < actualEffectStartScroll - windowHeight * 0.5) { // Un poco de margen antes de la activación
          this.resetCards();
          return;
      }


      // ====================================================================
      // CÁLCULO DINÁMICO DE PUNTOS DE SCROLL BASADO EN scrollDurations
      // ====================================================================

      // Array para almacenar los puntos de scroll relativos donde cada tarjeta debe iniciar su animación
      // Estos puntos serán relativos al `relativeScroll` que estamos calculando.
      const cardAnimationRelativeStartPoints = [0]; // La primera tarjeta (Card 1) activa su animación en 0 del scroll relativo

      // Calcular los puntos de inicio de animación para las tarjetas secundarias
      for (let i = 0; i < this.totalCards - 1; i++) {
          const previousRelativeStart = cardAnimationRelativeStartPoints[i];
          const durationForNextCard = this.scrollDurations[i] || (windowHeight * 0.5); // Fallback si no está definido
          cardAnimationRelativeStartPoints.push(previousRelativeStart + durationForNextCard);
      }

      // El punto donde TODAS las tarjetas están completamente apiladas y el efecto dentro del contenedor termina
      // Basado en el último punto de inicio de animación + un poco de scroll para el "desapilamiento" final.
      const effectRelativeCompletionScroll = cardAnimationRelativeStartPoints[this.totalCards - 1] + (windowHeight * 0.5);


      // === Depuración de puntos de scroll (descomenta para ver en consola) ===
      // console.log(`--- Scroll Debug ---`);
      // console.log(`scrollY: ${scrollY.toFixed(0)}`);
      // console.log(`containerTop: ${containerTop.toFixed(0)}`);
      // console.log(`windowHeight: ${windowHeight.toFixed(0)}`);
      // console.log(`actualEffectStartScroll: ${actualEffectStartScroll.toFixed(0)}`);
      // console.log(`relativeScroll: ${relativeScroll.toFixed(0)}`);
      // cardAnimationRelativeStartPoints.forEach((point, i) => console.log(`Card ${i + 1} Anim Relative Start: ${point.toFixed(0)}`));
      // console.log(`effectRelativeCompletionScroll: ${effectRelativeCompletionScroll.toFixed(0)}`);
      // console.log(`--------------------`);

      let currentActiveCard = 0;

      this.cards.forEach((card, index) => {
          let currentY = 0;
          let currentOpacity = 1;
          let currentScale = 1;
          let currentPointerEvents = 'auto';
          let zIndex = String(index + 1);

          // Rango de scroll específico para la animación de esta tarjeta (relativo al efecto)
          const cardRelativeScrollStart = cardAnimationRelativeStartPoints[index];
          const cardRelativeScrollEnd = (index + 1 < this.totalCards) ? cardAnimationRelativeStartPoints[index + 1] : effectRelativeCompletionScroll;
          const cardRelativeScrollDuration = cardRelativeScrollEnd - cardRelativeScrollStart;

          // Progreso de animación para esta tarjeta
          let progress = 0;
          if (relativeScroll >= cardRelativeScrollStart && relativeScroll < cardRelativeScrollEnd) {
              progress = Math.max(0, Math.min(1, (relativeScroll - cardRelativeScrollStart) / cardRelativeScrollDuration));
          } else if (relativeScroll >= cardRelativeScrollEnd) {
              progress = 1; // Ya pasó su punto de finalización
          }

          if (index === 0) { // Lógica para la Card 1 (la base)
              // Card 1 se mantiene fija en el centro del viewport durante y después de su fase.
              // `translateY(0px)` respecto a top:50%, left:50% ya la centra en el contenedor.
              const targetFixedY = 0; // Posición final apilada para Card 1 (centrada)

              if (relativeScroll < cardAnimationRelativeStartPoints[0]) {
                 // Antes de que el efecto "empiece" para la Card 1:
                 currentY = windowHeight * 0.4; // Posición inicial visible (ajusta este valor si necesitas que empiece más arriba/abajo)
                 currentOpacity = 1;
                 currentScale = 1;
                 zIndex = '1';
                 currentPointerEvents = 'auto';
              } else {
                 // Durante y después del efecto para Card 1: se mantiene en su posición final apilada
                 currentY = targetFixedY; // Se queda en el centro
                 currentOpacity = 1; // Permanece completamente visible
                 currentScale = 1; // Mantiene su tamaño completo
                 zIndex = '1'; // Se mantiene en el fondo de la pila
                 currentPointerEvents = 'auto'; // Sigue siendo interactuable
              }
              currentActiveCard = Math.max(currentActiveCard, 0); // Card 1 es siempre la "activa" inicial

          } else { // Lógica para tarjetas secundarias (índice > 0)
              const initialHiddenY = windowHeight * 0.7; // Posición inicial desde donde "suben" (ocultas y abajo)
              const finalStackedY = index * 32; // Offset vertical cuando están apiladas (32px por tarjeta)

              // Antes de que su animación comience, deben estar invisibles y abajo
              if (relativeScroll < cardRelativeScrollStart) {
                  currentY = initialHiddenY;
                  currentOpacity = 0;
                  currentScale = 0.9;
                  currentPointerEvents = 'none';
              }
              // Durante su animación de entrada
              else if (relativeScroll >= cardRelativeScrollStart && relativeScroll < cardRelativeScrollEnd) {
                  currentY = initialHiddenY - (progress * (initialHiddenY - finalStackedY));
                  currentOpacity = progress; // Se hace visible gradualmente
                  currentScale = 0.9 + (progress * 0.1);
                  currentPointerEvents = 'auto';
                  currentActiveCard = Math.max(currentActiveCard, index);
              }
              // Después de que su animación ha terminado (está apilada)
              else if (relativeScroll >= cardRelativeScrollEnd) {
                  currentY = finalStackedY; // Se mantiene en su posición apilada
                  currentOpacity = 1;
                  currentScale = 1;
                  currentPointerEvents = 'auto';
                  currentActiveCard = Math.max(currentActiveCard, index);
              }
          }

          // Aplicar la transformación final
          card.style.transform = `translate(-50%, -50%) translateY(${currentY}px) scale(${currentScale})`;
          card.style.opacity = currentOpacity;
          card.style.zIndex = zIndex;
          card.style.pointerEvents = currentPointerEvents;

          // Depuración por tarjeta (descomentar para ver)
          // console.log(`Card ${index}: Y=${currentY.toFixed(0)}, Opacity=${currentOpacity.toFixed(2)}, Scale=${currentScale.toFixed(2)}, Z=${zIndex}`);
      });

      this.currentCard = currentActiveCard;
      this.updateProgress();

      if (this.currentCard !== this.lastCard) {
          console.log('Card actual:', this.currentCard);
          this.lastCard = this.currentCard;
      }
  }

  // ========================================
  // RESET CARDS: Estado cuando el contenedor no está en vista
  // ========================================
  resetCards() {
      this.cards.forEach((card, index) => {
          if (index === 0) {
              // Card 1 en su posición inicial (no centrada aún)
              card.style.transform = `translate(-50%, -50%) translateY(0px) scale(1)`; // Vuelve a su estado inicial visible
              card.style.opacity = '1';
              card.style.zIndex = '1';
              card.style.pointerEvents = 'auto';
          } else {
              // Otras tarjetas completamente ocultas y abajo
              card.style.transform = `translate(-50%, -50%) translateY(${this.windowHeight * 0.7}px) scale(0.9)`;
              card.style.opacity = '0';
              card.style.zIndex = String(index + 1);
              card.style.pointerEvents = 'none';
          }
      });
      this.currentCard = 0;
      this.updateProgress();
      if (this.lastCard !== this.currentCard) {
        console.log('StackingCards: Contenedor fuera de vista o antes de activación. Reseteando. Card actual:', this.currentCard);
        this.lastCard = this.currentCard;
      }
  }

  // ========================================
  // UTILIDADES
  // ========================================

  updateProgress() {
      if (!this.progressDots.length) return;
      this.progressDots.forEach((dot, index) => {
          dot.classList.toggle('active', index <= this.currentCard);
      });
  }

  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================

  goToCard(cardIndex) {
      if (cardIndex < 0 || cardIndex >= this.totalCards) return;

      const containerTop = this.container.offsetTop;
      const windowHeight = this.windowHeight;

      // El punto de activación del efecto en el scroll del documento
      const actualEffectStartScroll = containerTop - (windowHeight - this.container.offsetHeight) / 2;

      // Recalcular los puntos de inicio de animación relativos para asegurar la consistencia
      const cardAnimationRelativeStartPoints = [0];
      for (let i = 0; i < this.totalCards - 1; i++) {
          const previousRelativeStart = cardAnimationRelativeStartPoints[i];
          const durationForNextCard = this.scrollDurations[i] || (windowHeight * 0.5);
          cardAnimationRelativeStartPoints.push(previousRelativeStart + durationForNextCard);
      }

      // El scroll objetivo en el documento es el punto de inicio del efecto + el punto relativo de la tarjeta
      let targetScroll = actualEffectStartScroll + cardAnimationRelativeStartPoints[cardIndex];

      window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
      });
  }

  pause() {
      this.isPaused = true;
      console.log('StackingCards: Pausado.');
  }

  resume() {
      this.isPaused = false;
      this.handleScroll();
      console.log('StackingCards: Reanudado.');
  }

  getCurrentCard() {
      return this.currentCard;
  }

  destroy() {
      this.isDestroyed = true;
      if (this.observer) {
          this.observer.disconnect();
          console.log('StackingCards: IntersectionObserver desconectado.');
      }
      console.log('StackingCards destruido');
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA Y API GLOBAL
// ========================================

let stackingCardsInstance = null;

function initStackingCards() {
  const container = document.querySelector('.stacking-container');
  const cards = document.querySelectorAll('.stacking-card');

  if (container && cards.length > 0 && !stackingCardsInstance) {
      stackingCardsInstance = new StackingCards();
      console.log('StackingCards inicializado');
  } else if (stackingCardsInstance) {
      console.log('StackingCards ya está inicializado.');
  } else {
      console.warn('StackingCards: Elementos .stacking-container o .stacking-card no encontrados para inicializar.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStackingCards);
} else {
  initStackingCards();
}

window.addEventListener('load', () => {
  if (!stackingCardsInstance) {
      initStackingCards();
  }
});

window.addEventListener('beforeunload', () => {
  if (stackingCardsInstance) {
      stackingCardsInstance.destroy();
      stackingCardsInstance = null;
  }
});

// ========================================
// API GLOBAL
// ========================================

window.StackingCardsAPI = {
  goToCard: (index) => {
      if (stackingCardsInstance) {
          stackingCardsInstance.goToCard(index);
      } else {
          console.warn('StackingCards no está inicializado.');
      }
  },
  pause: () => {
      if (stackingCardsInstance) {
          stackingCardsInstance.pause();
      }
  },
  resume: () => {
      if (stackingCardsInstance) {
          stackingCardsInstance.resume();
      }
  },
  getCurrentCard: () => {
      return stackingCardsInstance ? stackingCardsInstance.getCurrentCard() : 0;
  },
  getInstance: () => {
      return stackingCardsInstance;
  },
  debug: () => {
      const container = document.querySelector('.stacking-container');
      const cards = document.querySelectorAll('.stacking-card');
      const dots = document.querySelectorAll('.progress-dot');

      console.log('=== StackingCards Debug ===');
      console.log('Instance:', !!stackingCardsInstance);
      console.log('Container:', !!container);
      console.log('Cards encontradas:', cards.length);
      console.log('Dots encontrados:', dots.length);

      if (stackingCardsInstance) {
          console.log('Current card:', stackingCardsInstance.getCurrentCard());
          console.log('Total cards:', stackingCardsInstance.totalCards);
          console.log('Container height:', stackingCardsInstance.containerHeight);
          console.log('Window height:', stackingCardsInstance.windowHeight);
          console.log('Scroll Y:', window.scrollY);
          console.log('isPaused:', stackingCardsInstance.isPaused);
          console.log('isDestroyed:', stackingCardsInstance.isDestroyed);
          console.log('isContainerInView:', stackingCardsInstance.isContainerInView); // Nuevo debug
          console.log('Scroll Durations:', stackingCardsInstance.scrollDurations);

          cards.forEach((card, index) => {
              const transform = card.style.transform;
              const opacity = card.style.opacity;
              const zIndex = card.style.zIndex;
              const pointerEvents = card.style.pointerEvents;
              console.log(`Card ${index + 1}:`, {
                  transform: transform.length > 50 ? transform.substring(0, 50) + '...' : transform,
                  opacity: opacity,
                  zIndex: zIndex,
                  pointerEvents: pointerEvents
              });
          });
      } else {
          console.log('No StackingCards instance is active.');
      }
      console.log('===========================');
  }
};

console.log('StackingCards script cargado. Usa StackingCardsAPI.debug() para información detallada.');