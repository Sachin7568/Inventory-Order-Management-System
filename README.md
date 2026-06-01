# Full-Stack Inventory & Order Management System

A production-ready, containerized full-stack application built with FastAPI (Python), React (TypeScript + Vite), and PostgreSQL.

## Features
- **Product Management:** Add, update, delete, and view products with unique SKUs and stock tracking.
- **Customer Management:** Manage customers with unique emails and contact details.
- **Order Management:** Create orders, automatically calculate total amounts, and dynamically reduce product stock upon order creation.
- **Dashboard:** At-a-glance analytics including total products, customers, orders, and low stock alerts.
- **Beautiful UI:** A highly polished, responsive interface built with pure Vanilla CSS and modern design tokens.

## Tech Stack
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Axios, React Router, Lucide Icons, Vanilla CSS
- **Infrastructure:** Docker, Docker Compose

---

## Local Development (Docker Compose)

The easiest way to run the entire stack locally is via Docker Compose.

### Prerequisites
- Docker & Docker Compose installed on your machine.

### Instructions

1. **Clone the repository** (if you haven't already).
2. **Run Docker Compose:**
   ```bash
   docker-compose up --build
   ```
3. **Access the application:**
   - **Frontend UI:** `http://localhost:3000`
   - **Backend API Docs (Swagger):** `http://localhost:8000/docs`

---

## Manual Local Development (Without Docker)

If you prefer to run the services individually:

### Backend
```bash
cd backend
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*(By default, this will create a local SQLite database if no `DATABASE_URL` environment variable is provided).*

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation Notes

- **Authentication:** Currently, the API is public (no JWT/OAuth required) for simplicity in the assessment.
- **Payload Requirements:**
  - `POST /products`: Requires unique `sku` and `price >= 0`, `quantity >= 0`.
  - `POST /customers`: Requires unique `email`.
  - `POST /orders`: Expects a valid `customer_id` and a list of `items` containing `product_id` and `quantity > 0`. If any product lacks sufficient stock, the entire transaction is rolled back and returns a 400 error.
- **Health Check:** `GET /health` is available to verify API uptime.

---

## Deployment Checklist (Render, Neon, Vercel)

### 1. Database (Neon Postgres)
- [ ] Create a new project in Neon.
- [ ] Copy the provided connection string (e.g., `postgresql://...`).

### 2. Backend (Render)
- [ ] Create a new **Web Service** on Render connected to your GitHub repository.
- [ ] Root Directory: `backend`
- [ ] Environment: `Docker` (Render will automatically detect the `Dockerfile`).
- [ ] **Environment Variables:**
  - `DATABASE_URL`: Paste the connection string from Neon.
- [ ] Deploy and copy the live API URL once successful (e.g., `https://my-backend.onrender.com`).

### 3. Frontend (Vercel)
- [ ] Create a new Project in Vercel connected to your GitHub repository.
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: `frontend`
- [ ] **Environment Variables:**
  - `VITE_API_URL`: Paste the live backend API URL from Render.
- [ ] Deploy!

## Submission Links

- **GitHub Repository:** https://github.com/Sachin7568/Inventory-Order-Management-System
- **Docker Hub Image:** https://hub.docker.com/r/sachin10094/inventory-backend
- **Live Frontend:** https://inventory-order-management-system-rho.vercel.app/
- **Live Backend:** https://inventory-backend-478w.onrender.com
