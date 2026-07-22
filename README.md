# IBIS Rice - Digitalization Payment & Field Operations Dev

Welcome to the **digitalization_payment_dev** repository. This project contains a suite of offline-ready, client-side web tools and reference documents designed to digitalize and streamline field operations, quality control, payments, and transport logistics for **IBIS Rice Conservation Co., Ltd.**

---

## 📂 Repository Contents

The workspace contains the following files:

### 1. Interactive Tools (HTML/JS)
*   **[paddy_purchase_invoice.html](file:///c:/Users/laych/Documents/digitalization_payment_dev/paddy_purchase_invoice.html)**: 
    *   **Paddy Purchase Record**: Digital tool to record transactions with producers (Farmer name, Family code, Village), calculate paddy weights and prices across various grades, and automatically compute seed return deductions (at 10% interest/110% repayment weight).
    *   **Transport Record & Logistics**: Integrates logistics tracking, allowing field staff to log loading date/time, driver details, truck plate numbers, and verify truck sanitation.
    *   **Features**: Import purchase records directly to transport lists, print-ready layout styling, history logs saved in local storage, and CSV export capabilities.
*   **[specs_checking_record.html](file:///c:/Users/laych/Documents/digitalization_payment_dev/specs_checking_record.html)**:
    *   **Quality Inspection Tool**: Allows quality inspectors to measure and validate key quality specifications of paddy (Moisture %, Purity %, Impurities %, Broken Rice %, Whole Grain %, Foreign Matter %).
    *   **Pricing Engine**: Automatically maps quality metrics to grading standards, looks up base pricing in real-time, and applies organic bonuses (+100 KHR/kg) to compute final purchase rates.
    *   **Dashboard & History**: Displays key metrics (Total Samples, Pass Rate, Avg Price) and lists historical inspection entries with search, edit, sort, and CSV export functions.

### 2. Reference Documents & Records
*   **[paddy specification and price.pdf](file:///c:/Users/laych/Documents/digitalization_payment_dev/paddy%20specification%20and%20price.pdf)**: Official specification manual outlining quality thresholds, grading tiers, and purchase price frameworks.
*   **[Paddy Purchased Record-2025.docx](file:///c:/Users/laych/Documents/digitalization_payment_dev/Paddy%20Purchased%20Record-2025.docx)**: Official template and log for recording purchase volumes and prices during the 2025 harvest season.
*   **[Paddy Transport Record-2025.docx](file:///c:/Users/laych/Documents/digitalization_payment_dev/Paddy%20Transport%20Record-2025.docx)**: Log sheet and verification checklists for transport operations and shipping compliance in 2025.

---

## ⚡ Key Technical Features of the Web Apps

*   **100% Offline-Ready**: Designed for remote agricultural fields. All data is processed on the client side, using the browser's `localStorage` for data persistence.
*   **Tailored UI/UX**: Styled with an elegant dark theme using modern typography (Inter font), grid systems, responsive flex layouts, CSS variables, and clean interactive elements (modals, toasts, transitions).
*   **CSV Exports**: Supports exporting recorded transactions/inspections directly to `.csv` files for backend database imports or Excel analysis.
*   **Print Optimization**: Styled with print media queries (`@media print`) so field operators can print clean invoice receipts and records to physical paper.

---

## 🚀 How to Run Locally

Since these are pure client-side applications (HTML/CSS/JS), **no server setup or installation is required**.

1. Clone or download this repository.
2. Double-click either **`paddy_purchase_invoice.html`** or **`specs_checking_record.html`** to open it in any modern web browser (Chrome, Edge, Safari, Firefox).
3. (Optional) Run a lightweight local server if preferred:
   ```bash
   npx serve .
   ```
