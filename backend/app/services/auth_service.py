from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import User, Patient, Doctor
from app.schemas.schemas import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token

def register_user(db: Session, user_in: UserRegister) -> User:
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role.upper()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto create patient profile if role is PATIENT
    if user.role == "PATIENT":
        patient = Patient(user_id=user.id)
        db.add(patient)
        db.commit()
    
    return user

def authenticate_user(db: Session, login_in: UserLogin) -> dict:
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
