@echo off
title DaniyouStuff.co - Python Flask Server
cd /d "%~dp0"
echo ============================================================
echo   DANIYOU STUFF.CO - PYTHON FLASK WEB APP
echo   Aesthetic Earthy Design (100%% Python Flask & Jinja2)
echo ============================================================
echo.
echo Mengaktifkan virtualenv envsifaa...
echo Server berjalan di: http://127.0.0.1:5000/
echo Tekan CTRL+C untuk menghentikan server.
echo.
Scripts\python.exe app.py
pause

