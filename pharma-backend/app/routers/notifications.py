from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationOut
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).all()

@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notif = db.get(Notification, notification_id)
    if not notif or notif.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif