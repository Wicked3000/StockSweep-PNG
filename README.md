# StockSweep PNG 🇵🇳
**Professional Inventory & POS Management System**

StockSweep PNG is a production-hardened inventory management system designed specifically for the Papua New Guinea retail environment. It features a robust XAMPP/MySQL backend and a modern React frontend.

---

## 🚀 Recent Core Updates (April 2026)

### 🛒 Advanced POS System
- **Multi-Item Cart**: Support for unlimited items per transaction.
- **Smart Merging**: Automatically combines duplicate items in the cart to keep receipts clean.
- **Batch Processing**: Sales are recorded as a single atomic transaction for maximum speed and data integrity.
- **In-Cart Controls**: Adjust quantities or "Void" items directly from the digital receipt.

### 💰 Financial Hardening
- **Profit Tracking**: Implemented `cost_price` and `cost_total` fields across products and sales.
- **Real-time Analytics**: Dashboard now calculates Gross Profit and total inventory value automatically.
- **Unit Price Breakdown**: Detailed "Price per unit" display on both the selection card and the final checkout list.

### 🛡️ System Stability & Security
- **127.0.0.1 Native Binding**: Switched from `localhost` to IP-based binding to resolve XAMPP connection refusal issues.
- **Database Self-Repair**: Upgraded `setup.php` to automatically detect missing columns and apply migrations without data loss.
- **Accessibility (A11y)**: Full audit completed. All interactive elements now include `aria-label` for screen reader compatibility.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: PHP 8 (XAMPP), MySQL.
- **State Management**: Zustand (with unified ApiService).
- **Communication**: RESTful API with JSON-based batch transactions.

---

## 📋 Setup & Installation

1. **XAMPP Configuration**:
   - Install XAMPP and start **Apache** and **MySQL**.
   - Ensure the `api` folder is located in `C:/xampp/htdocs/api` (or use the provided `setup_xampp_api.bat` to create a link).

2. **Database Initialization**:
   - Open a browser and visit `http://127.0.0.1/api/setup.php`.
   - This will create the `stocksweep_png` database and all necessary tables.

3. **Frontend Setup**:
   - Run `npm install` to install dependencies.
   - Run `npm run dev` to launch the application.

---

## 📦 System Features
- **Dashboard**: Real-time business intelligence with low-stock alerts.
- **Stock Count**: Easy adjustment of stock levels with audit-safe increments/decrements.
- **Record Sale**: High-speed, scanner-compatible Point of Sale.
- **Reports**: Detailed sales history with profitability breakdown.
- **Barcode Scanner**: Integrated camera-based scanner for mobile and desktop use.

---

## 👨‍💻 Maintenance
- **Schema Updates**: Always add new database changes to `src/api/setup.php`.
- **API Base**: The app is hardcoded to `127.0.0.1/api` for maximum stability in local networking environments.

*Last Updated: April 14, 2026*