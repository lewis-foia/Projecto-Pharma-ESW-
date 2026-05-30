from pydantic import BaseModel
from typing import Optional, List

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

from datetime import date, datetime
from typing import Optional

# ... (schemas existentes)

# Patient schemas
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