from app.models.donation import Donation
from app.models.user import User
from fastapi import HTTPException
from beanie import PydanticObjectId
from datetime import datetime, timezone
from typing import List, Dict, Optional

async def create_donation_in_db(donor_id: str, donation_data: dict) -> dict:
    """
    Allow a donor to make a monetary donation.
    :param donor_id: The ID of the donor making the donation.
    :param donation_data: Dict containing donation details (e.g., "amount", "foodbank_id").
    :return: Donation details as a dict.
    """
    try:
        new_donation = Donation(
            donor_id=donor_id,
            amount=donation_data["amount"],
            foodbank_id=donation_data["foodbank_id"],
            status="confirmed"  # You can replace this with a dynamic value if needed.
        )
        await new_donation.insert()
        donation = new_donation.model_dump()
        donation["id"] = str(donation["id"])
        return donation
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating donation in db: {str(e)}")

async def get_donation_by_id(donation_id: str) -> dict:
    """
    Retrieve a specific donation record by its ID.
    :param donation_id: The ID of the donation.
    :return: Donation details as a dict.
    """
    try:
        donation = await Donation.get(PydanticObjectId(donation_id))
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")
        donation_dict = donation.model_dump()
        donation_dict["id"] = str(donation_dict["id"])
        return donation_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching donation: {str(e)}")

async def process_fake_payment_in_db(donation_id: str, transaction_id: str) -> dict:
    """
    Process payment details for a donation using simulated (fake) payment data.
    Only stores minimal transaction information (user ID and fake transaction ID).
    """
    try:
        donation = await Donation.get(PydanticObjectId(donation_id))
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")

        donation.status = "completed"
        donation.transaction_id = transaction_id  # Ensure your Donation model includes this field.
        donation.modified_at = datetime.now(timezone.utc)
        await donation.save()
        updated_donation = donation.model_dump()
        updated_donation["id"] = str(updated_donation["id"])
        return updated_donation
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing payment: {str(e)}")
            
async def get_donations_by_user(donor_id: str) -> List[dict]:
    """
    Retrieve all donations made by a specific donor.
    :param donor_id: The ID of the donor.
    :return: A list of donation details.
    """
    try:
        donations = await Donation.find(Donation.donor_id == donor_id).to_list()
        donation_list = []
        for donation in donations:
            d = donation.model_dump()
            d["id"] = str(d["id"])
            donation_list.append(d)
        return donation_list
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error retrieving donations for user {donor_id}: {str(e)}"
        )
    
async def get_recent_donations_in_db() -> List[dict]:
    """
    Retrieve recent donation updates from the database.
    This function returns a list of the most recent completed donations,
    which can be used to display live updates on the donation tracker page.
    """
    try:
        # Query recent donations with a status of "completed", sorted by creation date (newest first).
        recent_donations = (
            await Donation.find(Donation.status == "completed")
                        .sort(-Donation.created_at)
                        .limit(10)
                        .to_list()
        )
        donation_list = []
        for donation in recent_donations:
            d = donation.model_dump()
            d["id"] = str(d["id"])
            donation_list.append(d)
        return donation_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recent donations: {str(e)}")

async def get_donation_statistics_in_db() -> Dict[str, any]:
    """
    Retrieve donation statistics (e.g., total donations, total food donated, monthly stats).
    You can replace the hard-coded data with actual DB aggregations.
    """
    try:
        # Example: Hard-coded for demonstration.
        statistics = {
            "total_donations": 3100,
            "total_food_donated": 120,  # if you track food donation
            "donation_trend": [
                {"month": "Jan", "amount": 500},
                {"month": "Feb", "amount": 700},
                {"month": "Mar", "amount": 900},
                {"month": "Apr", "amount": 500},
                {"month": "May", "amount": 500}
            ]
        }
        return statistics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching donation statistics: {str(e)}"
        )

async def process_payment_in_db(donation_id: str, payment_data: dict) -> dict:
    """
    Process payment details (simulated) and update the donation record to reflect payment status.
    We do NOT store card details. We only store transaction_id or minimal info.
    :param donation_id: The ID of the donation being paid for.
    :param payment_data: Dict containing payment details (transaction_id, payment_method, etc.).
    :return: Updated donation record.
    """
    try:
        donation = await Donation.get(PydanticObjectId(donation_id))
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")

        # Simulate external payment processing...
        transaction_id = payment_data.get("transaction_id")
        if not transaction_id:
            raise HTTPException(status_code=400, detail="Transaction ID is required for payment")

        # Update donation status and store minimal payment info
        donation.status = "completed"
        donation.transaction_id = transaction_id  # Add a field to your Donation model if needed
        donation.modified_at = datetime.now(timezone.utc)

        await donation.save()
        updated_donation = donation.model_dump()
        updated_donation["id"] = str(updated_donation["id"])
        return updated_donation
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing payment: {str(e)}"
        )

async def get_drop_off_locations_in_db() -> List[dict]:
    """
    Retrieve a list of drop-off locations for the 'Find Drop-off Location' feature.
    You can integrate a real database or mapping API if you have location data.
    """
    try:
        drop_off_locations = [
            {"id": "loc1", "name": "Food Bank Street A", "address": "1 Finch Ave. W", "phone": "647-123-1233"},
            {"id": "loc2", "name": "Food Bank Street B", "address": "2 Finch Ave. W", "phone": "647-456-7890"},
            {"id": "loc3", "name": "Food Bank Street C", "address": "3 Finch Ave. W", "phone": "647-987-6543"},
        ]
        return drop_off_locations
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching drop-off locations: {str(e)}"
        )

