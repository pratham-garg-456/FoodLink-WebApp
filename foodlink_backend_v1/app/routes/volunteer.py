from fastapi import APIRouter, HTTPException, Depends
from app.utils.jwt_handler import jwt_required
from app.services.volunteer_service import (
    add_event_application_in_db,
    retrieve_list_jobs_in_db,
    add_foodbank_job_application_in_db,
)

router = APIRouter()


@router.post("/application/event")
async def apply_available_jobs_for_event(
    payload: dict = Depends(jwt_required), application_data: dict = {}
):
    """
    Allow volunteer to submit the application to specific event for specific food bank
    :param application_data: A application information
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return A created application is stored in the db
    """
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only volunteer can apply application"
        )

    required_key = ["event_id", "job_id"]

    # Start validation those keys
    for key in required_key:
        if not application_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # create a application in db
    new_application = await add_event_application_in_db(
        volunteer_id=payload.get("sub"),
        event_id=application_data["event_id"],
        job_id=application_data["job_id"],
    )

    return {"status": "success", "event_application": new_application}


@router.post("/application/foodbank")
async def apply_available_jobs_for_foodbank(
    payload: dict = Depends(jwt_required), application_data: dict = {}
):
    """
    Allow volunteer to submit the application to available positions from different foodbank
    :param application_data: A application information
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return A created application is stored in the db
    """
    # Validate if the request is made from a volunteer
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only volunteer can apply application"
        )

    required_key = ["foodbank_id", "job_id"]

    # Start validation those keys
    for key in required_key:
        if not application_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # create a application in db
    new_application = await add_foodbank_job_application_in_db(
        volunteer_id=payload.get("sub"),
        foodbank_id=application_data["foodbank_id"],
        job_id=application_data["job_id"],
    )

    return {"status": "success", "foodbank_application": new_application}


@router.get("/jobs")
async def retrieve_available_job(payload: dict = Depends(jwt_required)):
    """
    Retrieve the list of available job from different foodbank
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return a list of available jobs from different foodbank
    """

    # Validate if the request is made from Volunteer
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only Volunteer get the list of the jobs"
        )

    jobs = await retrieve_list_jobs_in_db()

    if len(jobs) == 0:
        raise HTTPException(status_code=404, detail="There are no posted jobs!")

    return {"status": "success", "jobs": jobs}
