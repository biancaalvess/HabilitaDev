@echo off
echo Inicializando banco de dados...
echo.

cd /d %~dp0

echo Verificando Go...
go version
if errorlevel 1 (
    echo ERRO: Go nao encontrado. Instale Go 1.19 ou superior.
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
echo Criando banco de dados e tabelas...
go run init_db.go
if errorlevel 1 (
    echo ERRO: Falha ao criar banco de dados.
    pause
    exit /b 1
)

echo.
echo Banco de dados criado com sucesso!
echo Arquivo: data\database.db
pause

