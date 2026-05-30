import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Prescription, Patient, Doctor, Consultation
from app.schemas.schemas import PrescriptionCreate, PrescriptionOut

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.get("/", response_model=List[PrescriptionOut])
def list_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todas as receitas (requer autenticação)"""
    prescriptions = db.exec(select(Prescription)).all()
    return prescriptions

@router.post("/", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
def create_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Emite uma nova receita electrónica"""
    # Verificar existências
    patient = db.get(Patient, prescription.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = db.get(Doctor, prescription.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if prescription.consultation_id:
        consultation = db.get(Consultation, prescription.consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")

    # Converter lista de medicamentos para JSON string
    medications_json = json.dumps([med.dict() for med in prescription.medications])

    # Se issued_at não enviado, usar agora
    issued_at = prescription.issued_at or datetime.now(timezone.utc)

    db_prescription = Prescription(
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
        consultation_id=prescription.consultation_id,
        medications=medications_json,
        issued_at=issued_at,
        notes=prescription.notes
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    # Converter de volta para lista no output
    out = PrescriptionOut.model_validate(db_prescription)
    out.medications = prescription.medications
    return out