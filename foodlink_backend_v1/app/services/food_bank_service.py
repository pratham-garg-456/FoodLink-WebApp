from app.models.user import User
from app.models.event import Event
from app.models.inventory import Inventory
from fastapi import HTTPException
from beanie import PydanticObjectId


async def get_foodbank_by_id(foodbank_id: str):
    """
    Retrieve a foodbank information using its ID
    :param foodbank_id: A unique ID for foodbank
    """

    foodbank = await User.get(PydanticObjectId(foodbank_id))

    if not foodbank:
        return None

    foodbank_dict = foodbank.model_dump()
    foodbank_dict["id"] = str(foodbank_dict["id"])

    if not foodbank_dict["role"] == "foodbank":
        return None

    return foodbank_dict


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
            detail=f"An error occured while creating a new food in db: {e}",
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
            detail=f"An error occured while updating a food in db: {e}",
        )


async def get_inventory_in_db():
    """
    Retrieve the list of inventory in db
    """

    inventory_list = []

    try:
        inventory = await Inventory.find().to_list()
        for inv in inventory:
            inv = inv.model_dump()
            inv["id"] = str(inv["id"])
            inventory_list.append(inv)

        return inventory_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occured while retrieving a list of inventory in db: {e}",
        )
