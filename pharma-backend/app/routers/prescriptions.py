from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Prescription
from app.schemas.schemas import PrescriptionOut, PrescriptionCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[PrescriptionOut])
def list_prescriptions(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    prescriptions = db.query(Prescription).all()
    if current_user.role == "patient":
        prescriptions = [p for p in prescriptions if p.patient_id == current_user.id]
    return prescriptions

@router.post("/", response_model=PrescriptionOut)
def issue_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role == "patient":
        raise HTTPException(status_code=403, detail="Pacientes não podem emitir receitas")
    db_pres = Prescription.from_orm(prescription)
    db.add(db_pres)
    db.commit()
    db.refresh(db_pres)
    return db_pres