@echo off
title IBIS RICE Operations Server Launcher
echo =======================================================
echo IBIS RICE CONSERVATION CO., LTD - Multi-User LAN Server
echo =======================================================
echo Starting Next.js Production Server on 0.0.0.0:3000...
cd /d "%~dp0ibis-app"
cmd /c npm run build && cmd /c npm run start
pause
