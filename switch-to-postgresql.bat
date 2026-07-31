@echo off
title IBIS RICE PostgreSQL Production Server Launcher
color 0B
cls
echo ======================================================================
echo  IBIS RICE CONSERVATION CO., LTD - POSTGRESQL PRODUCTION SERVER
echo ======================================================================
echo.
echo [1/4] Verifying uploads directory...
if not exist "public\uploads" mkdir "public\uploads"

echo [2/4] Writing PostgreSQL connection settings...
(
echo DATABASE_URL="postgresql://postgres:PostgreSQLSetha*1789@localhost:5432/ibis_db?schema=public"
echo NEXTAUTH_SECRET="ibis-rice-secret-key-2026-production-super-secure"
echo NEXTAUTH_URL="http://localhost:3000"
echo PORT=3000
echo HOSTNAME="0.0.0.0"
) > ".env"

echo [3/4] Generating Prisma PostgreSQL Client & Syncing ibis_db tables...
call npx prisma generate
call npx prisma db push
call npx tsx prisma/seed.ts

echo [4/4] Building Production Server...
call npm run build

echo.
echo ======================================================================
echo SUCCESS! Connected to PostgreSQL database (ibis_db).
echo Starting IBIS RICE Production Application on http://localhost:3000 ...
echo Network LAN Access: http://0.0.0.0:3000
echo ======================================================================
echo Press Ctrl+C to stop the server.
echo.
call npm run start
pause
