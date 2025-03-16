from beanie import Document
from datetime import datetime, timezone

class DonationTracker(Document):
    donor_id: str  # Reference to User model (donor)
    total_donated: float
# total_food_donated: float
    last_donation_date: datetime

    class Settings:
        collection = "donation_tracker"