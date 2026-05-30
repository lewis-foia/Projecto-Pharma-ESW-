from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routers import auth, products, sales, users
from app.routers import patients
from app.services.mock_data import seed_mock_data
from app.routers import auth, users, products, sales, patients, doctors, consultations, payments, chat, prescriptions, referrals, notifications, reports, triage

app = FastAPI(title="Pharma API", version="1.0.0")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(consultations.router)
app.include_router(payments.router)
app.include_router(chat.router)
app.include_router(prescriptions.router)
app.include_router(referrals.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(triage.router)

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

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(sales.router, prefix="/sales", tags=["sales"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(patients.router)