from beanie import Document
from datetime import datetime
from typing import Literal


class Job(Document):
    foodbank_id: str
    title: str
    description: str
    location: str
    category: str
    date_posted: datetime
    deadline: datetime
    status: Literal["available", "unavailable"] = "available"

    class Settings:
        collection = "jobs"
