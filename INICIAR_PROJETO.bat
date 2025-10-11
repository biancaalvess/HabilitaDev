@echo off
echo ============================================
echo   INICIANDO HABILITADEV
echo ============================================
echo.
echo [1/2] Iniciando Backend (porta 8000)...
echo.

cd /d D:\Desktop\PROJETOS\Desenvolvendo\HabilitaDev-backend
call .\venv\Scripts\activate.bat
start "HabilitaDev Backend" cmd /k "uvicorn app.main:app --reload --port 8000"

timeout /t 3 >nul

echo.
echo [2/2] Iniciando Frontend (porta 3001)...
echo.

cd /d D:\Desktop\PROJETOS\Desenvolvendo\HabilitaDev
start "HabilitaDev Frontend" cmd /k "npm run dev"

timeout /t 3 >nul

echo.
echo ============================================
echo   SERVIDORES INICIADOS!
echo ============================================
echo.
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3001
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:3001

echo.
echo Para PARAR os servidores:
echo - Va nas janelas abertas e pressione CTRL+C
echo.
pause

