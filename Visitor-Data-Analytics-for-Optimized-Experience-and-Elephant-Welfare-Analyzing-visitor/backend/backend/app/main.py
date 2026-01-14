from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routers import visitors, dashboard, admin, events

app = FastAPI(
    title="Pinnawala Visitor Analytics System",
    description="Backend for Visitor Management, Ticketing, and AI Analytics.",
    version="1.0.0"
)

# CORS (Allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def start_db():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Pinnawala Smart Visitor System API is Running!"}

# Include Routers
app.include_router(visitors.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(events.router)
