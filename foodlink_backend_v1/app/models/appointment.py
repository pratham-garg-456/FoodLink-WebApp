from beanie import Document
from typing import Optional, Literal
from datetime import datetime, timezone

class Appointment(Document):
    individual_id: str
    foodbank_id: str
    start_time: datetime
    end_time: datetime
    description: Optional[str]
    status: Literal["confirmed", "rescheduled", "cancelled", "pending"] = "pending"
    product: list[str]
    created_at: datetime = datetime.now(timezone.utc)

    class Settings: 
        collection = "appointments"