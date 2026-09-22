# ☁️ Cloud-Based Retail Product Catalog Management System

A full-stack cloud computing project for managing retail products, categories, inventory, stock levels, and product information through a web-based dashboard.

## 📌 Project Overview

The **Cloud-Based Retail Product Catalog Management System** provides a centralized platform for retail businesses to manage their product catalog efficiently.

The system allows administrators to:

- Add new products
- Edit existing products
- Delete products
- Search products
- Filter products by category
- Manage product categories
- Track inventory and stock levels
- Identify low-stock products
- Identify out-of-stock products
- View dashboard statistics
- Manage user registration and login

The application follows a modern **frontend + backend + database** architecture.

---

## 🎯 Objectives

- Develop a centralized retail product management platform.
- Provide an easy-to-use product catalog interface.
- Maintain product and inventory information digitally.
- Monitor stock levels in real time.
- Provide dashboard-based product statistics.
- Implement user authentication.
- Use a lightweight relational database for data storage.
- Demonstrate cloud computing and full-stack application concepts.

---

## ✨ Features

### 🔐 User Authentication

- User registration
- User login
- Authentication using backend APIs
- Local session/token storage

### 📊 Dashboard

The dashboard displays:

- Total Products
- Total Stock
- Low Stock Products
- Out-of-Stock Products
- Recent product information
- Inventory alerts

### 📦 Product Management

Users can:

- Add products
- Edit products
- Delete products
- Search products
- Filter products
- View product details

Product information includes:

- Product Name
- Brand
- Category
- Price
- Stock Quantity
- Product Image URL
- Description
- Status

### 🗂️ Category Management

The system provides:

- Product category listing
- Category-wise product count
- Category-wise stock information
- Category filtering

Default categories include:

- Electronics
- Clothing
- Groceries
- Home & Kitchen
- Beauty
- Sports
- Books

### 📋 Inventory Management

Inventory monitoring includes:

- Current stock quantity
- In-stock products
- Low-stock products
- Out-of-stock products
- Stock status indicators

### 🔎 Search and Filtering

Products can be searched and filtered using:

- Product name
- Brand
- Category

---

## 🏗️ System Architecture

```text
                ┌──────────────────────────┐
                │        User / Admin      │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │   React + Vite Frontend  │
                │                          │
                │  Dashboard               │
                │  Products                │
                │  Categories              │
                │  Inventory               │
                │  Authentication          │
                └────────────┬─────────────┘
                             │
                         REST API
                             │
                             ▼
                ┌──────────────────────────┐
                │      Node.js Backend     │
                │        Express.js        │
                │                          │
                │  Authentication API      │
                │  Product API             │
                │  Category API            │
                │  Dashboard API           │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │      SQLite Database     │
                │                          │
                │  Users                   │
                │  Products                │
                │  Categories              │
                └──────────────────────────┘
```

---

## 🛠️ Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router DOM

### Backend

- Node.js
- Express.js
- REST API
- Nodemon

### Database

- SQLite

### Development Tools

- Visual Studio Code
- Git
- GitHub
- PowerShell
- npm

---

## 📁 Project Structure

```text
Cloud-Retail-Product-Catalog/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── internship_portal.db
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/karnamyaswanth/Cloud-Retail-Product-Catalog.git
```

### 2. Open the Project

```bash
cd Cloud-Retail-Product-Catalog
```

---

## 🚀 Backend Setup

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

Backend API:

```text
http://localhost:5000/api
```

---

## 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Install required packages if needed:

```bash
npm install axios react-router-dom
```

Start the frontend:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## 🔗 API Endpoints

### Authentication

```text
POST /api/signup
POST /api/login
```

### Dashboard

```text
GET /api/dashboard
```

### Products

```text
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Categories

```text
GET /api/categories
POST /api/categories
```

---

## 📦 Sample Product

```text
Product Name: Wireless Headphones
Brand: Sony
Category: Electronics
Price: 2999
Stock Quantity: 25
Description: Wireless Bluetooth headphones
Status: Active
```

---

## 📊 Inventory Status

The application automatically identifies product stock conditions.

```text
Stock > 10
    ↓
In Stock

Stock 1–10
    ↓
Low Stock

Stock = 0
    ↓
Out of Stock
```

---

## 🔒 Security

The project includes basic application-level security features such as:

- User authentication
- Login validation
- Protected application flow
- Backend API separation
- Database-based user storage

For production deployment, additional security mechanisms such as password hashing, HTTPS, JWT-based authentication, environment variables, rate limiting, and role-based access control can be added.

---

## ☁️ Cloud Computing Concepts

This project demonstrates several cloud and distributed application concepts:

- Client-server architecture
- RESTful APIs
- Web-based application architecture
- Database-backed application
- Frontend and backend separation
- Centralized product management
- Scalable application structure
- Cloud-ready deployment architecture

The application can be extended for deployment using cloud platforms and managed database services.

---

## 🔄 Application Workflow

```text
User
  │
  ▼
Login / Signup
  │
  ▼
Dashboard
  │
  ├── Products
  │     ├── Add
  │     ├── Edit
  │     ├── Delete
  │     └── Search
  │
  ├── Categories
  │
  └── Inventory
        ├── Stock Monitoring
        ├── Low Stock
        └── Out of Stock
```

---

## 🎓 Academic Use

This project can be used as a **Cloud Computing / Full-Stack Development academic project** to demonstrate:

- Cloud application architecture
- Web application development
- REST API development
- Database integration
- Authentication
- Inventory management
- CRUD operations
- Frontend-backend communication

---

## 🔮 Future Enhancements

Possible future improvements include:

- Cloud deployment
- Admin and employee role management
- JWT authentication
- Password hashing
- Product image upload
- Cloud object storage
- Sales management
- Order management
- Supplier management
- Inventory history
- Automated stock alerts
- Email notifications
- Advanced analytics
- Product export to CSV/PDF
- Cloud-hosted database
- Docker deployment
- CI/CD integration

---

## 👩‍💻 Author

**karnamyaswanth**

GitHub:

https://github.com/karnamyaswanth

---

## 📄 License

This project is developed for educational and academic purposes.
