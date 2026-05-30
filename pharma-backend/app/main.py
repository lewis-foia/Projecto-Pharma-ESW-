from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.services.mock_data import seed_mock_data
from app.routers import (
    auth, products, sales, users, patients,
    doctors, consultations, chat, prescriptions,
)

app = FastAPI(title="Pharma API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_mock_data()

# Routers implementados
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(sales.router, prefix="/sales", tags=["sales"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
app.include_router(consultations.router, prefix="/consultations", tags=["consultations"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])

# Routers ainda não implementados (ignorados)
try:
    from app.routers import payments
    app.include_router(payments.router, prefix="/payments", tags=["payments"])
except ImportError:
    pass

try:
    from app.routers import referrals
    app.include_router(referrals.router, prefix="/referrals", tags=["referrals"])
except ImportError:
    pass

try:
    from app.routers import notifications
    app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
except ImportError:
    pass

try:
    from app.routers import reports
    app.include_router(reports.router, prefix="/reports", tags=["reports"])
except ImportError:
    pass

try:
    from app.routers import triage
    app.include_router(triage.router, prefix="/triage", tags=["triage"])
except ImportError:
    pass