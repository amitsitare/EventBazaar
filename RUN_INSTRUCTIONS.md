# 🚀 How to Run EventBazaar

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and **npm** installed
3. **PostgreSQL** database running
4. **Backend `.env` file** configured (see below)

---

## 📋 Step 1: Database Setup

Before running the application, ensure your database is set up:

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already activated)
.venv\Scripts\activate

# Run database setup script
python database_setup.py
```

---

## 🔧 Step 2: Backend Setup & Run

### First Time Setup (if not done already):

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Run Backend Server:

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.venv\Scripts\activate

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run on:** `http://localhost:8000`  
**API Docs available at:** `http://localhost:8000/docs`

---

## 🎨 Step 3: Frontend Setup & Run

### First Time Setup (if not done already):

```powershell
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

### Run Frontend Development Server:

```powershell
# Navigate to frontend directory
cd frontend

# Start the development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173` (or the port shown in terminal)

---

## 📝 Quick Start Commands (All in One)

### Terminal 1 - Backend:
```powershell
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

---

## ⚙️ Backend Configuration

Make sure you have a `.env` file in the `backend/` directory with:

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

# Twilio WhatsApp (Optional)
TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_ADMIN_WHATSAPP_TO=

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## ✅ Verification

1. **Backend Health Check:**
   - Open browser: `http://localhost:8000/health`
   - Should return: `{"status":"ok","database":"localhost:5432/shaadisphere"}`

2. **Backend API Docs:**
   - Open browser: `http://localhost:8000/docs`
   - Should show Swagger UI with all API endpoints

3. **Frontend:**
   - Open browser: `http://localhost:5173`
   - Should show the homepage

---

## 🛑 Stopping the Servers

- **Backend:** Press `Ctrl+C` in the backend terminal
- **Frontend:** Press `Ctrl+C` in the frontend terminal

---

## 🔍 Troubleshooting

### Backend Issues:

1. **Module not found:**
   ```powershell
   # Make sure virtual environment is activated
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Database connection error:**
   - Check PostgreSQL is running
   - Verify `.env` file has correct database credentials
   - Ensure database `shaadisphere` exists

3. **Port already in use:**
   ```powershell
   # Use a different port
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

### Frontend Issues:

1. **Dependencies not installed:**
   ```powershell
   cd frontend
   npm install
   ```

2. **Port already in use:**
   - Vite will automatically use the next available port
   - Check terminal for the actual port number

3. **API connection error:**
   - Ensure backend is running on port 8000
   - Check `frontend/src/auth.js` has correct `API_BASE` URL

---

## 📌 Important Notes

- **Backend must run before frontend** (or frontend will show API errors)
- **Database must be set up** before running backend
- **Two separate terminals** are needed (one for backend, one for frontend)
- **Virtual environment** must be activated for backend commands
- **PostgreSQL** must be running and accessible

---

## 🎯 Sample Login Credentials

After running `database_setup.py`, you can use:

**Providers:**
- Email: `rajesh@catering.com` / Password: `password123`
- Email: `priya@tent.com` / Password: `password123`
- Email: `amit@bandbaja.com` / Password: `password123`

**Customers:**
- Email: `customer1@email.com` / Password: `password123`
- Email: `customer2@email.com` / Password: `password123`

