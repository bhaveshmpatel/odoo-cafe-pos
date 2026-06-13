# Odoo Cafe POS ☕️

> A real-time, full-stack Point-of-Sale and Kitchen Display System built for modern cafes.

[cite_start]This project is a unified, three-part system designed to manage restaurant operations from demand to delivery[cite: 272]. [cite_start]It features a centralized Administrative Backend, a high-speed POS Terminal for cashiers, and a real-time reactive Kitchen Display System (KDS)[cite: 272, 273].

**[Link to Live Demo]** | **[Link to Demo Video]**

---

## 🚀 The Architecture
This project is built as a Monorepo using **Turborepo** to separate concerns while sharing database schemas and TypeScript interfaces across the stack.

* **Frontend (`apps/web`):** Next.js (App Router), Tailwind CSS, Zustand (State Management).
* **Backend (`apps/api`):** Node.js, Express, Socket.io (for real-time KDS syncing).
* **Database (`packages/database`):** PostgreSQL managed via **Prisma ORM**.
* **Shared Types (`packages/shared-types`):** Centralized TypeScript interfaces for end-to-end type safety.

---

## ✨ Core Features

### 1. Administrative Backend
[cite_start]The control center for cafe owners (Admin role).
* [cite_start]**Menu & Inventory:** Manage products, categories, and dynamic UI colors[cite: 295, 308].
* [cite_start]**Spatial Floor Plans:** Create and map out floors and physical table arrangements[cite: 319].
* [cite_start]**Automated Promotions:** Set conditional pricing rules based on minimum quantities or order totals[cite: 330, 332, 333].
* [cite_start]**Real-time Analytics:** View live dashboards with sales trends, top products, and exportable reports[cite: 352, 368].

### 2. The POS Terminal
[cite_start]A fast, offline-resilient interface for cashiers (Employee role).
* **Multi-Table Cart State:** Switch between active tables without losing un-submitted cart data.
* [cite_start]**Dynamic Payments:** Process Cash, Card, or automatically generated UPI QR codes[cite: 421, 422, 424].
* [cite_start]**Customer Tracking:** Assign specific customers to orders for email receipt delivery[cite: 461].

### 3. Kitchen Display System (KDS)
[cite_start]A reactive pipeline for the kitchen staff[cite: 463].
* [cite_start]**Real-Time Sync:** WebSockets instantly push new orders from the POS to the kitchen[cite: 464].
* [cite_start]**Stage Progression:** Move tickets from *To Cook* → *Preparing* → *Completed*[cite: 470].
* [cite_start]**Item-Level Tracking:** Tap individual items on a ticket to strike them through as they are plated[cite: 478].

---

## 🛠️ Local Development Setup

Follow these steps to run the complete ecosystem locally.

### Prerequisites
* Node.js (v18+)
* PostgreSQL running locally or via Docker
* `pnpm` or `npm` installed globally

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/odoo-cafe-pos.git](https://github.com/your-username/odoo-cafe-pos.git)
cd odoo-cafe-pos
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (or use `.env.example` as a template).

```env
DATABASE_URL="postgresql://user:password@localhost:5432/odoocafe"
NEXT_PUBLIC_API_URL="http://localhost:4000"
JWT_SECRET="super_secret_hackathon_key"

```

### 3. Database Initialization (Prisma)

Generate the client and push the schema to your PostgreSQL database.

```bash
cd packages/database
npx prisma db push
npx prisma generate

```

### 4. Run the Turborepo

This single command will boot up both the Next.js frontend and the Node/Express backend simultaneously.

```bash
npm run dev

```

* **Frontend / POS:** `http://localhost:3000`
* **Backend API:** `http://localhost:4000`

---

## 🔑 Demo Credentials

To test the system, use the following pre-seeded accounts:

**Admin / Owner (Backend Access)** 

* **Email:** admin@cafe.com
* **Password:** admin123

**Cashier / Employee (POS Access)** 

* **Email:** employee@cafe.com
* **Password:** pos123

---

*Built for the Odoo Hackathon* 🚀

```

```