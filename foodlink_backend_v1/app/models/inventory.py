from beanie import Document

class Inventory(Document):
    foodbank_id: str
    food_name: str
    quantity: int
    
    class Settings:
        collection = "inventory"