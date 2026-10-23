@echo off
chcp 65001 > nul
title Simulador de Banca Oral PGE-AL - Instalador e Inicializador
echo ====================================================================
echo      SIMULADOR DE BANCA ORAL PGE-AL - VIVIANE LIMA
echo      Configuração Automática para Laptop Pessoal
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Verifica se o Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Python não foi encontrado no seu laptop!
    echo.
    echo Para instalar em 1 minuto:
    echo 1. Baixe o instalador oficial do Python em: https://www.python.org/downloads/
    echo 2. IMPORTANTE: Na primeira tela de instalação, marque a caixinha:
    echo    "[X] Add python.exe to PATH"
    echo 3. Conclua a instalação e dê dois cliques neste arquivo novamente.
    echo.
    pause
    exit /b
)

echo [1/3] Python detectado com sucesso!
python --version

:: 2. Instalação / Verificação das Dependências
echo [2/3] Verificando e instalando bibliotecas necessárias...
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo Tentando instalar dependências com privilégio de usuário...
    pip install -r requirements.txt --user --quiet
)

:: 3. Inicialização do Servidor e Abertura do Navegador
echo [3/3] Iniciando o Simulador...
echo Abrindo seu navegador em http://127.0.0.1:8000 ...

start http://127.0.0.1:8000

python app.py

pause
