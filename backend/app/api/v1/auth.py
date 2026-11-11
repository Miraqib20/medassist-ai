from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.services import auth_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new patient, doctor, or admin user."""
    return auth_service.register_user(db, user_in)

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    return auth_service.authenticate_user(db, login_in)

@router.get("/me", response_model=UserOut)
def get_me(current_user: UserOut = Depends(get_current_user)):
    """Get current logged-in user profile."""
    return current_user
