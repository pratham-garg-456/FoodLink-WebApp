from beanie import Document
from typing import Literal
from datetime import datetime, timezone

class Payment(Document):
    donation_id: str  # Reference to Donation model
    transaction_id: str
    payment_method: Literal["credit_card", "paypal", "bank_transfer"]
    status: Literal["success", "failed", "pending"] = "pending"

    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        collection = "payments"