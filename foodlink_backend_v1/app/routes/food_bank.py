from fastapi import APIRouter, HTTPException, Depends
from app.services.food_bank_service import (
    add_inventory_in_db,
    update_inventory_in_db,
    get_inventory_in_db,
    create_an_event_in_db,
    get_list_volunteer_in_db
)
from app.utils.jwt_handler import jwt_required

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


@router.get("/event")
async def get_list_of_event(payload: dict = Depends(jwt_required)):
    pass


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
            status_code=401, detail="Only FoodBank admin can add new food in the main inventory"
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
    :param inventory_id: A unique number to identify the correct
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
            status_code=401, detail="Only FoodBank admin can retrieve the inventory list"
        )

    inventory_list = await get_inventory_in_db(foodbank_id=payload.get("sub"))

    return {"status": "success", "inventory": inventory_list}


@router.get("/volunteers/{event_id}")
async def get_list_volunteer_application(
    event_id: str, payload: dict = Depends(jwt_required)
):
    """
    Allow food bank admin to retrieve the list of volunteer application for specific event
    :param payload: Decoded JWT containing user claims (validated via jwt_required).
    :param event_id: An event ID, the application is stored including the event ID
    """

    # Validate if the request is made from Foodbank user
    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only FoodBank admin can retrieve the list of volunteer application"
        )

    # Retrieve the list of volunteer application
    volunteers = await get_list_volunteer_in_db(event_id=event_id)
    
    if len(volunteers) == 0:
        raise HTTPException(
            status_code=404, detail=f"The list of volunteer applications is Empty"
        )
        
    return {"status": "success", "volunteers": volunteers}