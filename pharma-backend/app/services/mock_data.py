from sqlmodel import Session
from app.database import engine
from app.models.models import User, Product, Sale, Patient, Doctor, Consultation, Payment, Prescription, Referral, ChatMessage, Notification
from app.utils.security import hash_password
from datetime import datetime, timedelta, date, timezone
from random import randint, choice
import json

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
        seed_patients(db)

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

        if db.query(Doctor).count() == 0: # Verificação de existência de médicos
            # Criação de users para médicos (se não existirem)
            doctor_users = [
                User(username="dr_silva", full_name="Dr. António Silva", email="antonio.silva@clinicapt", role="pharmacist", hashed_password=hash_password("doctor123")),
                User(username="dr_mabunda", full_name="Dra. Lina Mabunda", email="lina.mabunda@clinicapt", role="pharmacist", hashed_password=hash_password("doctor123")),
            ]
            for u in doctor_users:
                if not db.query(User).filter(User.email == u.email).first():
                    db.add(u)
            db.commit()

        # Obter os users criados
        user_silva = db.query(User).filter(User.email == "antonio.silva@clinicapt").first()
        user_mabunda = db.query(User).filter(User.email == "lina.mabunda@clinicapt").first()

        doctors_data = [
            {"user_id": user_silva.id, "crm": "CRM12345", "specialty": "Clínica Geral", "phone": "821234567", "email": user_silva.email},
            {"user_id": user_mabunda.id, "crm": "CRM67890", "specialty": "Pediatria", "phone": "823456789", "email": user_mabunda.email},
        ]
        for d in doctors_data:
            db.add(Doctor(**d))
        db.commit()

    
        # MOCK DE CONSULTAS
        
        if db.query(Consultation).count() == 0:
            patients = db.query(Patient).all()
            doctors = db.query(Doctor).all()
            if patients and doctors:
                
                base_date = datetime.now(timezone.utc) - timedelta(days=20)
                for i in range(10):
                    patient = choice(patients)
                    doctor = choice(doctors)
                    cons = Consultation(
                        patient_id=patient.id,
                        doctor_id=doctor.id,
                        scheduled_date=base_date + timedelta(days=i),
                        status=choice(["agendada", "realizada", "cancelada"]),
                        notes=f"Notas da consulta {i+1}"
                    )
                    db.add(cons)
                db.commit()

        
        # MOCK DE PAGAMENTOS
        
        if db.query(Payment).count() == 0:
            consultations = db.query(Consultation).all()
            users = db.query(User).all()
            registrar = users[0]  # admin
            methods = ["dinheiro", "cartao", "mpesa", "emola", "mkesh"]
            statuses = ["pendente", "pago"]
            for i, cons in enumerate(consultations[:5]):  # só para as primeiras 5 consultas
                payment = Payment(
                    consultation_id=cons.id,
                    amount=round(randint(2000, 10000)/100, 2),  # entre 20 e 100
                    payment_date=datetime.now(timezone.utc) - timedelta(days=i),
                    method=choice(methods),
                    status=choice(statuses),
                    receipt_number=f"RCP-{int(datetime.now().timestamp())}-{i}",
                    registered_by=registrar.id
                )
                db.add(payment)
            db.commit()

        
        # MOCK DE PRESCRIÇÕES
        
        if db.query(Prescription).count() == 0:
            patients = db.query(Patient).all()
            doctors = db.query(Doctor).all()
            consultations = db.query(Consultation).all()
            for i in range(5):
                prescription = Prescription(
                    patient_id=choice(patients).id,
                    doctor_id=choice(doctors).id,
                    consultation_id=choice(consultations).id if consultations else None,
                    medications=json.dumps([
                        {"name": "Paracetamol 500mg", "dosage": "1 comprimido de 8/8h", "duration": "3 dias"},
                        {"name": "Ibuprofeno 400mg", "dosage": "1 comprimido de 12/12h", "duration": "2 dias"}
                    ]),
                    issued_at=datetime.now(timezone.utc) - timedelta(days=i),
                    notes="Tomar após as refeições"
                )
                db.add(prescription)
            db.commit()

        
        # MOCK DE ENCAMINHAMENTOS
        
        if db.query(Referral).count() == 0:
            patients = db.query(Patient).all()
            doctors = db.query(Doctor).all()
            specialties = ["Cardiologia", "Neurologia", "Ortopedia", "Oftalmologia", "Dermatologia"]
            for i in range(5):
                referral = Referral(
                    patient_id=choice(patients).id,
                    from_doctor_id=choice(doctors).id,
                    to_specialty=choice(specialties),
                    reason="Necessita de avaliação especializada",
                    status=choice(["pendente", "aceite", "concluido"]),
                    created_at=datetime.now(timezone.utc) - timedelta(days=i)
                )
                db.add(referral)
            db.commit()

        
        # MOCK DE MENSAGENS DE CHAT
        
        if db.query(ChatMessage).count() == 0:
            users = db.query(User).all()
            if len(users) >= 2:
                # Mensagens entre admin e dr_silva
                admin = users[0]
                dr_silva = db.query(User).filter(User.email == "antonio.silva@clinicapt").first()
                if dr_silva:
                    messages = [
                        {"sender_id": admin.id, "receiver_id": dr_silva.id, "message": "Olá Dr. Silva, como está?", "timestamp": datetime.now(timezone.utc) - timedelta(days=2)},
                        {"sender_id": dr_silva.id, "receiver_id": admin.id, "message": "Bom dia! Tudo bem, obrigado.", "timestamp": datetime.now(timezone.utc) - timedelta(days=2, hours=1)},
                        {"sender_id": admin.id, "receiver_id": dr_silva.id, "message": "Precisamos de mais medicamentos na farmácia.", "timestamp": datetime.now(timezone.utc) - timedelta(days=1)},
                    ]
                    for m in messages:
                        db.add(ChatMessage(**m))
                db.commit()

        
        # MOCK DE NOTIFICAÇÕES
        
        if db.query(Notification).count() == 0:
            users = db.query(User).all()
            for user in users:
                for i in range(2):
                    notif = Notification(
                        user_id=user.id,
                        title=f"Notificação {i+1}",
                        message="Esta é uma notificação de exemplo.",
                        type=choice(["info", "alerta", "lembrete"]),
                        is_read=(i==0),  # primeira lida, segunda não lida
                        created_at=datetime.now(timezone.utc) - timedelta(days=i)
                    )
                    db.add(notif)
            db.commit()
