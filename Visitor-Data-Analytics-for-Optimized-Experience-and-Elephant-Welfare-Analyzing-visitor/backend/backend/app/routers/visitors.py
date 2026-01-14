from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models import Visitor, Ticket, EventLog
from app.ml_engine import ml_engine
from pydantic import BaseModel, EmailStr
from datetime import datetime
import qrcode
import io
import base64

router = APIRouter(prefix="/visitors", tags=["Visitors"])

    # ... (imports) ...
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class VisitorRequest(BaseModel):
    name: str
    age: int
    country: str
    email: EmailStr
    phone: str
    password: str # New Field
    event_preference: str = None 
    booking_date: datetime
    tickets_count: int

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def login_visitor(data: LoginRequest):
    # 1. Find Visitor
    visitor = await Visitor.find_one(Visitor.email == data.email)
    if not visitor:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # 2. Verify Password
    if not visitor.password_hash or not pwd_context.verify(data.password, visitor.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {
        "status": "success",
        "visitor_id": str(visitor.id),
        "name": visitor.name,
        "role": "visitor"
    }

@router.post("/register")
async def register_visitor(data: VisitorRequest):
    # Check if email exists
    existing = await Visitor.find_one(Visitor.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # AI Suggestion 
    final_event = data.event_preference
    ai_note = "User selected"
    if not final_event:
        final_event = ml_engine.predict_preference(data.age, data.country)
        ai_note = "AI Recommended based on Country/Age Profile"

    # 3. Hash Password
    hashed_pw = pwd_context.hash(data.password)

    # 4. Save Visitor
    visitor = Visitor(
        name=data.name,
        age=data.age,
        country=data.country,
        email=data.email,
        phone=data.phone,
        password_hash=hashed_pw
    )
    await visitor.insert()

    # Calculate Ticket Price
    SAARC_COUNTRIES = ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"]
    is_adult = data.age > 12
    if data.country.lower() == "sri lanka":
        base_rate = 250 if is_adult else 100
        currency = "LKR"
    elif data.country in SAARC_COUNTRIES:
        base_rate = 10.00 if is_adult else 5.00
        currency = "USD"
    else:
        base_rate = 15.00 if is_adult else 7.50
        currency = "USD"
        
    vat_multiplier = 1.18
    ticket_price_unit = base_rate * vat_multiplier
    total_price = round(ticket_price_unit * data.tickets_count, 2)

    tickets = Ticket(
        visitor=visitor,
        event_name=final_event,
        booking_date=datetime.now(),
        tickets_count=data.tickets_count,
        total_price=total_price,
        currency=currency
    )
    await tickets.insert()
    

    return {
        "status": "success",
        "ticket_id": str(tickets.id),
        "visitor_id": str(visitor.id),
        "event": final_event,
        "ai_note": ai_note,
        "qr_code_data": tickets.qr_code_data,
        "price_details": {
            "currency": currency,
            "unit_price_inc_vat": round(ticket_price_unit, 2),
            "total_price": total_price,
        }
    }

@router.get("/")
async def get_all_visitors():
    return await Visitor.find_all().to_list()

@router.get("/{visitor_id}/history")
async def get_visitor_history(visitor_id: str):
    """
    Returns full history: Past Tickets + Event Visits (with Time Spent).
    """
    # 1. Fetch Tickets
    try:
        # Check if visitor exists
        visitor = await Visitor.get(visitor_id)
        if not visitor:
            raise HTTPException(status_code=404, detail="Visitor not found")
            
        tickets = await Ticket.find(Ticket.visitor.id == visitor.id).to_list()
        
        # 2. Fetch Event Activity Logs
        # Assuming EventLog model exists and has visitor_id field
        logs = await EventLog.find(EventLog.visitor_id == visitor_id).sort(+EventLog.timestamp).to_list()
        
        # 3. Calculate Time Spent
        visit_history = []
        open_sessions = {} # {event_id: start_time}
        
        for log in logs:
            if log.action == "check_in":
                open_sessions[log.event_name] = log.timestamp
            elif log.action == "check_out" and log.event_name in open_sessions:
                start_time = open_sessions.pop(log.event_name)
                duration = log.timestamp - start_time
                minutes_spent = round(duration.total_seconds() / 60, 1)
                
                visit_history.append({
                    "event_name": log.event_name, # Changed from 'event' to 'event_name' match interface
                    "check_in": start_time.isoformat(),
                    "check_out": log.timestamp.isoformat(),
                    "minutes_spent": minutes_spent
                })
        
        return {
            "status": "success",
            "visitor": visitor.name,
            "tickets": tickets,
            "journey_history": visit_history,
            "active_sessions": list(open_sessions.keys()) 
        }
        
    except Exception as e:
        print(f"Error serving history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TicketPurchaseRequest(BaseModel):
    booking_date: datetime
    tickets_count: int
    event_preference: str = "General Entry"

@router.post("/{visitor_id}/tickets")
async def purchase_ticket(visitor_id: str, data: TicketPurchaseRequest):
    # Fetch Visitor
    visitor = await Visitor.get(visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    # Calculate Ticket Price
    SAARC_COUNTRIES = ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"]
    is_adult = visitor.age > 12
    
    if visitor.country.lower() == "sri lanka":
        base_rate = 250 if is_adult else 100
        currency = "LKR"
    elif visitor.country in SAARC_COUNTRIES:
        base_rate = 10.00 if is_adult else 5.00
        currency = "USD"
    else:
        base_rate = 15.00 if is_adult else 7.50
        currency = "USD"
        
    vat_multiplier = 1.18
    ticket_price_unit = base_rate * vat_multiplier
    total_price = round(ticket_price_unit * data.tickets_count, 2)

    # 3. Create Ticket
    tickets = Ticket(
        visitor=visitor,
        event_name=data.event_preference,
        booking_date=data.booking_date,
        tickets_count=data.tickets_count,
        total_price=total_price,
        currency=currency
    )
    await tickets.insert()
    
    return {
        "status": "success",
        "ticket_id": str(tickets.id),
        "qr_code_data": tickets.qr_code_data,
        "price_details": {
            "currency": currency,
            "total_price": total_price
        }
    }
