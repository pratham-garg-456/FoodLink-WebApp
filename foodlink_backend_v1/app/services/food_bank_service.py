from app.models.event import Event, EventInventory
from app.models.application import Application
from app.models.appointment import Appointment
from app.models.donation import Donation
from fastapi import HTTPException
from beanie import PydanticObjectId
from app.utils.time_converter import convert_string_time_to_iso
from datetime import datetime, timezone
from app.models.food_item import FoodItem
from app.models.inventory import MainInventory, MainInventoryFoodItem
from typing import List


from datetime import datetime, timezone
from fastapi import HTTPException
from typing import Dict

async def add_a_food_item_in_db(food_data: dict):
    """
    Add a food item to the database.
    :param food_data: A dictionary containing food item data, including the expiration date, food name, category, etc.
    """
    # Check if a food item with the same name already exists in the database
    existing_food_item = await FoodItem.find_one(FoodItem.food_name == food_data["food_name"])
    if existing_food_item:
        raise HTTPException(
            status_code=400,
            detail="A food item with the same name already exists in the database."
        )

    # Parse expiration_date if it exists, otherwise set it to None
    expiration_date = None
    if food_data.get("expiration_date"):
        try:
            expiration_date = datetime.strptime(food_data["expiration_date"], "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid expiration date format. Please use 'YYYY-MM-DD'."
            )

    try:
        # Create a new FoodItem instance
        new_food_item = FoodItem(
            food_name=food_data["food_name"], 
            category=food_data["category"],
            unit=food_data["unit"],
            description=food_data.get("description"),
            expiration_date=expiration_date,
            added_on=datetime.now(timezone.utc)
        )

        # Insert the new food item into the database
        await new_food_item.insert()

        # Convert the inserted model to a dictionary and modify the id
        new_food_item = new_food_item.dict()  # Use `dict()` to get the model's dictionary representation
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
            food_item_dict["id"] = str(food_item_dict["id"])  # Convert MongoDB ObjectId to string
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
            existing_food_item = await FoodItem.find_one(FoodItem.food_name == food_name)

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
                    new_food_item = MainInventoryFoodItem(food_name=food_name, quantity=quantity)
                    existing_inventory.stock.append(new_food_item)

                # Update the `last_updated` timestamp
                existing_inventory.last_updated = datetime.now(timezone.utc)

                # Save the updated MainInventory record
                await existing_inventory.save()

                # Return the updated inventory
                existing_inventory = existing_inventory.model_dump()
                existing_inventory["id"] = str(existing_inventory["id"])
                added_inventory.append({
                    "food_name": food_name,
                    "quantity": quantity,
                    "foodbank_id": foodbank_id,
                    "expiration_date": expiration_date,
                    "unit": unit,
                    "updated_on": existing_inventory["last_updated"].isoformat(),
                })

            else:
                # If no existing inventory for the foodbank, create a new MainInventory
                new_inventory_item = MainInventory(
                    foodbank_id=foodbank_id,
                    stock=[MainInventoryFoodItem(food_name=food_name, quantity=quantity)],
                    last_updated=datetime.now(timezone.utc)
                )
                # Insert the new inventory into the database
                await new_inventory_item.insert()

                # Return the new inventory item with its id
                new_inventory_item = new_inventory_item.model_dump()
                new_inventory_item["id"] = str(new_inventory_item["id"])
                added_inventory.append({
                    "food_name": food_name,
                    "quantity": quantity,
                    "foodbank_id": foodbank_id,
                    "expiration_date": expiration_date,
                    "unit": unit,
                    "added_on": new_inventory_item["last_updated"].isoformat(),
                })

        return added_inventory  # Return the list of added or updated inventory items
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while adding or updating inventory: {str(e)}"
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
            existing_food_item = await FoodItem.find_one(FoodItem.food_name == food_name)

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
                removed_inventory.append({
                    "food_name": food_name,
                    "quantity_removed": quantity,
                    "foodbank_id": foodbank_id,
                    "expiration_date": expiration_date,
                    "unit": unit,
                    "updated_on": existing_inventory["last_updated"].isoformat(),
                })
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
            detail=f"An error occurred while removing inventory: {str(e)}"
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
        main_inventory = await MainInventory.find(MainInventory.foodbank_id == foodbank_id).to_list()

        # If no inventory found, return a clear message
        if not main_inventory:
            raise HTTPException(
                status_code=404,
                detail=f"No inventory found for foodbank '{foodbank_id}'."
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
            detail=f"An error occurred while retrieving the inventory for foodbank '{foodbank_id}': {str(e)}"
        )

async def create_an_event_in_db(foodbank_id: str, event_data: dict):
    """
    Create an event for upcoming events
    :param event_data: A detailed event including name, optional description, date, start_time, end_time, location, list of food services, and event MainInventory
    """
    event_inventory_list = []
    for ev_inventory in event_data["event_inventory"]:
        # Retrieve a food item in the main MainInventory first
        food = await MainInventory.find_one(
            MainInventory.food_name == ev_inventory["food_name"]
        )

        food = food.model_dump()
        food["id"] = str(food["id"])

        # Define variables for food quantity
        main_quantity = food["quantity"]
        event_quantity = ev_inventory["quantity"]

        # Check if the quantity of the food in the main MainInventory is 0 (out of stock)
        if main_quantity == 0:
            raise HTTPException(
                status_code=400, detail=f"{food['food_name']} is out of stock!"
            )

        # Check if the given event MainInventory is greater than the main MainInventory
        if event_quantity > main_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"The required quantity for {ev_inventory['food_name']} is greater than the quantity in the main MainInventory!",
            )

        # Update the main MainInventory before creating an event MainInventory
        await update_inventory_in_db(
            inventory_id=food["id"], quantity=(main_quantity - event_quantity)
        )

        # Create an event MainInventory in db
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

    event = await Event.get(PydanticObjectId(event_id))

    if not event:
        raise HTTPException(
            status_code=404, detail="Event ID is not valid or not found"
        )
    try:
        applications = await Application.find(
            Application.event_id == event_id, Application.status == status
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
        appointment.modified_at = datetime.now(timezone.utc)
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
        raise HTTPException(status_code=400, detail=f"An error occurred while retrieving a list of donations in db: {str(e)}")


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
        raise HTTPException(status_code=500, detail=f"Error fetching donation: {str(e)}")
