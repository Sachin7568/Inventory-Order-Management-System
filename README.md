# 📦 Full-Stack Inventory & Order Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A production-ready, containerized, and highly polished full-stack application built for robust inventory tracking and order processing. The backend is powered by **FastAPI (Python)** and **PostgreSQL** (with transactional stock safety), and the frontend is a modern SPA powered by **React (TypeScript + Vite)**.

---

## 🔗 Live Deployments & Resources

| Resource | URL |
| :--- | :--- |
| **💻 Live Frontend Dashboard** | [inventory-order-management-system-rho.vercel.app](https://inventory-order-management-system-rho.vercel.app/) |
| **⚙️ Live Backend API Docs** | [inventory-backend-478w.onrender.com/docs](https://inventory-backend-478w.onrender.com/docs) |
| **🐙 GitHub Repository** | [Sachin7568/Inventory-Order-Management-System](https://github.com/Sachin7568/Inventory-Order-Management-System) |
| **🐳 Docker Hub Image** | [sachin10094/inventory-backend](https://hub.docker.com/r/sachin10094/inventory-backend) |

---

## ✨ Features

- **📊 Comprehensive Analytics Dashboard:** Real-time KPIs showing total products, customers, orders, and highlighting low stock alerts.
- **📦 Product Management:** Full CRUD operations for products featuring unique SKUs, price constraints, and real-time stock levels.
- **👥 Customer Profiles:** Unique email check and phone record management with cascade-on-delete order tracking.
- **🛒 Safe Order Processing:** ACID transaction handling:
  - Validates customer and stock levels.
  - Automatically calculates total amounts.
  - Dynamically reduces stock levels atomically.
  - Rolls back the entire transaction if any product has insufficient stock (preventing race conditions).
  - Automatically restores inventory stock if an order is cancelled/deleted.
- **🎨 Premium UI/UX:** Responsive, modern design using custom CSS design tokens, smooth hover effects, micro-animations, and clean typography (Inter/Outfit).

---

## 🛠️ Tech Stack

### Backend
- **FastAPI:** High-performance ASGI framework for building APIs.
- **SQLAlchemy (ORM) & PostgreSQL:** Robust relational data mapping and execution.
- **Pydantic:** Strictly enforced data validation and serialization schemas.
- **Pytest & TestClient:** Comprehensive integration suite for testing API endpoints.

### Frontend
- **React (v19) & TypeScript:** Component-driven development with strict typing.
- **Vite:** Next-generation frontend tooling for fast bundling and hot module replacement.
- **React Router (v7):** Declarative, client-side routing.
- **Axios:** Standardized HTTP client for backend communication.
- **Lucide Icons:** Clean, customizable vector icons.
- **Vanilla CSS:** Highly optimized, semantic design system without heavy framework overhead.

---

## 📐 Database Schema & Architecture

```mermaid
erDiagram
    Product {
        int id PK
        string name
        string sku UK
        float price
        int quantity
    }
    Customer {
        int id PK
        string full_name
        string email UK
        string phone
    }
    Order {
        int id PK
        int customer_id FK
        float total_amount
        datetime created_at
    }
    OrderItem {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
    }

    Customer ||--o{ Order : places
    Order ||--|{ OrderItem : contains
    Product ||--o{ OrderItem : ordered_in
```

### Directory Structure

```text
├── backend/
│   ├── app/
│   │   ├── routers/       # API endpoints (products, customers, orders)
│   │   ├── tests/         # Integration test suite (pytest)
│   │   ├── crud.py        # Database operations & ACID transactions
│   │   ├── database.py    # SQLAlchemy engine, session maker, and DB dependency
│   │   ├── models.py      # SQLAlchemy DB schema models
│   │   ├── schemas.py     # Pydantic validation schemas
│   │   └── main.py        # FastAPI app creation & error handlers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (nav, cards, alerts)
│   │   ├── pages/         # Page components (Dashboard, Products, Customers, Orders)
│   │   ├── services/      # Axios API request service configurations
│   │   ├── App.tsx        # Main routing and App container
│   │   └── index.css      # Core Vanilla CSS design system
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Multi-container local execution setup
└── README.md
```

---

## 🚀 Local Installation & Run Guide

### Option 1: Docker Compose (Quickest)

Ensure you have **Docker** and **Docker Compose** installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sachin7568/Inventory-Order-Management-System.git
   cd Inventory-Order-Management-System
   ```
2. **Create environment file:**
   Copy the example environment settings:
   ```bash
   cp .env.example .env
   ```
3. **Spin up the services:**
   ```bash
   docker-compose up --build
   ```
4. **Access the application:**
   - 🖥️ **Frontend:** `http://localhost:3000`
   - ⚙️ **Swagger API Docs:** `http://localhost:8000/docs`

---

### Option 2: Manual Local Development

If you prefer running services independently:

#### 1. Database & Backend Setup
Make sure you have a PostgreSQL database instance running or leave `DATABASE_URL` unset to automatically fallback to a local SQLite database (`sqlite:///./sql_app.db`).

```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Run server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```

To run the integration tests:
```bash
pytest
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The client will start on `http://localhost:5173` (or configured Vite port). Copy the `.env` settings if pointing to a non-default backend port.

---

## 🔌 API Reference Guide

### 📦 Products Endpoint (`/products`)

| Method | Path | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/products` | None (supports `skip`, `limit` query parameters) | Retrieve list of all products |
| **POST** | `/products` | `{ name, sku, price, quantity }` | Add a new product (SKU must be unique) |
| **GET** | `/products/{id}` | None | Get specific product detail |
| **PUT** | `/products/{id}` | `{ name, sku, price, quantity }` (all optional) | Update product attributes |
| **DELETE** | `/products/{id}` | None | Remove product |

### 👥 Customers Endpoint (`/customers`)

| Method | Path | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/customers` | None (supports `skip`, `limit` query parameters) | Retrieve list of all customers |
| **POST** | `/customers` | `{ full_name, email, phone }` | Register a customer (Email must be unique) |
| **GET** | `/customers/{id}` | None | Retrieve specific customer details |
| **DELETE** | `/customers/{id}`| None | Remove customer (Cascades order removal) |

### 🛒 Orders Endpoint (`/orders`)

| Method | Path | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/orders` | None (supports `skip`, `limit` query parameters) | Retrieve list of all orders |
| **POST** | `/orders` | `{ customer_id, items: [{ product_id, quantity }] }` | Create an order. Triggers atomic stock check & reduction. |
| **GET** | `/orders/{id}` | None | Retrieve specific order details |
| **DELETE** | `/orders/{id}`| None | Cancel order (Deletes order record, restores product inventory) |

---

## 🔒 Environment Variable Configuration

| Variable Name | Description | Default Value / Example | Required |
| :--- | :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL superuser username (Docker) | `inventory_user` | Yes (for Docker compose) |
| `POSTGRES_PASSWORD`| PostgreSQL password (Docker) | `secure_password_here` | Yes (for Docker compose) |
| `POSTGRES_DB` | PostgreSQL database name (Docker) | `inventory_db` | Yes (for Docker compose) |
| `DATABASE_URL` | SQLAlchemy-compatible Database connection URL | `postgresql://user:pass@host:port/db` | Optional (default: SQLite) |
| `VITE_API_URL` | Base API target URL for frontend requests | `http://localhost:8000` | Optional |

---

## ☁️ Deployment Reference

### 1. Database (Neon Postgres)
- Spin up a serverless PostgreSQL instance on **Neon**.
- Retrieve the connection string URI and set it as `DATABASE_URL` in backend configurations.

### 2. Backend API Service (Render via Docker)
- Deploy Web Service connected to your repository.
- Root Directory: `backend`.
- Environment: Select **Docker** (Render reads the `Dockerfile` automatically).
- Configure Environment Variables: `DATABASE_URL` (pointing to Neon).

### 3. Frontend Web Service (Vercel)
- Create project, select `frontend` as root folder, select **Vite** framework preset.
- Configure Environment Variables: Set `VITE_API_URL` to your live Render backend API URL.

---
