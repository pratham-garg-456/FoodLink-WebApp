from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.config import settings

async def init_db():
    """
    Initialize the MongoDB database with Beanie models.
    """    
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.get_database('User-Collection')
    await init_beanie(database=db, document_models=[User])