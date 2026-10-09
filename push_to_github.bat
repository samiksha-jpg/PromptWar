@echo off
title Push CitySense AI to GitHub
color 0A
echo ================================================================
echo  CitySense AI - Pushing to https://github.com/samiksha-jpg/PromptWar
echo ================================================================
echo.
cd /d "C:\Users\samik\Desktop\PromptWar"

echo Checking git status...
git status -s

echo.
echo Pushing branch 'main' to GitHub origin...
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ================================================================
    echo  SUCCESS: All project files pushed to GitHub successfully!
    echo  Repository: https://github.com/samiksha-jpg/PromptWar
    echo ================================================================
) else (
    echo ================================================================
    echo  If prompted, please click "Sign in with your browser" to authorize.
    echo ================================================================
)
echo.
pause
