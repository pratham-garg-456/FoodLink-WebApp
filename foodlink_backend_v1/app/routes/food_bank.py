from fastapi import APIRouter, HTTPException, Depends
from app.services.food_bank_service import (
    add_inventory_in_db,
    update_inventory_in_db,
    get_inventory_in_db,
    create_an_event_in_db,
    get_list_volunteer_in_db,
    delete_inventory_in_db,
    get_list_appointments_in_db,
    update_application_status_in_db,
    update_appointment_status_in_db,
    get_list_of_events,
    update_the_existing_event_in_db,
    delete_event_in_db,
    get_donation_by_id,
    get_all_donations,
    add_a_new_job_in_db,
    add_a_new_event_job_in_db,
)

from app.services.user_service import get_user_by_id
from app.utils.jwt_handler import jwt_required
from app.models.event import Event
from beanie import PydanticObjectId

router = APIRouter()


@router.post("/event")
async def create_an_event(payload: dict = Depends(jwt_required), event_data: dict = {}):
    """
    Allow food bank admin to create an event
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param event_data: A detailed event including name, optional description, date, start_time, end_time, location, list of food services, and event inventory
    :return A created event is stored in the db
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can create an event"
        )

    # Required key in the body
    required_key = [
        "event_name",
        "date",
        "start_time",
        "end_time",
        "location",
        "food_services",
        "event_inventory",
    ]

    # Start validation those keys
    for key in required_key:
        if not event_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # Add a new event in db
    event = await create_an_event_in_db(
        foodbank_id=payload.get("sub"), event_data=event_data
    )

    return {"status": "success", "event": event}


@router.get("/events")
async def get_list_of_event(payload: dict = Depends(jwt_required)):
    """
    Allow foodbank admin to retrieve the list of events
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return a list of events
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can retrieve the list of events",
        )

    # Retrieve events from db
    events = await get_list_of_events(foodbank_id=payload.get("sub"))

    if len(events) == 0:
        raise HTTPException(
            status_code=404,
            detail="There are no events here!",
        )

    return {"status": "success", "events": events}


@router.put("/event/{event_id}")
async def update_an_existing_event(
    event_id: str, payload: dict = Depends(jwt_required), updated_event: dict = {}
):
    """
    Allow foodbank admin to update an existing event
    :param event_id: A unique identifier for event to retrieve the correct event from db
    :param payload: Decoded JWT containing user claims (validated via jwt_required)
    :return an updated event
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can update an event"
        )

    # Required key in the body
    required_key = [
        "event_name",
        "date",
        "start_time",
        "end_time",
        "location",
        "food_services",
        "event_inventory",
    ]

    # Start validation those keys
    for key in required_key:
        if not updated_event.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    updated_event = await update_the_existing_event_in_db(
        event_id=event_id, event_data=updated_event
    )

    return {"status": "success", "event": updated_event}


@router.delete("/event/{event_id}")
async def delete_event(event_id: str, payload: dict = Depends(jwt_required)):
    """
    Allow foodbank admin to delete an event
    :param event_id: A unique identifier for event
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can delete an event",
        )

    await delete_event_in_db(event_id=event_id)

    return {"status": "success", "detail": "The event is removed from the database!"}


@router.post("/inventory")
async def add_inventory(
    payload: dict = Depends(jwt_required), inventory_data: dict = {}
):
    """
    Allow food bank admin to add inventory
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param inventory_data: Inventory details including food_name and quantity
    :return: A created inventory item is stored in the db
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can add new food in the main inventory",
        )

    # Required key in the body
    required_key = ["food_name", "quantity"]

    # Start validation those keys
    for key in required_key:
        if not inventory_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # Store the new food in the db
    new_inventory = await add_inventory_in_db(
        payload.get("sub"),
        inventory_data["food_name"],
        inventory_data["quantity"],
    )

    return {"status": "success", "inventory": new_inventory}


@router.put("/inventory/{inventory_id}")
async def update_inventory(
    inventory_id: str,
    payload: dict = Depends(jwt_required),
    updated_inventory: dict = {},
):
    """
    Allow food bank admin to update inventory
    :param inventory_id: A unique number to identify the correct inventory item
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param updated_inventory: the updated quantity
    :return: An updated inventory item is stored in the db
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can update the inventory"
        )

    # Required key in the body
    required_key = ["quantity"]

    # Start validation those keys
    for key in required_key:
        if not updated_inventory.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    if not inventory_id:
        raise HTTPException(
            status_code=400,
            detail=f"Inventory ID is required to retrieve the correct item",
        )

    updated_food = await update_inventory_in_db(
        inventory_id=inventory_id, quantity=updated_inventory["quantity"]
    )

    return {"status": "success", "inventory": updated_food}


