from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Sale, Product, User   # <-- ADICIONAR User AQUI
from app.schemas.schemas import SaleCreate, SaleOut
from app.dependencies import get_current_user
from typing import List
from datetime import datetime
from app.models.models import Sale, Product, User

router = APIRouter()

@router.get("/", response_model=List[SaleOut])
def list_sales(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sales = db.query(Sale).all()
    result = []
    for s in sales:
        prod = db.get(Product, s.product_id)
        user = db.get(User, s.sold_by)
        result.append(SaleOut(
            id=s.id,
            product_id=s.product_id,
            product_name=prod.name if prod else "Desconhecido",
            quantity=s.quantity,
            total_price=s.total_price,
            sold_by=s.sold_by,
            sold_by_name=user.full_name if user else "Desconhecido",
            created_at=s.created_at
        ))
    return result

@router.post("/", response_model=SaleOut)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    prod = db.get(Product, sale.product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if prod.stock < sale.quantity:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    
    db_sale = Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        total_price=round(prod.price * sale.quantity, 2),
        sold_by=current_user.id,
        created_at=datetime.now().isoformat()
    )
    prod.stock -= sale.quantity
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return SaleOut(
        id=db_sale.id,
        product_id=db_sale.product_id,
        product_name=prod.name,
        quantity=db_sale.quantity,
        total_price=db_sale.total_price,
        sold_by=db_sale.sold_by,
        sold_by_name=current_user.full_name,
        created_at=db_sale.created_at
    )