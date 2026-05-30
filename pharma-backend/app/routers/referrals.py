from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Referral, Patient, Doctor
from app.schemas.schemas import ReferralCreate, ReferralOut

router = APIRouter(prefix="/referrals", tags=["Referrals"])

@router.get("/", response_model=List[ReferralOut])
def list_referrals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Listagem de todos os encaminhamentos, mediante requer autenticação
    referrals = db.exec(select(Referral)).all()
    return referrals

@router.post("/", response_model=ReferralOut, status_code=status.HTTP_201_CREATED)
def create_referral(
    referral: ReferralCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Criação de um novo encaminhamento
    # Verificação de existências
    patient = db.get(Patient, referral.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = db.get(Doctor, referral.from_doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db_referral = Referral.model_validate(referral)
    db.add(db_referral)
    db.commit()
    db.refresh(db_referral)
    return db_referral