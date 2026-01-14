
import asyncio
from datetime import datetime, timedelta
import random
from passlib.context import CryptContext
from app.db import init_db
from app.models import Event, Visitor, Ticket, EventLog

# Setup Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_full_db():
    print("--- STARTING DATABASE SEED (DEMO MODE) ---")
    await init_db()
    
    # 1. Clear Collections
    print("Clean slate: Deleting old records...")
    await Event.find_all().delete()
    await Visitor.find_all().delete()
    await Ticket.find_all().delete()
    await EventLog.find_all().delete()
    
    # 2. SEED EVENTS
    daily_events = [
        {"event_name": "Bottle Feeding (Morning)", "category": "Interaction", "capacity": 50},
        {"event_name": "River Bathing (Morning)", "category": "Observation", "capacity": 200},
        {"event_name": "Fruit Feeding", "category": "Interaction", "capacity": 100},
        {"event_name": "Museum Visit", "category": "Observation", "capacity": 80},
        {"event_name": "River Bathing (Afternoon)", "category": "Observation", "capacity": 200},
        {"event_name": "Mahout Talk", "category": "Special", "capacity": 40}
    ]
    
    event_objs = []
    print(f"Creating {len(daily_events)} Events...")
    for ev in daily_events:
        e = Event(**ev)
        await e.insert()
        event_objs.append(e)
        
    # 3. SEED VISITORS (50 Users)
    print("Generating 50 Visitors...")
    countries = ["Sri Lanka"] * 10 + ["United Kingdom", "Germany", "India", "China", "USA"] * 8
    visitors = []
    pw_hash = pwd_context.hash("password123")
    
    for i in range(50):
        country = random.choice(countries)
        v = Visitor(
            name=f"Visitor {i+1}",
            age=random.randint(20, 65),
            country=country,
            email=f"user{i+1}@test.com",
            phone=f"+9477{random.randint(1000000, 9999999)}",
            password_hash=pw_hash
        )
        await v.insert()
        visitors.append(v)
        
    # 4. SEED TICKETS (200 Tickets over last 7 days)
    print("Generating 200 Tickets...")
    
    for _ in range(200):
        visitor = random.choice(visitors)
        days_ago = random.randint(0, 6)
        booking_date = datetime.now() - timedelta(days=days_ago)
        
        # Price Logic
        is_adult = visitor.age > 12
        if visitor.country == "Sri Lanka":
            currency = "LKR"
            price = 500.0 if is_adult else 250.0
        else:
            currency = "USD"
            price = 15.0 if is_adult else 8.0
            
        t = Ticket(
            visitor=visitor,
            event_name="General Entry",
            booking_date=booking_date,
            tickets_count=random.randint(1, 4),
            total_price=price * random.randint(1, 4),
            currency=currency,
            status="CONFIRMED"
        )
        await t.insert()
        
    # 5. SEED EVENT LOGS (Heatmap Data - TODAY)
    print("Generating 500 Entry Logs for Heatmap...")
    # Distribution: Peak at 10 (Bathing) and 14 (Bathing)
    
    today_start = datetime.now().replace(hour=8, minute=0, second=0)
    
    for _ in range(500):
        # Pick event
        event = random.choice(daily_events)
        ev_name = event["event_name"]
        
        # Pick time based on simple weights
        rand_val = random.random()
        if "Bathing" in ev_name:
            # bias towards 10-11 and 14-15
            hour_offset = random.choice([2, 3, 6, 7]) # 10, 11, 14, 15
        elif "Morning" in ev_name:
            hour_offset = random.randint(1, 4) # 9-12
        else:
            hour_offset = random.randint(1, 9) # 9-17
            
        log_time = today_start + timedelta(hours=hour_offset, minutes=random.randint(0, 59))
        
        log = EventLog(
            event_id="seeded_id",
            event_name=ev_name,
            action="check_in",
            timestamp=log_time
        )
        await log.insert()
        
    print("--- SEED COMPLETE: Admin Dashboard is now populated! ---")

if __name__ == "__main__":
    asyncio.run(seed_full_db())
