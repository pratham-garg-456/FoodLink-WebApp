from app.models.application import Application, EventApplication
from app.models.appointment import Appointment
from app.models.donation import Donation
from app.models.job import Job, EventJob
from app.models.volunter_activity import VolunteerActivity
from fastapi import HTTPException
from beanie import PydanticObjectId
from app.utils.time_converter import convert_string_time_to_iso
from datetime import datetime, timezone
from app.models.food_item import FoodItem
from app.models.inventory import MainInventory, MainInventoryFoodItem
from typing import List
from app.models.appointment import Appointment, AppointmentFoodItem
from app.models.event import Event, EventInventory, EventInventoryFoodItem
from typing import List, Optional
from app.models.user import User

from datetime import datetime, timezone
from fastapi import HTTPException


async def get_appointments_by_foodbank(foodbank_id: str):
    """
    Fetch all appointments for a specific food bank.

    :param foodbank_id: The ID of the food bank.
    :return: A list of appointment objects.
    """
    try:
        appointments = await Appointment.find(
            Appointment.foodbank_id == foodbank_id
        ).to_list()

        # Convert ObjectId to string for JSON response
        for appointment in appointments:
            appointment = appointment.model_dump()
            appointment["id"] = str(appointment["id"])

        return appointments

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching appointments: {str(e)}",
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
    Update appointment status. Restore inventory only if the appointment is cancelled.
    """

    appointment = await Appointment.get(PydanticObjectId(appointment_id))

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    if appointment.status == "cancelled":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled.")

    if updated_status == "picked":
        # Simply update the status to 'picked' (No inventory change)
        appointment.status = "picked"
        appointment.last_updated = datetime.now(timezone.utc)
        await appointment.save()
        return appointment.model_dump()

    # If appointment is cancelled, restore reserved inventory
    if updated_status == "cancelled":
        existing_inventory = await MainInventory.find_one(
            MainInventory.foodbank_id == appointment.foodbank_id
        )

        if not existing_inventory:
            raise HTTPException(
                status_code=404, detail="Inventory not found for this food bank."
            )

        for item in appointment.product:
            food_name = item.food_name
            quantity = item.quantity

            food_found = False
            for stock_item in existing_inventory.stock:
                if stock_item.food_name == food_name:
                    stock_item.quantity += quantity  # Restore stock
                    food_found = True
                    break

            if not food_found:
                existing_inventory.stock.append(
                    AppointmentFoodItem(food_name=food_name, quantity=quantity)
                )

        # Save updated inventory
        existing_inventory.last_updated = datetime.now(timezone.utc)
        await existing_inventory.save()

    # Update appointment status
    appointment.status = updated_status
    appointment.last_updated = datetime.now(timezone.utc)
    await appointment.save()
    appointment = appointment.model_dump()
    appointment["id"] = str(appointment["id"])

    return appointment


async def reschedule_appointment_in_db(appointment_id: str, reschedule_data: dict):
    """
    Reschedules an appointment to a new date and time.

    :param appointment_id: The ID of the appointment to reschedule.
    :param reschedule_data: A dictionary containing the new start and end time.
    :return: The updated appointment details.
    """
    try:
        # Fetch the appointment from the database
        appointment = await Appointment.get(PydanticObjectId(appointment_id))

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found.")

        # Extract new start and end times
        new_start_time = reschedule_data.get("start_time")
        new_end_time = reschedule_data.get("end_time")

        if not new_start_time or not new_end_time:
            raise HTTPException(
                status_code=400, detail="New start and end time must be provided."
            )

        # Convert to datetime objects
        new_start_time = datetime.fromisoformat(new_start_time)
        new_end_time = datetime.fromisoformat(new_end_time)

        if new_start_time >= new_end_time:
            raise HTTPException(
                status_code=400, detail="End time must be after start time."
            )

        # ✅ Optional: Check if the new time slot is available
        is_available = await check_time_slot_availability(
            appointment.foodbank_id, new_start_time, new_end_time
        )
        if not is_available:
            raise HTTPException(
                status_code=400, detail="New time slot is not available."
            )

        # Update appointment details
        appointment.start_time = new_start_time
        appointment.end_time = new_end_time
        appointment.status = "rescheduled"
        appointment.last_updated = datetime.now(timezone.utc)

        # Save the updated appointment
        await appointment.save()

        # Convert the updated appointment to a dictionary for response
        updated_appointment = appointment.model_dump()
        updated_appointment["id"] = str(updated_appointment["id"])

        return updated_appointment

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while rescheduling: {str(e)}"
        )


async def check_time_slot_availability(
    foodbank_id: str, start_time: datetime, end_time: datetime
) -> bool:
    """
    Checks if the new appointment time slot is available.

    :param foodbank_id: The ID of the food bank.
    :param start_time: The new proposed start time.
    :param end_time: The new proposed end time.
    :return: True if the time slot is available, False otherwise.
    """
    overlapping_appointments = await Appointment.find(
        {
            "foodbank_id": foodbank_id,
            "start_time": {
                "$lt": end_time
            },  # Appointments that start before the new end time
            "end_time": {
                "$gt": start_time
            },  # Appointments that end after the new start time
        }
    ).to_list()

    return (
        len(overlapping_appointments) == 0
    )  # If no overlapping appointments, the slot is available


async def add_a_food_item_in_db(food_data: dict):
    """
    Add a food item to the database.
    :param food_data: A dictionary containing food item data, including the expiration date, food name, category, etc.
    """
    # Check if a food item with the same name already exists in the database
    existing_food_item = await FoodItem.find_one(
        FoodItem.food_name == food_data["food_name"]
    )
    if existing_food_item:
        raise HTTPException(
            status_code=400,
            detail="A food item with the same name already exists in the database.",
        )

    # Parse expiration_date if it exists, otherwise set it to None
    expiration_date = None
    if food_data.get("expiration_date"):
        expiration_date = convert_string_time_to_iso(
            food_data["expiration_date"].split(" ")[0],
            food_data["expiration_date"].split(" ")[1],
        )

    try:
        # Create a new FoodItem instance
        new_food_item = FoodItem(
            food_name=food_data["food_name"],
            category=food_data["category"],
            unit=food_data["unit"],
            description=food_data.get("description"),
            expiration_date=expiration_date,
            added_on=datetime.now(timezone.utc),
        )

        # Insert the new food item into the database
        await new_food_item.insert()
        new_food_item = new_food_item.model_dump()
        new_food_item["id"] = str(new_food_item.get("id"))

        return new_food_item

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while adding the food item to the database: {e}",
        )


async def get_food_items_in_db():
    """
    Retrieve a list of food items from the database for a specific food bank.
    :param foodbank_id: A unique identifier for the food bank.
    """
    food_items_list = []

    try:
        # Retrieve the food items related to the specific food bank
        food_items = await FoodItem.find().to_list()

        for food_item in food_items:
            food_item_dict = food_item.model_dump()
            food_item_dict["id"] = str(
                food_item_dict["id"]
            )  # Convert MongoDB ObjectId to string
            food_items_list.append(food_item_dict)

        return food_items_list

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while fetching the list of food items in db: {e}",
        )


async def add_inventory_in_db(foodbank_id: str, inventory_data: List[dict]):
    """
    Add or update inventory for specific food names and quantities.
    :param foodbank_id: The ID of the foodbank where inventory will be stored.
    :param inventory_data: List of dictionaries containing food items with their names and quantities.
    :return: List of added or updated inventory items.
    """

    added_inventory = []

    try:
        # Iterate over the inventory data (list of food items and their quantities)
        for food in inventory_data:
            food_name = food["food_name"]
            quantity = food["quantity"]

            # Check if the food item already exists in the FoodItem collection.
            existing_food_item = await FoodItem.find_one(
                FoodItem.food_name == food_name
            )

            # If the food item doesn't exist, raise an exception
            if not existing_food_item:
                raise HTTPException(
                    status_code=404,
                    detail=f"The food item '{food_name}' does not exist in the database. Please add the food item first.",
                )

            # Ensure 'unit' exists
            unit = existing_food_item.unit  # Set default to 'unknown' if not provided
            expiration_date = existing_food_item.expiration_date

            # If the food item exists, check if the foodbank's inventory exists.
            existing_inventory = await MainInventory.find_one(
                MainInventory.foodbank_id == foodbank_id
            )

            if existing_inventory:
                # If the food item already exists in the stock, update its quantity
                food_found = False
                for item in existing_inventory.stock:
                    if item.food_name == food_name:
                        item.quantity += quantity  # Update the quantity
                        food_found = True
                        break

                if not food_found:
                    # If the food item is not found in stock, append the new item to the stock array
                    new_food_item = MainInventoryFoodItem(
                        food_name=food_name, quantity=quantity
                    )
                    existing_inventory.stock.append(new_food_item)

                # Update the `last_updated` timestamp
                existing_inventory.last_updated = datetime.now(timezone.utc)

                # Save the updated MainInventory record
                await existing_inventory.save()

                # Return the updated inventory
                existing_inventory = existing_inventory.model_dump()
                existing_inventory["id"] = str(existing_inventory["id"])
                added_inventory.append(
                    {
                        "food_name": food_name,
                        "quantity": quantity,
                        "foodbank_id": foodbank_id,
                        "expiration_date": expiration_date,
                        "unit": unit,
                        "updated_on": existing_inventory["last_updated"].isoformat(),
                    }
                )

            else:
                # If no existing inventory for the foodbank, create a new MainInventory
                new_inventory_item = MainInventory(
                    foodbank_id=foodbank_id,
                    stock=[
                        MainInventoryFoodItem(food_name=food_name, quantity=quantity)
                    ],
                    last_updated=datetime.now(timezone.utc),
                )
                # Insert the new inventory into the database
                await new_inventory_item.insert()

                # Return the new inventory item with its id
                new_inventory_item = new_inventory_item.model_dump()
                new_inventory_item["id"] = str(new_inventory_item["id"])
                added_inventory.append(
                    {
                        "food_name": food_name,
                        "quantity": quantity,
                        "foodbank_id": foodbank_id,
                        "expiration_date": expiration_date,
                        "unit": unit,
                        "added_on": new_inventory_item["last_updated"],
                    }
                )

        return added_inventory  # Return the list of added or updated inventory items

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while adding or updating inventory: {str(e)}",
        )


async def remove_inventory_in_db(foodbank_id: str, inventory_data: List[dict]):
    """
    Remove the inventory for specific food names and quantities in the given foodbank.
    :param foodbank_id: The ID of the foodbank where inventory will be updated.
    :param inventory_data: List of dictionaries containing food items with their names and quantities to be removed.
    :return: List of removed inventory items.
    """

    removed_inventory = []  # List to store removed inventory items

    try:
        # Iterate over the inventory data (list of food items and their quantities)
        for food in inventory_data:
            food_name = food["food_name"]
            quantity = food["quantity"]

            # Check if the food item exists in the FoodItem collection.
            existing_food_item = await FoodItem.find_one(
                FoodItem.food_name == food_name
            )

            # If the food item doesn't exist, raise an exception
            if not existing_food_item:
                raise HTTPException(
                    status_code=404,
                    detail=f"The food item '{food_name}' does not exist in the database. Please add the food item first.",
                )

            # Ensure 'unit' and 'expiration_date' are available
            unit = existing_food_item.unit  # Default to 'unknown' if not provided
            expiration_date = existing_food_item.expiration_date

            # If the food item exists, check if the foodbank's inventory exists.
            existing_inventory = await MainInventory.find_one(
                MainInventory.foodbank_id == foodbank_id
            )

            if existing_inventory:
                food_found = False
                for item in existing_inventory.stock:
                    if item.food_name == food_name:
                        if item.quantity >= quantity:
                            # If quantity to remove is less than or equal to what's available, subtract it
                            item.quantity -= quantity
                            if item.quantity == 0:
                                # Remove the food item completely if quantity reaches 0
                                existing_inventory.stock.remove(item)
                            food_found = True
                        else:
                            raise HTTPException(
                                status_code=400,
                                detail=f"Not enough quantity of '{food_name}' in inventory to remove.",
                            )
                        break

                if not food_found:
                    # If the food item doesn't exist in stock, return an error
                    raise HTTPException(
                        status_code=404,
                        detail=f"The food item '{food_name}' does not exist in the inventory for the given foodbank.",
                    )

                # Update the `last_updated` timestamp
                existing_inventory.last_updated = datetime.now(timezone.utc)

                # Save the updated MainInventory record
                await existing_inventory.save()

                # Return the removed inventory information
                existing_inventory = existing_inventory.model_dump()
                existing_inventory["id"] = str(existing_inventory["id"])
                removed_inventory.append(
                    {
                        "food_name": food_name,
                        "quantity_removed": quantity,
                        "foodbank_id": foodbank_id,
                        "expiration_date": expiration_date,
                        "unit": unit,
                        "updated_on": existing_inventory["last_updated"].isoformat(),
                    }
                )
            else:
                # If no existing inventory for the foodbank, return an error
                raise HTTPException(
                    status_code=404,
                    detail=f"No inventory found for foodbank '{foodbank_id}'.",
                )

        return removed_inventory  # Return the list of removed inventory items

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while removing inventory: {str(e)}",
        )


async def get_inventory_in_db(foodbank_id: str):
    """
    Retrieve the list of MainInventory for a specific foodbank in db.
    :param foodbank_id: The ID of the food bank
    :return: List of inventories for the given foodbank.
    """
    inventory_list = []

    try:
        # Find all MainInventory entries for the given foodbank_id
        main_inventory = await MainInventory.find(
            MainInventory.foodbank_id == foodbank_id
        ).to_list()

        # If no inventory found, return a clear message
        if not main_inventory:
            raise HTTPException(
                status_code=404,
                detail=f"No inventory found for foodbank '{foodbank_id}'.",
            )

        # Process each inventory item
        for inv in main_inventory:
            # Convert the inventory item to a dictionary
            inv_data = inv.model_dump()
            inv_data["id"] = str(inv_data["id"])  # Ensure ID is a string
            inventory_list.append(inv_data)

        return inventory_list  # Return the list of inventories

    except Exception as e:
        # Handle any errors that occur while retrieving the inventory
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while retrieving the inventory for foodbank '{foodbank_id}': {str(e)}",
        )


async def create_an_event_in_db(foodbank_id: str, event_data: dict):
    """
    Create an event for upcoming events
    :param event_data: A detailed event including name, optional description, date, start_time, end_time, location, list of food services, and event MainInventory
    """
    try:
        # Convert datetime fields
        date = convert_string_time_to_iso(event_data["date"], event_data["start_time"])

        start = convert_string_time_to_iso(event_data["date"], event_data["start_time"])

        end = convert_string_time_to_iso(event_data["date"], event_data["end_time"])
        
        # Create the event
        new_event = Event(
            foodbank_id=foodbank_id,
            event_name=event_data["event_name"],
            description=event_data["description"],
            date=date,
            start_time=start,
            end_time=end,
            location=event_data["location"],
            status=event_data["status"],
        )
        await new_event.insert()
        new_event = new_event.model_dump()
        new_event["id"] = str(new_event["id"])

        return new_event

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(ve)}")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating an event in db: {str(e)}",
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
    Update an existing event in db
    :param event_id: An event ID
    :param event_data: An updated event data
    """

    event = await Event.get(PydanticObjectId(event_id))

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Convert datetime fields
    date = convert_string_time_to_iso(event_data["date"], event_data["start_time"])

    start = convert_string_time_to_iso(event_data["date"], event_data["start_time"])

    end = convert_string_time_to_iso(event_data["date"], event_data["end_time"])

    event_data["date"] = date
    event_data["start_time"] = start
    event_data["end_time"] = end

    # Update the exisitng event in db
    try:
        for key, value in event_data.items():
            setattr(event, key, value)
        # Update the modification date
        event.last_updated = datetime.now(timezone.utc)
        await event.save()
        event = event.model_dump()
        event["id"] = str(event["id"])
        return event
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while updating the event in db: {e}",
        )


async def get_event_inventory_from_db(event_id: str):
    """
    Retrieve the inventory for a specific event.
    :param event_id: ID of the event.
    :return: List of items in the EventInventory.
    """
    try:
        # Fetch event inventory
        event_inventory = await EventInventory.find_one(
            EventInventory.event_id == event_id
        )

        if not event_inventory:
            raise HTTPException(status_code=404, detail="Event inventory not found.")

        event_inventory = event_inventory.model_dump()
        event_inventory["id"] = str(event_inventory["id"])
        return {"status": "success", "event_inventory": event_inventory}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving event inventory: {str(e)}"
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


async def add_event_inventory_to_db(
    event_id: str, foodbank_id: str, stock_data: List[dict]
):
    """
    Add items from MainInventory to EventInventory for a specific event.
    :param event_id: ID of the event where inventory is added.
    :param foodbank_id: ID of the food bank.
    :param stock_data: List of food items to add.
    :return: Updated EventInventory
    """
    try:
        # Fetch the main inventory for the food bank
        main_inventory = await MainInventory.find_one(
            MainInventory.foodbank_id == foodbank_id
        )
        if not main_inventory or not main_inventory.stock:
            raise HTTPException(
                status_code=404,
                detail=f"Main inventory not found or empty for food bank ID: {foodbank_id}.",
            )
        # Check if the event exists
        event = await Event.get(PydanticObjectId(event_id))
        if not event:
            raise HTTPException(
                status_code=404, detail=f"Event not found for ID: {event_id}."
            )

        # check if event Inventory exist for the event
        event_inventory = await EventInventory.find_one(
            EventInventory.event_id == event_id
        )
        if not event_inventory:
            event_inventory = EventInventory(stock=[], event_id=event_id)
            await event_inventory.insert()

        # Process each item
        for item in stock_data:
            food_name = item["food_name"]
            quantity = item["quantity"]

            # Check if food item exists in MainInventory
            food_item_found = False
            for mi_item in main_inventory.stock:
                if mi_item.food_name == food_name:
                    print(f"Found food item: {food_name}")
                    if mi_item.quantity < quantity:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Not enough quantity of '{food_name}' in MainInventory.",
                        )
                    # Deduct quantity from MainInventory
                    mi_item.quantity -= quantity
                    if mi_item.quantity == 0:
                        main_inventory.stock.remove(mi_item)
                    food_item_found = True
                    break

            if not food_item_found:
                raise HTTPException(
                    status_code=404,
                    detail=f"The food item '{food_name}' does not exist in MainInventory.",
                )

            # Check if item already exists in EventInventory
            event_food_found = False
            for ei_item in event_inventory.stock:
                if ei_item.food_name == food_name:
                    ei_item.quantity += quantity
                    event_food_found = True
                    break

            if not event_food_found:
                # Add a new item if it does not exist
                event_inventory.stock.append(
                    EventInventoryFoodItem(food_name=food_name, quantity=quantity)
                )

        # Update timestamps
        main_inventory.last_updated = datetime.now(timezone.utc)
        event_inventory.last_updated = datetime.now(timezone.utc)

        # Save changes
        await main_inventory.save()
        await event_inventory.save()
        main_inventory = main_inventory.model_dump()
        event_inventory = event_inventory.model_dump()
        main_inventory["id"] = str(main_inventory["id"])
        event_inventory["id"] = str(event_inventory["id"])

        return event_inventory

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while adding inventory to event: {str(e)}",
        )


async def update_event_inventory_in_db(event_id: str, used_items: List[dict]):
    """
    Update EventInventory when items are used.
    :param event_id: ID of the event.
    :param used_items: List of items with updated quantities.
    :return: Updated EventInventory
    """
    try:
        # Fetch event inventory
        event_inventory = await EventInventory.find_one(
            EventInventory.event_id == event_id
        )
        if not event_inventory:
            raise HTTPException(status_code=404, detail="Event inventory not found.")

        # Update quantities
        for used_item in used_items:
            event_item = next(
                (
                    ei
                    for ei in event_inventory.stock
                    if ei.food_name == used_item["food_name"]
                ),
                None,
            )
            if not event_item or event_item.quantity < used_item["quantity"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough '{used_item.food_name}' in EventInventory.",
                )

            event_item.quantity -= used_item["quantity"]
            if event_item.quantity == 0:
                event_inventory.stock.remove(event_item)

        event_inventory.last_updated = datetime.now(timezone.utc)
        await event_inventory.save()
        event_inventory = event_inventory.model_dump()
        event_inventory["id"] = str(event_inventory["id"])

        return event_inventory

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating event inventory in db: {str(e)}"
        )


async def transfer_event_inventory_to_main_inventory_in_db(
    foodbank_id: str, event_id: str
):
    """
    Transfer remaining items from EventInventory back to MainInventory.
    :param event_id: ID of the event.
    :param foodbank_id: ID of the food bank.
    :return: Updated MainInventory
    """
    try:
        # Fetch event inventory
        event_inventory = await EventInventory.find_one(
            EventInventory.event_id == event_id
        )
        if not event_inventory or not event_inventory.stock:
            raise HTTPException(
                status_code=404, detail="No inventory to transfer back."
            )

        # Fetch main inventory for the food bank
        main_inventory = await MainInventory.find_one(
            MainInventory.foodbank_id == foodbank_id
        )
        if not main_inventory:
            main_inventory = MainInventory(foodbank_id=foodbank_id, stock=[])

        # Transfer items back
        for item in event_inventory.stock:
            main_item = next(
                (mi for mi in main_inventory.stock if mi.food_name == item.food_name),
                None,
            )
            if main_item:
                main_item.quantity += item.quantity
            else:
                main_inventory.stock.append(item)

        # Clear event inventory
        event_inventory.stock = []
        event_inventory.last_updated = datetime.now(timezone.utc)
        main_inventory.last_updated = datetime.now(timezone.utc)

        await event_inventory.save()
        await main_inventory.save()
        main_inventory = main_inventory.model_dump()
        event_inventory = event_inventory.model_dump()
        main_inventory["id"] = str(main_inventory["id"])
        event_inventory["id"] = str(event_inventory["id"])

        return main_inventory

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error transferring inventory back: {str(e)}"
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
    if application == None:
        application = await EventApplication.get(PydanticObjectId(application_id))
        if application == None:
            raise HTTPException(
                status_code=404,
                detail="There is no application corresponding with the given ID",
            )
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


async def search_donations(
    foodbank_id: str,
    donor_id: Optional[str] = None,
    donation_id: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    status: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
) -> List[Donation]:
    query = {"foodbank_id": foodbank_id}

    if donor_id:
        query["donor_id"] = donor_id
    if donation_id:
        try:
            donation_id = PydanticObjectId(donation_id)
            query["_id"] = donation_id
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid donation_id: {str(e)}"
            )
    if start_time:
        query["created_at"] = {"$gte": start_time}
    if end_time:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_time
        else:
            query["created_at"] = {"$lte": end_time}
    if status:
        query["status"] = status
    if min_amount is not None:
        query["amount"] = {"$gte": min_amount}
    if max_amount is not None:
        if "amount" in query:
            query["amount"]["$lte"] = max_amount
        else:
            query["amount"] = {"$lte": max_amount}

    try:
        donations = await Donation.find(query).to_list()
        donation_list = [donation.model_dump() for donation in donations]
        for donation in donation_list:
            donation["id"] = str(donation["id"])
        return donation_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while searching donations: {str(e)}",
        )


async def add_a_new_job_in_db(foodbank_id: str, job_data: dict):
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
            foodbank_id=foodbank_id,
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


async def add_a_new_event_job_in_db(foodbank_id: str, job_data: dict):
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
            foodbank_id=foodbank_id,
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

            # Retrieve volunteer information based on the volunteer ID
            volunteer = await User.get(
                PydanticObjectId(str(application["volunteer_id"]))
            )
            application["volunteer_name"] = volunteer.name

            # Retrieve job informaation
            job = await Job.get(PydanticObjectId(application["job_id"]))
            application["job_name"] = job.title
            application["job_category"] = job.category

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


async def list_event_job_in_db():
    """
    Retrieve the list of jobs within the specific events
    """

    job_list = []

    try:
        jobs = await Job.find(Job.category == "Event").to_list()

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


async def update_existing_job_info_in_db(job_id: str, job_data: dict):
    """
    Update the existing job information
    :param job_id: Used to identify the job that we are looking for
    :param job_data: Job new information
    """

    job = await Job.get(PydanticObjectId(job_id))

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Convert deadline string time to ISO format
    deadline = convert_string_time_to_iso(
        job_data["deadline"].split(" ")[0], job_data["deadline"].split(" ")[1]
    )

    job_data["deadline"] = datetime.fromisoformat(deadline)

    try:
        for key, value in job_data.items():
            setattr(job, key, value)

        await job.save()
        job = job.model_dump()
        job["id"] = str(job["id"])
        return job
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while updating the job in db: {e}",
        )
