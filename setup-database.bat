@echo off
title IBIS RICE Database Setup
echo =======================================================
echo IBIS RICE Database Initialization & Seed Script
echo =======================================================
cd /d "%~dp0ibis-app"
echo Pushing Prisma database schema...
cmd /c npx prisma db push
echo Seeding default accounts, banks, and prices...
cmd /c npx tsx prisma/seed.ts
echo.
echo Database setup & initial seed completed successfully!
pause
