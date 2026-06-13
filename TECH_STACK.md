# Technical Stack & Architecture

This document serves as the single source of truth for the technologies, libraries, and architectural decisions used in the Odoo Cafe POS project.

## 🏗 Core Architecture: Turborepo
We are utilizing a monorepo structure managed by **Turborepo** to strictly separate our frontend and backend while sharing TypeScript interfaces and database schemas.

* **Package Manager:** `pnpm`
* **Language:** TypeScript (Strict mode enabled globally)

## 🎨 Frontend (`apps/web`)
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS (using standard utility classes; dynamic category colors mapped via inline styles or CSS variables).
* **State Management:** Zustand (Crucial for maintaining offline-resilient, multi-table cart states).
* **Key Dependencies:**
    * `socket.io-client`: Used in the KDS route to listen for real-time order updates.
    * `lucide-react`: Standardized icon library.

## ⚙️ Backend (`apps/api`)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Real-Time Engine:** Socket.io (Handles emitting `new_order` and `item_status_update` events to the KDS).
* **Authentication:** JSON Web Tokens (JWT) & `bcrypt` (For Admin and Employee login sessions).

## 🗄️ Database (`packages/database`)
* **Database Engine:** PostgreSQL
* **ORM:** Prisma 
* *Architecture Note:* The `schema.prisma` file and generated Prisma Client reside entirely within this package. The Express backend imports the client from here to ensure 100% type safety on all queries.

## 🧩 Shared Types (`packages/shared-types`)
A centralized repository for TypeScript interfaces (e.g., `Order`, `CartItem`, `Product`, `User`). Both the `web` and `api` applications import from this package to guarantee the WebSocket payloads and API responses perfectly match the frontend expectations.