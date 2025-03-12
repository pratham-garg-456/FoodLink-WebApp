from app.models.application import Application, EventApplication
from app.models.job import Job
from bson import ObjectId
from fastapi import HTTPException


async def add_event_application_in_db(
    volunteer_id: str, event_id: str, job_id: str
):
    """
    Add an application to db
    :param event_id: the event ID
    :param volunteer_id: the volunteer ID
    :param applied_position: the position that the volunteer want
    """
    try:
        new_application = EventApplication(
            volunteer_id=volunteer_id,
            event_id=event_id,
            job_id=job_id,
        )
        await new_application.insert()
        new_application = new_application.model_dump()
        new_application["id"] = str(new_application["id"])
        return new_application

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while creating a new application in db: {e}",
        )


async def retrieve_list_jobs_in_db():
    """
    Retrieve the list of available jobs only
    """

    job_list = []

    try:
        jobs = await Job.find().to_list()
        for job in jobs:
            # Automate the process of updating the status of job
            await job.check_and_update_status()

            if job.status == "available":
                job = job.model_dump()
                job["id"] = str(job["id"])
                job_list.append(job)

            return job_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching a list of job in db: {e}",
        )
    
async def retrieve_specific_job_in_db(job_id: str):
    """
    Retrieve the specific job based on the job id
    """
    try:
        job = await Job.find_one({"_id": ObjectId(job_id)})
        
        if not job:
            return None
        await job.check_and_update_status()

        if job.status != "available":
            return None
        
        job_dict = job.model_dump()
        job_dict["id"] = str(job.id)
        return job_dict

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching a specific job in db: {e}",
        )


async def retrieve_applied_job_in_db(volunteer_id: str):
    """
    Retrieve the applied job based on the volunteer id
    """
    try:
        applications_list = []
        applications = await Application.find(
            {"volunteer_id": volunteer_id, "status": {"$ne": "canceled"}}
        ).to_list(None)
        for application in applications:
            app_dict = application.model_dump()
            app_dict["id"] = str(application.id) 
            applications_list.append(app_dict)
        return applications_list

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching a list of applied job in db: {e}",
        )

async def delete_application(volunteer_id: str,application_id:str):
    """
    Delete the application based on volunteer id and application id
    """
    try:
        application = await Application.find_one({"_id": ObjectId(application_id), "volunteer_id": volunteer_id})
        if not application:
            raise False
        await application.delete()
        return True

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while deleting job in db: {e}",
        )
    