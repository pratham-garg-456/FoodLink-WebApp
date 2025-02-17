from app.models.donation import Donation
from app.models.user import User
from fastapi import HTTPException
from beanie import PydanticObjectId


async def create_donation_in_db(donor_id: str, amount: float):
    """
    Allow a donor to make a monetary donation.
    :param donor_id: The ID of the donor making the donation.
    :param amount: The amount of money donated.
    :return: Donation details.
    """

    # Validate donor existence
    donor = await User.get(PydanticObjectId(donor_id))
    if not donor:
        raise HTTPException(status_code=400, detail="Invalid donor ID")

    if donor.role != "donor":
        raise HTTPException(status_code=403, detail="Only donors can make a donation")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Donation amount must be greater than zero")

    # Create and save donation
    try:
        donation = Donation(donor_id=donor_id, amount=amount, status="pending")
        await donation.insert()

        donation_dict = donation.model_dump()
        donation_dict["id"] = str(donation_dict["id"])
        return donation_dict

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording donation: {str(e)}")


async def get_all_donations():
    """
    Retrieve all donation records from the database.
    :return: List of donations.
    """
    try:
        donations = await Donation.find_all().to_list()
        return [donation.model_dump() for donation in donations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching donations: {str(e)}")


async def get_donation_by_id(donation_id: str):
    """
    Retrieve a specific donation record.
    :param donation_id: The ID of the donation.
    :return: Donation details.
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
