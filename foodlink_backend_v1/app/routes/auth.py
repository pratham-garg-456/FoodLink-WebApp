from fastapi import APIRouter, HTTPException
from app.services.user_service import get_user_by_email_from_db, create_user_in_db
from app.utils.jwt_handler import get_password_hash, verify_password

router = APIRouter()

@router.post("/register")
async def signup(user_data: dict = {}):
    """
    Allow users to sign up their account to FoodLink
    :param user_data: A user information contains name, role, email, and password
    :return A successful message indicates that the user is stored in the db
    """
    if not user_data["name"] and user_data["role"] and user_data["email"] and user_data["password"] and user_data["confirm_password"]:
        raise HTTPException(status_code=400, detail="Name, role, email, and password are required!")
    
    if not user_data["confirm_password"] == user_data["password"]:
        raise HTTPException(status_code=401, detail="Password does not match!")
    
    # Validate the email as an username for user:
    user = await get_user_by_email_from_db(email=user_data["email"])
    
    if user:
        raise HTTPException(status_code=400, status=f"{user_data['email']} already registered")
    
    # Hash the input password
    try:
        hashed_password = get_password_hash(user_data["password"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occured while hashing the password: {e}")
    
    # Store the new user into a db
    new_user = await create_user_in_db(name=user_data["name"], role=user_data["role"], email=user_data["email"], password=hashed_password)
    
    return {"status": "success", "user": new_user}    
    
@router.post("/signin")
async def signin(user_data: dict = {}):
    """
    Allow users to signin to FoodLink
    :param user_data: A user information contains email and plain password
    :return A successful message indicates that user is authenticated
    """
    
    if not user_data["email"] and user_data["password"]:
        raise HTTPException(status_code=400, detail="Email and Password are required!")
    
    # Fetch the stored user in the db
    user = await get_user_by_email_from_db(email=user_data["email"])
    
    # Compare the input password with the hashed password stored in the db
    if not user or not verify_password(user_data["password"], user["password"]):
        raise HTTPException(status_code=401, detail=f"Invalid email or password") 
    
    return {"status": "success", "user": user}
    
    
    