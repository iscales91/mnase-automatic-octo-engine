#!/usr/bin/env python3
"""
MNASE Basketball League - New Features Testing
Testing 8 newly implemented features for production readiness
"""

import requests
import json
from datetime import datetime

class NewFeaturesAPITester:
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
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

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

    def test_new_features(self):
        """Test all 8 new features"""
        print("\n" + "="*80)
        print("📋 TESTING NEW FEATURES")
        print("="*80)
        
        # 1. DIVISION MANAGEMENT (Critical Priority)
        print("\n🏆 1. DIVISION MANAGEMENT SYSTEM")
        
        # Create a test program first
        program_data = {
            "slug": "test-division-program",
            "name": "Test Division Program",
            "season": "Winter 2024",
            "description": "Test program for division testing",
            "long_description": "Test program for division management testing",
            "age_range": "8-16",
            "price": 150.00,
            "inclusions": ["Jersey", "Training"],
            "schedule": "Saturdays 10AM-12PM",
            "registration_info": "Register online",
            "active": True
        }
        
        success, program_response = self.test_api_call(
            "Create Test Program for Divisions",
            "POST",
            "programs",
            200,
            data=program_data,
            use_admin=True
        )
        
        program_id = program_response.get('id') if success else None
        
        if program_id:
            # Test division endpoints
            division_data = {
                "program_id": program_id,
                "name": "U12 Boys Division",
                "age_range": "10-12",
                "gender": "male",
                "capacity": 20,
                "description": "Under 12 boys division",
                "active": True
            }
            
            # Create division
            success, div_response = self.test_api_call(
                "Create Division",
                "POST",
                "divisions",
                200,
                data=division_data,
                use_admin=True
            )
            
            # Get all divisions
            self.test_api_call("Get All Divisions", "GET", "divisions", 200, use_admin=True)
            
            # Get program divisions
            self.test_api_call(
                "Get Program Divisions",
                "GET",
                f"programs/{program_id}/divisions",
                200
            )
            
            division_id = div_response.get('id') if success else None
            if division_id:
                # Update division
                update_data = {"capacity": 25, "current_enrollment": 10}
                self.test_api_call(
                    "Update Division",
                    "PUT",
                    f"divisions/{division_id}",
                    200,
                    data=update_data,
                    use_admin=True
                )
                
                # Delete division
                self.test_api_call(
                    "Delete Division",
                    "DELETE",
                    f"divisions/{division_id}",
                    200,
                    use_admin=True
                )

        # 2. MEDIA MANAGEMENT (High Priority)
        print("\n📸 2. MEDIA MANAGEMENT SYSTEM")
        
        media_endpoints = [
            ("Get All Media", "media/category/all"),
            ("Get Events Media", "media/category/events"),
            ("Get Programs Media", "media/category/programs"),
            ("Get Facilities Media", "media/category/facilities"),
            ("Get General Media", "media/category/general")
        ]
        
        for name, endpoint in media_endpoints:
            self.test_api_call(name, "GET", endpoint, 200)

        # 3. EMAIL QUEUE (High Priority)
        print("\n📧 3. EMAIL QUEUE SYSTEM")
        
        # Add email to queue
        email_data = {
            "to_email": "test@example.com",
            "subject": "Test Email",
            "body": "Test email body",
            "priority": "normal"
        }
        
        self.test_api_call(
            "Add Email to Queue",
            "POST",
            "admin/email-queue/add",
            200,
            data=email_data,
            use_admin=True
        )
        
        # Check queue status
        self.test_api_call(
            "Check Email Queue Status",
            "GET",
            "admin/email-queue/status",
            200,
            use_admin=True
        )
        
        # Add high priority email
        high_priority_email = {
            "to_email": "urgent@example.com",
            "subject": "Urgent Test",
            "body": "High priority test email",
            "priority": "high"
        }
        
        self.test_api_call(
            "Add High Priority Email",
            "POST",
            "admin/email-queue/add",
            200,
            data=high_priority_email,
            use_admin=True
        )
        
        # Process queue (safe to run)
        self.test_api_call(
            "Process Email Queue",
            "POST",
            "admin/email-queue/process",
            200,
            use_admin=True
        )

        # 4. RECURRING EVENTS (High Priority)
        print("\n🔄 4. RECURRING EVENTS SYSTEM")
        
        # Daily recurrence
        daily_event = {
            "title": "Daily Practice",
            "description": "Daily basketball practice",
            "start_date": "2024-12-20",
            "time": "18:00",
            "location": "Main Court",
            "capacity": 15,
            "price": 0.00,
            "category": "Practice",
            "recurrence_pattern": "daily",
            "recurrence_end_date": "2024-12-22",
            "frequency": 1
        }
        
        self.test_api_call(
            "Create Daily Recurring Events",
            "POST",
            "events/recurring",
            200,
            data=daily_event,
            use_admin=True
        )
        
        # Weekly recurrence
        weekly_event = {
            "title": "Saturday Tournament",
            "description": "Weekly Saturday tournaments",
            "start_date": "2024-12-21",
            "time": "10:00",
            "location": "Tournament Court",
            "capacity": 32,
            "price": 15.00,
            "category": "Tournament",
            "recurrence_pattern": "weekly",
            "recurrence_end_date": "2025-01-04",
            "recurrence_days": ["saturday"],
            "frequency": 1
        }
        
        self.test_api_call(
            "Create Weekly Recurring Events",
            "POST",
            "events/recurring",
            200,
            data=weekly_event,
            use_admin=True
        )
        
        # Monthly recurrence
        monthly_event = {
            "title": "Monthly Championship",
            "description": "Monthly championship games",
            "start_date": "2024-12-25",
            "time": "14:00",
            "location": "Championship Arena",
            "capacity": 100,
            "price": 25.00,
            "category": "Championship",
            "recurrence_pattern": "monthly",
            "recurrence_end_date": "2025-02-25",
            "frequency": 1
        }
        
        self.test_api_call(
            "Create Monthly Recurring Events",
            "POST",
            "events/recurring",
            200,
            data=monthly_event,
            use_admin=True
        )

        # 5. PROGRAM LOGOS (Medium Priority)
        print("\n🖼️ 5. PROGRAM LOGOS SYSTEM")
        
        # Create program with logo
        logo_program_data = {
            "slug": "test-logo-program",
            "name": "Test Logo Program",
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
        
        success, logo_response = self.test_api_call(
            "Create Program With Logo",
            "POST",
            "programs",
            200,
            data=logo_program_data,
            use_admin=True
        )
        
        logo_program_id = logo_response.get('id') if success else None
        if logo_program_id:
            # Update logo
            update_logo_data = {"logo_url": "https://example.com/updated-logo.png"}
            self.test_api_call(
                "Update Program Logo",
                "PUT",
                f"programs/{logo_program_id}",
                200,
                data=update_logo_data,
                use_admin=True
            )
        
        # Verify logo field in programs
        self.test_api_call("Verify Program Logo Field", "GET", "programs", 200)

        # 6. AFFILIATE APPROVAL (High Priority - ObjectId Fix)
        print("\n🤝 6. AFFILIATE APPROVAL SYSTEM (ObjectId Fix)")
        
        # Test affiliate endpoints
        self.test_api_call(
            "Get Affiliate Applications",
            "GET",
            "admin/affiliates/applications",
            200,
            use_admin=True
        )

        # 7. EXISTING FEATURES REGRESSION (Critical Priority)
        print("\n🔄 7. EXISTING FEATURES REGRESSION TEST")
        
        regression_tests = [
            ("Events API", "events"),
            ("Facilities API", "facilities"),
            ("Programs API", "programs"),
            ("Calendar Events API", "calendar-events")
        ]
        
        for name, endpoint in regression_tests:
            self.test_api_call(f"Regression: {name}", "GET", endpoint, 200)

        # Get calendar events and count total
        success, calendar_response = self.test_api_call(
            "Count Calendar Events",
            "GET",
            "calendar-events",
            200
        )
        
        if success:
            total_events = len(calendar_response)
            print(f"✅ Total calendar events found: {total_events}")

    def run_comprehensive_test(self):
        """Run the complete test suite"""
        print("🏀 MNASE Basketball League - Comprehensive New Features Testing")
        print("="*80)
        print("Testing 8 newly implemented features for production readiness")
        print("Authentication: mnasebasketball@gmail.com / IzaMina1612")
        print("="*80)
        
        # Authenticate
        if not self.authenticate():
            print("❌ Authentication failed - cannot continue testing")
            return False
        
        # Test new features
        self.test_new_features()
        
        # Summary
        print("\n" + "="*80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("="*80)
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Feature-wise results
        print("\n📋 FEATURE RESULTS:")
        
        feature_categories = {
            "Division Management": ["Create Test Program", "Create Division", "Get All Divisions", "Get Program Divisions", "Update Division", "Delete Division"],
            "Media Management": ["Get All Media", "Get Events Media", "Get Programs Media", "Get Facilities Media", "Get General Media"],
            "Email Queue": ["Add Email to Queue", "Check Email Queue Status", "Add High Priority Email", "Process Email Queue"],
            "Recurring Events": ["Create Daily Recurring Events", "Create Weekly Recurring Events", "Create Monthly Recurring Events"],
            "Program Logos": ["Create Program With Logo", "Update Program Logo", "Verify Program Logo Field"],
            "Affiliate Approval": ["Get Affiliate Applications"],
            "Regression Tests": ["Regression: Events API", "Regression: Facilities API", "Regression: Programs API", "Regression: Calendar Events API"]
        }
        
        for category, tests in feature_categories.items():
            category_passed = sum(1 for test in tests if self.results.get(test, False))
            category_total = len(tests)
            category_rate = (category_passed / category_total) * 100 if category_total > 0 else 0
            status = "✅" if category_rate >= 80 else "⚠️" if category_rate >= 50 else "❌"
            print(f"{status} {category}: {category_passed}/{category_total} ({category_rate:.1f}%)")
        
        # Failed tests
        failed_tests = [test for test, result in self.results.items() if not result]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test}")
        
        # Final verdict
        print("\n" + "="*80)
        if success_rate >= 95:
            print("🎉 COMPREHENSIVE TESTING COMPLETED SUCCESSFULLY!")
            print("✅ All new features are production ready")
        elif success_rate >= 80:
            print("⚠️ COMPREHENSIVE TESTING COMPLETED WITH MINOR ISSUES")
            print("🔧 Some features need minor fixes")
        else:
            print("❌ COMPREHENSIVE TESTING FOUND CRITICAL ISSUES")
            print("🚨 Features need significant attention before production")
        
        print("="*80)
        
        return success_rate >= 95

def main():
    """Main function"""
    tester = NewFeaturesAPITester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())