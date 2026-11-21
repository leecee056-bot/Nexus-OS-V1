@echo off
title NEXUS Companion USB
cd /d "%~dp0"

REM Prefer unpacked folder (true portable); fall back to single .exe
set "NEXUS_USB_ROOT=%~dp0.."
set "NEXUS_PORTABLE=1"

if exist "%~dp0NEXUS-Companion\NEXUS Companion.exe" (
  start "" "%~dp0NEXUS-Companion\NEXUS Companion.exe"
  exit /b 0
)

if exist "%~dp0NEXUS-Companion-Windows-portable.exe" (
  start "" "%~dp0NEXUS-Companion-Windows-portable.exe"
  exit /b 0
)

if exist "%~dp0NEXUS Companion.exe" (
  start "" "%~dp0NEXUS Companion.exe"
  exit /b 0
)

echo.
echo NEXUS Companion binary not found in Windows\
echo Copy the portable .exe or win-unpacked folder here, then try again.
echo See README.txt
echo.
pause
exit /b 1
