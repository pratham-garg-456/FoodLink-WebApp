from fastapi import APIRouter, HTTPException
from app.models.service import Service

router = APIRouter()

@router.post("/services")
async def add_available_services(service_data: dict = {}):
    """
    Allow food link admin to add available services of the app
    :param service_data: A service information
    :return A created service is stored in the db
    """
    # Required key in the body
    required_keys = ["title", "description"]
    # Validate it
    for key in required_keys:
        if not service_data.get(key):
            raise HTTPException(status_code=400, detail=f"{key} is required and cannot be empty")

    # Check if the service is defined already
    is_defined = await Service.find_one(Service.title == service_data.get("title"))
    
    if is_defined:
        raise HTTPException(status_code=401, detail=f"{service_data.get("title")} defined already!")
    
    # Creating a new service in the db    
    try:
        new_service = Service(title=service_data["title"], description=service_data["description"])
        
        await new_service.insert()
        service_dict = new_service.model_dump()
        service_dict["id"] = str(service_dict["id"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occured while creating new service in db: {e}")
    
    return {"status": "success", "service": service_dict}

@router.get("/services")
async def retrieve_a_list_of_service():
    """
    Allow FoodLink admin to get the list of services in the db
    :return a list of services which can display to the end users
    """
    # Define a list of a service
    service_list = []
    
    # Fetch the list of services in the db
    try:
        services = await Service.find().to_list()
        for service in services:
            service_dict = service.model_dump()
            service_dict["id"] = str(service_dict["id"])
            service_list.append(service_dict)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"List is empty or {e}")
    
    return {"status": "success", "services": service_list}
    