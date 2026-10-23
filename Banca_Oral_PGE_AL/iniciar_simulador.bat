@echo off
chcp 65001 > nul
echo ========================================================
echo   SIMULADOR DE BANCA EXAMINADORA - PROVA ORAL PGE-AL
echo   Candidata: Viviane Lima
echo ========================================================
echo.
echo Iniciando o servidor local...
cd /d "%~dp0"

start http://127.0.0.1:8000

python app.py
pause
