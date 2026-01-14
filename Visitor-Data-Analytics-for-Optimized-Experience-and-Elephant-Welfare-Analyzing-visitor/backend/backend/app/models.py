from beanie import Document, Link
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class Event(Document):
    event_name: str
    category: str
    capacity: int = 100
    description: Optional[str] = None
    current_count: int = 0  # Live Tracker
    
    class Settings:
        name = "events"

class EventLog(Document):
    """
    Stores historical check-ins to train ML models on 'Best Time to Visit'.
    """
    event_id: str
    event_name: str
    visitor_id: Optional[str] = None
    action: str  # "check_in" or "check_out"
    timestamp: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "event_logs"

class Visitor(Document):
    name: str
    age: int
    country: str
    email: EmailStr
    phone: str
    password_hash: Optional[str] = None # Added for Security
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "visitors"

class Ticket(Document):
    visitor: Link[Visitor]
    event_name: str
    booking_date: datetime
    tickets_count: int
    total_price: float = 0.0
    currency: str = "USD"
    qr_code_data: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "CONFIRMED" # CONFIRMED, CANCELLED, USED
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "tickets"

class AnalyticsReport(Document):
    report_date: datetime = Field(default_factory=datetime.now)
    total_visitors_forecast: float
    top_countries: dict
    top_events: list
    cluster_insights: dict # New field for ML clustering results
    generated_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "analytics_reports"

class ScheduleRecommendation(Document):
    month: str
    recommended_event: str
    reason: str
    confidence_score: float
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "schedule_recommendations"
