from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.config import settings
from contextlib import asynccontextmanager
from app.routes import auth, misc

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting application in {settings.APP_ENV} environment...")
    try:
        await init_db()
        print("Database connection initialized successfully.")
    except Exception as e:
        print(f"An error occurred while initializing the database: {e}")
    yield

# Create FastAPI instance
app = FastAPI(
    title="FastAPI with FoodLink",
    description="An application that handles the inside functionalities of FoodLink App",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route
app.include_router(auth.router, prefix="/api/v1/foodlink/auth", tags=["Authentication"])
app.include_router(misc.router, prefix="/api/v1/foodlink/misc", tags=["Misc"])
# Root endpoint for health checks or basic info
@app.get("/")
async def root():
    return {
        "message": "Welcome to the FoodLink application "
    }
