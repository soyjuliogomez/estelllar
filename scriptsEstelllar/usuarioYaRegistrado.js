document.addEventListener('DOMContentLoaded', async () => {
  // Verificación de usuario registrado
  function checkIfUserIsRegistered() {
    // Puedes usar localStorage, sessionStorage o cookies para verificar
    const isRegistered = localStorage.getItem('userRegistered');
    const userData = isRegistered ? JSON.parse(localStorage.getItem('userData')) : null;
    
    if (isRegistered && userData) {
      // Ocultar el formulario
      document.getElementById('registrationForm').style.display = 'none';
      
      // Mostrar el panel de usuario registrado
      const panel = document.getElementById('alreadyRegisteredPanel');
      if (panel) {
        panel.style.display = 'block';
        document.getElementById('userRegisteredName').textContent = userData.firstName || 'Nombre';
      }
    }
  }
  
  // Código existente para cargar industrias
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
  
  // Verificar si el usuario está registrado
  checkIfUserIsRegistered();
  
  // Eventos para los botones del panel informativo (si el usuario está registrado)
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  const shareToStoriesBtn = document.getElementById('shareToStoriesBtn');
  
  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', function() {
      // Código para añadir al calendario
      const eventDetails = {
        title: 'Stelllar 2025',
        location: 'Centro de Convenciones Quito',
        startDate: '2025-06-15T09:00:00',
        endDate: '2025-06-15T18:00:00'
      };
      
      // Generar URL para Google Calendar
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&location=${encodeURIComponent(eventDetails.location)}&dates=${encodeURIComponent(eventDetails.startDate.replace(/-|:|\.\d+/g, ''))}\/${encodeURIComponent(eventDetails.endDate.replace(/-|:|\.\d+/g, ''))}`;
      
      window.open(googleCalendarUrl, '_blank');
    });
  }
  
  if (shareToStoriesBtn) {
    shareToStoriesBtn.addEventListener('click', function() {
      // Código para compartir en redes sociales
      if (navigator.share) {
        navigator.share({
          title: 'Stelllar 2025',
          text: '¡Me he registrado para Stelllar 2025! Únete a este increíble evento en Quito.',
          url: window.location.href
        })
        .catch(error => console.log('Error al compartir:', error));
      } else {
        alert('La función de compartir no está disponible en este navegador.');
      }
    });
  }
});

// Mantener el código existente para los avatares
const cardsContainer = document.querySelector('.avatarImageCards');
if (cardsContainer) {
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
}

// Mantener el handler del formulario
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

  // Cambiar el estado del botón
  const submitButton = document.getElementById('submitButton');
  const buttonText = submitButton.querySelector('.button-text');
  const buttonIcon = submitButton.querySelector('.button-icon');
  const buttonLoading = submitButton.querySelector('.button-loading');
  
  if (buttonText && buttonIcon && buttonLoading) {
    buttonText.textContent = 'Enviando...';
    buttonIcon.style.display = 'none';
    buttonLoading.style.display = 'inline-block';
    submitButton.disabled = true;
  }

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
      // Guardar información del usuario registrado
      localStorage.setItem('userRegistered', 'true');
      localStorage.setItem('userData', JSON.stringify(data));
      
      setTimeout(() => {
        window.location.href = 'registro.html';
      }, 1000);
    } else {
      messageContent.innerHTML = `<p class="error-message">${result.error}</p>`;
      
      // Restaurar el botón
      if (buttonText && buttonIcon && buttonLoading) {
        buttonText.textContent = 'Inscríbete Hoy';
        buttonIcon.style.display = 'inline-block';
        buttonLoading.style.display = 'none';
        submitButton.disabled = false;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    spinner.style.display = 'none';
    messageContent.innerHTML = `<p class="error-message">${error.message}</p>`;
    
    // Restaurar el botón
    if (buttonText && buttonIcon && buttonLoading) {
      buttonText.textContent = 'Inscríbete Hoy';
      buttonIcon.style.display = 'inline-block';
      buttonLoading.style.display = 'none';
      submitButton.disabled = false;
    }
  }
});