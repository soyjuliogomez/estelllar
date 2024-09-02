const cardsContainer = document.querySelector('.avatarImageCards');
let isDragging = false;
let startX;
let scrollLeft;

cardsContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX - cardsContainer.offsetLeft;
  scrollLeft = cardsContainer.scrollLeft;
  cardsContainer.style.cursor = 'grabbing'; // Cambia el cursor al arrastrar
});

cardsContainer.addEventListener('mouseleave', () => {
  if (isDragging) {
    isDragging = false;
    cardsContainer.style.cursor = 'grab'; // Cambia el cursor de nuevo al salir
  }
});

cardsContainer.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    cardsContainer.style.cursor = 'grab'; // Cambia el cursor de nuevo al soltar
  }
});

cardsContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - cardsContainer.offsetLeft;
  const walk = (x - startX) * 2; // Ajusta la velocidad del scroll
  cardsContainer.scrollLeft = scrollLeft - walk;
});
