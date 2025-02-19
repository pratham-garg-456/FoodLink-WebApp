from fastapi import APIRouter, HTTPException, Depends, Request, Body
from app.services.donor_service import create_donation_in_db
from app.utils.jwt_handler import jwt_required
from typing import List

router = APIRouter()

@router.post("/donations")
async def create_donation(payload: dict = Depends(jwt_required), donation_data: dict =Body(...)):
    """
    API Endpoint: Allow only donors to make a donation.
    """

    if payload.get("role") != "donor":
        raise HTTPException(status_code=403, detail="Only donors can make donations")
    
     # Required key in the body
    required_key = ["foodbank_id","amount"]

    # Start validation those keys
    for key in required_key:
        if not donation_data.get(key):
            raise HTTPException(
                status_code=400, detail=f"{key} is required and cannot be empty"
            )
        
    if donation_data["amount"] <= 0:
        raise HTTPException(status_code=400, detail="Donation amount must be greater than zero")


    donation = await create_donation_in_db(donor_id = payload.get("sub"), donation_data = donation_data)

    return {
        "status": "success",
        "message": "Donation recorded successfully",
        "donation": donation
    }

