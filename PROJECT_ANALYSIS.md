# EventBazaar - Complete Project Analysis

## 📋 Project Overview

**EventBazaar** is a comprehensive event services booking platform that connects service providers (caterers, tent houses, band baja, decorators, etc.) with customers planning events. The platform enables customers to browse, search, and book event-related services, while providers can manage their service listings.

---

## 🏗️ Architecture

### **Technology Stack**

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with psycopg (async driver)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Payment Gateway**: Razorpay integration
- **Notifications**: Twilio WhatsApp API
- **Environment**: Python 3.x with virtual environment

#### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Bootstrap 5
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Payment**: Razorpay Checkout SDK

---

## 📁 Project Structure

```
ShaadiSphere/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Configuration & environment variables
│   │   ├── db.py                # Database connection management
│   │   ├── schemas.py           # Pydantic models for data validation
│   │   ├── security.py          # Password hashing & JWT token management
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints (register, login, me)
│   │   │   ├── services.py      # Service CRUD operations
│   │   │   ├── bookings.py      # Booking creation & management
│   │   │   └── payments.py      # Razorpay payment integration
│   │   └── services/
│   │       └── whatsapp.py      # Twilio WhatsApp notification service
│   ├── database_setup.py        # Database schema creation & sample data
│   └── requirements.txt         # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main app component with routing
    │   ├── auth.js              # Authentication utilities
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation bar
    │   │   └── Footer.jsx       # Footer component
    │   └── pages/
    │       ├── Home.jsx         # Landing page
    │       ├── Login.jsx        # Login page
    │       ├── Register.jsx    # Registration page
    │       ├── ServiceList.jsx  # Browse all services
    │       ├── ServiceDetail.jsx # Service details & booking
    │       ├── ProviderDashboard.jsx # Provider service management
    │       └── MyBookings.jsx   # Customer booking history
    └── package.json             # Node.js dependencies
```

---

## 🎯 Core Functionalities

### 1. **User Authentication & Authorization**

#### **User Roles**
- **Provider**: Service providers who can add, edit, and delete their services
- **Customer**: Users who can browse and book services

#### **Authentication Features**
- **Registration** (`POST /api/auth/register`)
  - Fields: name, email, mobile, whatsapp_number (optional), address, role, password
  - Email uniqueness validation
  - Password hashing with bcrypt
  - Returns user profile (without password)

- **Login** (`POST /api/auth/login`)
  - Email and password authentication
  - Returns JWT access token
  - Token expires in 120 minutes (configurable)

- **Get Current User** (`GET /api/auth/me`)
  - Protected endpoint requiring JWT token
  - Returns authenticated user's profile

#### **Security**
- Password hashing using bcrypt
- JWT tokens with configurable expiration
- Role-based access control (RBAC)
- CORS middleware for frontend communication

---

### 2. **Service Management**

#### **Provider Features**
- **Create Service** (`POST /api/services/`)
  - Fields: name, description, price, photo_url, location
  - Only providers can create services
  - Automatically linked to provider's account

- **List Own Services** (`GET /api/services/my`)
  - Returns all services created by logged-in provider
  - Protected route (provider only)

- **Update Service** (`PUT /api/services/{service_id}`)
  - Edit service details
  - Ownership verification (only service owner can update)

- **Delete Service** (`DELETE /api/services/{service_id}`)
  - Remove service from platform
  - Ownership verification required

#### **Public Features**
- **List All Services** (`GET /api/services/`)
  - Browse all available services
  - Query parameters:
    - `query`: Search by name or description (case-insensitive)
    - `location`: Filter by location (case-insensitive)
  - Returns paginated list of services

- **Get Service Details** (`GET /api/services/{service_id}`)
  - View complete service information
  - Includes provider details, pricing, location, photos

---

### 3. **Booking System**

#### **Customer Features**
- **Create Booking** (`POST /api/bookings/`)
  - Fields:
    - `service_id`: ID of service to book
    - `event_date`: Date of the wedding/event
    - `quantity`: Number of units (default: 1)
    - `address`: Optional service delivery address
    - `duration_hours`: Optional service duration
    - `notes`: Additional requirements/notes
  - Only customers can create bookings
  - Booking status defaults to "pending"
  - **Payment Integration**: Razorpay payment required before booking creation

- **View My Bookings** (`GET /api/bookings/my`)
  - Customers: See all their bookings
  - Providers: See bookings for their services
  - Displays booking status (pending/confirmed/cancelled)

#### **Booking Workflow**
1. Customer selects service and fills booking form
2. Razorpay order is created on backend
3. Customer completes payment via Razorpay checkout
4. Payment signature is verified on backend
5. Booking is created in database
6. WhatsApp notifications sent to provider and admin

---

### 4. **Payment Integration (Razorpay)**

#### **Endpoints**
- **Get Razorpay Config** (`GET /api/payments/config`)
  - Returns Razorpay Key ID for frontend checkout

- **Create Order** (`POST /api/payments/create-order`)
  - Creates Razorpay order
  - Parameters: amount (in paise), currency, receipt
  - Returns order ID and details

