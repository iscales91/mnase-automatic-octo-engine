"""
Script to seed calendar events for MNASE Basketball League
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_calendar_events():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing calendar events
    await db.calendar_events.delete_many({})
    
    # Generate dates for upcoming events
    today = datetime.now()
    
    calendar_events = [
        # Programs
        {
            "id": "cal-1",
            "title": "Elite Mammoths Program - Registration Opens",
            "description": "Registration opens for the March-June travel program",
            "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "time": "09:00",
            "location": "Online",
            "type": "program",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-2",
            "title": "Weekend Draft League",
            "description": "Weekly draft-style games every Saturday",
            "date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
            "time": "10:00",
            "location": "Main Gymnasium",
            "type": "program",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-3",
            "title": "Lockdown 3on3 League",
            "description": "Fast-paced 3-on-3 basketball league",
            "date": (today + timedelta(days=8)).strftime("%Y-%m-%d"),
            "time": "14:00",
            "location": "Court A & B",
            "type": "program",
            "created_at": datetime.now().isoformat()
        },
        
        # Tournaments
        {
            "id": "cal-4",
            "title": "Summer Sizzle Circuit - Round 1",
            "description": "First tournament of the Summer Sizzle Circuit series",
            "date": (today + timedelta(days=12)).strftime("%Y-%m-%d"),
            "time": "08:00",
            "location": "Multiple College Facilities",
            "type": "tournament",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-5",
            "title": "Winter Wars Championship",
            "description": "Championship games for Winter Wars Circuit",
            "date": (today + timedelta(days=45)).strftime("%Y-%m-%d"),
            "time": "09:00",
            "location": "State Tournament Venue",
            "type": "tournament",
            "created_at": datetime.now().isoformat()
        },
        
        # Camps
        {
            "id": "cal-6",
            "title": "Youth Basketball Camp - Session 1",
            "description": "5-day intensive camp for ages 10-16",
            "date": (today + timedelta(days=20)).strftime("%Y-%m-%d"),
            "time": "09:00",
            "location": "Training Center",
            "type": "camp",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-7",
            "title": "Elite Skills Camp",
            "description": "3-day advanced camp for competitive players",
            "date": (today + timedelta(days=30)).strftime("%Y-%m-%d"),
            "time": "10:00",
            "location": "Performance Gym",
            "type": "camp",
            "created_at": datetime.now().isoformat()
        },
        
        # Clinics
        {
            "id": "cal-8",
            "title": "Shooting Clinic",
            "description": "Master your shooting form and mechanics",
            "date": (today + timedelta(days=6)).strftime("%Y-%m-%d"),
            "time": "18:00",
            "location": "Court C",
            "type": "clinic",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-9",
            "title": "Defense & Footwork Clinic",
            "description": "Defensive techniques and positioning",
            "date": (today + timedelta(days=14)).strftime("%Y-%m-%d"),
            "time": "18:30",
            "location": "Main Gymnasium",
            "type": "clinic",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-10",
            "title": "Ball Handling Clinic",
            "description": "Advanced dribbling drills and ball control",
            "date": (today + timedelta(days=21)).strftime("%Y-%m-%d"),
            "time": "17:00",
            "location": "Training Center",
            "type": "clinic",
            "created_at": datetime.now().isoformat()
        },
        
        # Workshops
        {
            "id": "cal-11",
            "title": "Mental Toughness Workshop",
            "description": "Develop the mental game for peak performance",
            "date": (today + timedelta(days=15)).strftime("%Y-%m-%d"),
            "time": "14:00",
            "location": "Conference Room A",
            "type": "workshop",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-12",
            "title": "College Recruitment Workshop",
            "description": "Navigate the college recruitment process",
            "date": (today + timedelta(days=35)).strftime("%Y-%m-%d"),
            "time": "13:00",
            "location": "Conference Room B",
            "type": "workshop",
            "created_at": datetime.now().isoformat()
        },
        
        # Events
        {
            "id": "cal-13",
            "title": "MNASE Annual Showcase",
            "description": "Year-end showcase featuring all age divisions",
            "date": (today + timedelta(days=60)).strftime("%Y-%m-%d"),
            "time": "10:00",
            "location": "Main Arena",
            "type": "event",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-14",
            "title": "Family Skills Night",
            "description": "Fun basketball activities for the whole family",
            "date": (today + timedelta(days=25)).strftime("%Y-%m-%d"),
            "time": "18:00",
            "location": "Community Center",
            "type": "event",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "cal-15",
            "title": "Open Gym Session",
            "description": "Free play and practice for all members",
            "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "time": "19:00",
            "location": "Main Gymnasium",
            "type": "event",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    # Insert calendar events
    await db.calendar_events.insert_many(calendar_events)
    print(f"✅ Seeded {len(calendar_events)} calendar events")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_calendar_events())
