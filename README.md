# 🎉 EventBazaar - Event Services Booking Platform

<div align="center">

![EventBazaar](https://img.shields.io/badge/EventBazaar-Event%20Services-red?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-316192?style=for-the-badge&logo=postgresql)

**A comprehensive full-stack platform connecting wedding service providers with customers. Book catering, decoration, tents, music, and more with secure payments and real-time notifications.**

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Environment Variables](#️-environment-variables)
- [Deployment](#-deployment)
  - [Frontend on Vercel](#frontend-deployment-on-vercel)
  - [Backend on Render](#backend-deployment-on-render)
  - [Database on Render](#database-setup-on-render)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Contributing](#-contributing)
- [Support](#-support)

---

## 🎯 Overview

**EventBazaar** is a modern event services marketplace that simplifies the process of finding and booking event-related services. The platform enables:

- **Service Providers** to list and manage their services (catering, decoration, tents, music, etc.)
- **Customers** to browse, search, and book services with secure online payments
- **Real-time Notifications** via WhatsApp when bookings are made
- **Secure Payment Processing** through Razorpay integration

---

## ✨ Features

### 🔐 Authentication & User Management
- ✅ Role-based registration (Provider/Customer)
- ✅ JWT-based secure authentication
- ✅ User profile management
- ✅ Password hashing with bcrypt

### 🏪 Service Management
- ✅ Provider dashboard for service CRUD operations
- ✅ Service catalog with search and filtering
- ✅ Location-based service discovery
- ✅ Image uploads for service listings
- ✅ Service details with pricing and availability

### 💳 Payment Integration
- ✅ Razorpay payment gateway integration
- ✅ Secure payment processing
- ✅ Payment verification and confirmation
- ✅ Transaction history tracking

### 📱 Real-time Notifications
- ✅ WhatsApp notifications via Twilio
- ✅ Instant booking alerts to providers
- ✅ Customer and booking details in notifications
- ✅ Admin notification support

### 📋 Booking System
- ✅ Service booking with date selection
- ✅ Quantity and duration specification
- ✅ Booking status tracking (pending/confirmed/cancelled)
- ✅ Booking history for customers and providers

### 🎨 User Interface
- ✅ Responsive Bootstrap design
- ✅ Modern and intuitive interface
- ✅ Traditional Indian wedding theme
- ✅ Mobile-friendly layout

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.111.0
- **Database**: PostgreSQL with psycopg
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Payment**: Razorpay SDK
- **Notifications**: Twilio WhatsApp API
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.4.10
- **Styling**: Bootstrap 5.3.3
- **Routing**: React Router DOM 6.26.2
- **HTTP Client**: Axios 1.7.7

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database Hosting**: Render PostgreSQL

---

## 📁 Project Structure

```
EventBazaar/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration settings
│   │   ├── db.py                # Database connection
│   │   ├── schemas.py           # Pydantic models
│   │   ├── security.py          # Authentication utilities
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── services.py      # Service CRUD endpoints
│   │   │   ├── bookings.py      # Booking endpoints
│   │   │   └── payments.py      # Payment endpoints
│   │   └── services/
│   │       └── whatsapp.py      # WhatsApp notification service
│   ├── database_setup.py        # Database initialization
│   ├── cleanup_duplicates.py    # Database cleanup utility
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main app component
    │   ├── auth.js              # Auth utilities
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation bar
    │   │   └── Footer.jsx       # Footer component
    │   └── pages/
    │       ├── Home.jsx         # Landing page
    │       ├── Login.jsx        # Login page
    │       ├── Register.jsx     # Registration page
    │       ├── ServiceList.jsx  # Service listing
    │       ├── ServiceDetail.jsx # Service details
    │       ├── ProviderDashboard.jsx # Provider dashboard
    │       ├── MyBookings.jsx   # Booking history
    │       └── ContactUs.jsx    # Contact page
    ├── package.json             # Node dependencies
    └── vite.config.js           # Vite configuration
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.8 or higher
- **Node.js** 16 or higher and npm
- **PostgreSQL** 13 or higher (for local development)
- **Git** for version control

### Accounts Required
- **Razorpay Account** - For payment processing
- **Twilio Account** - For WhatsApp notifications (optional)
- **Vercel Account** - For frontend deployment
- **Render Account** - For backend and database deployment

---

## 🚀 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/amitsitare/EventBazaar.git
cd EventBazaar
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Variables section)
# Copy the example and fill in your values
cp .env.example .env

# Setup database (creates tables and sample data)
python database_setup.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`  
API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend `.env` File

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shaadisphere
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=120

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:5173

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Twilio WhatsApp Configuration (Optional)
TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_ADMIN_WHATSAPP_TO=whatsapp:+919876543210
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory (if needed):

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Frontend Deployment on Vercel

#### Step 1: Prepare Frontend for Production

1. **Update API Base URL** in `frontend/src/auth.js`:
   ```javascript
   export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://your-backend.onrender.com';
   ```

2. **Build the project** (optional, Vercel will do this):
   ```bash
   cd frontend
   npm run build
   ```

#### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend.onrender.com`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend
   - Your site will be live at `https://your-project.vercel.app`

#### Step 3: Configure Custom Domain (Optional)

- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

---

### Backend Deployment on Render

#### Step 1: Prepare Backend for Production

1. **Create `render.yaml`** in the root directory:
   ```yaml
   services:
     - type: web
       name: eventbazaar-backend
       env: python
       buildCommand: pip install -r backend/requirements.txt
       startCommand: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: DB_HOST
           fromDatabase:
             name: shaadisphere-db
             property: host
         - key: DB_PORT
           fromDatabase:
             name: shaadisphere-db
             property: port
         - key: DB_NAME
           fromDatabase:
             name: shaadisphere-db
             property: database
         - key: DB_USER
           fromDatabase:
             name: shaadisphere-db
             property: user
         - key: DB_PASSWORD
           fromDatabase:
             name: shaadisphere-db
             property: password
         - key: JWT_SECRET
           generateValue: true
         - key: FRONTEND_URL
           sync: false
   ```

2. **Create `Procfile`** in the `backend/` directory:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

#### Step 2: Deploy to Render

1. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `eventbazaar-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory**: `backend` (or leave empty if using render.yaml)

3. **Add Environment Variables**:
   - Go to Environment tab
   - Add all variables from your `.env` file:
     ```
     DB_HOST=<from_database>
     DB_PORT=<from_database>
     DB_NAME=<from_database>
     DB_USER=<from_database>
     DB_PASSWORD=<from_database>
     JWT_SECRET=<generate_strong_secret>
     JWT_ALGORITHM=HS256
     JWT_EXPIRES_MINUTES=120
     FRONTEND_URL=https://your-frontend.vercel.app
     RAZORPAY_KEY_ID=your_key_id
     RAZORPAY_KEY_SECRET=your_key_secret
     TWILIO_ENABLED=false
     TWILIO_ACCOUNT_SID=your_sid
     TWILIO_AUTH_TOKEN=your_token
     ```

4. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Your API will be live at `https://your-backend.onrender.com`

#### Step 3: Initialize Database

After deployment, run the database setup:

1. **SSH into Render** (or use Render Shell):
   ```bash
   # In Render dashboard, go to your service → Shell
   cd backend
   python database_setup.py
   ```

2. **Or use Render's Background Worker**:
   - Create a new Background Worker
   - Command: `cd backend && python database_setup.py`
   - Run once to initialize database

---

### Database Setup on Render

#### Step 1: Create PostgreSQL Database

1. **Create Database**:
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Configure:
     - **Name**: `shaadisphere-db`
     - **Database**: `shaadisphere`
     - **User**: `shaadisphere_user` (or auto-generated)
     - **Region**: Choose closest to your backend
     - **PostgreSQL Version**: 15 (or latest)

2. **Get Connection Details**:
   - Go to database dashboard
   - Copy connection string or individual values:
     - Internal Database URL
     - Host, Port, Database, User, Password

#### Step 2: Connect Backend to Database

1. **Update Backend Environment Variables**:
   - In your backend service on Render
   - Add database connection variables:
     ```
     DB_HOST=<render_database_host>
     DB_PORT=5432
     DB_NAME=shaadisphere
     DB_USER=<render_database_user>
     DB_PASSWORD=<render_database_password>
     ```

2. **Test Connection**:
   - Backend will automatically connect on startup
   - Check logs for connection status

#### Step 3: Run Database Migrations

1. **Initialize Database Schema**:
   - Use Render Shell or SSH
   - Run: `python backend/database_setup.py`

2. **Verify Tables**:
   - Check database dashboard
   - Tables should be created: `users`, `services`, `bookings`

---

## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:8000`
- **Production**: `https://your-backend.onrender.com`

### Interactive API Docs
- **Swagger UI**: `https://your-backend.onrender.com/docs`
- **ReDoc**: `https://your-backend.onrender.com/redoc`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Services
- `GET /api/services/` - List all services
- `GET /api/services/{id}` - Get service details
- `POST /api/services/` - Create service (provider only)
- `PUT /api/services/{id}` - Update service (provider only)
- `DELETE /api/services/{id}` - Delete service (provider only)

#### Bookings
- `POST /api/bookings/` - Create booking (customer only)
- `GET /api/bookings/my` - Get user bookings

#### Payments
- `GET /api/payments/config` - Get Razorpay config
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

---

## 🔒 Security

### Implemented Security Features
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ✅ SQL injection prevention (parameterized queries)
- ✅ Payment signature verification
- ✅ Environment variable protection

### Security Best Practices
- Use strong JWT secrets in production
- Enable HTTPS for all deployments
- Regularly update dependencies
- Monitor API logs for suspicious activity
- Implement rate limiting (recommended)
- Use secure database connections

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features


---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- FastAPI for the excellent web framework
- React team for the amazing UI library
- Bootstrap for responsive design components
- Razorpay for payment gateway integration
- Twilio for WhatsApp API services

---

<div align="center">

**Made with ❤️ for making weddings special**

[⭐ Star this repo](https://github.com/yourusername/EventBazaar) • [🐛 Report Bug](https://github.com/yourusername/EventBazaar/issues) • [💡 Request Feature](https://github.com/yourusername/EventBazaar/issues)

</div>