- **Verify Payment** (`POST /api/payments/verify`)
  - Verifies payment signature using HMAC-SHA256
  - Ensures payment authenticity
  - Required before booking creation

#### **Payment Flow**
1. Frontend requests Razorpay config
2. Backend creates Razorpay order
3. Customer pays via Razorpay checkout modal
4. Payment response sent to backend for verification
5. Only verified payments proceed to booking creation

---

### 5. **WhatsApp Notifications (Twilio)**

#### **Notification Types**
- **Provider Notification**: Sent to service provider when booking is created
  - Includes: customer details, service info, event date, quantity, notes
  - Uses provider's WhatsApp number from database

- **Admin Notification**: Sent to configured admin number
  - Includes: complete booking summary
  - Helps platform administrators track bookings

#### **Features**
- Automatic phone number normalization (adds country code if missing)
- Graceful error handling (booking succeeds even if WhatsApp fails)
- Configurable via environment variables
- Formatted messages with emojis for better readability

#### **Configuration**
- `TWILIO_ENABLED`: Enable/disable notifications
- `TWILIO_ACCOUNT_SID`: Twilio account ID
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_WHATSAPP_FROM`: Twilio WhatsApp sender number
- `TWILIO_ADMIN_WHATSAPP_TO`: Admin WhatsApp number for notifications

---

## 🗄️ Database Schema

### **Tables**

#### **users**
```sql
- id (SERIAL PRIMARY KEY)
- name (TEXT NOT NULL)
- email (TEXT UNIQUE NOT NULL)
- mobile (TEXT NOT NULL)
- whatsapp_number (TEXT) -- Optional
- address (TEXT NOT NULL)
- role (TEXT CHECK: 'provider' OR 'customer')
- password_hash (TEXT NOT NULL)
- created_at (TIMESTAMPTZ DEFAULT NOW())
```

#### **services**
```sql
- id (SERIAL PRIMARY KEY)
- provider_id (INTEGER REFERENCES users(id) ON DELETE CASCADE)
- name (TEXT NOT NULL)
- description (TEXT)
- price (NUMERIC(12,2) NOT NULL)
- photo_url (TEXT)
- location (TEXT NOT NULL)
- created_at (TIMESTAMPTZ DEFAULT NOW())
```

#### **bookings**
```sql
- id (SERIAL PRIMARY KEY)
- service_id (INTEGER REFERENCES services(id) ON DELETE CASCADE)
- customer_id (INTEGER REFERENCES users(id) ON DELETE CASCADE)
- event_date (DATE NOT NULL)
- quantity (INTEGER DEFAULT 1)
- notes (TEXT)
- address (TEXT) -- Optional service delivery address
- duration_hours (INTEGER) -- Optional service duration
- status (TEXT CHECK: 'pending', 'confirmed', 'cancelled' DEFAULT 'pending')
- created_at (TIMESTAMPTZ DEFAULT NOW())
```

#### **Indexes**
- Full-text search index on `services.name`
- Location index on `services.location`

---

## 🎨 Frontend Pages & Features

### **1. Home Page (`/`)**
- Hero section with wedding-themed imagery
- Service category chips (Catering, Band & DJ, Decor, etc.)
- Call-to-action buttons:
  - "Browse Services" → `/services`
  - "Become a Provider" → `/register`
- Traditional Indian wedding theme with red color scheme

### **2. Login Page (`/login`)**
- Email and password authentication
- Redirects to dashboard or home based on role
- Link to registration page

### **3. Register Page (`/register`)**
- User registration form
- Fields: name, email, mobile, whatsapp_number, address, role, password
- Role selection: Provider or Customer
- Auto-login after successful registration

### **4. Service List Page (`/services`)**
- Displays all available services in card grid
- Search functionality (by name/description)
- Location filter
- Consistent image sizing (200px height)
- Fallback placeholder for missing images
- Click to view service details

### **5. Service Detail Page (`/services/:id`)**
- Full service information display
- Large service image (max 400px height)
- Booking form (customer only):
  - Event date picker
  - Quantity input
  - Optional address field
  - Optional duration (hours)
  - Notes textarea
- **Payment Integration**: Razorpay checkout before booking
- Booking confirmation message

### **6. Provider Dashboard (`/dashboard`)**
- **Protected Route**: Provider role only
- **Add Service Form**:
  - Service name, description, price, photo URL, location
  - Create and update functionality
- **Service List**:
  - Displays all provider's services
  - Edit and delete buttons for each service
  - Service count badge
  - Responsive layout (form on left, list on right)
  - Loading states and error handling

### **7. My Bookings Page (`/my-bookings`)**
- **Protected Route**: Customer role only
- Displays all customer bookings
- Shows: Service ID, event date, quantity, notes, status
- Status badges (pending/confirmed/cancelled)

### **8. Navigation Bar**
- Brand: "EventBazaar"
- Links:
  - Home
  - Services
  - Dashboard (provider only)
  - My Bookings (customer only)
  - Login/Logout
  - Register

### **9. Footer**
- Company information
- Quick links
- Service categories
- Contact information
- Professional design

---

## 🔧 Configuration & Environment Variables

### **Backend `.env` File**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shaadisphere
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=dev_secret_change_me
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=120

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:5173

# Twilio WhatsApp Configuration
TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_ADMIN_WHATSAPP_TO=

# Razorpay Configuration
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 🚀 API Endpoints Summary

### **Authentication** (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user (protected)

### **Services** (`/api/services`)
- `GET /` - List all services (with search/filter)
- `GET /{service_id}` - Get service details
- `POST /` - Create service (provider only)
- `GET /my` - Get provider's services (provider only)
- `PUT /{service_id}` - Update service (owner only)
- `DELETE /{service_id}` - Delete service (owner only)

### **Bookings** (`/api/bookings`)
- `POST /` - Create booking (customer only)
- `GET /my` - Get user's bookings (customer/provider)

### **Payments** (`/api/payments`)
- `GET /config` - Get Razorpay configuration
- `POST /create-order` - Create Razorpay order
- `POST /verify` - Verify payment signature

### **Health Check**
- `GET /health` - API health status

---

## 🔐 Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Passwords never stored in plain text

2. **JWT Authentication**
   - Token-based authentication
   - Configurable expiration
   - Role-based access control

3. **Input Validation**
   - Pydantic models for request validation
   - SQL injection prevention via parameterized queries
   - Email format validation

4. **Payment Security**
   - Razorpay signature verification
   - HMAC-SHA256 verification
   - Payment required before booking

5. **CORS Protection**
   - Configured allowed origins
   - Credentials support for cookies

---

## 📦 Dependencies

### **Backend** (`requirements.txt`)
- `fastapi==0.111.0` - Web framework
- `uvicorn[standard]==0.30.1` - ASGI server
- `psycopg[binary]==3.2.1` - PostgreSQL async driver
- `passlib[bcrypt]==1.7.4` - Password hashing
- `python-jose==3.3.0` - JWT handling
- `pydantic==2.7.4` - Data validation
- `python-dotenv==1.0.0` - Environment variables
- `httpx==0.27.0` - HTTP client for Twilio
- `razorpay==1.4.2` - Razorpay SDK
- `setuptools>=68.0.0` - Package utilities

### **Frontend** (`package.json`)
- React 18+
- React Router DOM
- Axios
- Bootstrap 5
- Vite (build tool)

---

## 🎯 Key Features Summary

✅ **User Management**
- Role-based authentication (Provider/Customer)
- Secure password hashing
- JWT token-based sessions

✅ **Service Management**
- Full CRUD operations for providers
- Public service browsing
- Search and filter functionality
- Image support with fallbacks

✅ **Booking System**
- Customer booking creation
- Booking history for customers
- Provider booking view
- Booking status tracking

✅ **Payment Integration**
- Razorpay payment gateway
- Secure payment verification
- Payment required before booking

✅ **Notifications**
- WhatsApp notifications via Twilio
- Provider notifications on new bookings
- Admin notifications
- Graceful error handling

✅ **UI/UX**
- Responsive Bootstrap design
- Traditional Indian wedding theme
- Consistent image sizing
- Loading states and error handling
- Professional navigation and footer

---

## 🔄 Workflow Examples

### **Provider Workflow**
1. Register as provider
2. Login to dashboard
3. Add services (name, price, photo, location)
4. Edit/update services as needed
5. Receive WhatsApp notifications when bookings are made
6. View bookings for their services

### **Customer Workflow**
1. Register as customer
2. Browse services on homepage or service list
3. Search/filter services by name or location
4. View service details
5. Fill booking form (date, quantity, notes)
6. Complete Razorpay payment
7. Booking confirmed
8. View booking history

---

## 🛠️ Setup & Installation

### **Backend Setup**
1. Create virtual environment: `python -m venv .venv`
2. Activate: `.venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Configure `.env` file with database and API credentials
5. Run database setup: `python database_setup.py`
6. Start server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### **Frontend Setup**
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Access at `http://localhost:5173`

---

## 📝 Notes

- Database name: `shaadisphere` (as per user requirement)
- All service prices normalized to ₹1.00 in sample data
- WhatsApp notifications are optional (can be disabled)
- Payment integration requires Razorpay account setup
- Sample users provided in database setup script
- All passwords in sample data: `password123`

---

## 🎉 Project Highlights

- **Complete Full-Stack Application**: React frontend + FastAPI backend
- **Secure Authentication**: JWT + bcrypt password hashing
- **Payment Integration**: Razorpay for secure payments
- **Real-time Notifications**: WhatsApp via Twilio
- **Role-Based Access Control**: Provider and Customer roles
- **Responsive Design**: Bootstrap-based modern UI
- **Production-Ready**: Error handling, validation, security best practices

---

**Project Name**: EventBazaar  
**Database**: shaadisphere  
**Version**: 0.1.0

