from app.models.donation import Donation
from app.models.user import User
from fastapi import HTTPException
from beanie import PydanticObjectId


async def create_donation_in_db(donor_id: str, donation_data: dict):
    """
    Allow a donor to make a monetary donation.
    :param donor_id: The ID of the donor making the donation.
    :param amount: The amount of money donated.
    :return: Donation details.
    """

    # Create and save donation
    try:
        new_donation = Donation(donor_id=donor_id, amount=donation_data["amount"], foodbank_id=donation_data["foodbank_id"], status="confirmed")
        await new_donation.insert()
        new_donation = new_donation.model_dump()
        new_donation["id"] = str(new_donation["id"])
        return new_donation

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"An error occurred while creating a new donation in db : {str(e)}")


