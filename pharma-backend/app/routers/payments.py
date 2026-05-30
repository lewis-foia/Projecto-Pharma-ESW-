from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Payment, Consultation
from app.schemas.schemas import PaymentOut, PaymentCreate
from app.dependencies import get_current_user
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[PaymentOut])
def list_payments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "recepcionista"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    return db.query(Payment).all()

@router.post("/", response_model=PaymentOut)
def register_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ["admin", "recepcionista"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    # Verificar se a consulta existe
    consultation = db.get(Consultation, payment.consultation_id)
    if not consultation:
        raise HTTPException(status_code=404, detail="Consulta não encontrada")
    
    # Gerar número de recibo automático
    receipt = f"REC{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    db_payment = Payment(
        consultation_id=payment.consultation_id,
        amount=payment.amount,
        method=payment.method,
        receipt_number=receipt
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment