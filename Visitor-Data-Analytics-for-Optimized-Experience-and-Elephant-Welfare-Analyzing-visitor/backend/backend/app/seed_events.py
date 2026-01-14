import asyncio
from app.db import init_db
from app.models import Event

async def seed_events():
    await init_db()
    
    # 1. Clear existing events to avoid duplicates
    await Event.find_all().delete()
    
    # 2. Define Real-World Events (Daily Standard - 2025 Schedule)
    daily_events = [
        {"event_name": "Bottle Feeding (Morning)", "category": "Interaction", "description": "09.15 AM. Milk feeding for baby elephants."},
        {"event_name": "Herd Departure to River (Morning)", "category": "Observation", "description": "10.00 AM. The herd leaves for the Maha Oya river."},
        {"event_name": "Herd Return from River (Morning)", "category": "Observation", "description": "12.00 PM. The herd returns from the river."},
        {"event_name": "Bottle Feeding (Afternoon)", "category": "Interaction", "description": "13.15 PM. Milk feeding session."},
        {"event_name": "Herd Departure to River (Afternoon)", "category": "Observation", "description": "14.00 PM. The herd leaves for the Maha Oya river."},
        {"event_name": "Herd Return from River (Afternoon)", "category": "Observation", "description": "16.00 PM. The herd returns from the river."},
        {"event_name": "Bottle Feeding (Evening)", "category": "Interaction", "description": "17.00 PM. Milk feeding session."},
        {"event_name": "Fruit Feeding Session", "category": "Interaction", "description": "Available during opening hours (8.30 AM - 5.30 PM)."}
    ]
    
    # 3. Define Special Seasonal Events
    seasonal_events = [
        {"event_name": "Vesak Buddhist Rituals", "category": "Cultural", "description": "Special ceremonial events in May."},
        {"event_name": "Esala Perahera Procession Prep", "category": "Cultural", "description": "July/August. Preparing elephants for the Kandy procession."},
        {"event_name": "National Day Celebration", "category": "Special", "description": "February 4th. Special fruit feasts for the herd."},
        {"event_name": "Mahout Welcome Ceremony", "category": "Cultural", "description": "Traditional welcome for new elephants/mahouts."}
    ]

    # 4. Insert
    print("Seeding Daily Events...")
    for ev in daily_events:
        await Event(**ev).insert()
        
    print("Seeding Seasonal Events...")
    for ev in seasonal_events:
        await Event(**ev).insert()
        
    print("Database seeded with Pinnawala Events!")

if __name__ == "__main__":
    asyncio.run(seed_events())
