import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Conversation, Message
from app.schemas.schemas import ChatMessageInput, ChatResponse, ConversationOut
from app.ai.agent import AIAgent
from app.api.deps import get_current_user_optional, get_current_user

router = APIRouter(prefix="/chat", tags=["Chatbot"])

@router.post("", response_model=ChatResponse)
def send_chat_message(
    chat_in: ChatMessageInput,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Main Chatbot API endpoint. Processes natural language patient prompts,
    executes backend tools, queries RAG context, persists chat memory,
    and returns response with optional action payloads for rich UI rendering.
    """
    user_id = current_user.id if current_user else None
    role = current_user.role if current_user else "PATIENT"

    # Get or create conversation
    conv_id = chat_in.conversation_id
    conversation = None
    if conv_id:
        conversation = db.query(Conversation).filter(Conversation.id == conv_id).first()

    if not conversation:
        title_snippet = chat_in.message[:40] if len(chat_in.message) > 40 else chat_in.message
        conversation = Conversation(
            user_id=user_id,
            title=f"Chat: {title_snippet}"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=chat_in.message
    )
    db.add(user_msg)

    # Retrieve previous conversation history for memory
    past_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.timestamp.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in past_messages]

    # Invoke AI Agent Orchestrator
    agent = AIAgent(db=db)
    agent_result = agent.process_message(
        user_message=chat_in.message,
        conversation_history=history,
        user_id=user_id,
        role=role
    )

    # Save assistant message
    actions_json = json.dumps(agent_result.get("actions", []), default=str)
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=agent_result["message"],
        actions_json=actions_json
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "conversation_id": conversation.id,
        "message": agent_result["message"],
        "actions": agent_result.get("actions", [])
    }

@router.get("/conversations", response_model=List[ConversationOut])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all chat conversations for logged in patient."""
    return db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc()).all()

@router.get("/conversations/{id}", response_model=ConversationOut)
def get_conversation_details(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete message thread for a specific conversation ID."""
    conv = db.query(Conversation).filter(Conversation.id == id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if current_user.role != "ADMIN" and conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return conv
