from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_db
from app.models.models import ChatMessage, User
from app.schemas.schemas import ChatMessageOut, ChatMessageCreate
from app.dependencies import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ChatMessageOut])
def get_messages(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    messages = db.query(ChatMessage).order_by(ChatMessage.timestamp.desc()).limit(50).all()
    result = []
    for m in messages:
        sender = db.get(User, m.sender_id)
        result.append(ChatMessageOut(
            id=m.id,
            sender_id=m.sender_id,
            sender_name=sender.full_name if sender else "Desconhecido",
            text=m.text,
            timestamp=m.timestamp
        ))
    # Ordenar por timestamp ascendente (mais antigas primeiro)
    result.reverse()
    return result

@router.post("/", response_model=ChatMessageOut)
def send_message(msg: ChatMessageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_msg = ChatMessage(
        sender_id=current_user.id,
        text=msg.text
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return ChatMessageOut(
        id=db_msg.id,
        sender_id=db_msg.sender_id,
        sender_name=current_user.full_name,
        text=db_msg.text,
        timestamp=db_msg.timestamp
    )