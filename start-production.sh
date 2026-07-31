#!/bin/bash
# ======================================================================
# IBIS RICE CONSERVATION CO., LTD - PRODUCTION LAUNCHER (LINUX/LIGHTSAIL)
# ======================================================================

set -e

echo "[1/3] Ensuring public/uploads directory exists..."
mkdir -p public/uploads

echo "[2/3] Running Prisma database migration and seed..."
npx prisma db push --skip-generate
npx tsx prisma/seed.ts

echo "[3/3] Building Next.js production bundle..."
npm run build

echo "======================================================================"
echo "Starting IBIS RICE Production Application on port 3000..."
echo "======================================================================"

npm run start
