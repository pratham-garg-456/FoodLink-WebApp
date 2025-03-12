from beanie import Document
from datetime import datetime, timezone
from typing import Literal


class Application(Document):
    volunteer_id: str
    foodbank_id: str
    job_id: str
    category: str = "Foodbank"
    status: Literal["pending", "approved", "rejected"] = "pending"
    applied_at: datetime = datetime.now(timezone.utc)

    class Settings:
        collection = "applications"


class EventApplication(Application):
    event_id: str
    category: str = "Event"

    class Settings:
        collection = "event_applications"
