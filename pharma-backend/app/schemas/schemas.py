from pydantic import BaseModel
from typing import Optional, List

# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    is_active: bool

class UserCreate(BaseModel):
    full_name: str
    username: str
    email: str
    password: str
    role: str = "patient"

# ---------- Product ----------
class ProductOut(BaseModel):
    id: int
    name: str
    category: str
    price: float
    stock: int
    min_stock: int
    expiry_date: Optional[str]

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    stock: int
    min_stock: int = 10
    expiry_date: Optional[str] = None

# ---------- Sale ----------
class SaleCreate(BaseModel):
    product_id: int
    quantity: int

class SaleOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    total_price: float
    sold_by: int
    sold_by_name: str
    created_at: str

# ---------- Patient ----------
class PatientCreate(BaseModel):
    name: str
    birth_date: str
    gender: str
    phone: str
    address: str
    history: Optional[str] = None

class PatientOut(BaseModel):
    id: int
    name: str
    birth_date: str
    gender: str
    phone: str
    address: str
    history: Optional[str] = None

# ---------- Doctor ----------
class DoctorCreate(BaseModel):
    name: str
    specialty: str
    phone: str
    email: str
    available_days: str

class DoctorOut(BaseModel):
    id: int
    name: str
    specialty: str
    phone: str
    email: str
    available_days: str

# ---------- Consultation ----------
class ConsultationCreate(BaseModel):
    patient_id: int
    doctor_id: int
    date: str
    time: str

class ConsultationOut(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    date: str
    time: str
    status: str
    notes: Optional[str] = None

# ---------- Payment ----------
class PaymentCreate(BaseModel):
    consultation_id: int
    amount: float
    method: str

class PaymentOut(BaseModel):
    id: int
    consultation_id: int
    amount: float
    method: str
    date: str
    receipt_number: str

# ---------- Prescription ----------
class PrescriptionCreate(BaseModel):
    consultation_id: int
    patient_id: int
    doctor_id: int
    medication: str
    dosage: str
    duration: str

class PrescriptionOut(BaseModel):
    id: int
    consultation_id: int
    patient_id: int
    doctor_id: int
    medication: str
    dosage: str
    duration: str
    issued_at: str

# ---------- Referral ----------
class ReferralCreate(BaseModel):
    consultation_id: int
    patient_id: int
    to_unit: str
    reason: str

class ReferralOut(BaseModel):
    id: int
    consultation_id: int
    patient_id: int
    to_unit: str
    reason: str
    date: str

# ---------- Chat ----------
class ChatMessageCreate(BaseModel):
    text: str

class ChatMessageOut(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    text: str
    timestamp: str

# ---------- Notification ----------
class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    type: str
    read: bool
    created_at: str

# ---------- Triage ----------
class TriageSymptom(BaseModel):
    symptom: str
    severity: int

class TriageRequest(BaseModel):
    symptoms: List[TriageSymptom]

class TriageResponse(BaseModel):
    possible_conditions: List[str]
    recommendation: str
    urgency: str