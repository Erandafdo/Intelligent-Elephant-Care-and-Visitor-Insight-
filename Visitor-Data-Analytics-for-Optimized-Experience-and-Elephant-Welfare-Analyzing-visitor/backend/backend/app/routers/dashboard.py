from fastapi import APIRouter
from app.models import Visitor, Ticket
from app.ml_engine import ml_engine
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats():
    # 1. Basic Stats (from DB)
    total_visitors = await Visitor.count()
    total_tickets = await Ticket.count()
    
    # 2. Country Breakdown (Aggregate)
    # Note: Beanie aggregation needed. For prototype, we might fetch a subset or use aggregation pipeline.
    # Simple Pipeline:
    # Using get_pymongo_collection() to bypass Beanie wrapper issues with this version combination
    cursor = Visitor.get_pymongo_collection().aggregate([
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ])
    country_counts = await cursor.to_list(length=None)
    
    # 3. AI Forecast (Next Month)
    next_month = (datetime.now().month % 12) + 1
    forecast_val = ml_engine.forecast_attendance(next_month, 0) # Assumes avg day
    
    return {
        "total_visitors_lifetime": total_visitors,
        "total_tickets_sold": total_tickets,
        "top_countries": country_counts,
        "ai_forecast_next_month": forecast_val,
        "ai_forecast_message": f"AI Predicts {forecast_val} visitors next month based on seasonal trends."
    }

@router.get("/schedule-recommendations")
async def get_schedule():
    # Heuristic Logic using ML insights
    # "If high forecast + High Indian crowd -> Schedule more Feeding"
    
    month = datetime.now().month
    expected_traffic = ml_engine.forecast_attendance(month, 0)
    
    recommendations = []
    
    if expected_traffic > 50: # Threshold
        recommendations.append({
            "event": "Elephant Bathing",
            "action": "Increase Frequency",
            "reason": "High Visitor Forecast detected by AI."
        })
        
    return {"month": month, "recommendations": recommendations}
