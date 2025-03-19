from fastapi import APIRouter, HTTPException, Depends, Request, Body
from app.services.donor_service import (
    create_donation_in_db,
    get_donations_by_user,
)

from app.utils.jwt_handler import jwt_required
from typing import List

router = APIRouter()


@router.post("/donations")
async def create_donation(
    payload: dict = Depends(jwt_required), donation_data: dict = {}
):
    """
    API Endpoint: Allow only donors to make a monetary donation.
    """
    if payload.get("role") != "donor":
        raise HTTPException(status_code=401, detail="Only donors can make donations")

    required_key = ["amount", "foodbank_id"]

    # Validate required keys
    for key in required_key:
        if not donation_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )

    if donation_data["amount"] <= 0:
        raise HTTPException(
            status_code=400, detail="Donation amount must be greater than zero"
        )

    # Create the donation record
    donation = await create_donation_in_db(
        donor_id=payload.get("sub"), donation_data=donation_data
    )

    return {
        "status": "success",
        "message": "Donation recorded successfully",
        "donation": donation,
    }


@router.get("/donations")
async def get_donations_for_donor(payload: dict = Depends(jwt_required)):
    """
    API Endpoint: Retrieve all donations made by the donor.
    """
    if payload.get("role") != "donor":
        raise HTTPException(
            status_code=401, detail="Only donors can retrieve donation details"
        )

    donations = await get_donations_by_user(donor_id=payload.get("sub"))
    return {"status": "success", "donations": donations}