@router.get("/inventory")
async def get_inventory(payload: dict = Depends(jwt_required)):
    """
    Allow food bank admin to retrieve inventory
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return: A list inventory item is stored in the db
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can retrieve the inventory list",
        )

    inventory_list = await get_inventory_in_db(foodbank_id=payload.get("sub"))

    return {"status": "success", "inventory": inventory_list}


@router.delete("/inventory/{inventory_id}")
async def delete_inventory(inventory_id: str, payload: dict = Depends(jwt_required)):
    """
    Allow food bank admin to delete inventory
    :param foodbank_id: The ID of the food bank
    :param inventory_id: The ID of the inventory item to delete
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :return: A success message
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can delete inventory"
        )

    await delete_inventory_in_db(inventory_id=inventory_id)

    return {"status": "success", "message": "Inventory item deleted successfully"}


@router.get("/volunteers/{event_id}")
async def get_list_volunteer_application(
    event_id: str, payload: dict = Depends(jwt_required), status: str | None = None
):
    """
    Allow food bank admin to retrieve the list of volunteer application for specific event
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param event_id: An event ID, the application is stored including the event ID
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can retrieve the list of volunteer application",
        )

    if not status == "approved" and not status == "pending":
        raise HTTPException(
            status_code=400, detail="Status must be either approved or pending!"
        )
    # Retrieve the list of volunteer application
    volunteers = await get_list_volunteer_in_db(event_id=event_id, status=status)

    if len(volunteers) == 0:
        raise HTTPException(
            status_code=404, detail=f"The list of volunteer applications is Empty"
        )

    return {"status": "success", "volunteers": volunteers}


@router.put("/volunteers/{application_id}")
async def update_status_of_application(
    application_id: str,
    payload: dict = Depends(jwt_required),
    application_data: dict = {},
):
    """
    Allow food bank admin to update the status of the specific application
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param application_id: A unique identifier for application in DB
    :return a success message
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can update the status of the specific application!",
        )

    if not application_data["updated_status"]:
        raise HTTPException(
            status_code=400, detail="New status is required and can not be empty!"
        )

    if (
        application_data["updated_status"] != "approved"
        and application_data["updated_status"] != "rejected"
    ):
        raise HTTPException(
            status_code=400, detail="Status must be either approved or rejected!"
        )

    # Update the status of an application in db
    application = await update_application_status_in_db(
        application_id=application_id, updated_status=application_data["updated_status"]
    )

    return {"status": "success", "application": application}


@router.get("/volunteer/{volunteer_id}")
async def get_volunteer_detailed_info(
    volunteer_id: str, payload: dict = Depends(jwt_required)
):
    """
    Allow food bank admin to retrieve the detailed information about specific volunteer
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param status:
    :return a success message and an information of a volunteer
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can retrieve the list of appointments",
        )

    # Get volunteer information from db
    volunteer = await get_user_by_id(id=volunteer_id)

    return {"status": "success", "volunteer": volunteer}


@router.get("/appointments")
async def get_list_of_appointments(
    payload: dict = Depends(jwt_required), status: str | None = None
):
    """
    Allow food bank admin to retrieve the list of appointments
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param status: Pending, confirmed, or rescheduled, or cancelled
    :return a success message and a list of appointments
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can retrieve the list of appointments",
        )

    if (
        not status == "confirmed"
        and not status == "pending"
        and not status == "cancelled"
        and not status == "rescheduled"
    ):
        raise HTTPException(
            status_code=400,
            detail="Status of an appointment must be confirmed or pending or cancelled or rescheduled",
        )

    appointments = await get_list_appointments_in_db(
        foodbank_id=payload.get("sub"), status=status
    )

    if len(appointments) == 0:
        raise HTTPException(
            status_code=404, detail="There are no upcoming appointments!"
        )

    return {"status": "success", "appointments": appointments}


