from app.models.event import Event, EventInventory
from app.models.inventory import Inventory
from app.models.application import Application, EventApplication
from app.models.appointment import Appointment
from app.models.donation import Donation
from app.models.job import Job, EventJob
from app.models.volunter_activity import VolunteerActivity
from fastapi import HTTPException
from beanie import PydanticObjectId
from app.utils.time_converter import convert_string_time_to_iso


async def add_inventory_in_db(foodbank_id: str, food_name: str, quantity: str):
    """
    Add an inventory for specific food name and quantity
    :param foodbank_id: Inventory is stored along with its foodbank ID
    :param food_name: The name of the food that they want to store
    :param quantity: The quantity of the food that they want to store in DB
    """
    try:
        new_food = Inventory(
            foodbank_id=foodbank_id, food_name=food_name, quantity=quantity
        )

        await new_food.insert()
        new_food = new_food.model_dump()
        new_food["id"] = str(new_food["id"])
        return new_food
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while creating a new food in db: {e}",
        )


async def update_inventory_in_db(inventory_id: str, quantity: int):
    """
    Update an inventory with the new quantity
    :param inventory_id: Inventory ID to retrieve the correct item
    :param quantity: The new quantity of the food that they want to store in DB
    """
    food = await Inventory.get(PydanticObjectId(inventory_id))

    if not food:
        raise HTTPException(status_code=404, detail="Invalid Inventory ID")

    try:
        food.quantity = quantity
        await food.save()
        food = food.model_dump()
        food["id"] = str(food["id"])
        return food
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while updating a food in db: {e}",
        )


async def get_inventory_in_db(foodbank_id: str):
    """
    Retrieve the list of inventory for a specific foodbank in db
    :param foodbank_id: The ID of the food bank
    """
    inventory_list = []

    try:
        inventory = await Inventory.find(Inventory.foodbank_id == foodbank_id).to_list()
        for inv in inventory:
            inv = inv.model_dump()
            inv["id"] = str(inv["id"])
            inventory_list.append(inv)

        return inventory_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while retrieving a list of inventory in db: {e}",
        )


async def delete_inventory_in_db(inventory_id: str):
    """
    Delete an inventory item from the db
    :param inventory_id: The ID of the inventory item to delete
    """
    food = await Inventory.get(PydanticObjectId(inventory_id))

    if not food:
        raise HTTPException(status_code=404, detail="Invalid Inventory ID")

    try:
        await food.delete()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while deleting a food in db: {e}",
        )


async def create_an_event_in_db(foodbank_id: str, event_data: dict):
    """
    Create an event for upcoming events
    :param event_data: A detailed event including name, optional description, date, start_time, end_time, location, list of food services, and event inventory
    """
    event_inventory_list = []
    for ev_inventory in event_data["event_inventory"]:
        # Retrieve a food item in the main inventory first
        food = await Inventory.find_one(
            Inventory.food_name == ev_inventory["food_name"]
        )

        food = food.model_dump()
        food["id"] = str(food["id"])

        # Define variables for food quantity
        main_quantity = food["quantity"]
        event_quantity = ev_inventory["quantity"]

        # Check if the quantity of the food in the main inventory is 0 (out of stock)
        if main_quantity == 0:
            raise HTTPException(
                status_code=400, detail=f"{food['food_name']} is out of stock!"
            )

        # Check if the given event inventory is greater than the main inventory
        if event_quantity > main_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"The required quantity for {ev_inventory['food_name']} is greater than the quantity in the main inventory!",
            )

        # Update the main inventory before creating an event inventory
        await update_inventory_in_db(
            inventory_id=food["id"], quantity=(main_quantity - event_quantity)
        )

        # Create an event inventory in db
        event_inventory = EventInventory(
            food_name=ev_inventory["food_name"],
            quantity=ev_inventory["quantity"],
        )
        event_inventory_list.append(event_inventory)

    # Convert the given datetime string into ISO format to store in db
    start_time = convert_string_time_to_iso(
        event_data["date"], event_data["start_time"]
    )
    event_date = convert_string_time_to_iso(
        event_data["date"], event_data["start_time"]
    )
    end_time = convert_string_time_to_iso(event_data["date"], event_data["end_time"])

    # Create an Event in DB
    try:
        event = Event(
            foodbank_id=foodbank_id,
            event_name=event_data["event_name"],
            description=event_data["description"],
            date=event_date,
            start_time=start_time,
            end_time=end_time,
            location=event_data["location"],
            food_services=event_data["food_services"],
            event_inventory=event_inventory_list,
        )

        await event.insert()
        event = event.model_dump()
        event["id"] = str(event["id"])

        return event
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while creating an event in db: {e}",
        )


async def get_list_of_events(foodbank_id: str):
    """
    Retrieve a list of events in db
    :param foodbank_id: A unique identifier for Foodbank admin
    """

    event_list = []

    events = await Event.find(Event.foodbank_id == foodbank_id).to_list()

    try:
        for event in events:
            event = event.model_dump()
            event["id"] = str(event["id"])
            event_list.append(event)

        return event_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while fetching the list of events in db: {e}",
        )


async def update_the_existing_event_in_db(event_id: str, event_data: dict):
    """
    Update an exisiting event in db
    :param event_id: An event ID
    :param event_data: An updated event data
    """

    event = await Event.get(PydanticObjectId(event_id))

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Convert the date time string to ISO format
    date = convert_string_time_to_iso(
        date_time=event_data["date"], time_str=event_data["start_time"]
    )
    start_time = convert_string_time_to_iso(
        date_time=event_data["date"], time_str=event_data["start_time"]
    )
    end_time = convert_string_time_to_iso(
        date_time=event_data["date"], time_str=event_data["end_time"]
    )

    event_data["date"] = date
    event_data["start_time"] = start_time
    event_data["end_time"] = end_time

    # Update the exisitng event in db
    try:
        for key, value in event_data.items():
            setattr(event, key, value)

        await event.save()
        event = event.model_dump()
        event["id"] = str(event["id"])

        return event
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while updating the event in db: {e}",
        )


async def delete_event_in_db(event_id: str):
    """
    Delete the existing event based on the requested ID
    :param event_id: An unique identifier of event
    """
    event = await Event.get(PydanticObjectId(event_id))

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    try:
        await event.delete()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"An error occurred while deleting the event"
        )


async def get_list_volunteer_in_db(event_id: str, status: str):
    """
    Retrieve a list of volunteer application for a specific event
    :param event_id: An event ID, the application is stored including the event ID
    """

    application_list = []

    # Validate the event id if it is valid or not
    # try:
    #     event_id = PydanticObjectId(event_id)
    # except Exception as e:
    #     raise HTTPException(status_code=422, detail=f"Invalid event_id: {e}")

    # Retrieve the event stored in db
    # event = await Event.get(event_id)

    # if not event:
    #     raise HTTPException(
    #         status_code=404, detail="Event ID is not valid or not found"
    #     )
    try:
        applications = await EventApplication.find(
            {"status": status, "event_id": event_id}
        ).to_list()

        for application in applications:
            application = application.model_dump()
            application["id"] = str(application["id"])
            application_list.append(application)

        return application_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching the list of application in DB: {e}",
        )


async def update_application_status_in_db(application_id: str, updated_status: str):
    """
    Update the status of a specific application in db
    :param application_id: A unique identifier for volunteer's application
    :param updated_status: A new status of application (approved or rejected)
    """

    application = await Application.get(PydanticObjectId(application_id))

    try:
        application.status = updated_status
        await application.save()
        application = application.model_dump()
        application["id"] = str(application["id"])

        return application
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while updating the application in DB: {e}",
        )


async def get_list_appointments_in_db(foodbank_id: str, status: str):
    """
    Retrieve a list of appointments
    :param foodbank_id: A unique identifier for foodbank is used for filtering out the appointments
    """

    appointment_list = []

    appointments = await Appointment.find(
        Appointment.foodbank_id == foodbank_id, Appointment.status == status
    ).to_list()

    try:
        for appointment in appointments:
            appointment = appointment.model_dump()
            appointment["id"] = str(appointment["id"])
            appointment_list.append(appointment)

        return appointment_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while fetching the list of appointments: {e}",
        )


async def update_appointment_status_in_db(appointment_id: str, updated_status: str):
    """
    Update the status of a specific appointment in db
    :param appointment_id: A unique identifier for volunteer's appointment
    :param updated_status: A new status of appointment (approved or rejected)
    """

    appointment = await Appointment.get(PydanticObjectId(appointment_id))

    try:
        appointment.status = updated_status
        await appointment.save()
        appointment = appointment.model_dump()
        appointment["id"] = str(appointment["id"])

        return appointment
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while updating the appointment in DB: {e}",
        )


async def get_all_donations(foodbank_id: str):

    donation_list = []

    """
    Retrieve all donation records from the database.
    :return: List of donations.
    """
    try:
        donations = await Donation.find(Donation.foodbank_id == foodbank_id).to_list()
        for donation in donations:
            donation = donation.model_dump()
            donation["id"] = str(donation["id"])
            donation_list.append(donation)

        return donation_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while retrieving a list of donations in db: {str(e)}",
        )


async def get_donation_by_id(donation_id: str):
    """
    Retrieve a specific donation record.
    :param donation_id: The ID of the donation.
    :return: Donation details.
    """
    try:
        donation = await Donation.get(PydanticObjectId(donation_id))
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")

        donation_dict = donation.model_dump()
        donation_dict["id"] = str(donation_dict["id"])
        return donation_dict

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching donation: {str(e)}"
        )


async def add_a_new_job_in_db(job_data: dict):
    """
    Create a new job in DB
    :param job_data : A dictionary contains job information
    """

    # Convert the deadline time str to UTC ISO format
    job_data["deadline"] = convert_string_time_to_iso(
        job_data["deadline"].split(" ")[0], job_data["deadline"].split(" ")[1]
    )

    try:
        job = Job(
            foodbank_id=job_data["foodbank_id"],
            title=job_data["title"],
            description=job_data["description"],
            location=job_data["location"],
            category=job_data["category"],
            deadline=job_data["deadline"],
            status=job_data["status"],
        )

        await job.insert()
        job = job.model_dump()
        job["id"] = str(job["id"])
        return job
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating a new job in db: {e}",
        )


async def add_a_new_event_job_in_db(job_data: dict):
    """
    Create a new event job in DB
    :param job_data : A dictionary contains job information
    """

    # Convert the deadline time str to UTC ISO format
    job_data["deadline"] = convert_string_time_to_iso(
        job_data["deadline"].split(" ")[0], job_data["deadline"].split(" ")[1]
    )

    try:
        event_job = EventJob(
            event_id=job_data["event_id"],
            foodbank_id=job_data["foodbank_id"],
            title=job_data["title"],
            description=job_data["description"],
            location=job_data["location"],
            category=job_data["category"],
            deadline=job_data["deadline"],
            status=job_data["status"],
        )

        await event_job.insert()
        event_job = event_job.model_dump()
        event_job["id"] = str(event_job["id"])
        return event_job
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating a new event job in db: {e}",
        )


async def list_foodbank_job_in_db():
    """
    Retrieve the list of jobs within the foodbank
    """

    job_list = []

    try:
        jobs = await Job.find().to_list()

        for job in jobs:
            # Automate process updating the job status post
            await job.check_and_update_status()
            job = job.model_dump()
            job["id"] = str(job["id"])
            job_list.append(job)
        return job_list
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching the list of job in db: {e}",
        )


async def get_list_foodbank_application_in_db(foodbank_id: str, status: str):
    """
    Retrieve a list of volunteer application for foodbank position
    :param status: used to filter the list
    :param foodbank_id: A unique identifier for foodbank
    """

    application_list = []
    try:
        applications = await Application.find(
            Application.foodbank_id == foodbank_id, Application.status == status
        ).to_list()

        for application in applications:
            application = application.model_dump()
            application["id"] = str(application["id"])
            application_list.append(application)

        return application_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching the list of application in DB: {e}",
        )


async def get_application_detail(application_id: str):
    """
    Retrieve application details
    :param application_id: An id is created from mongodb
    """

    try:
        application = await Application.get(PydanticObjectId(application_id))
        application = application.model_dump()
        application["id"] = str(application["id"])

        return application
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching the detailed of application in DB: {e}",
        )


async def get_job_detail_in_db(job_id: str):
    """
    Retrieve the job details
    :param job_id: An id is created from mongodb
    """

    try:
        job = await Job.get(PydanticObjectId(job_id))
        job = job.model_dump()
        job["id"] = str(job["id"])

        return job
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while fetching the detailed of a job in DB: {e}",
        )


async def add_volunteer_activity_in_db(
    application_id: str,
    date_worked: str,
    foodbank_name: str,
    category: str,

    working_hours: dict,
):
    """
    Add volunteer activity in db
    :param date_worked: the date that volunteer work
    :param foodbank_name: The foodbank name
    :param category: category of the job
    :working_hours: start time and end time
    """

    # Convert str time to datetime
    start = convert_string_time_to_iso(
        date_time=date_worked, time_str=working_hours["start"]
    )

    end = convert_string_time_to_iso(
        date_time=date_worked, time_str=working_hours["end"]
    )
    
    date_worked = convert_string_time_to_iso(
        date_time=date_worked, time_str=working_hours["start"]
    )

    working_hours["start"] = start
    working_hours["end"] = end
    try:
        activity = VolunteerActivity(
            application_id=application_id,
            date_worked=date_worked,
            foodbank_name=foodbank_name,
            category=category,
            working_hours=working_hours,
        )

        await activity.save()
        activity = activity.model_dump()
        activity["id"] = str(activity["id"])
        return activity
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while creating the volunteer activity in DB: {e}",
        )
