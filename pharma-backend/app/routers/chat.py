from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User, ChatMessage
from app.schemas.schemas import ChatMessageCreate, ChatMessageOut

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/", response_model=List[ChatMessageOut])
def list_messages(
    with_user_id: int = Query(..., description="ID do outro utilizador na conversa"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista mensagens trocadas entre o utilizador logado e outro utilizador"""
    messages = db.exec(
        select(ChatMessage).where(
            ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == with_user_id)) |
            ((ChatMessage.sender_id == with_user_id) & (ChatMessage.receiver_id == current_user.id))
        ).order_by(ChatMessage.timestamp)
    ).all()
    return messages

@router.post("/", response_model=ChatMessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    message: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Envia uma mensagem para outro utilizador"""
    # Verificar se o destinatário existe
    receiver = db.get(User, message.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    db_message = ChatMessage(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        message=message.message,
        is_read=False
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message