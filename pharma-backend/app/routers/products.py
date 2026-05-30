from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Product
from app.schemas.schemas import ProductOut, ProductCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Product).all()

@router.post("/", response_model=ProductOut)
def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores")
    db_product = Product.from_orm(product)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_product = db.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/search/", response_model=List[ProductOut])
def search_products(
    q: str = Query(..., min_length=1, description="Termo de pesquisa (nome ou categoria)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Pesquisa produtos por nome ou categoria
    
    products = db.exec(
        select(Product).where(
            (Product.name.ilike(f"%{q}%")) | (Product.category.ilike(f"%{q}%"))
        )
    ).all()
    return products