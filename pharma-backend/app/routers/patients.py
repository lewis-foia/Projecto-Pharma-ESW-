from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Patient
from app.schemas.schemas import PatientOut, PatientCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[PatientOut])
def list_patients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Patient).all()

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return patient

@router.post("/", response_model=PatientOut)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "recepcionista"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    db_patient = Patient.from_orm(patient)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, patient: PatientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "recepcionista"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    db_patient = db.get(Patient, patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    for key, value in patient.dict().items():
        setattr(db_patient, key, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient