from beanie import Document, Link
from datetime import datetime, timezone
from typing import Literal
from beanie import PydanticObjectId

class Application(Document):
    volunteer_id: str 
    event_id: str
    service_id: str
    status: Literal["pending", "approved", "rejected"] = "pending"  
    applied_at: datetime = datetime.now(timezone.utc)  

    class Settings:
        collection = "applications"
