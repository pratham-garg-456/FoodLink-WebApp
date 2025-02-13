from app.models.application import Application
from fastapi import HTTPException


async def add_application_in_db(
    volunteer_id: str, event_id: str, applied_position: str, category: str
):
    """
    Add an application to db
    :param event_id: the event ID
    :param volunteer_id: the volunteer ID
    :param applied_position: the position that the volunteer want
    """
    try:
        new_application = Application(
            volunteer_id=volunteer_id,
            event_id=event_id,
            applied_position=applied_position,
            category=category,
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
