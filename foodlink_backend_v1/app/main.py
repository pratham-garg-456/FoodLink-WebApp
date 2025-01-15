from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI instance
app = FastAPI(
    title="FastAPI with FoodLink",
    description="An application that handles the inside functionalities of FoodLink App",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint for health checks or basic info
@app.get("/")
async def root():
    return {
        "message": "Welcome to the FoodLink application "
    }

