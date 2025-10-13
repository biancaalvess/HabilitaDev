@echo off
chcp 65001 >nul
color 0A
title 🚀 HabilitaDev - Backend Local (Porta 8000)

echo.
echo ============================================
echo    🚀 INICIANDO BACKEND LOCAL
echo ============================================
echo.

REM Navegar para a pasta do backend
echo 📂 Navegando para HabilitaDev-backend...
cd /d D:\Desktop\PROJETOS\Desenvolvendo\HabilitaDev-backend

REM Verificar se a pasta existe
if not exist ".\venv\Scripts\activate" (
    echo.
    echo ❌ ERRO: Ambiente virtual não encontrado!
    echo.
    echo 💡 Execute primeiro:
    echo    python -m venv venv
    echo.
    pause
    exit /b 1
)

echo.
echo 🔧 Ativando ambiente virtual...
call .\venv\Scripts\activate

echo.
echo 📦 Instalando dependências adicionais...
pip install email-validator --quiet

echo.
echo ============================================
echo    ✅ BACKEND PRONTO!
echo ============================================
echo.
echo 📡 Iniciando servidor FastAPI...
echo 🌐 URL: http://localhost:8000
echo 📚 Documentação: http://localhost:8000/docs
echo.
echo ⚠️  Mantenha esta janela aberta!
echo ⏹️  Para parar: CTRL+C
echo.
echo ============================================
echo.

REM Iniciar o servidor
uvicorn app.main:app --reload --port 8000

pause

