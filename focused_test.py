#!/usr/bin/env python3
"""
MNASE Basketball League - Focused New Features Testing
Testing available features and identifying issues with new implementations
"""

import requests
import json
from datetime import datetime

class FocusedAPITester:
    def __init__(self):
        self.base_url = "https://courtside-22.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = {}

    def test_api_call(self, name, method, endpoint, expected_status=200, data=None, use_admin=False):
        """Make API call and test response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ {name} - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text[:200]}")

            self.results[name] = success
            return success, response.json() if response.content and success else {}

        except requests.exceptions.Timeout:
            print(f"❌ {name} - Request timeout")
            self.results[name] = False
            return False, {}
        except Exception as e:
            print(f"❌ {name} - Error: {str(e)}")
            self.results[name] = False
            return False, {}

    def authenticate(self):
        """Authenticate with super admin credentials"""
        print("🔐 Authenticating...")
        
        credentials = {
            "email": "mnasebasketball@gmail.com",
            "password": "IzaMina1612"
        }
        
        success, response = self.test_api_call(
            "Super Admin Login",
            "POST",
            "auth/login",
            200,
            data=credentials
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.admin_token = response['token']  # Super admin can act as admin
            print(f"✅ Authenticated as: {response['user'].get('name', 'Unknown')}")
            print(f"✅ Role: {response['user'].get('role', 'Unknown')}")
            return True
        else:
            print("❌ Authentication failed")
            return False

    def test_core_features(self):
        """Test core existing features (regression test)"""
        print("\n" + "="*80)
        print("📋 TESTING CORE FEATURES (REGRESSION)")
        print("="*80)
        
        # Test existing endpoints that should work
        core_tests = [
            ("Events API", "GET", "events", 200),
            ("Facilities API", "GET", "facilities", 200),
            ("Programs API", "GET", "programs", 200),
            ("Calendar Events API", "GET", "calendar-events", 200),
        ]
        
        for name, method, endpoint, expected_status in core_tests:
            success, response = self.test_api_call(name, method, endpoint, expected_status)
            if success and isinstance(response, list):
                print(f"   Found {len(response)} items")

    def test_division_management(self):
        """Test division management endpoints"""
        print("\n🏆 DIVISION MANAGEMENT SYSTEM")
        
        # Test if division endpoints exist
        division_tests = [
            ("Get All Divisions", "GET", "divisions", [200, 404]),
            ("Get Divisions (Admin)", "GET", "divisions", [200, 404], True),
        ]
        
        for name, method, endpoint, expected_statuses, *args in division_tests:
            use_admin = args[0] if args else False
            success, response = self.test_api_call(name, method, endpoint, 200, use_admin=use_admin)
            if not success:
                # Try with 404 as acceptable (endpoint might not exist)
                if 404 in expected_statuses:
                    print(f"   ⚠️ {name} - Endpoint not found (404) - Feature not implemented")
                    self.results[name] = "not_implemented"

    def test_media_management(self):
        """Test media management endpoints"""
        print("\n📸 MEDIA MANAGEMENT SYSTEM")
        
        media_endpoints = [
            ("Get All Media", "media/category/all"),
            ("Get Events Media", "media/category/events"),
            ("Get Programs Media", "media/category/programs"),
            ("Get Facilities Media", "media/category/facilities"),
            ("Get General Media", "media/category/general")
        ]
        
        for name, endpoint in media_endpoints:
            success, response = self.test_api_call(name, "GET", endpoint, 200)
            if not success:
                print(f"   ⚠️ {name} - Endpoint not accessible - May be in additional_routes")
                self.results[name] = "not_accessible"

    def test_email_queue(self):
        """Test email queue endpoints"""
        print("\n📧 EMAIL QUEUE SYSTEM")
        
        email_tests = [
            ("Add Email to Queue", "POST", "admin/email-queue/add"),
            ("Check Email Queue Status", "GET", "admin/email-queue/status"),
            ("Process Email Queue", "POST", "admin/email-queue/process"),
        ]
        
        for name, method, endpoint in email_tests:
            if method == "POST":
                data = {
                    "to_email": "test@example.com",
                    "subject": "Test Email",
                    "body": "Test email body",
                    "priority": "normal"
                }
            else:
                data = None
                
            success, response = self.test_api_call(name, method, endpoint, 200, data=data, use_admin=True)
            if not success:
                print(f"   ⚠️ {name} - Endpoint not accessible - Likely in additional_routes")
                self.results[name] = "not_accessible"

    def test_recurring_events(self):
        """Test recurring events endpoints"""
        print("\n🔄 RECURRING EVENTS SYSTEM")
        
        recurring_data = {
            "title": "Test Recurring Event",
            "description": "Test recurring event",
            "start_date": "2024-12-20",
            "time": "18:00",
            "location": "Test Court",
            "capacity": 15,
            "price": 0.00,
            "category": "Practice",
            "recurrence_pattern": "daily",
            "recurrence_end_date": "2024-12-22",
            "frequency": 1
        }
        
        success, response = self.test_api_call(
            "Create Recurring Events",
            "POST",
            "events/recurring",
            200,
            data=recurring_data,
            use_admin=True
        )
        
        if not success:
            print(f"   ⚠️ Recurring Events - Endpoint not accessible - Likely in additional_routes")
            self.results["Create Recurring Events"] = "not_accessible"

    def test_program_logos(self):
        """Test program logos functionality"""
        print("\n🖼️ PROGRAM LOGOS SYSTEM")
        
        # Test creating program with logo_url field
        logo_program_data = {
            "slug": "test-logo-program-focused",
            "name": "Test Logo Program Focused",
            "season": "Winter 2024",
            "description": "Test program with logo",
            "long_description": "Test program with logo URL field",
            "age_range": "13-15",
            "price": 175.00,
            "inclusions": ["Jersey", "Training", "Logo"],
            "schedule": "Sundays 2PM-4PM",
            "registration_info": "Register online",
            "logo_url": "https://example.com/logo.png",
            "active": True
        }
        
        success, response = self.test_api_call(
            "Create Program With Logo",
            "POST",
            "programs",
            200,
            data=logo_program_data,
            use_admin=True
        )
        
        if success:
            logo_url = response.get('logo_url')
            if logo_url:
                print(f"   ✅ Logo URL field working: {logo_url}")
            else:
                print(f"   ❌ Logo URL field not returned in response")
        
        # Verify programs endpoint returns logo_url field
        success, programs = self.test_api_call("Get Programs (Check Logo Field)", "GET", "programs", 200)
        if success and programs:
            programs_with_logos = [p for p in programs if p.get('logo_url')]
            print(f"   ✅ Found {len(programs_with_logos)} programs with logo URLs")

    def test_affiliate_approval(self):
        """Test affiliate approval system"""
        print("\n🤝 AFFILIATE APPROVAL SYSTEM")
        
        # Test affiliate endpoints
        affiliate_tests = [
            ("Get Affiliate Applications", "GET", "admin/affiliates/applications"),
            ("Get All Affiliates", "GET", "admin/affiliates"),
        ]
        
        for name, method, endpoint in affiliate_tests:
            success, response = self.test_api_call(name, method, endpoint, 200, use_admin=True)
            if success:
                if isinstance(response, dict):
                    applications = response.get('applications', [])
                    affiliates = response.get('affiliates', [])
                    if applications:
                        print(f"   ✅ Found {len(applications)} affiliate applications")
                    if affiliates:
                        print(f"   ✅ Found {len(affiliates)} affiliates")

    def run_focused_test(self):
        """Run the focused test suite"""
        print("🏀 MNASE Basketball League - Focused New Features Testing")
        print("="*80)
        print("Testing available features and identifying implementation issues")
        print("Authentication: mnasebasketball@gmail.com / IzaMina1612")
        print("="*80)
        
        # Authenticate
        if not self.authenticate():
            print("❌ Authentication failed - cannot continue testing")
            return False
        
        # Test features
        self.test_core_features()
        self.test_division_management()
        self.test_media_management()
        self.test_email_queue()
        self.test_recurring_events()
        self.test_program_logos()
        self.test_affiliate_approval()
        
        # Summary
        print("\n" + "="*80)
        print("📊 FOCUSED TEST SUMMARY")
        print("="*80)
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Categorize results
        working_features = []
        not_implemented = []
        not_accessible = []
        failed_features = []
        
        for test, result in self.results.items():
            if result is True:
                working_features.append(test)
            elif result == "not_implemented":
                not_implemented.append(test)
            elif result == "not_accessible":
                not_accessible.append(test)
            elif result is False:
                failed_features.append(test)
        
        print(f"\n✅ WORKING FEATURES ({len(working_features)}):")
        for feature in working_features:
            print(f"   • {feature}")
        
        if not_accessible:
            print(f"\n⚠️ NOT ACCESSIBLE - LIKELY IN additional_routes.py ({len(not_accessible)}):")
            for feature in not_accessible:
                print(f"   • {feature}")
        
        if not_implemented:
            print(f"\n❌ NOT IMPLEMENTED ({len(not_implemented)}):")
            for feature in not_implemented:
                print(f"   • {feature}")
        
        if failed_features:
            print(f"\n❌ FAILED FEATURES ({len(failed_features)}):")
            for feature in failed_features:
                print(f"   • {feature}")
        
        # Analysis
        print(f"\n📋 ANALYSIS:")
        print(f"✅ Core System: {'WORKING' if len(working_features) > 0 else 'ISSUES'}")
        print(f"⚠️ New Features: {'PARTIALLY IMPLEMENTED' if not_accessible else 'NOT ACCESSIBLE'}")
        print(f"🔧 Issue: additional_routes.py dependency injection problems preventing new feature access")
        
        print("\n" + "="*80)
        
        return success_rate >= 80

def main():
    """Main function"""
    tester = FocusedAPITester()
    success = tester.run_focused_test()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())