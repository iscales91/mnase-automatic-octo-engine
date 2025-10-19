#!/usr/bin/env python3
"""
Debug ticket creation issue
"""
import requests
import json

BASE_URL = "https://courtside-22.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

def debug_ticket_creation():
    print("🔍 Debugging Ticket Creation")
    print("=" * 40)
    
    # Login as super admin
    login_data = {
        "email": "mnasebasketball@gmail.com",
        "password": "IzaMina1612"
    }
    
    response = requests.post(f"{API_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
        
    token = response.json()['token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Get existing events
    print("\n1. Getting existing events...")
    response = requests.get(f"{API_URL}/events")
    if response.status_code == 200:
        events = response.json()
        if events:
            event_id = events[0]['id']
            print(f"✅ Using existing event: {event_id}")
        else:
            print("❌ No events found")
            return
    else:
        print(f"❌ Failed to get events: {response.text}")
        return
    
    # Try to create ticket type
    print(f"\n2. Creating ticket type for event {event_id}...")
    ticket_data = {
        "event_id": event_id,
        "name": "Debug Ticket",
        "description": "Debug ticket type",
        "price": 10.00,
        "quantity_available": 50,
        "has_seat_numbers": False
    }
    
    print(f"Request data: {json.dumps(ticket_data, indent=2)}")
    
    response = requests.post(f"{API_URL}/admin/tickets/create-type", json=ticket_data, headers=headers)
    print(f"Response status: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print(f"✅ Success: {response.json()}")
    else:
        print(f"❌ Failed: {response.text}")
        
        # Try to get more details
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print("Could not parse error response as JSON")

if __name__ == "__main__":
    debug_ticket_creation()