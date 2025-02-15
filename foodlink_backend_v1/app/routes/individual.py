from fastapi import APIRouter, HTTPException, Depends
from app.utils.jwt_handler import jwt_required
from app.services.individual_service import create_appointment_in_db

router = APIRouter()


@router.post("/appointment")
async def request_an_appointment(
    payload: dict = Depends(jwt_required), appointment_data: dict = {}
):
    """
    Allow individual to create an appointment
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param appointment_data: A detailed appointment is made by individual
    :return A created appointment in db
    """

    # Validate if the request is made from an individual

    if payload.get("role") != "individual":
        raise HTTPException(
            status_code=401, detail="Only Individual can request an appointment!"
        )

    # Validate the given body
    required_key = ["foodbank_id", "start_time", "end_time", "product"]

    # Start validation those keys
    for key in required_key:
        if not appointment_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # Store a new appointment in db
    appointment = await create_appointment_in_db(
        individual_id=payload.get("sub"), appointment_data=appointment_data
    )

    return {"status": "success", "appointment": appointment}
