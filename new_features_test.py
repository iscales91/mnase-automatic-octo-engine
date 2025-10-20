#!/usr/bin/env python3
"""
MNASE Basketball League - New Features Testing
Testing the 5 new features from the review request:
1. Affiliate Approval Fix (ObjectId conversion)
2. Media Management System
3. Email Queue System
4. Recurring Events System
5. Program Logos Feature
"""

import requests
import json
from datetime import datetime

class NewFeaturesAPITester:
    def __init__(self, base_url="https://courtside-22.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.super_admin_token = None
        self.super_admin_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_event_id = None
        self.program_with_logo_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, use_super_admin=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_super_admin and self.super_admin_token:
            headers['Authorization'] = f'Bearer {self.super_admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")

            return success, response.json() if response.content and success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_super_admin_login(self):
        """Test super admin login with provided credentials"""
        super_admin_credentials = {
            "email": "mnasebasketball@gmail.com",
            "password": "IzaMina1612"
        }
        
        success, response = self.run_test(
            "Super Admin Login",
            "POST",
            "auth/login",
            200,
            data=super_admin_credentials
        )
        
        if success and 'token' in response:
            self.super_admin_token = response['token']
            self.super_admin_user_id = response['user']['id']
            print(f"✅ Super Admin logged in with ID: {self.super_admin_user_id}")
            return True
        return False

    def test_affiliate_approval_fix(self):
        """Test 1: Affiliate Approval Fix - ObjectId conversion"""
        print("\n" + "="*60)
        print("🔧 TESTING AFFILIATE APPROVAL FIX (ObjectId Conversion)")
        print("="*60)
        
        # Create a new user for affiliate testing
        test_user_data = {
            "email": f"affiliate_test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Affiliate Test User",
            "date_of_birth": "1995-01-01",
            "phone": "555-123-9999"
        }
        
        success, response = self.run_test(
            "Create User for Affiliate Testing",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if not success:
            print("❌ Failed to create test user for affiliate testing")
            return False
            
        test_token = response.get('token')
        test_user_id = response.get('user', {}).get('id')
        
        # Submit affiliate application as new user
        application_data = {
            "role_type": "athlete",
            "sport_experience": "5 years playing basketball at high school level",
            "social_media_links": ["https://instagram.com/testuser"],
            "motivation": "Want to promote basketball events and earn commission"
        }
        
        # Use test user token for application
        original_token = self.super_admin_token
        self.super_admin_token = test_token
        
        success, response = self.run_test(
            "Submit Affiliate Application (New User)",
            "POST",
            "affiliates/apply",
            200,
            data=application_data,
            use_super_admin=True
        )
        
        # Restore super admin token
        self.super_admin_token = original_token
        
        if not success:
            print("❌ Failed to submit affiliate application")
            return False
            
        # Get applications as admin
        success, response = self.run_test(
            "Get Affiliate Applications (Admin) - ObjectId Fix Test",
            "GET",
            "admin/affiliates/applications",
            200,
            use_super_admin=True
        )
        
        if not success:
            print("❌ Failed to get affiliate applications")
            return False
            
        applications = response.get('applications', [])
        if not applications:
            print("❌ No applications found")
            return False
            
        # Find the application we just created
        target_app = None
        for app in applications:
            if app.get('user_id') == test_user_id:
                target_app = app
                break
                
        if not target_app:
            print("❌ Could not find the test application")
            return False
            
        # Test approval with ObjectId conversion fix
        approval_data = {
            "application_id": target_app.get('_id') or target_app.get('id'),
            "admin_id": self.super_admin_user_id
        }
        
        success, response = self.run_test(
            "Approve Affiliate Application - ObjectId Fix Test",
            "POST",
            "admin/affiliates/approve",
            200,
            data=approval_data,
            use_super_admin=True
        )
        
        if success:
            print("✅ ObjectId conversion fix working - affiliate approval successful")
            affiliate_id = response.get('affiliate_id')
            referral_code = response.get('referral_code')
            print(f"✅ Created affiliate ID: {affiliate_id}")
            print(f"✅ Generated referral code: {referral_code}")
        
        return success

    def test_media_management_endpoints(self):
        """Test 2: Media Management System"""
        print("\n" + "="*60)
        print("📸 TESTING MEDIA MANAGEMENT SYSTEM")
        print("="*60)
        
        # Test 1: Get all media (should be empty initially)
        success1, response1 = self.run_test(
            "Get All Media",
            "GET",
            "media/category/all",
            200
        )
        
        if success1:
            media_count = len(response1.get('media', []))
            print(f"✅ Found {media_count} media items")
        
        # Test 2: Get media by category - events
        success2, response2 = self.run_test(
            "Get Events Media",
            "GET",
            "media/category/events",
            200
        )
        
        # Test 3: Get media by category - programs
        success3, response3 = self.run_test(
            "Get Programs Media",
            "GET",
            "media/category/programs",
            200
        )
        
        # Test 4: Get media by category - facilities
        success4, response4 = self.run_test(
            "Get Facilities Media",
            "GET",
            "media/category/facilities",
            200
        )
        
        # Test 5: Get media by category - general
        success5, response5 = self.run_test(
            "Get General Media",
            "GET",
            "media/category/general",
            200
        )
        
        print("ℹ️  Note: File upload testing requires multipart form data")
        print("ℹ️  The upload endpoints are available but need frontend testing")
        
        return success1 and success2 and success3 and success4 and success5

    def test_email_queue_system(self):
        """Test 3: Email Queue Management System"""
        print("\n" + "="*60)
        print("📧 TESTING EMAIL QUEUE SYSTEM")
        print("="*60)
        
        # Test 1: Add test email to queue
        email_data = {
            "to_email": "test@example.com",
            "subject": "Test Email",
            "body": "This is a test email",
            "priority": "normal"
        }
        
        success1, response1 = self.run_test(
            "Add Email to Queue",
            "POST",
            "admin/email-queue/add",
            200,
            data=email_data,
            use_super_admin=True
        )
        
        if success1:
            print(f"✅ Email queued with ID: {response1.get('queue_id', 'Unknown')}")
        
        # Test 2: Check queue status
        success2, response2 = self.run_test(
            "Check Email Queue Status",
            "GET",
            "admin/email-queue/status",
            200,
            use_super_admin=True
        )
        
        if success2:
            status = response2
            print(f"✅ Queue status - Pending: {status.get('pending', 0)}")
            print(f"✅ Queue status - Sent today: {status.get('sent_today', 0)}")
            print(f"✅ Queue status - Failed: {status.get('failed', 0)}")
            print(f"✅ Rate limit: {status.get('rate_limit', 0)} emails/day")
        
        # Test 3: Add high priority email
        high_priority_email = {
            "to_email": "priority@example.com",
            "subject": "High Priority Test Email",
            "body": "This is a high priority test email",
            "priority": "high"
        }
        
        success3, response3 = self.run_test(
            "Add High Priority Email to Queue",
            "POST",
            "admin/email-queue/add",
            200,
            data=high_priority_email,
            use_super_admin=True
        )
        
        # Test 4: Check queue status again (should have 2 pending)
        success4, response4 = self.run_test(
            "Check Queue Status After Adding High Priority",
            "GET",
            "admin/email-queue/status",
            200,
            use_super_admin=True
        )
        
        if success4:
            pending_count = response4.get('pending', 0)
            print(f"✅ Queue now has {pending_count} pending emails")
        
        # Test 5: Process queue
        success5, response5 = self.run_test(
            "Process Email Queue",
            "POST",
            "admin/email-queue/process",
            200,
            use_super_admin=True
        )
        
        if success5:
            processed = response5.get('processed', 0)
            failed = response5.get('failed', 0)
            print(f"✅ Queue processing - Processed: {processed}, Failed: {failed}")
        
        # Test 6: Check final queue status
        success6, response6 = self.run_test(
            "Check Final Queue Status",
            "GET",
            "admin/email-queue/status",
            200,
            use_super_admin=True
        )
        
        if success6:
            final_status = response6
            print(f"✅ Final status - Sent today: {final_status.get('sent_today', 0)}")
        
        return success1 and success2 and success3 and success4 and success5 and success6

    def test_recurring_events_system(self):
        """Test 4: Recurring Event Creation System"""
        print("\n" + "="*60)
        print("🔄 TESTING RECURRING EVENTS SYSTEM")
        print("="*60)
        
        # Test 1: Create daily recurring event
        daily_event_data = {
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
        
        success1, response1 = self.run_test(
            "Create Daily Recurring Event",
            "POST",
            "events/recurring",
            200,
            data=daily_event_data,
            use_super_admin=True
        )
        
        if success1:
            count = response1.get('count', 0)
            print(f"✅ Created {count} daily event instances (expected: 5 for Jan 20-24)")
        
        # Test 2: Create weekly recurring event
        weekly_event_data = {
            "title": "Weekend Tournament",
            "description": "Saturday tournament",
            "location": "Arena",
            "start_date": "2025-01-25",  # Saturday
            "start_time": "09:00",
            "end_time": "17:00",
            "recurring": True,
            "recurrence_frequency": "weekly",
            "recurrence_days": ["Saturday"],
            "recurrence_end_date": "2025-02-22",
            "capacity": 50,
            "price": 25,
            "category": "tournament"
        }
        
        success2, response2 = self.run_test(
            "Create Weekly Recurring Event",
            "POST",
            "events/recurring",
            200,
            data=weekly_event_data,
            use_super_admin=True
        )
        
        if success2:
            count = response2.get('count', 0)
            print(f"✅ Created {count} weekly event instances (expected: 5 Saturdays)")
        
        # Test 3: Verify all recurring instances created
        success3, response3 = self.run_test(
            "Verify Recurring Events in Calendar",
            "GET",
            "calendar-events",
            200
        )
        
        if success3:
            total_events = len(response3)
            print(f"✅ Total calendar events now: {total_events}")
            
            # Count recurring events
            recurring_count = sum(1 for event in response3 if event.get('is_recurring'))
            print(f"✅ Recurring events created: {recurring_count}")
        
        # Test 4: Create single (non-recurring) event for comparison
        single_event_data = {
            "title": "Single Event Test",
            "description": "Non-recurring event",
            "location": "Test Court",
            "start_date": "2025-03-01",
            "start_time": "14:00",
            "end_time": "16:00",
            "recurring": False,
            "capacity": 30,
            "price": 15,
            "category": "other"
        }
        
        success4, response4 = self.run_test(
            "Create Single (Non-Recurring) Event",
            "POST",
            "events/recurring",
            200,
            data=single_event_data,
            use_super_admin=True
        )
        
        if success4:
            event_id = response4.get('event_id')
            print(f"✅ Created single event with ID: {event_id}")
            self.created_event_id = event_id
        
        return success1 and success2 and success3 and success4

    def test_program_logos_feature(self):
        """Test 5: Program Logos Feature"""
        print("\n" + "="*60)
        print("🖼️ TESTING PROGRAM LOGOS FEATURE")
        print("="*60)
        
        # Test 1: Create program with logo_url
        program_data = {
            "slug": "elite-training",
            "name": "Elite Training Program",
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
        
        success1, response1 = self.run_test(
            "Create Program with Logo URL",
            "POST",
            "programs",
            200,
            data=program_data,
            use_super_admin=True
        )
        
        if success1:
            program_id = response1.get('id')
            logo_url = response1.get('logo_url')
            print(f"✅ Program created with ID: {program_id}")
            print(f"✅ Logo URL: {logo_url}")
            self.program_with_logo_id = program_id
        
        # Test 2: Get programs and verify logo_url field
        success2, response2 = self.run_test(
            "Get Programs - Verify Logo URL Field",
            "GET",
            "programs",
            200
        )
        
        if success2:
            programs = response2
            logo_programs = [p for p in programs if p.get('logo_url')]
            print(f"✅ Found {len(logo_programs)} programs with logo URLs")
            
            # Find our test program
            test_program = None
            for program in programs:
                if program.get('slug') == 'elite-training':
                    test_program = program
                    break
                    
            if test_program:
                print(f"✅ Test program logo URL: {test_program.get('logo_url')}")
        
        # Test 3: Update logo_url
        if self.program_with_logo_id:
            update_data = {
                "slug": "elite-training",
                "name": "Elite Training Program",
                "season": "Winter 2025",
                "description": "Advanced training - Updated",
                "long_description": "Comprehensive elite training program - Updated",
                "age_range": "13-18",
                "price": 299.99,
                "inclusions": ["Training", "Equipment", "Tournaments", "Nutrition Guide"],
                "schedule": "Mon/Wed/Fri 6-8pm",
                "registration_info": "Register online",
                "logo_url": "/api/media/programs/updated-logo.png",  # Updated logo
                "active": True
            }
            
            success3, response3 = self.run_test(
                "Update Program Logo URL",
                "PUT",
                f"programs/{self.program_with_logo_id}",
                200,
                data=update_data,
                use_super_admin=True
            )
            
            if success3:
                updated_logo = response3.get('logo_url')
                print(f"✅ Updated logo URL: {updated_logo}")
        else:
            success3 = True  # Skip if no program ID
            print("⚠️ Skipping logo update test - no program ID available")
        
        # Test 4: Verify logo_url persists
        success4, response4 = self.run_test(
            "Verify Logo URL Persistence",
            "GET",
            "programs/slug/elite-training",
            200
        )
        
        if success4:
            persisted_logo = response4.get('logo_url')
            print(f"✅ Persisted logo URL: {persisted_logo}")
        
        return success1 and success2 and success3 and success4

    def test_existing_functionality_regression(self):
        """Test 6: Existing Functionality Regression Test"""
        print("\n" + "="*60)
        print("🔍 TESTING EXISTING FUNCTIONALITY REGRESSION")
        print("="*60)
        
        # Test 1: List events (should include recurring instances)
        success1, response1 = self.run_test(
            "Regression Test - Get Events",
            "GET",
            "events",
            200
        )
        
        if success1:
            events_count = len(response1)
            print(f"✅ Events endpoint working - {events_count} events found")
        
        # Test 2: List facilities
        success2, response2 = self.run_test(
            "Regression Test - Get Facilities",
            "GET",
            "facilities",
            200
        )
        
        if success2:
            facilities_count = len(response2)
            print(f"✅ Facilities endpoint working - {facilities_count} facilities found")
        
        # Test 3: Test registration still works
        regression_registration_data = {
            "athlete_first_name": "Regression",
            "athlete_last_name": "Test",
            "athlete_date_of_birth": "2012-01-01",
            "athlete_gender": "Male",
            "athlete_grade": "6th",
            "athlete_school": "Regression Test School",
            "parent_first_name": "Parent",
            "parent_last_name": "Test",
            "parent_email": "regression.test@example.com",
            "parent_phone": "555-0199",
            "parent_address": "123 Regression St",
            "parent_city": "Test City",
            "parent_state": "CA",
            "emergency_name": "Emergency Contact",
            "emergency_relationship": "Guardian",
            "emergency_phone": "555-0198",
            "insurance_provider": "Test Insurance",
            "insurance_policy_number": "REG123456",
            "shirt_size": "Medium",
            "shorts_size": "Medium",
            "years_playing": "2",
            "skill_level": "Beginner",
            "liability_waiver": True,
            "code_of_conduct": True,
            "medical_treatment": True
        }
        
        success3, response3 = self.run_test(
            "Regression Test - Enhanced Registration",
            "POST",
            "enhanced-registrations",
            200,
            data=regression_registration_data
        )
        
        if success3:
            reg_id = response3.get('id')
            print(f"✅ Registration system working - ID: {reg_id}")
        
        # Test 4: Calendar events working
        success4, response4 = self.run_test(
            "Regression Test - Calendar Events",
            "GET",
            "calendar-events",
            200
        )
        
        if success4:
            calendar_events_count = len(response4)
            print(f"✅ Calendar events working - {calendar_events_count} events found")
        
        return success1 and success2 and success3 and success4

    def run_all_new_features_tests(self):
        """Run all new features tests as per review request"""
        print("🏀 MNASE Basketball League - NEW FEATURES TESTING")
        print("🎯 Testing 5 New Features from Review Request")
        print("=" * 80)
        
        # Login first
        if not self.test_super_admin_login():
            print("❌ Super admin login failed - cannot proceed with tests")
            return False
        
        # Run all new feature tests
        test_results = []
        
        test_results.append(("Affiliate Approval Fix", self.test_affiliate_approval_fix()))
        test_results.append(("Media Management Endpoints", self.test_media_management_endpoints()))
        test_results.append(("Email Queue System", self.test_email_queue_system()))
        test_results.append(("Recurring Events System", self.test_recurring_events_system()))
        test_results.append(("Program Logos Feature", self.test_program_logos_feature()))
        test_results.append(("Existing Functionality Regression", self.test_existing_functionality_regression()))
        
        # Print results summary
        print("\n" + "=" * 80)
        print("📊 NEW FEATURES TEST RESULTS SUMMARY")
        print("=" * 80)
        
        failed_tests = []
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
            if not result:
                failed_tests.append(test_name)
        
        print(f"\n📈 Overall: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        # Success criteria from review request: 90%+ success rate
        if success_rate >= 90:
            print("🎉 SUCCESS CRITERIA MET: 90%+ success rate achieved!")
        else:
            print(f"⚠️  SUCCESS CRITERIA NOT MET: {success_rate:.1f}% < 90% required")
        
        if failed_tests:
            print(f"\n❌ Failed Tests: {', '.join(failed_tests)}")
            return False
        else:
            print("\n🎉 All new features tests passed!")
            return True

def main():
    """Main function to run new features testing"""
    tester = NewFeaturesAPITester()
    success = tester.run_all_new_features_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())