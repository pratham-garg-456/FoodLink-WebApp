from app.models.donation import Donation
from app.models.user import User
from fastapi import HTTPException
from beanie import PydanticObjectId
from datetime import datetime, timezone
from typing import List, Dict, Optional
import uuid

async def create_donation_in_db(donor_id: str, donation_data: dict) -> dict:
    """
    Allow a donor to make a monetary donation.
    :param donor_id: The ID of the donor making the donation.
    :param donation_data: Dict containing donation details (e.g., "amount").
    :return: Donation details as a dict.
    """
    try:
        # Generate a random foodbank_id for monetary donations
        random_foodbank_id = str(uuid.uuid4())
        
        new_donation = Donation(
            donor_id=donor_id,
            amount=donation_data["amount"],
            foodbank_id=random_foodbank_id,
            status="confirmed"
        )
        await new_donation.insert()
        donation = new_donation.model_dump()
        donation["id"] = str(donation["id"])
        return donation
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating donation in db: {str(e)}")
            
async def get_donations_by_user(donor_id: str) -> List[dict]:
    """
    Retrieve all donations made by a specific donor.
    :param donor_id: The ID of the donor.
    :return: A list of donation details.
    """
    donation_list = []
    try:
        donations = await Donation.find(Donation.donor_id == donor_id).to_list()
        for donation in donations:
            donation = donation.model_dump()
            donation["id"] = str(donation["id"])
            donation_list.append(donation)
        return donation_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error retrieving donations for user {donor_id}: {str(e)}"
        )
