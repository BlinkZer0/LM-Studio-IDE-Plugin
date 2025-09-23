@echo off
echo Restarting Windsurf to load the LM Studio extension...
echo.

REM Kill any running Windsurf processes
taskkill /f /im Windsurf.exe >nul 2>&1

echo Waiting 3 seconds for processes to close...
timeout /t 3 /nobreak >nul

echo Starting Windsurf...
start "" "C:\!APPS\Windsurf\Windsurf.exe" "E:\GitHub Projects\LocalLLM-IDE"

echo.
echo Windsurf is starting up...
echo.
echo Extension installed at: C:\Users\Randy\.windsurf\extensions\your-name.vscode-windsurf-lms-0.1.0-universal
echo.
echo To verify the extension is loaded:
echo 1. Wait for Windsurf to fully load
echo 2. Press Ctrl+Shift+X to open Extensions view
echo 3. Look for "Windsurf + LM Studio" in the installed extensions
echo 4. Or look for the robot icon in the Activity Bar
echo 5. Or press Ctrl+Shift+P and type "LMS:" to see available commands
echo.
echo If you don't see the extension, check the Developer Console:
echo - Press F12 or Ctrl+Shift+I
echo - Look for any error messages related to the extension
echo.
pause
