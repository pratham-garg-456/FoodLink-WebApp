from app.models.application import Application
from datetime import datetime, timezone

from fastapi import HTTPException
from beanie import PydanticObjectId


async def add_application_in_db(event_id:str,volunteer_id:str,service_id:str):
    """
    Add an application to db
    :param event_id: the event ID
    :param volunteer_id: the volunteer ID
    :param service_id: the service id in that event
    """
    try:
        new_application = Application(
            volunteer_id = volunteer_id,event_id = event_id,service_id=service_id,
            status="pending",
            applied_at=datetime.now(timezone.utc)
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
