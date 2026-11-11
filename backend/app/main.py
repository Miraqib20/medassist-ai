from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.api.v1 import auth, doctors, services, appointments, chat, admin

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="MediAssist AI - Intelligent Clinic Appointment & Patient Support API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
