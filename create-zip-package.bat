@echo off
title Create Clean IBIS RICE Deployment Package
color 0A
cls
echo ======================================================================
echo  CREATING CLEAN DEPLOYMENT PACKAGE FOR IBIS RICE
echo ======================================================================
echo.
echo Packaging application files into ibis-rice-app.zip (Excluding locked IDE & temp files)...
echo.

powershell -Command "Compress-Archive -Path 'src', 'prisma', 'public', 'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts', 'postcss.config.mjs', 'eslint.config.mjs', 'next-env.d.ts', '.env', '.env.example', '.gitignore', 'start-production-local.bat', 'switch-to-postgresql.bat', 'start-production.sh', 'README.md' -DestinationPath 'ibis-rice-app.zip' -Force"

echo ======================================================================
echo SUCCESS! Created clean transfer zip file: ibis-rice-app.zip (~5 MB)
echo ======================================================================
echo.
echo 1. Copy 'ibis-rice-app.zip' to your USB drive or target computer.
echo 2. Extract it on the target computer.
echo 3. Run 'npm install' then double-click 'switch-to-postgresql.bat'!
echo.
pause
