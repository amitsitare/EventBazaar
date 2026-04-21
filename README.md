# EventBazaar

EventBazaar is a full-stack event services marketplace.  
Customers can browse and book services, and providers can manage listings, bookings, and payments.

It is designed for local-first development and simple cloud deployment.

## What this project includes

- JWT-based auth with `customer` and `provider` roles
- Service listing and management with image uploads
- Booking flow with date availability checks
- Razorpay payment verification
- Provider and customer booking/payment dashboards
- Optional WhatsApp + email notifications after booking

## Tech stack

- **Frontend:** React, Vite, Bootstrap, Axios
- **Backend:** FastAPI, psycopg, Pydantic, passlib, python-jose
- **Database:** PostgreSQL
- **Integrations:** Razorpay, Twilio WhatsApp, SMTP email
- **Deploy:** Vercel (frontend), Hugging Face Spaces or Render (backend)

## Project structure

```text
EventBazaar/
|- frontend/                      # React app (Vite)
|- backend/                       # FastAPI app
|  |- app/routes/                 # auth, services, bookings, payments
|  |- app/services/               # notifications and invoice helpers
|  |- run.py
|  |- database_setup.py
|- render.yaml
|- vercel.json
```

## Prerequisites

Before running the project, install:

- Python 3.10+ (recommended)
- Node.js 18+ and npm
- PostgreSQL 13+ (or newer)
- Git

## Local setup

### 1) Backend

```bash
cd backend
python -m venv .venv
```

Activate venv:

- **Windows (PowerShell):** `.venv\Scripts\Activate.ps1`
- **Linux/macOS:** `source .venv/bin/activate`

Then install and run:

```bash
pip install -r requirements.txt
python database_setup.py
python run.py
```

API runs on `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Quick test flow

After both servers are running:

1. Register a provider account.
2. Register a customer account.
3. Login as provider and create a service.
4. Login as customer and book that service.
5. Complete payment (if Razorpay is configured).
6. Check provider dashboard for booking/payment visibility.

## Environment variables

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=EventBazaar
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=change_me
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=120

FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_ADMIN_WHATSAPP_TO=

SMTP_ENABLED=false
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=EventBazaar
SMTP_USE_TLS=true
SMTP_USE_SSL=false

ADMIN_EMAILS=
```

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:8000
```

Notes:

- `VITE_API_BASE` must match your backend URL.
- Keep `JWT_SECRET` strong in production.
- If Razorpay keys are empty, payment endpoints will not work.
- If Twilio/SMTP values are empty, booking still works; notifications are skipped.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/services`
- `POST /api/bookings`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`

## Deployment notes

### Backend on Hugging Face Spaces (Docker)

1. Create a new Space and choose **Docker** SDK.
2. Upload the repository (or connect GitHub), and set the Space root to `backend/`.
3. The included `backend/Dockerfile` starts FastAPI using:
   - `uvicorn app.main:app --host 0.0.0.0 --port 7860`
4. In Space settings, add backend secrets/variables:
   - `DATABASE_URL` (recommended) or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRES_MINUTES`
   - `FRONTEND_URL` (your Vercel domain)
   - Optional: Razorpay/Twilio/SMTP vars
5. Redeploy the Space and verify:
   - `https://<space-subdomain>.hf.space/health`
   - `https://<space-subdomain>.hf.space/docs`

### Frontend on Vercel

1. Import this repo in Vercel.
2. Set **Root Directory** to `frontend`.
3. Build settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE=https://<your-space-subdomain>.hf.space`
5. Deploy and test login/service pages.

### Existing Render config

- `render.yaml` is still available if you prefer Render for backend hosting.

## Troubleshooting

Common issues during setup:

- **Database connection error:** verify `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD`.
- **CORS issue in browser:** check `FRONTEND_URL` in backend env.
- **Frontend calling wrong API:** verify `VITE_API_BASE` in `frontend/.env`.
- **Payment verification failing:** ensure Razorpay key/secret pair is correct.
- **Port already in use:** free the port or run app on a different port.

## License

MIT (see `LICENSE` if present).
