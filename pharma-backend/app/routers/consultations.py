from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Consultation, Patient, Doctor
from app.schemas.schemas import ConsultationCreate, ConsultationOut

router = APIRouter(prefix="/consultations", tags=["Consultations"])

@router.get("/", response_model=List[ConsultationOut])
def list_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todas as consultas (requer autenticação)"""
    consultations = db.exec(select(Consultation)).all()
    return consultations

@router.post("/", response_model=ConsultationOut, status_code=status.HTTP_201_CREATED)
def create_consultation(
    consultation: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Agenda uma nova consulta"""
    # Verificar se paciente e médico existem
    patient = db.get(Patient, consultation.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = db.get(Doctor, consultation.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db_consultation = Consultation.model_validate(consultation)
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    return db_consultation

@router.put("/{consultation_id}/cancel", response_model=ConsultationOut)
def cancel_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancela uma consulta (altera status para 'cancelada')"""
    consultation = db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    if consultation.status == "cancelada":
        raise HTTPException(status_code=400, detail="Consultation already cancelled")
    consultation.status = "cancelada"
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation