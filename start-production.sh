#!/bin/bash
# ======================================================================
# IBIS RICE CONSERVATION CO., LTD - PRODUCTION LAUNCHER (LINUX/LIGHTSAIL)
# ======================================================================

set -e

echo "[1/4] Entering ibis-app directory..."
cd "$(dirname "$0")/ibis-app"

echo "[2/4] Ensuring public/uploads directory exists..."
mkdir -p public/uploads

echo "[3/4] Running Prisma database migration and seed..."
npx prisma db push --skip-generate
npx tsx prisma/seed.ts

echo "[4/4] Building Next.js production bundle..."
npm run build

echo "======================================================================"
echo "Starting IBIS RICE Production Application on port 3000..."
echo "======================================================================"

npm run start
