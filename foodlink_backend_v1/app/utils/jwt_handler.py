import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from app.config import settings
from passlib.context import CryptContext


SECRET_KEY = settings.SECRET_KEY  # Store securely in .env
ALGORITHM = "HS256"

# Password hasing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_backend_token(): 
    pass

