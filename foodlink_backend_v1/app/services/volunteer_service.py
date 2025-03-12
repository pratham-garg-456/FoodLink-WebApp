from app.models.application import Application, EventApplication
from app.models.job import Job
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
