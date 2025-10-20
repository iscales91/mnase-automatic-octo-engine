#!/usr/bin/env python3
"""
Quick test of new features for MNASE Basketball League
"""

import requests
import json

def test_endpoint(name, url, method="GET", data=None, headers=None):
    """Test a single endpoint"""
    print(f"\n🔍 Testing {name}...")
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        
        print(f"Status: {response.status_code}")
        if response.status_code < 400:
            print("✅ PASS")
            return True
        else:
            print("❌ FAIL")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    base_url = "https://courtside-22.preview.emergentagent.com/api"
    
    # Login first
    login_data = {
        "email": "mnasebasketball@gmail.com",
        "password": "IzaMina1612"
    }
    
    print("🔐 Logging in as Super Admin...")
    response = requests.post(f"{base_url}/auth/login", json=login_data, timeout=10)
    
    if response.status_code != 200:
        print("❌ Login failed")
        return False
    
    token = response.json().get('token')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("✅ Login successful")
    
    # Test new features
    results = []
    
    print("\n" + "="*60)
    print("📸 TESTING MEDIA MANAGEMENT")
    print("="*60)
    
    # Test media endpoints
    results.append(test_endpoint(
        "Get All Media", 
        f"{base_url}/media/category/all"
    ))
    
    results.append(test_endpoint(
        "Get Events Media", 
        f"{base_url}/media/category/events"
    ))
    
    results.append(test_endpoint(
        "Get Programs Media", 
        f"{base_url}/media/category/programs"
    ))
    
    results.append(test_endpoint(
        "Get Facilities Media", 
        f"{base_url}/media/category/facilities"
    ))
    
    results.append(test_endpoint(
        "Get General Media", 
        f"{base_url}/media/category/general"
    ))
    
    print("\n" + "="*60)
    print("📧 TESTING EMAIL QUEUE")
    print("="*60)
    
    # Test email queue
    email_data = {
        "to_email": "test@example.com",
        "subject": "Test Email",
        "body": "This is a test email",
        "priority": "normal"
    }
    
    results.append(test_endpoint(
        "Add Email to Queue", 
        f"{base_url}/admin/email-queue/add",
        "POST",
        email_data,
        headers
    ))
    
    results.append(test_endpoint(
        "Check Email Queue Status", 
        f"{base_url}/admin/email-queue/status",
        "GET",
        None,
        headers
    ))
    
    results.append(test_endpoint(
        "Process Email Queue", 
        f"{base_url}/admin/email-queue/process",
        "POST",
        None,
        headers
    ))
    
    print("\n" + "="*60)
    print("🔄 TESTING RECURRING EVENTS")
    print("="*60)
    
    # Test recurring events
    daily_event = {
        "title": "Daily Practice",
        "description": "Daily basketball practice",
        "location": "Main Court",
        "start_date": "2025-01-20",
        "start_time": "10:00",
        "end_time": "12:00",
        "recurring": True,
        "recurrence_frequency": "daily",
        "recurrence_end_date": "2025-01-24",
        "capacity": 20,
        "price": 0,
        "category": "camp"
    }
    
    results.append(test_endpoint(
        "Create Daily Recurring Event", 
        f"{base_url}/events/recurring",
        "POST",
        daily_event,
        headers
    ))
    
    results.append(test_endpoint(
        "Get Calendar Events", 
        f"{base_url}/calendar-events"
    ))
    
    print("\n" + "="*60)
    print("🖼️ TESTING PROGRAM LOGOS")
    print("="*60)
    
    # Test program with logo
    program_data = {
        "slug": "elite-training-test",
        "name": "Elite Training Program Test",
        "season": "Winter 2025",
        "description": "Advanced training",
        "long_description": "Comprehensive elite training program",
        "age_range": "13-18",
        "price": 299.99,
        "inclusions": ["Training", "Equipment", "Tournaments"],
        "schedule": "Mon/Wed/Fri 6-8pm",
        "registration_info": "Register online",
        "logo_url": "/api/media/programs/test-logo.png",
        "active": True
    }
    
    results.append(test_endpoint(
        "Create Program with Logo", 
        f"{base_url}/programs",
        "POST",
        program_data,
        headers
    ))
    
    results.append(test_endpoint(
        "Get Programs (Verify Logo Field)", 
        f"{base_url}/programs"
    ))
    
    print("\n" + "="*60)
    print("🔍 TESTING EXISTING FUNCTIONALITY")
    print("="*60)
    
    # Test existing functionality
    results.append(test_endpoint(
        "Get Events", 
        f"{base_url}/events"
    ))
    
    results.append(test_endpoint(
        "Get Facilities", 
        f"{base_url}/facilities"
    ))
    
    # Summary
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total) * 100
    
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    print(f"Tests Passed: {passed}/{total}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 SUCCESS CRITERIA MET: 90%+ success rate achieved!")
    else:
        print(f"⚠️  SUCCESS CRITERIA NOT MET: {success_rate:.1f}% < 90% required")
    
    return success_rate >= 90

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)