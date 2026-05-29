from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Patient
from app.schemas.schemas import PatientCreate, PatientUpdate, PatientOut

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=List[PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todos os pacientes (requer autenticação)"""
    patients = db.query(Patient).all()
    return patients

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém um paciente pelo ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient

@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria um novo paciente"""
    # Validação do género (apenas M ou F)
    if patient.gender not in ["M", "F"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gender must be 'M' or 'F'")
    
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualização completa de um paciente (PUT)"""
    # Validação do género
    if patient_data.gender not in ["M", "F"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gender must be 'M' or 'F'")
    
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    # Actualiza todos os campos
    for key, value in patient_data.model_dump().items():
        setattr(db_patient, key, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient