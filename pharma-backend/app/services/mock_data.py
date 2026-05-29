from sqlmodel import Session
from app.database import engine
from app.models.models import User, Product, Sale, Patient
from app.utils.security import hash_password
from datetime import datetime, timedelta, date
from random import randint, choice

def seed_mock_data():
    with Session(engine) as db:
        if db.query(User).count() > 0:
            return

        admin = User(
            username="admin",
            full_name="Administrador",
            email="admin@pharma.pt",
            role="admin",
            hashed_password=hash_password("admin123")
        )
        farm = User(
            username="farmacia",
            full_name="Farmacêutico Chefe",
            email="farma@pharma.pt",
            role="pharmacist",
            hashed_password=hash_password("farma123")
        )
        db.add_all([admin, farm])

        products = [
            Product(name="Paracetamol 500mg", category="Analgésico", price=2.5, stock=150, min_stock=20, expiry_date="2027-06-01"),
            Product(name="Ibuprofeno 400mg", category="Anti-inflamatório", price=3.8, stock=80, min_stock=15, expiry_date="2026-12-15"),
            Product(name="Amoxicilina 250mg", category="Antibiótico", price=5.2, stock=60, min_stock=10, expiry_date="2026-09-20"),
            Product(name="Omeprazol 20mg", category="Inibidor de bomba", price=4.1, stock=120, min_stock=25, expiry_date="2027-03-10"),
            Product(name="Loratadina 10mg", category="Anti-histamínico", price=3.0, stock=200, min_stock=30, expiry_date="2027-08-22"),
            Product(name="Salbutamol 100mcg", category="Broncodilatador", price=6.9, stock=35, min_stock=5, expiry_date="2026-11-05"),
            Product(name="Diazepam 5mg", category="Ansiolítico", price=4.5, stock=45, min_stock=8, expiry_date="2027-01-18"),
            Product(name="Metformina 850mg", category="Antidiabético", price=2.8, stock=90, min_stock=12, expiry_date="2027-05-30"),
        ]
        db.add_all(products)
        
        def seed_patients(db: Session):
            if db.query(Patient).first():
                return
            
            patients_data = [
                {"name": "Maria Macuácua", "birth_date": date(1985, 3, 12), "gender": "F", 
                "phone": "841234567", "address": "Maputo, Bairro Central", 
                "history": "Hipertensão controlada"},
                {"name": "João Sitoe", "birth_date": date(1990, 7, 25), "gender": "M", 
                "phone": "823456789", "address": "Matola, Liberdade", 
                "history": "Diabetes tipo 2"},
                {"name": "Ana Mabunda", "birth_date": date(1978, 11, 5), "gender": "F", 
                "phone": "845678901", "address": "Beira, Macuti", 
                "history": "Asma brônquica"},
                {"name": "Carlos Macuácua", "birth_date": date(2000, 1, 20), "gender": "M", 
                "phone": "867890123", "address": "Nampula, Muatala", 
                "history": None},
                {"name": "Helena Sitoe", "birth_date": date(1995, 9, 14), "gender": "F", 
                "phone": "879012345", "address": "Maputo, Polana Cimento", 
                "history": "Alergia a penicilina"},
            ]
            
            for p in patients_data:
                patient = Patient(**p)
                db.add(patient)
        
        db.commit()

        base = datetime.now() - timedelta(days=30)
        for i in range(50):
            prod = choice(products)
            qty = randint(1, 5)
            sale = Sale(
                product_id=prod.id,
                quantity=qty,
                total_price=round(prod.price * qty, 2),
                sold_by=farm.id,
                created_at=(base + timedelta(days=randint(0, 30))).isoformat()
            )
            db.add(sale)
        db.commit()
