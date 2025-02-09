from app.models.user import User
from fastapi import HTTPException

async def get_user_by_email_from_db(email: str):
    """
    Checking if the user already registered or not
    :param email: An email that users used for registration
    """
    
    user = await User.find_one(User.email == email)
    if user:
        user_dict = user.model_dump()
        user_dict["id"] = str(user_dict["id"])
        return user_dict
    
    return None


async def create_user_in_db(name: str, role: str, email: str, password: str):
    """
    Creating a user in db
    :param name: A full name of a user or a name of organization for foodbank
    :param role: Role of a user (individual, donor, foodbank, or volunteer)
    :param email: An email of user
    :param password: A hashed password
    """
    
    try:
        new_user = User(name=name, role=role, email=email, password=password)
    
        await new_user.insert()
        user_dict = new_user.model_dump()
        user_dict["id"] = str(user_dict["id"])
        return user_dict
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while creating new user in db: {e}",
        )