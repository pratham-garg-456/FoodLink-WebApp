from beanie import Document
from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone

# ✅ Fix `BaseModel` import
class AppointmentFoodItem(BaseModel):
    food_item_id: str      # ID of the food item                
    quantity: float        # Quantity of the food item

class Appointment(Document):
    individual_id: str
    foodbank_id: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    status: Literal["confirmed", "rescheduled", "cancelled", "pending"] = "pending"
    product: list[AppointmentFoodItem]  # ✅ Fix the type if it's a list of objects
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))  # ✅ Fix timestamp issue
    modified_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings: 
        collection = "appointments"
