from beanie import Document
from datetime import datetime, timezone
from typing import Literal

class Donation(Document):
    donor_id: str  # Reference to a user (donor)
    amount: float
    status: Literal["pending", "confirmed", "failed"] = "pending"
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        collection = "donations"
