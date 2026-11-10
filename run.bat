@echo off
title DaniyouStuff.co - Django Web Server
cd /d "%~dp0"
echo ===================================================
echo     DANIYOUSTUFF.CO - DJANGO WEB APP
echo     Aesthetic Earthy Design
echo ===================================================
echo.
echo Server berjalan di: http://127.0.0.1:8000/
echo Tekan CTRL + C untuk mematikan server.
echo ===================================================
echo.

start "" "http://127.0.0.1:8000/"
Scripts\python.exe manage.py runserver 127.0.0.1:8000
pause
