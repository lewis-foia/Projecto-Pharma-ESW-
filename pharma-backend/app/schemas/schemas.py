from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from typing import Optional

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


class PatientBase(BaseModel):
    name: str
    birth_date: date
    gender: str  # 'M' ou 'F'
    phone: str
    address: str
    history: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

#  Doctor 
class DoctorBase(BaseModel):
    user_id: int
    crm: str
    specialty: str
    phone: str
    email: str

class DoctorCreate(DoctorBase):
    pass

class DoctorOut(DoctorBase):
    id: int

    class Config:
        from_attributes = True

#  Consultation 
class ConsultationBase(BaseModel):
    patient_id: int
    doctor_id: int
    scheduled_date: datetime
    status: str = "agendada"
    notes: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationOut(ConsultationBase):
    id: int

    class Config:
        from_attributes = True

#  Payment 
class PaymentBase(BaseModel):
    consultation_id: Optional[int] = None
    amount: float
    payment_date: Optional[datetime] = None  # se não enviado, usa-se default
    method: str
    status: str = "pendente"
    receipt_number: str
    registered_by: int

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    id: int

    class Config:
        from_attributes = True

#  Prescription 
class MedicationItem(BaseModel):
    name: str
    dosage: str
    duration: str  # ex: "7 dias"

class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    consultation_id: Optional[int] = None
    medications: List[MedicationItem]  # será convertido para JSON string
    issued_at: Optional[datetime] = None
    notes: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionOut(PrescriptionBase):
    id: int
    issued_at: datetime

    class Config:
        from_attributes = True

#  Referral 
class ReferralBase(BaseModel):
    patient_id: int
    from_doctor_id: int
    to_specialty: str
    reason: str
    status: str = "pendente"

class ReferralCreate(ReferralBase):
    pass

class ReferralOut(ReferralBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

#  Chat 
class ChatMessageBase(BaseModel):
    receiver_id: int
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

#  Notification 
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationCreate(NotificationBase):
    pass

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    type: str

    class Config:
        from_attributes = True

#  Reports 
class ReportQueryParams(BaseModel):
    type: str  # sales, consultations, prescriptions, top_medicines, payment_methods, unread_notifications
    period: str  # daily, weekly, monthly, custom
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ReportResponse(BaseModel):
    data: Dict[str, Any]

#  Triagem 
class TriageRequest(BaseModel):
    symptoms: str

class TriageResponse(BaseModel):
    possible_diagnosis: str
    urgency: str  # low, medium, high, emergency
    recommendations: str
