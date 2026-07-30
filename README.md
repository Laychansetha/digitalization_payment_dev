# 🌾 IBIS RICE CONSERVATION CO., LTD — Operations Portal

> **Integrated Field, Warehouse, & Finance Operations Web Application**  
> Built with Next.js 16 (App Router), TypeScript, Prisma ORM, SQLite, and NextAuth.js.

---

## 🖥️ Environment Architecture & Workflow

| Environment | Machine | Purpose & Workflow | Network Access |
| :--- | :--- | :--- | :--- |
| 💻 **Development** | **Primary Dev PC** (`digitalization_payment_dev`) | Feature development, bug fixes, UI/API enhancements, and local unit testing. | `http://localhost:3000` |
| 🧪 **Testing / UAT** | **Secondary Desktop Computer** | Stable testing environment for multi-user team testing (Field, Warehouse, Finance, Admin). | `http://<UAT_SERVER_IP>:3000` |

### Deployment Lifecycle:
1. **Develop on Primary PC**: All new feature requests, schema changes, and UI improvements are implemented and verified locally on this PC.
2. **Local Verification**: Execute `npm run build` to confirm type safety and zero compilation warnings.
3. **Deploy to UAT Server**: Once feature milestones are approved, code changes are committed and deployed to the secondary desktop computer for team User Acceptance Testing (UAT).

---

## 🌐 Local Network (Wi-Fi / LAN) UAT Deployment Guide

Follow these steps when updating or deploying to the secondary testing desktop computer:

### 1. Prerequisites (Host Server Computer)
- **Operating System**: Windows 10 / 11 (64-bit)
- **Node.js**: Version 18 LTS or higher ([Download Node.js](https://nodejs.org/))
- **Network**: Connected to local Wi-Fi or LAN router

---

### 2. Quick One-Click Setup

1. **Clone or Copy Repository**:
   Copy the project folder to your host Windows desktop computer.

2. **Initialize Database**:
   Double-click `setup-database.bat` (or run in Command Prompt):
   ```cmd
   cd ibis-app
   npm install
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. **Start the Production Server**:
   Double-click `start-server.bat` (or run in Command Prompt):
   ```cmd
   cd ibis-app
   npm run build
   npm run start
   ```
   The server will start listening on `http://0.0.0.0:3000`.

---

### 3. Windows Firewall Configuration

To allow other computers on the same network to connect, run the following command in **Command Prompt (Admin)**:

```cmd
netsh advfirewall firewall add rule name="IBIS RICE App" dir=in action=allow protocol=TCP localport=3000
```

---

### 4. How to Connect from Other Devices

1. **Find Server IP Address**:
   On the host Windows computer, open Command Prompt and type:
   ```cmd
   ipconfig
   ```
   Look for your **IPv4 Address** (e.g. `192.168.1.15`).

2. **Access from Field Tablets / Desktop Computers**:
   On any phone, tablet, or PC connected to the same Wi-Fi/LAN, open a browser and navigate to:
   ```text
   http://<SERVER_IP>:3000
   ```
   *Example*: `http://192.168.1.15:3000`

---

## 👥 Default User Accounts

| Role | Username / Email | Password | Allowed Modules |
| :--- | :--- | :--- | :--- |
| 🌾 **Field Staff** | `field@ibisrice.com` | `Ibis2026!` | Field Operations Only |
| 🏬 **Warehouse Staff** | `warehouse@ibisrice.com` | `Ibis2026!` | Warehouse Receiving Only |
| 💳 **Finance Staff** | `finance@ibisrice.com` | `Ibis2026!` | Finance Verification Only |
| ⚙️ **System Admin** | `admin@ibisrice.com` | `Ibis2026!` | Full Access to All 4 Modules |

---

## 🔑 Login & Role Verification System

- Users select their target role using the **Quick Select Role** selector on the login page.
- Users **must** enter their assigned **Username** and **Password**.
- The authentication provider checks:
  1. Username exists and password matches (`bcrypt`).
  2. User account status is `ACTIVE`.
  3. The selected role matches the user's assigned role in the database.
- System Admin can create new accounts, edit roles, toggle Active/Inactive status, and reset passwords in **Admin Master Settings → User Accounts**.

---

## 📄 License & Contact

**IBIS RICE CONSERVATION CO., LTD**  
Phnom Penh / Preah Vihear, Cambodia.
