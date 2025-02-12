from fastapi import APIRouter, HTTPException,Depends
from app.models.user import User
from app.models.application import Application
from app.utils.jwt_handler import jwt_required
from app.services.volunteer_service import (
    add_application_in_db
)
router = APIRouter()


@router.post("/application")
async def apply_available_services(payload: dict = Depends(jwt_required),application_data: dict = {}):
    """
    Allow volunteer to submit the application to specific services for specific food bank
    :param service_data: A application information
    :return A created application is stored in the db
    """
    # Required key in the body
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only volunteer can apply services"
        )
    
    required_key = [
        "event_id",
        "service_id",
    ]

    # Start validation those keys
    for key in required_key:
        if not application_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )
    
    # create a application in db
    new_application = await add_application_in_db(application_data["event_id"],payload.get("sub"),application_data["service_id"])
    return {"status": "success", "application": new_application}

