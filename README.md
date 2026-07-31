# IBIS RICE — Operations Portal (Field, Warehouse & Finance)

A production-grade, offline-first digital payment and supply chain management web application built for **IBIS RICE CONSERVATION CO., LTD**.

---

## 🏗️ Architecture Overview

The system operates in a **dual-mode hybrid architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IBIS RICE WEB APPLICATION                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│       FIELD OPERATIONS       │          │     WAREHOUSE & FINANCE      │
│        (Offline-First)       │          │        (Online-Only)       │
├──────────────────────────────┤          ├──────────────────────────────┤
│ • Specs Record               │          │ • Warehouse Intake & Scale   │
│ • Farmer Payment Info        │          │ • Finance Reconciliation     │
│ • Purchase Record & Sacks    │          │ • Admin & Master Specs/Banks │
│ • Transport Dispatch         │          │ • Audit Logs & System Config │
├──────────────────────────────┤          ├──────────────────────────────┤
│ 💾 Persistent IndexedDB      │          │ 🌐 Direct PostgreSQL API     │
│ 📷 Base64 Photo Storage      │          │ 📊 Real-Time Server Queries  │
│ ✍️ Electronic Signatures     │          │                             │
│ 🖨️ Local Receipt Printing    │          │                             │
│ ⚡ Auto & Manual Sync        │          │                             │
└──────────────────────────────┘          └──────────────────────────────┘
```

1. **Field Operations (Offline-First Engine)**:
   - Covers: Quality Specs, Farmer Payment Profiles, Purchase Invoices, and Truck Transport Dispatch.
   - Saves all records immediately to browser IndexedDB (`ibis_rice_field_offline_v3`).
   - Photos (bank document passbooks) and farmer signatures are preserved as Base64 strings. Unsynced records survive browser refreshes and computer restarts.
   - Synchronizes with central PostgreSQL automatically when internet becomes available without duplicate creation.
2. **Warehouse & Finance (Online-Only)**:
   - Connects directly to central PostgreSQL server for real-time scale variance calculations, finance payment approvals, and audit logging.

---

## 📁 Directory Structure

```text
digitalization_payment_dev/
├── prisma/
│   ├── schema.prisma              # Active Prisma ORM database schema
│   ├── schema.postgresql.prisma   # PostgreSQL production schema template
│   └── seed.ts                    # Database initialization & seed script
├── public/
│   ├── logo.png                   # Official IBIS Rice logo
│   ├── sw.js                      # PWA Service Worker offline caching script
│   └── uploads/                   # Uploaded bank passbooks & scale photos
├── src/
│   ├── app/
│   │   ├── api/                   # REST API routes (specs, farmers, purchases, transport, warehouse, finance, admin)
│   │   ├── layout.tsx             # Root layout & PWA provider wrapper
│   │   ├── page.tsx               # Main multi-role operations dashboard UI
│   │   └── globals.css            # Tailored dark-mode UI design system
│   ├── components/                # Modular UI modals & details components
│   │   ├── OfflineQueueModal.tsx  # Header sync drawer modal
│   │   ├── PrintReceiptModal.tsx  # Printable purchase receipt component
│   │   ├── PrintManifestModal.tsx # Printable transport manifest component
│   │   └── ...
│   └── lib/
│       ├── db.ts                  # Shared PrismaClient instance
│       ├── offline-sync.ts        # IndexedDB offline store & background sync engine
│       └── auth.ts                # NextAuth credential authentication options
├── .env                           # Environment configuration file
├── .env.example                   # Environment configuration template
├── start-production-local.bat     # One-click Windows local production server launcher
├── switch-to-postgresql.bat       # One-click script to configure PostgreSQL (ibis_db)
├── start-production.sh            # Linux / AWS Lightsail production startup script
├── package.json                   # Dependencies and npm scripts
└── README.md                      # System documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: (Required for production desktop testing / AWS Lightsail deployment)

### 1. Installation
Clone or extract the project directory and install node dependencies:
```bash
npm install
```

---

### 2. Running Locally (Development Mode — SQLite)
For rapid local testing with built-in SQLite database:
```bash
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Deploying / Running on Target Desktop (PostgreSQL Production)

To run as a full local production server connected to your PostgreSQL database (`ibis_db`):

1. **One-Click Automated Setup (Windows)**:
   Simply double-click:
   ```cmd
   switch-to-postgresql.bat
   ```
   *This automatically configures `.env` with your password (`PostgreSQLSetha*1789`), syncs the database tables, seeds default accounts, compiles the Webpack production bundle, and starts the server on `http://localhost:3000`!*

2. **Manual Production Launch**:
   ```cmd
   start-production-local.bat
   ```

---

## 🔐 Default Pre-Configured User Accounts

All default accounts are initialized with password **`Ibis2026!`**:

| Role | Username | Permissions & Scope |
|---|---|---|
| **System Administrator** | `admin` | Full access across Field, Warehouse, Finance, User Mgmt & Price Specs |
| **Field Inspector** | `field` | Field Operations (Specs, Farmer Profiles, Purchases, Transport Dispatch) |
| **Warehouse Officer** | `warehouse` | Warehouse Receiving, Gross/Tare Scale Intake & Scale Variance Audit |
| **Finance Officer** | `finance` | Finance Truck Verification, Bank Bulk Transfers & Disbursement |

---

## ☁️ AWS Lightsail Deployment Ready

This application is ready to deploy to AWS Lightsail or any Linux VPS:
1. Copy this folder to your Linux server instance.
2. Edit `.env` with your production `DATABASE_URL` and `NEXTAUTH_SECRET`.
3. Make the launcher executable and run:
   ```bash
   chmod +x start-production.sh
   ./start-production.sh
   ```
