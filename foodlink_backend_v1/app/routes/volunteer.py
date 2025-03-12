from fastapi import APIRouter, HTTPException, Depends
from app.utils.jwt_handler import jwt_required
from app.services.volunteer_service import (
    add_foodbank_job_application_in_db,
    add_event_application_in_db,
    retrieve_list_jobs_in_db,
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

@router.get("/job/{job_id}")
async def retrieve_specific_job(job_id: str,payload: dict = Depends(jwt_required)):
    """
    Retrieve the information of the job based on the job id
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param job_id: job id for fetch the job.
    :return the specific job
    """

    # Validate if the request is made from Volunteer
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only Volunteer get the list of the jobs"
    )
    job = await retrieve_specific_job_in_db(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found or is no longer available")
    
    return {"status": "success", "job": job}


@router.get("/appliedJob")
async def retrieve_applied_job(payload: dict = Depends(jwt_required)):
    """
    Retrieve the volunteer applied job based on volunteer id
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return the list of applied jobs
    """
    # Validate if the request is made from Volunteer
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only Volunteer get the list of the jobs"
    )
    volunteer_id = payload.get("sub")
    applied_job = await retrieve_applied_job_in_db(volunteer_id=volunteer_id)
    return {"status": "success", "application": applied_job}


@router.delete("/cancelApplication/{application_id}")
async def retrieve_applied_job(application_id: str,payload: dict = Depends(jwt_required)):
    """
    Update the status application to cancel 
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return the list of applied jobs
    """
    # Validate if the request is made from Volunteer
    if payload.get("role") != "volunteer":
        raise HTTPException(
            status_code=401, detail="Only Volunteer get the list of the jobs"
    )

    volunteer_id = payload.get("sub")
    deleted = await delete_application(volunteer_id=volunteer_id,application_id=application_id)
    if deleted==False:
        raise HTTPException(status_code=404, detail="Application not found or does not belong to you.")
    else: 
        return {"status": "success", "message": "Application has been canceled."}
    



