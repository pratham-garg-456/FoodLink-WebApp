from beanie import Document
from datetime import datetime, timezone
from typing import Literal

class User(Document):
    name: str
    role: Literal["foodbank", "individual", "donor", "volunteer"]
    email: str
    password: str
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)
    
    