@router.put("/appointment/{appointment_id}")
async def update_status_of_appointment(
    appointment_id: str,
    payload: dict = Depends(jwt_required),
    appointment_data: dict = {},
):
    """
    Allow food bank admin to confirm, reschedule, or cancel the appointment,
    :param appointment_id: An ID for appointment in db
    :param appointment_data: An updated_status for the specific appointments
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can update the status of the appointment",
        )

    if not appointment_data["updated_status"]:
        raise HTTPException(
            status_code=400, detail="New status is required and can not be empty!"
        )

    if (
        appointment_data["updated_status"] != "confirmed"
        and appointment_data["updated_status"] != "rescheduled"
        and appointment_data["updated_status"] != "cancelled"
    ):
        raise HTTPException(
            status_code=400,
            detail="Status must be confirmed or cancelled or rescheduled!",
        )

    # Update the appointment in db
    appointment = await update_appointment_status_in_db(
        appointment_id=appointment_id, updated_status=appointment_data["updated_status"]
    )

    return {"status": "success", "appointment": appointment}


@router.get("/donations")
async def get_donations_for_foodbank(payload: dict = Depends(jwt_required)):
    """
    API Endpoint: Retrieve all donations for foodbank.
    """

    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only food banks can retrieve list of donations"
        )

    donations = await get_all_donations(foodbank_id=payload.get("sub"))

    return {
        "status": "success",
        "message": "Donations retrieved successfully",
        "donations": donations,
    }


@router.get("/donations/{donation_id}")
async def get_donation(donation_id: str, payload: dict = Depends(jwt_required)):
    """
    API Endpoint: Retrieve a specific donation by ID.
    """
    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401,
            detail="Only FoodBank admin can retrieve the donation details",
        )

    donation = await get_donation_by_id(donation_id=donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    return {
        "status": "success",
        "message": "Donation retrieved successfully",
        "donation": donation,
    }


@router.post("/job")
async def post_a_new_job(payload: dict = Depends(jwt_required), job_data: dict = {}):
    """
    Allow foodbank admin to create a new job within foodbank for the volunteer
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param job_data: A dictionary contains job information
    """

    # Validate if the request is made from Foodbank admin
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can post a new job"
        )

    # Validate the job data
    required_key: list = [
        "foodbank_id",
        "title",
        "description",
        "location",
        "category",
        "deadline",
        "status",
    ]

    # Start validation those keys
    for key in required_key:
        if not job_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # Validate if the foodbank ID is a valid registered foodbank
    foodbank = await get_user_by_id(id=job_data["foodbank_id"])

    if not foodbank:
        raise HTTPException(status_code=404, detail=f"Foodbank Not Found!")

    # Validate the given status if it is available or unavailable
    if job_data["status"] != "available" and job_data["status"] != "unavailable":
        raise HTTPException(
            status_code=400,
            detail="Status of a job must be either available or unavailable!",
        )

    # Add a new job in db
    job = await add_a_new_job_in_db(job_data=job_data)

    return {"status": "success", "job": job}


@router.post("/event_job")
async def post_a_new_event_job(
    payload: dict = Depends(jwt_required), job_data: dict = {}
):
    """
    Allow foodbank admin to create a new job for specific event
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param job_data: A dictionary contains job information
    """

    # Validate if the request is made from Foodbank admin
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can post a new job"
        )

    # Validate the job data
    required_key: list = [
        "foodbank_id",
        "event_id",
        "title",
        "description",
        "location",
        "category",
        "deadline",
        "status",
    ]

    # Start validation those keys
    for key in required_key:
        if not job_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    # Validate if the foodbank ID is a valid registered foodbank
    foodbank = await get_user_by_id(id=job_data["foodbank_id"])

    if not foodbank:
        raise HTTPException(status_code=404, detail=f"Foodbank Not Found!")

    # Validate if the event ID is a valid event
    event = await Event.get(PydanticObjectId(job_data["event_id"]))

    if not event:
        raise HTTPException(status_code=404, detail="Event not found!")

    # Validate the given status if it is available or unavailable
    if job_data["status"] != "available" and job_data["status"] != "unavailable":
        raise HTTPException(
            status_code=400,
            detail="Status of a job must be either available or unavailable!",
        )

    # Add a new job in db
    job = await add_a_new_event_job_in_db(job_data=job_data)

    return {"status": "success", "job": job}
