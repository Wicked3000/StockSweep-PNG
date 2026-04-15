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
- **Backend (Hybrid)**: 
  - **Local**: PHP 8 (XAMPP), MySQL.
  - **Cloud/Mobile**: Built-in `LocalStorage` standalone persistence.
- **Mobile Engine**: Capacitor 6.
- **PWA**: Automated manifest with premium icons.

---

## 📱 Mobile & Cloud Integration
- **Vercel Enabled**: Optimized for cloud deployment to ensure secure (HTTPS) camera access on real phones.
- **Standalone Mode**: Built-in logic to detect server connectivity. If the backend is unreachable (e.g., testing on mobile), the app automatically shifts to offline memory.
- **Native Android**: Pre-configured with **Capacitor**—ready to build as a native `.apk`.

---

## 📋 Setup & Installation

1. **Local Desktop (XAMPP)**:
   - Install XAMPP and start **Apache** and **MySQL**.
   - Visit `http://127.0.0.1/api/setup.php` to initialize the DB.

2. **Mobile Testing (Vercel)**:
   - Link your GitHub repo to Vercel for instant hosting.
   - Tap **"Add to Home Screen"** to install as a real app.
   - Tap **"Continue in Standalone Mode"** to test without a server.

---

## 📦 System Features
- **Dashboard**: Real-time business intelligence with low-stock alerts.
- **Smart Scanner**: Integrated camera-based scanner with audio and haptic feedback.
- **Stock Count**: Audit-safe inventory adjustment.
- **Record Sale**: High-speedPoint of Sale.
- **Reports**: Detailed sales and profitability history.

---

## 👨‍💻 Maintenance
- **Schema Updates**: Always add new database changes to `src/api/setup.php`.
- **API Base**: The app is hardcoded to `127.0.0.1/api` for maximum local stability.

*Last Updated: April 15, 2026 (Mobile-Hardening Release)*