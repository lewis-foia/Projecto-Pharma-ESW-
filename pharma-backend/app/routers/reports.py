from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import Dict, Any
from datetime import datetime, date, timedelta

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, Sale, Consultation, Prescription, Payment, Product, Notification
from app.schemas.schemas import ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", response_model=ReportResponse)
def generate_report(
    type: str = Query(..., description="Tipo de relatório: sales, consultations, prescriptions, top_medicines, payment_methods, unread_notifications"),
    period: str = Query(..., description="Período: daily, weekly, monthly, custom"),
    start_date: date = Query(None, description="Data de início para period=custom"),
    end_date: date = Query(None, description="Data de fim para period=custom"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Produção de relatórios com base no tipo e período
    
    # Calcular intervalo de datas
    end = datetime.now()
    if period == "daily":
        start = end - timedelta(days=1)
    elif period == "weekly":
        start = end - timedelta(days=7)
    elif period == "monthly":
        start = end - timedelta(days=30)
    elif period == "custom":
        if not start_date or not end_date:
            raise HTTPException(status_code=400, detail="start_date and end_date required for custom period")
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    data = {}
    
    if type == "sales":
        # Vendas por período
        sales = db.exec(select(Sale).where(Sale.created_at >= start, Sale.created_at <= end)).all()
        total_revenue = sum(s.total_price for s in sales)
        total_items = sum(s.quantity for s in sales)
        data = {"total_revenue": total_revenue, "total_items": total_items, "sales_count": len(sales)}
    
    elif type == "consultations":
        # Consultas por médico no período
        consults = db.exec(select(Consultation).where(Consultation.scheduled_date >= start, Consultation.scheduled_date <= end)).all()
        by_doctor = {}
        for c in consults:
            doctor_name = c.doctor.user.full_name if c.doctor else f"Doctor {c.doctor_id}"
            by_doctor[doctor_name] = by_doctor.get(doctor_name, 0) + 1
        data = {"total_consultations": len(consults), "by_doctor": by_doctor}
    
    elif type == "prescriptions":
        # Receitas emitidas no período
        prescriptions = db.exec(select(Prescription).where(Prescription.issued_at >= start, Prescription.issued_at <= end)).all()
        data = {"total_prescriptions": len(prescriptions)}
    
    elif type == "top_medicines":
        # Medicamentos mais vendidos (top 10 por quantidade)
        results = db.exec(
            select(Product.name, func.sum(Sale.quantity).label("total_qty"))
            .join(Sale, Product.id == Sale.product_id)
            .where(Sale.created_at >= start, Sale.created_at <= end)
            .group_by(Product.id)
            .order_by(func.sum(Sale.quantity).desc())
            .limit(10)
        ).all()
        data = [{"name": r[0], "total_quantity": r[1]} for r in results]
    
    elif type == "payment_methods":
        # Percentagem de pagamentos por método
        payments = db.exec(select(Payment).where(Payment.payment_date >= start, Payment.payment_date <= end)).all()
        total = len(payments)
        if total == 0:
            data = {}
        else:
            method_counts = {}
            for p in payments:
                method_counts[p.method] = method_counts.get(p.method, 0) + 1
            data = {method: round(count/total*100, 2) for method, count in method_counts.items()}
    
    elif type == "unread_notifications":
        # Notificações não lidas por utilizador (para dashboard)
        unread = db.exec(
            select(User.id, User.full_name, func.count(Notification.id))
            .join(Notification, User.id == Notification.user_id)
            .where(Notification.is_read == False)
            .group_by(User.id)
        ).all()
        data = [{"user_id": u[0], "user_name": u[1], "unread_count": u[2]} for u in unread]
    
    else:
        raise HTTPException(status_code=400, detail="Invalid report type")
    
    return ReportResponse(data=data)