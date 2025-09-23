@echo off
echo Starting Windsurf with the LM Studio extension...
echo.
echo Extension installed: vscode-windsurf-lms-0.1.0.vsix
echo.
echo To test the extension in Windsurf:
echo 1. Wait for Windsurf to fully load
echo 2. Look for the robot icon in the Activity Bar (left sidebar)
echo 3. Or press Ctrl+Shift+P and type "LMS: Open Chat"
echo 4. Try typing in a code file to see inline completions
echo.
echo Press any key to launch Windsurf...
pause >nul

start "" "C:\!APPS\Windsurf\Windsurf.exe" "E:\GitHub Projects\LocalLLM-IDE"

echo.
echo Windsurf launched! The extension should be active.
echo.
echo Extension Features:
echo - Inline code completions (ghost text)
echo - Chat panel with @file, @selection, @workspace
echo - Command palette actions: Explain, Test, Refactor
echo - MCP tools integration (if Agent-Cascade is running)
echo.
echo Current LM Studio settings:
echo - Base URL: http://10.5.0.2:11434/v1
echo - Model: deepseek/deepseek-coder-6.7b-instruct-q4_0
echo.
pause
