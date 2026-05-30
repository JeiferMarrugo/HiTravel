# Ejecutar como administrador:
#   PowerShell -ExecutionPolicy Bypass -File scripts\reinstall-wsl.ps1

$ErrorActionPreference = "Stop"

Write-Host "==> Cerrando WSL..." -ForegroundColor Cyan
wsl --shutdown

Write-Host "==> Desregistrando Ubuntu (si existe)..." -ForegroundColor Cyan
wsl --unregister Ubuntu 2>$null

Write-Host "==> Habilitando componentes de Windows..." -ForegroundColor Cyan
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "==> Actualizando WSL..." -ForegroundColor Cyan
wsl --update
wsl --set-default-version 2

Write-Host "==> Instalando Ubuntu..." -ForegroundColor Cyan
wsl --install -d Ubuntu --no-launch

Write-Host ""
Write-Host "Listo. REINICIA EL PC y luego ejecuta:" -ForegroundColor Green
Write-Host "  wsl -d Ubuntu" -ForegroundColor Yellow
Write-Host "Crea usuario/contrasena cuando Ubuntu abra por primera vez." -ForegroundColor Green
Write-Host "Despues abre Docker Desktop como administrador." -ForegroundColor Green
