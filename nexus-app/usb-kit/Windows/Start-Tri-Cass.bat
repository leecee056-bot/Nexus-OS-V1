@echo off
title Tri-Cass Companion USB
cd /d "%~dp0"

REM Prefer unpacked folder (true portable); fall back to single .exe
set "TRICASS_USB_ROOT=%~dp0.."
set "TRICASS_PORTABLE=1"

if exist "%~dp0Tri-Cass-Companion\Tri-Cass Companion.exe" (
  start "" "%~dp0Tri-Cass-Companion\Tri-Cass Companion.exe"
  exit /b 0
)

if exist "%~dp0Tri-Cass-Companion-Windows-portable.exe" (
  start "" "%~dp0Tri-Cass-Companion-Windows-portable.exe"
  exit /b 0
)

if exist "%~dp0Tri-Cass Companion.exe" (
  start "" "%~dp0Tri-Cass Companion.exe"
  exit /b 0
)

echo.
echo Tri-Cass Companion binary not found in Windows\
echo Copy the portable .exe or win-unpacked folder here, then try again.
echo See README.txt
echo.
pause
exit /b 1
