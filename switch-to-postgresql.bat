@echo off
title Switch IBIS RICE to PostgreSQL Production Database
color 0B
cls
echo ======================================================================
echo  CONFIGURING IBIS RICE FOR POSTGRESQL (DESKTOP PRODUCTION SERVER)
echo ======================================================================
echo.
echo [1/4] Copying PostgreSQL Schema template...
copy /y "ibis-app\prisma\schema.postgresql.prisma" "ibis-app\prisma\schema.prisma"

echo [2/4] Writing PostgreSQL connection settings with your password...
(
echo DATABASE_URL="postgresql://postgres:PostgreSQLSetha*1789@localhost:5432/ibis_db?schema=public"
echo NEXTAUTH_SECRET="ibis-rice-secret-key-2026-production-super-secure"
echo NEXTAUTH_URL="http://localhost:3000"
echo PORT=3000
echo HOSTNAME="0.0.0.0"
) > "ibis-app\.env"

echo [3/4] Generating Prisma PostgreSQL Client & Syncing ibis_db tables...
cd /d "%~dp0ibis-app"
call npx prisma generate
call npx prisma db push
call npx tsx prisma/seed.ts

echo [4/4] Building Webpack Production Server...
call npm run build

echo.
echo ======================================================================
echo SUCCESS! PostgreSQL ibis_db connected, synced, and seeded!
echo Starting IBIS RICE Production Server on http://localhost:3000 ...
echo Network LAN Access: http://0.0.0.0:3000
echo ======================================================================
echo Press Ctrl+C to stop the server at any time.
echo.
call npm run start
pause
