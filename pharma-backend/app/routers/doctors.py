from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Doctor
from app.schemas.schemas import DoctorOut, DoctorCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[DoctorOut])
def list_doctors(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Doctor).all()

@router.post("/", response_model=DoctorOut)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores")
    db_doctor = Doctor.from_orm(doctor)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor