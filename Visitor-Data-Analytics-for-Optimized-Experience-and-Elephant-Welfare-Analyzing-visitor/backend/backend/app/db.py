from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import Visitor, Ticket, Event, AnalyticsReport, ScheduleRecommendation, EventLog

async def init_db():
    # Connect to MongoDB (Localhost for now)
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    
    # Initialize Beanie with the 'elephant_research_db' database
    await init_beanie(database=client.elephant_research_db, document_models=[
        Visitor,
        Ticket,
        AnalyticsReport,
        ScheduleRecommendation,
        Event,
        EventLog
    ])
