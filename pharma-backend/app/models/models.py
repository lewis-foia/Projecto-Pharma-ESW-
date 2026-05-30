from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    full_name: str
    email: str
    role: str = "patient"  # admin, pharmacist, patient
    hashed_password: str
    is_active: bool = True

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str
    price: float
    stock: int
    min_stock: int = 10
    expiry_date: Optional[str] = None

class Sale(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    total_price: float
    sold_by: int = Field(foreign_key="user.id")
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    birth_date: str
    gender: str
    phone: str
    address: str
    history: Optional[str] = None

class Doctor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    specialty: str
    phone: str
    email: str
    available_days: str  # "Seg, Qua, Sex"

class Consultation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    doctor_id: int = Field(foreign_key="doctor.id")
    date: str
    time: str
    status: str = "agendada"  # agendada, realizada, cancelada
    notes: Optional[str] = None

class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultation.id")
    amount: float
    method: str
    date: str = Field(default_factory=lambda: datetime.now().isoformat())
    receipt_number: str

class Prescription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultation.id")
    patient_id: int = Field(foreign_key="patient.id")
    doctor_id: int = Field(foreign_key="doctor.id")
    medication: str
    dosage: str
    duration: str
    issued_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class Referral(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: int = Field(foreign_key="consultation.id")
    patient_id: int = Field(foreign_key="patient.id")
    to_unit: str
    reason: str
    date: str = Field(default_factory=lambda: datetime.now().isoformat())

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id")
    text: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    message: str
    type: str  # info, warning, error
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())