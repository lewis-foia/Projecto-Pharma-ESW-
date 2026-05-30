from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Payment, Consultation
from app.schemas.schemas import PaymentCreate, PaymentOut

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/", response_model=List[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todos os pagamentos (requer autenticação)"""
    payments = db.exec(select(Payment)).all()
    return payments

@router.post("/", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regista um novo pagamento (requer autenticação)"""
    # Se consultation_id for fornecido, verificar existência
    if payment.consultation_id:
        consultation = db.get(Consultation, payment.consultation_id)
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")

    # Gerar receipt_number automático se não fornecido
    receipt_number = payment.receipt_number
    if not receipt_number:
        receipt_number = f"RCP-{datetime.now(timezone.utc).timestamp()}"
    # Verificar unicidade
    if db.exec(select(Payment).where(Payment.receipt_number == receipt_number)).first():
        raise HTTPException(status_code=400, detail="Receipt number already exists")

    # Usar registered_by do current_user? O schema pede registered_by, mas podemos forçar
    payment_data = payment.model_dump()
    payment_data["receipt_number"] = receipt_number
    if payment.payment_date is None:
        payment_data["payment_date"] = datetime.now(timezone.utc)

    db_payment = Payment.model_validate(payment_data)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment