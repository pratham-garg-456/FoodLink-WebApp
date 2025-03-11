from beanie import Document
from datetime import datetime, timezone
from typing import Literal


class Job(Document):
    foodbank_id: str
    title: str
    description: str
    location: str
    category: str
    date_posted: datetime = datetime.now(timezone.utc)
    deadline: datetime
    status: Literal["available", "unavailable"] = "available"

    class Settings:
        collection = "jobs"


class EventJob(Job):
    event_id: str
    
    class Settings:
        collection = "event_jobs"