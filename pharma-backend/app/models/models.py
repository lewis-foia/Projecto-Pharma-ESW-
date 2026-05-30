from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date, datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    full_name: str
    email: str
    role: str = "pharmacist"  # admin, pharmacist
    hashed_password: str
    is_active: bool = True
    doctor: Optional[Doctor] = Relationship(back_populates="user")
    payments: List[Payment] = Relationship(back_populates="registrar")
    sent_messages: List[ChatMessage] = Relationship(back_populates="sender")
    received_messages: List[ChatMessage] = Relationship(back_populates="receiver")
    notifications: List[Notification] = Relationship(back_populates="user")

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
    __tablename__ = "patients"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    birth_date: date = Field(nullable=False)
    gender: str = Field(max_length=1, nullable=False)  # 'M' ou 'F'
    phone: str = Field(nullable=False)
    address: str = Field(nullable=False)
    history: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), 
                                 sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)})

    consultations: List[Consultation] = Relationship(back_populates="patient")
    prescriptions: List[Prescription] = Relationship(back_populates="patient")
    referrals: List[Referral] = Relationship(back_populates="patient")
    

class Doctor(SQLModel, table=True):
    __tablename__ = "doctors"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)  # Um médico é também um User
    crm: str = Field(max_length=20, unique=True)  # Registo profissional
    specialty: str = Field(max_length=100)
    phone: str
    email: str = Field(unique=True, index=True)

    
    user: Optional[User] = Relationship(back_populates="doctor")
    consultations: List["Consultation"] = Relationship(back_populates="doctor")

    consultations: List["Consultation"] = Relationship(back_populates="doctor")
    prescriptions: List["Prescription"] = Relationship(back_populates="doctor")
    referrals_out: List["Referral"] = Relationship(back_populates="from_doctor")


class Consultation(SQLModel, table=True):
    __tablename__ = "consultations"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    doctor_id: int = Field(foreign_key="doctor.id")
    scheduled_date: datetime = Field(nullable=False)
    status: str = Field(default="agendada") 
    notes: Optional[str] = None

    # Relações
    patient: Optional[Patient] = Relationship(back_populates="consultations")
    doctor: Optional[Doctor] = Relationship(back_populates="consultations")
    payment: Optional["Payment"] = Relationship(back_populates="consultation")
    prescriptions: List["Prescription"] = Relationship(back_populates="consultation")


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    consultation_id: Optional[int] = Field(default=None, foreign_key="consultation.id")
    amount: float
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    method: str  # dinheiro, cartao, mpesa, emola, mkesh
    status: str = Field(default="pendente")  # pendente, pago
    receipt_number: str = Field(unique=True, index=True)
    registered_by: int = Field(foreign_key="user.id")  # farmacêutico ou admin

    # Relações
    consultation: Optional[Consultation] = Relationship(back_populates="payment")
    registrar: Optional[User] = Relationship(back_populates="payments")


class Prescription(SQLModel, table=True):
    __tablename__ = "prescriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    doctor_id: int = Field(foreign_key="doctor.id")
    consultation_id: Optional[int] = Field(default=None, foreign_key="consultation.id")
    medications: str  # JSON string (lista de medicamentos com dosagem, duração)
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

    
    patient: Optional[Patient] = Relationship(back_populates="prescriptions")
    doctor: Optional[Doctor] = Relationship(back_populates="prescriptions")
    consultation: Optional[Consultation] = Relationship(back_populates="prescriptions")


class Referral(SQLModel, table=True):
    __tablename__ = "referrals"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    from_doctor_id: int = Field(foreign_key="doctor.id")
    to_specialty: str  
    reason: str
    status: str = Field(default="pendente")  # pendente, aceite, concluido
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relações
    patient: Optional[Patient] = Relationship(back_populates="referrals")
    from_doctor: Optional[Doctor] = Relationship(back_populates="referrals_out")


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id")
    receiver_id: int = Field(foreign_key="user.id")
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = Field(default=False)

    # Relações
    sender: Optional[User] = Relationship(back_populates="sent_messages")
    receiver: Optional[User] = Relationship(back_populates="received_messages")


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    message: str
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    type: str = Field(default="info")  

    user: Optional[User] = Relationship(back_populates="notifications")