
  document.addEventListener('DOMContentLoaded', function() {
    const words = ['Innovación', 'Desarrollo', 'Crecimiento', 'Futuro', 'Transformación', 'Tecnología'];
    let currentIndex = 0;
    const changingWord = document.getElementById('changing-word');
    const cursor = document.querySelector('.cursor');
    
    // Función para borrar texto actual
    function deleteText() {
      if (changingWord.textContent.length > 0) {
        changingWord.textContent = changingWord.textContent.slice(0, -1);
        setTimeout(deleteText, 50); // Velocidad de borrado
      } else {
        // Una vez borrado, empezar a escribir
        currentIndex = (currentIndex + 1) % words.length;
        typeText(words[currentIndex], 0);
      }
    }
    
    // Función para escribir nuevo texto
    function typeText(word, index) {
      if (index < word.length) {
        changingWord.textContent += word.charAt(index);
        setTimeout(function() {
          typeText(word, index + 1);
        }, 100); // Velocidad de escritura
      } else {
        // Texto completo, esperar antes de borrar
        setTimeout(deleteText, 2000); // Tiempo en pantalla
      }
    }
    
    // Iniciar el ciclo después de una pausa inicial
    setTimeout(deleteText, 3000);
  });

