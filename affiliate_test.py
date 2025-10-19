#!/usr/bin/env python3
"""
Quick test for affiliate ticket sales system
"""
import requests
import json

BASE_URL = "https://courtside-22.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

def test_affiliate_endpoints():
    print("🎫 Testing Affiliate Ticket Sales System")
    print("=" * 50)
    
    # Test 1: Super Admin Login
    print("\n1. Testing Super Admin Login...")
    login_data = {
        "email": "mnasebasketball@gmail.com",
        "password": "IzaMina1612"
    }
    
    response = requests.post(f"{API_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        data = response.json()
        token = data['token']
        user_id = data['user']['id']
        print(f"✅ Super Admin logged in successfully")
        print(f"   User ID: {user_id}")
        print(f"   Role: {data['user'].get('role', 'Unknown')}")
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test 2: Submit Affiliate Application
        print("\n2. Testing Affiliate Application...")
        app_data = {
            "role_type": "athlete",
            "sport_experience": "5 years playing basketball at college level",
            "social_media_links": ["https://instagram.com/testathlete"],
            "motivation": "I want to promote basketball events and earn commission"
        }
        
        response = requests.post(f"{API_URL}/affiliates/apply", json=app_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            app_result = response.json()
            print(f"✅ Application submitted: {app_result.get('application_id', 'N/A')}")
        else:
            print(f"❌ Application failed: {response.text}")
        
        # Test 3: Get Affiliate Applications (Admin)
        print("\n3. Testing Get Affiliate Applications...")
        response = requests.get(f"{API_URL}/admin/affiliates/applications", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            apps = response.json().get('applications', [])
            print(f"✅ Found {len(apps)} applications")
        else:
            print(f"❌ Failed to get applications: {response.text}")
        
        # Test 4: Create Event for Tickets
        print("\n4. Testing Create Event...")
        event_data = {
            "title": "Test Basketball Tournament",
            "description": "Test event for affiliate ticket sales",
            "date": "2024-12-31",
            "time": "18:00",
            "location": "Test Arena",
            "capacity": 100,
            "price": 25.00,
            "category": "Tournament"
        }
        
        response = requests.post(f"{API_URL}/events", json=event_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            event = response.json()
            event_id = event.get('id')
            print(f"✅ Event created: {event_id}")
            
            # Test 5: Create Ticket Type
            print("\n5. Testing Create Ticket Type...")
            ticket_data = {
                "event_id": event_id,
                "name": "General Admission",
                "description": "Standard entry ticket",
                "price": 25.00,
                "quantity_available": 100,
                "has_seat_numbers": False
            }
            
            response = requests.post(f"{API_URL}/admin/tickets/create-type", json=ticket_data, headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                ticket_type = response.json().get('ticket_type', {})
                ticket_type_id = ticket_type.get('id')
                print(f"✅ Ticket type created: {ticket_type_id}")
                
                # Test 6: Get Event Tickets
                print("\n6. Testing Get Event Tickets...")
                response = requests.get(f"{API_URL}/tickets/event/{event_id}")
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    tickets = response.json().get('ticket_types', [])
                    print(f"✅ Found {len(tickets)} ticket types")
                else:
                    print(f"❌ Failed to get tickets: {response.text}")
                
                # Test 7: Purchase Ticket
                print("\n7. Testing Ticket Purchase...")
                purchase_data = {
                    "event_id": event_id,
                    "ticket_type_id": ticket_type_id,
                    "quantity": 1,
                    "buyer_name": "Test Buyer",
                    "buyer_email": "test.buyer@example.com",
                    "origin_url": BASE_URL
                }
                
                response = requests.post(f"{API_URL}/tickets/purchase", json=purchase_data)
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    purchase = response.json()
                    session_id = purchase.get('session_id')
                    print(f"✅ Purchase session created: {session_id}")
                    print(f"   Checkout URL: {purchase.get('checkout_url', 'N/A')}")
                else:
                    print(f"❌ Purchase failed: {response.text}")
            else:
                print(f"❌ Ticket type creation failed: {response.text}")
        else:
            print(f"❌ Event creation failed: {response.text}")
        
        # Test 8: Get Sales Statistics
        print("\n8. Testing Sales Statistics...")
        response = requests.get(f"{API_URL}/admin/tickets/sales-stats", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Sales stats retrieved")
            print(f"   Total sales: {stats.get('total_sales', 0)}")
            print(f"   Total revenue: ${stats.get('total_revenue', 0)}")
        else:
            print(f"❌ Stats failed: {response.text}")
            
    else:
        print(f"❌ Super Admin login failed: {response.text}")

if __name__ == "__main__":
    test_affiliate_endpoints()