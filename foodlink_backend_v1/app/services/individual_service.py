from app.models.appointment import Appointment
from fastapi import HTTPException


async def create_appointment_in_db(individual_id: str, appointment_data: dict):
    """
    Add an appointment in db
    :param appointment_data: A detailed appointment information is made by individual
    """

    try:
        new_appointment = Appointment(
            individual_id=individual_id,
            foodbank_id=appointment_data["foodbank_id"],
            start_time=appointment_data["start_time"],
            end_time=appointment_data["end_time"],
            description=appointment_data["description"],
            product=appointment_data["product"],
        )

        await new_appointment.insert()
        new_appointment = new_appointment.model_dump()
        new_appointment["id"] = str(new_appointment["id"])

        return new_appointment
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while creating a new appointment in db: {e}",
        )
