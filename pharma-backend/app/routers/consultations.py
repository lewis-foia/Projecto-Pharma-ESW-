from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Consultation, Patient, Doctor
from app.schemas.schemas import ConsultationOut, ConsultationCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ConsultationOut])
def list_consultations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    consultations = db.query(Consultation).all()
    result = []
    for c in consultations:
        patient = db.get(Patient, c.patient_id)
        doctor = db.get(Doctor, c.doctor_id)
        result.append(ConsultationOut(
            id=c.id,
            patient_id=c.patient_id,
            patient_name=patient.name if patient else "Desconhecido",
            doctor_id=c.doctor_id,
            doctor_name=doctor.name if doctor else "Desconhecido",
            date=c.date,
            time=c.time,
            status=c.status,
            notes=c.notes
        ))
    # Filtrar por paciente se for paciente logado
    if current_user.role == "patient":
        result = [c for c in result if c.patient_id == current_user.id]
    return result

@router.post("/", response_model=ConsultationOut)
def schedule_consultation(consultation: ConsultationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role == "patient":
        raise HTTPException(status_code=403, detail="Pacientes não podem agendar consultas")
    patient = db.get(Patient, consultation.patient_id)
    doctor = db.get(Doctor, consultation.doctor_id)
    if not patient or not doctor:
        raise HTTPException(status_code=404, detail="Paciente ou médico não encontrado")
    db_consultation = Consultation.from_orm(consultation)
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    return ConsultationOut(
        id=db_consultation.id,
        patient_id=db_consultation.patient_id,
        patient_name=patient.name,
        doctor_id=db_consultation.doctor_id,
        doctor_name=doctor.name,
        date=db_consultation.date,
        time=db_consultation.time,
        status=db_consultation.status,
        notes=db_consultation.notes
    )

@router.put("/{consultation_id}/cancel", response_model=ConsultationOut)
def cancel_consultation(consultation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    consultation = db.get(Consultation, consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    if consultation.status == "cancelada":
        raise HTTPException(status_code=400, detail="Consulta já cancelada")
    consultation.status = "cancelada"
    db.commit()
    db.refresh(consultation)
    patient = db.get(Patient, consultation.patient_id)
    doctor = db.get(Doctor, consultation.doctor_id)
    return ConsultationOut(
        id=consultation.id,
        patient_id=consultation.patient_id,
        patient_name=patient.name if patient else "Desconhecido",
        doctor_id=consultation.doctor_id,
        doctor_name=doctor.name if doctor else "Desconhecido",
        date=consultation.date,
        time=consultation.time,
        status=consultation.status,
        notes=consultation.notes
    )