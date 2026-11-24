@echo off
chcp 65001 >nul
cd /d "%~dp0"
set NODE_EXE=%~dp0..\_herramientas\node-v22.11.0-win-x64\node.exe
if not exist "%NODE_EXE%" set NODE_EXE=node
start "" http://localhost:8080/
"%NODE_EXE%" "%~dp0tools\servidor-local.cjs" 8080
pause
