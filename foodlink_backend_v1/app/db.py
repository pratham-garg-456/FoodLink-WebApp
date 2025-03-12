from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import (
    user,
    service,
    contact,
    event,
    inventory,
    application,
    appointment,
    donation,
    job,
    event_job,
    volunter_activity,
)
from app.config import settings


async def init_db():
    """
    Initialize the MongoDB database with Beanie models.
    """
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.get_database("FoodLink-Collection")
    await init_beanie(
        database=db,
        document_models=[
            user.User,
            service.Service,
            contact.Contact,
            event.Event,
            inventory.Inventory,
            application.Application,
            appointment.Appointment,
            donation.Donation,
            job.Job,
            event_job.EventJob,
            volunter_activity.VolunteerActivity,
            application.EventApplication
        ],
    )
