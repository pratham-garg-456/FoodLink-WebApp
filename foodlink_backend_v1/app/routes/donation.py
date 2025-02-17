from fastapi import APIRouter, HTTPException, Depends
from app.services.donor_service import create_donation_in_db, get_all_donations, get_donation_by_id
from app.utils.jwt_handler import jwt_required
from typing import List

router = APIRouter(tags=["donor"])


@router.post("/donations")
async def create_donation(payload: dict = Depends(jwt_required), amount: float = 0.0):
    """
    API Endpoint: Allow a donor to make a donation.
    """
    return await create_donation_in_db(donor_id=payload.get("sub"), amount=amount)


@router.get("/donations", response_model=List[dict])
async def get_donations(payload: dict = Depends(jwt_required)):
    """
    API Endpoint: Retrieve all donations.
    """
    if payload.get("role") not in ["admin", "foodbank"]:
        raise HTTPException(status_code=401, detail="Only admins or food banks can view donations")

    return await get_all_donations()


@router.get("/donations/{donation_id}")
async def get_donation(donation_id: str, payload: dict = Depends(jwt_required)):
    """
    API Endpoint: Retrieve a specific donation by ID.
    """
    return await get_donation_by_id(donation_id)
