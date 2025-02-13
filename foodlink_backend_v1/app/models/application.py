from beanie import Document
from datetime import datetime, timezone
from typing import Literal


class Application(Document):
    volunteer_id: str
    event_id: str
    applied_position: str
    category: str
    status: Literal["pending", "approved", "rejected"] = "pending"
    applied_at: datetime = datetime.now(timezone.utc)

    class Settings:
        collection = "applications"
