from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routers import auth, products, sales, users
from app.routers import patients
from app.services.mock_data import seed_mock_data


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

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(sales.router, prefix="/sales", tags=["sales"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(patients.router)