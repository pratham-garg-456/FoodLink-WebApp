from fastapi import APIRouter, HTTPException, Depends, Request
from app.services.donor_service import create_donation_in_db, get_all_donations, get_donation_by_id
from app.utils.jwt_handler import jwt_required
from typing import List

router = APIRouter(prefix="/api/v1/foodlink/donor", tags=["donor"])

@router.post("/donations")
async def create_donation(request: Request, amount: float = 0.0):
    """
    API Endpoint: Allow only donors to make a donation.
    """
    user = await jwt_required(request.headers.get("Authorization"))

    if user.get("role") != "donor":
        raise HTTPException(status_code=403, detail="Only donors can make donations")

    donation = await create_donation_in_db(donor_id=user.get("id"), amount=amount)

    return {
        "status": "success",
        "message": "Donation recorded successfully",
        "data": donation
    }

@router.get("/donations", response_model=List[dict])
async def get_donations_for_foodbank(request: Request):
    """
    API Endpoint: Retrieve all donations for foodbanks and admins.
    """
    user = await jwt_required(request.headers.get("Authorization"))

    if user.get("role") not in ["admin", "foodbank"]:
        raise HTTPException(status_code=401, detail="Only admins or food banks can view donations")

    donations = await get_all_donations()

    return {
        "status": "success",
        "message": "Donations retrieved successfully",
        "data": donations
    }

@router.get("/donations/{donation_id}")
async def get_donation(donation_id: str, request: Request):
    """
    API Endpoint: Retrieve a specific donation by ID.
    """
    user = await jwt_required(request.headers.get("Authorization"))

    donation = await get_donation_by_id(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    return {
        "status": "success",
        "message": "Donation retrieved successfully",
        "data": donation
    }
