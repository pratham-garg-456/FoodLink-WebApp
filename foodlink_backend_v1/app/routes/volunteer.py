from fastapi import APIRouter, HTTPException, Depends
from app.utils.jwt_handler import jwt_required
from app.services.volunteer_service import add_application_in_db

router = APIRouter()


@router.post("/application")
async def apply_available_services(
    payload: dict = Depends(jwt_required), application_data: dict = {}
):
    """
    Allow volunteer to submit the application to specific services for specific food bank
    :param application_data: A application information
    :return A created application is stored in the db
    """
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only volunteer can apply application"
        )

    required_key = ["event_id", "applied_position", "category"]

    # Start validation those keys
    for key in required_key:
        if not application_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # create a application in db
    new_application = await add_application_in_db(
        volunteer_id=payload.get("sub"),
        event_id=application_data["event_id"],
        applied_position=application_data["applied_position"],
        category=application_data["category"],
    )

    return {"status": "success", "application": new_application}
