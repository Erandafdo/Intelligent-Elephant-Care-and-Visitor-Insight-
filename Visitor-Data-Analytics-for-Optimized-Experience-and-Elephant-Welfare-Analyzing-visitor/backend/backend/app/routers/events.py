from fastapi import APIRouter, HTTPException
from app.models import Event, EventLog
from typing import Optional
from pydantic import BaseModel

class CheckInRequest(BaseModel):
    visitor_id: Optional[str] = None

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/")
async def get_all_events():
    """
    Returns the daily timetable with LIVE CROWD COUNTS.
    """
    events = await Event.find_all().to_list()
    
    # helper categorization
    daily_schedule = [e for e in events if e.category in ["Observation", "Interaction"]]
    special_events = [e for e in events if e.category in ["Cultural", "Special"]]
    
    return {
        "status": "success",
        "daily_timetable": daily_schedule,
        "special_events": special_events
    }

@router.post("/{event_id}/checkin")
async def check_in(event_id: str, data: CheckInRequest):
    """
    Visitor enters an event. Increments live count and logs action.
    """
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Increment Count
    event.current_count += 1
    await event.save()
    
    # Log for ML
    log = EventLog(
        event_id=str(event.id),
        event_name=event.event_name,
        visitor_id=data.visitor_id,
        action="check_in"
    )
    await log.insert()
    
    return {"status": "checked_in", "event": event.event_name, "current_count": event.current_count}

@router.post("/{event_id}/checkout")
async def check_out(event_id: str, data: CheckInRequest):
    """
    Visitor leaves an event. Decrements live count and logs action.
    """
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Decrement Count (min 0)
    if event.current_count > 0:
        event.current_count -= 1
        await event.save()
    
    # Log for ML
    log = EventLog(
        event_id=str(event.id),
        event_name=event.event_name,
        visitor_id=data.visitor_id,
        action="check_out"
    )
    await log.insert()
    
    return {"status": "checked_out", "event": event.event_name, "current_count": event.current_count}
