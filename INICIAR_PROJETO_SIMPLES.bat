@echo off
echo ============================================
echo   INICIANDO HABILITADEV - VERSAO SIMPLES
echo ============================================
echo.
echo Backend: Render (Nuvem) - Sempre ativo!
echo Frontend: Local (porta 3001)
echo.
echo Iniciando apenas o Frontend...
echo.

cd /d D:\Desktop\PROJETOS\Desenvolvendo\HabilitaDev
start "HabilitaDev Frontend" cmd /k "npm run dev"

timeout /t 3 >nul

echo.
echo ============================================
echo   FRONTEND INICIADO!
echo ============================================
echo.
echo Backend:  https://habilitadev-backend.onrender.com/docs
echo Frontend: http://localhost:3001
echo.
echo O backend esta na nuvem (Render)
echo Nao precisa iniciar localmente!
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:3001

echo.
echo Para PARAR o frontend:
echo - Va na janela aberta e pressione CTRL+C
echo.
pause

