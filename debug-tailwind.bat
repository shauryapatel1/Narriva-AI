@echo off
echo Debugging Tailwind CSS for Narriva...
cd narriva-web
echo Current directory: %CD%
echo.
echo === Tailwind Version ===
npx tailwindcss --version
echo.
echo === Verifying Tailwind Config ===
type tailwind.config.js
echo.
echo === Compiling Tailwind CSS ===
npx tailwindcss -i ./src/app/globals.css -o ./public/tailwind-debug.css
echo.
echo If no errors appeared above, check ./public/tailwind-debug.css
pause 