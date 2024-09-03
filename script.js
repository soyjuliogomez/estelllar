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


document.addEventListener('DOMContentLoaded', async () => {
  const selectElement = document.querySelector('.select.padding_select');

  try {
    const response = await fetch('https://api.estelllar.com/industry-interests');
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
    console.error('Error:', error);
  }
});