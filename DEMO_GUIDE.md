# 🌟 FundsRoom ERP/CRM - Live Demo & Evaluator Guide

Welcome to the live demonstration guide for **FundsRoom**, a full-stack Wholesale & Distribution ERP/CRM platform. This document is designed for recruiters, evaluators, and developers to easily explore the live deployment of the application.

---

## 🔗 Live Application Links

- **Frontend App (Vercel)**: [https://backend-r819.vercel.app](https://backend-r819.vercel.app)
- **Backend API (Render)**: [https://fundsroom-backend-n7oe.onrender.com/api](https://fundsroom-backend-n7oe.onrender.com/api)
- **Backend API Health Check**: [Check API Status](https://fundsroom-backend-n7oe.onrender.com/api/health)

---

## 🔑 Test Credentials (Role-Based Access)

The application uses strict Role-Based Access Control (RBAC). Use the credentials below to log in and test different capabilities.

**Global Password for all accounts:** `Password123`

| Role / Department | Login Email | What You Can Test |
| :--- | :--- | :--- |
| **Admin** (Full Access) | `admin@fundsroom.com` | Complete access to everything. Highly recommended for exploring all features. |
| **Sales Executive** | `sales@fundsroom.com` | View CRM, manage customers, create Sales Challans (Invoices), export PDFs. |
| **Warehouse Manager** | `warehouse@fundsroom.com` | View product catalog, log manual stock movements (IN/OUT), track inventory levels. |
| **Accounts / Billing** | `accounts@fundsroom.com` | View the global sales ledger and cancel confirmed challans to restore stock. |

---

## 🎯 Step-by-Step Testing Walkthrough

Here is a quick guide to test the core features of the platform:

### 1. Test Authentication & Dashboard
- Navigate to the **[Frontend App](https://backend-r819.vercel.app)**.
- Log in using `admin@fundsroom.com` and `Password123`.
- Notice how the **Dashboard** dynamically pulls live statistics from the backend database (total customers, total products, low stock alerts).

### 2. Test the CRM (Customers)
- Go to the **Customers** tab.
- Click **"Add Customer"** and create a test customer (e.g., a Retail or Wholesale client).
- The system prevents duplicate emails and enforces valid GST formats.

### 3. Test the Inventory Engine (Products)
- Go to the **Products** tab.
- Note the stock levels of the existing products.
- As the Warehouse Manager or Admin, you can manually log a stock movement (e.g., add 50 units of new stock). Watch the inventory math update instantly in the cloud!

### 4. Test the Core Feature: Sales Challans (Invoicing)
- Go to the **Challans** tab.
- Click **"Create Challan"** to open the wizard.
- Select a Customer, add a few Products to the invoice, and save it as **Draft**.
- Click on your newly created Draft Challan in the ledger. 
- Click **"Confirm & Lock Stock"**. The backend automatically executes a transactional database lock, deducting the required stock from inventory.
- **Cancel it:** Notice how clicking "Cancel Invoice" cleanly releases the stock lock and restores the product inventory count.

### 5. 🌟 Bonus Feature: Export PDF
- Click on any Challan in the ledger (Draft, Confirmed, or Cancelled).
- On the detailed invoice view, click the **"PDF"** download icon next to the Print button.
- The system will instantly generate and download a beautifully formatted, vector PDF of the distribution invoice directly to your computer!

---

## 🛠️ Technical Highlights

For a deep dive into how this was built, refer to the main [`README.md`](./README.md). In short, this platform demonstrates:

- **Enterprise CI/CD Pipelines**: Fully automated GitHub Actions for parallel testing (Vitest) and deployment.
- **Relational Integrity**: Built on **PostgreSQL** & **Prisma ORM** with complex `$transaction` rollbacks for stock safety.
- **Modern UI**: A responsive, fast React 18 interface styled purely with Tailwind CSS.
- **Security**: JWT-based stateless authentication and strict backend permission guards.

Enjoy exploring the platform!
