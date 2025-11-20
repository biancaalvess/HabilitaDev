@echo off
echo Iniciando HabilitaDev Backend...
echo.

cd /d %~dp0

echo Verificando Go...
go version
if errorlevel 1 (
    echo ERRO: Go nao encontrado. Instale Go 1.21 ou superior.
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
go mod download
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias.
    pause
    exit /b 1
)

echo.
echo Iniciando servidor...
go run main.go

pause

