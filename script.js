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

document.querySelector('#registrationForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = document.querySelector('input[name="firstName"]').value;
  const lastName = document.querySelector('input[name="lastName"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const phone = document.querySelector('input[name="phone"]').value;
  const dateOfBirth = document.querySelector('input[name="dateOfBirth"]').value;
  const industryId = document.querySelector('select[name="industryId"]').value;

  const data = {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    industryId
  };

  const messageContainer = document.getElementById('messageContainer');
  const messageContent = document.getElementById('messageContent');
  const spinner = document.getElementById('spinner');

  messageContainer.style.display = 'block';
  spinner.style.display = 'block';
  messageContent.innerHTML = '';

  try {
    const response = await fetch('https://api.estelllar.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    spinner.style.display = 'none';

    if (response.ok) {
      /* messageContent.innerHTML = `<p class="success-message">${result.message}</p>`; */
      // Take 3 seconds to redirect the user
      setTimeout(() => {
        window.location.href = 'registro.html';
      }, 1000);
    } else {
      messageContent.innerHTML = `<p class="error-message">${result.error}</p>`;
    }
  } catch (error) {
    console.error('Error:', error);
    spinner.style.display = 'none';
    messageContent.innerHTML = `<p class="error-message">${error.message}</p>`;
  }
});