from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Doctor
from app.schemas.schemas import DoctorCreate, DoctorOut

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/", response_model=List[DoctorOut])
def list_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    #Listagem de todos os médicos (requer autenticação)
    doctors = db.exec(select(Doctor)).all()
    return doctors

@router.post("/", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    #Criação de um novo médico (requer autenticação)
    # Verificar se user_id existe
    user = db.get(User, doctor.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Verificar se já não existe um médico com este user_id
    existing = db.exec(select(Doctor).where(Doctor.user_id == doctor.user_id)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already linked to a doctor")
    # Verificar se CRM ou email já existem
    if db.exec(select(Doctor).where(Doctor.crm == doctor.crm)).first():
        raise HTTPException(status_code=400, detail="CRM already registered")
    if db.exec(select(Doctor).where(Doctor.email == doctor.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    db_doctor = Doctor.model_validate(doctor)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor