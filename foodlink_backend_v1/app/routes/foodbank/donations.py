from fastapi import APIRouter, HTTPException, Depends
from app.utils.jwt_handler import jwt_required
from app.services.food_bank_service import (
    # get_donation_by_id,
    get_all_donations,
)

router = APIRouter()


@router.get("/donations")
async def get_donations_for_foodbank(payload: dict = Depends(jwt_required)):
    """
    API Endpoint: Retrieve all donations for foodbank.
    """

    if payload.get("role") != "foodbank":
        raise HTTPException(
            status_code=401, detail="Only food banks can retrieve list of donations"
        )

    donations = await get_all_donations(foodbank_id=payload.get("sub"))

    return {
        "status": "success",
        "donations": donations,
    }


# @router.get("/donations/{donation_id}")
# async def get_donation(donation_id: str, payload: dict = Depends(jwt_required)):
#     """
#     API Endpoint: Retrieve a specific donation by ID.
#     """
#     # Validate if the request is made from Foodbank user
#     if payload.get("role") != "foodbank":
#         raise HTTPException(
#             status_code=401,
#             detail="Only FoodBank admin can retrieve the donation details",
#         )

#     donation = await get_donation_by_id(donation_id=donation_id)
#     if not donation:
#         raise HTTPException(status_code=404, detail="Donation not found")

#     return {
#         "status": "success",
#         "donation": donation,
#     }
