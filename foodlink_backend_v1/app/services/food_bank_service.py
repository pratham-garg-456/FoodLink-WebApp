from app.models.event import Event, EventInventory
from app.models.inventory import Inventory
from app.models.application import Application

from fastapi import HTTPException
from beanie import PydanticObjectId

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
async def get_inventory_in_db(foodbank_id: str):
    """
    Retrieve the list of inventory for a specific foodbank in db
    :param foodbank_id: The ID of the food bank
    """
    inventory_list = []

    try:
        inventory = await Inventory.find(Inventory.foodbank_id == foodbank_id).to_list()
        inventory = await Inventory.find({"foodbank_id": foodbank_id}).to_list()
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
                status_code=400, detail=f"{food["food_name"]} is out of stock!"
            )

        # Check if the given event inventory is greater than the main inventory
        if event_quantity > main_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"The required quantity for {ev_inventory["food_name"]} is greater than the quantity in the main inventory!",
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

    # Create an Event in DB
    try:
        event = Event(
            foodbank_id=foodbank_id,
            event_name=event_data["event_name"],
            description=event_data["description"],
            date=event_data["date"],
            start_time=event_data["start_time"],
            end_time=event_data["end_time"],
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


async def get_list_volunteer_in_db(event_id: str):
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
            Application.event_id == event_id
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