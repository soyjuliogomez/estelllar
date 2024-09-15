@echo off
:: Compila un archivo SASS a CSS
sass --watch styles.scss:styles.css

:: Si deseas compilar toda una carpeta dentro del mismo directorio, usa esta línea:
:: sass --watch .scss:.css

pause