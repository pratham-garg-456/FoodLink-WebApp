from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventInventory(BaseModel):
    food_name: str
    quantity: int

class Event(Document):
    foodbank_id: str
    name: str
    description: Optional[str]
    date: datetime
    start_time: datetime
    end_time: datetime
    location: str
    food_services: Optional[list[str]]
    event_inventory: EventInventory
    
    class Settings:
        collection = "events"
        
