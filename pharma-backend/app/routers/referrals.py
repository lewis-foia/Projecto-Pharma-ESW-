from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Referral
from app.schemas.schemas import ReferralOut, ReferralCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ReferralOut])
def list_referrals(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "recepcionista"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return db.query(Referral).all()

@router.post("/", response_model=ReferralOut)
def create_referral(referral: ReferralCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "recepcionista"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    db_ref = Referral.from_orm(referral)
    db.add(db_ref)
    db.commit()
    db.refresh(db_ref)
    return db_ref