import requests
import sys
import json
from datetime import datetime

class MNASEBasketballAPITester:
    def __init__(self, base_url="https://basket-platform.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_event_id = None
        self.created_facility_id = None
        self.created_program_id = None
        self.created_team_id = None
        self.created_calendar_event_id = None
        self.created_membership_id = None
        self.created_payment_plan_id = None
        self.youth_registration_id = None
        self.adult_registration_id = None
        self.youth_session_id = None
        self.adult_session_id = None
        self.booking_session_id = None
        self.contact_submission_id = None
        self.volunteer_application_id = None
        self.sponsorship_inquiry_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if use_admin and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token and not use_admin:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

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

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test User",
            "date_of_birth": "1990-01-01",
            "phone": "555-0100"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"✅ User registered with ID: {self.user_id}")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        admin_credentials = {
            "email": "admin@mnase.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_credentials
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_user_id = response['user']['id']
            print(f"✅ Admin logged in with ID: {self.admin_user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login with registered user"""
        # First register a user
        if not self.test_user_registration():
            return False
            
        # Now test login with same credentials
        login_data = {
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_events(self):
        """Test getting all events"""
        success, response = self.run_test(
            "Get All Events",
            "GET",
            "events",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} events")
        return success

    def test_get_facilities(self):
        """Test getting all facilities"""
        success, response = self.run_test(
            "Get All Facilities",
            "GET",
            "facilities",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} facilities")
        return success

    def test_create_event_admin(self):
        """Test creating an event as admin"""
        event_data = {
            "title": "Test Basketball Tournament",
            "description": "A test tournament for API testing",
            "date": "2024-12-31",
            "time": "18:00",
            "location": "Test Court",
            "capacity": 20,
            "price": 25.00,
            "category": "Tournament"
        }
        
        success, response = self.run_test(
            "Create Event (Admin)",
            "POST",
            "events",
            200,
            data=event_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_event_id = response['id']
            print(f"✅ Event created with ID: {self.created_event_id}")
        return success

    def test_update_event_admin(self):
        """Test updating an event as admin"""
        if not self.created_event_id:
            print("❌ No event ID available for update test")
            return False
            
        updated_data = {
            "title": "Updated Test Tournament",
            "description": "Updated description for API testing",
            "date": "2024-12-31",
            "time": "19:00",
            "location": "Updated Test Court",
            "capacity": 25,
            "price": 30.00,
            "category": "Tournament"
        }
        
        success, response = self.run_test(
            "Update Event (Admin)",
            "PUT",
            f"events/{self.created_event_id}",
            200,
            data=updated_data,
            use_admin=True
        )
        return success

    def test_create_facility_admin(self):
        """Test creating a facility as admin"""
        facility_data = {
            "name": "Test Basketball Court",
            "description": "A test court for API testing",
            "hourly_rate": 50.00,
            "amenities": ["Full Court", "Scoreboard", "Sound System"],
            "capacity": 30,
            "available": True
        }
        
        success, response = self.run_test(
            "Create Facility (Admin)",
            "POST",
            "facilities",
            200,
            data=facility_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_facility_id = response['id']
            print(f"✅ Facility created with ID: {self.created_facility_id}")
        return success

    def test_update_facility_admin(self):
        """Test updating a facility as admin"""
        if not self.created_facility_id:
            print("❌ No facility ID available for update test")
            return False
            
        updated_data = {
            "name": "Updated Test Court",
            "description": "Updated description for API testing",
            "hourly_rate": 60.00,
            "amenities": ["Full Court", "Scoreboard", "Sound System", "Air Conditioning"],
            "capacity": 35,
            "available": True
        }
        
        success, response = self.run_test(
            "Update Facility (Admin)",
            "PUT",
            f"facilities/{self.created_facility_id}",
            200,
            data=updated_data,
            use_admin=True
        )
        return success

    def test_get_registrations(self):
        """Test getting user registrations"""
        success, response = self.run_test(
            "Get User Registrations",
            "GET",
            "registrations",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} registrations")
        return success

    def test_get_bookings(self):
        """Test getting user bookings"""
        success, response = self.run_test(
            "Get User Bookings",
            "GET",
            "bookings",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} bookings")
        return success

    def test_get_admin_registrations(self):
        """Test getting all registrations as admin"""
        success, response = self.run_test(
            "Get All Registrations (Admin)",
            "GET",
            "registrations",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} total registrations")
        return success

    def test_get_admin_bookings(self):
        """Test getting all bookings as admin"""
        success, response = self.run_test(
            "Get All Bookings (Admin)",
            "GET",
            "bookings",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} total bookings")
        return success

    def test_delete_event_admin(self):
        """Test deleting an event as admin"""
        if not self.created_event_id:
            print("❌ No event ID available for delete test")
            return False
            
        success, response = self.run_test(
            "Delete Event (Admin)",
            "DELETE",
            f"events/{self.created_event_id}",
            200,
            use_admin=True
        )
        return success

    def test_delete_facility_admin(self):
        """Test deleting a facility as admin"""
        if not self.created_facility_id:
            print("❌ No facility ID available for delete test")
            return False
            
        success, response = self.run_test(
            "Delete Facility (Admin)",
            "DELETE",
            f"facilities/{self.created_facility_id}",
            200,
            use_admin=True
        )
        return success

    def test_create_youth_registration(self):
        """Test creating a youth registration"""
        youth_registration_data = {
            "athlete_first_name": "John",
            "athlete_last_name": "Smith",
            "athlete_date_of_birth": "2010-05-15",
            "athlete_gender": "Male",
            "athlete_grade": "8th",
            "athlete_school": "Test Middle School",
            "athlete_email": "john.smith@test.com",
            "athlete_phone": "555-0123",
            "parent_first_name": "Michael",
            "parent_last_name": "Smith",
            "parent_email": "michael.smith@test.com",
            "parent_phone": "555-0124",
            "parent_address": "123 Test Street",
            "parent_city": "Test City",
            "parent_state": "CA",
            "parent_zip": "90210",
            "emergency_name": "Sarah Smith",
            "emergency_relationship": "Mother",
            "emergency_phone": "555-0125",
            "insurance_provider": "Test Insurance",
            "insurance_policy_number": "TEST123456",
            "shirt_size": "Medium",
            "shorts_size": "Medium",
            "years_playing": "3",
            "skill_level": "Intermediate",
            "liability_waiver": True,
            "code_of_conduct": True,
            "medical_treatment": True
        }
        
        success, response = self.run_test(
            "Create Youth Registration",
            "POST",
            "enhanced-registrations",
            200,
            data=youth_registration_data
        )
        
        if success and 'id' in response:
            self.youth_registration_id = response['id']
            print(f"✅ Youth registration created with ID: {self.youth_registration_id}")
        return success

    def test_create_adult_registration(self):
        """Test creating an adult registration"""
        adult_registration_data = {
            "participant_name": "Jane Doe",
            "participant_email": "jane.doe@test.com",
            "participant_phone": "555-0126",
            "emergency_contact_name": "John Doe",
            "emergency_contact_phone": "555-0127",
            "emergency_contact_relationship": "Spouse",
            "skill_level": "Advanced",
            "years_playing": "10",
            "position": "Point Guard",
            "shirt_size": "Large",
            "shorts_size": "Large",
            "liability_waiver": True,
            "code_of_conduct": True
        }
        
        success, response = self.run_test(
            "Create Adult Registration",
            "POST",
            "adult-registrations",
            200,
            data=adult_registration_data
        )
        
        if success and 'id' in response:
            self.adult_registration_id = response['id']
            print(f"✅ Adult registration created with ID: {self.adult_registration_id}")
        return success

    def test_approve_youth_registration(self):
        """Test approving youth registration as admin"""
        if not self.youth_registration_id:
            print("❌ No youth registration ID available for approval")
            return False
            
        success, response = self.run_test(
            "Approve Youth Registration (Admin)",
            "PUT",
            f"admin/enhanced-registrations/{self.youth_registration_id}/status?status=approved",
            200,
            use_admin=True
        )
        return success

    def test_approve_adult_registration(self):
        """Test approving adult registration as admin"""
        if not self.adult_registration_id:
            print("❌ No adult registration ID available for approval")
            return False
            
        success, response = self.run_test(
            "Approve Adult Registration (Admin)",
            "PUT",
            f"admin/adult-registrations/{self.adult_registration_id}/status?status=approved",
            200,
            use_admin=True
        )
        return success

    def test_youth_registration_checkout(self):
        """Test creating Stripe checkout for youth registration"""
        if not self.youth_registration_id:
            print("❌ No youth registration ID available for checkout")
            return False
            
        checkout_data = {
            "origin_url": self.base_url
        }
        
        success, response = self.run_test(
            "Youth Registration Checkout",
            "POST",
            f"enhanced-registrations/{self.youth_registration_id}/checkout",
            200,
            data=checkout_data
        )
        
        if success and 'session_id' in response:
            self.youth_session_id = response['session_id']
            print(f"✅ Youth checkout session created: {self.youth_session_id}")
            print(f"✅ Checkout URL: {response.get('checkout_url', 'N/A')}")
        return success

    def test_adult_registration_checkout(self):
        """Test creating Stripe checkout for adult registration"""
        if not self.adult_registration_id:
            print("❌ No adult registration ID available for checkout")
            return False
            
        checkout_data = {
            "origin_url": self.base_url
        }
        
        success, response = self.run_test(
            "Adult Registration Checkout",
            "POST",
            f"adult-registrations/{self.adult_registration_id}/checkout",
            200,
            data=checkout_data
        )
        
        if success and 'session_id' in response:
            self.adult_session_id = response['session_id']
            print(f"✅ Adult checkout session created: {self.adult_session_id}")
            print(f"✅ Checkout URL: {response.get('checkout_url', 'N/A')}")
        return success

    def test_youth_payment_status(self):
        """Test checking youth registration payment status"""
        if not self.youth_session_id:
            print("❌ No youth session ID available for status check")
            return False
            
        success, response = self.run_test(
            "Youth Payment Status Check",
            "GET",
            f"enhanced-registrations/payment-status/{self.youth_session_id}",
            200
        )
        
        if success:
            print(f"✅ Payment status: {response.get('payment_status', 'Unknown')}")
        return success

    def test_adult_payment_status(self):
        """Test checking adult registration payment status"""
        if not self.adult_session_id:
            print("❌ No adult session ID available for status check")
            return False
            
        success, response = self.run_test(
            "Adult Payment Status Check",
            "GET",
            f"adult-registrations/payment-status/{self.adult_session_id}",
            200
        )
        
        if success:
            print(f"✅ Payment status: {response.get('payment_status', 'Unknown')}")
        return success

    # Additional comprehensive tests for missing functionality
    def test_get_programs(self):
        """Test getting all programs"""
        success, response = self.run_test(
            "Get All Programs",
            "GET",
            "programs",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} programs")
        return success

    def test_create_program_admin(self):
        """Test creating a program as admin"""
        program_data = {
            "slug": "test-youth-league",
            "name": "Test Youth Basketball League",
            "season": "Winter 2024",
            "description": "Test youth basketball program",
            "long_description": "A comprehensive test program for youth basketball development",
            "age_range": "8-12",
            "price": 150.00,
            "inclusions": ["Jersey", "Training", "Games"],
            "schedule": "Saturdays 10AM-12PM",
            "registration_info": "Register online",
            "active": True
        }
        
        success, response = self.run_test(
            "Create Program (Admin)",
            "POST",
            "programs",
            200,
            data=program_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_program_id = response['id']
            print(f"✅ Program created with ID: {self.created_program_id}")
        return success

    def test_get_program_by_slug(self):
        """Test getting program by slug"""
        success, response = self.run_test(
            "Get Program by Slug",
            "GET",
            "programs/slug/test-youth-league",
            200
        )
        return success

    def test_facility_booking_checkout(self):
        """Test creating facility booking with payment"""
        # First create a facility if we don't have one
        if not self.created_facility_id:
            if not self.test_create_facility_admin():
                print("❌ Failed to create facility for booking test")
                return False
            
        booking_data = {
            "facility_id": self.created_facility_id,
            "booking_date": "2024-12-31",
            "start_time": "10:00",
            "end_time": "12:00",
            "hours": 2
        }
        
        checkout_data = {
            "origin_url": self.base_url
        }
        
        # The booking checkout endpoint expects booking data and checkout data separately
        # Let's test this as a two-step process like the registration flow
        success, response = self.run_test(
            "Facility Booking Checkout",
            "POST",
            "bookings/checkout",
            200,
            data={**booking_data, **checkout_data}
        )
        
        if success and 'session_id' in response:
            self.booking_session_id = response['session_id']
            print(f"✅ Booking checkout session created: {self.booking_session_id}")
        return success

    def test_booking_payment_status(self):
        """Test checking booking payment status"""
        if not hasattr(self, 'booking_session_id') or not self.booking_session_id:
            print("❌ No booking session ID available for status check")
            return False
            
        success, response = self.run_test(
            "Booking Payment Status Check",
            "GET",
            f"bookings/status/{self.booking_session_id}",
            200
        )
        
        if success:
            print(f"✅ Booking payment status: {response.get('payment_status', 'Unknown')}")
        return success

    def test_create_team_admin(self):
        """Test creating a team as admin"""
        team_data = {
            "name": "Test Warriors",
            "division": "U12",
            "age_group": "10-12",
            "season": "Winter 2024",
            "coach_name": "Coach Smith",
            "coach_email": "coach.smith@test.com",
            "coach_phone": "555-0130",
            "max_roster_size": 15,
            "practice_schedule": "Tuesdays 6PM",
            "home_venue": "Test Gym"
        }
        
        success, response = self.run_test(
            "Create Team (Admin)",
            "POST",
            "admin/teams",
            200,
            data=team_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_team_id = response['id']
            print(f"✅ Team created with ID: {self.created_team_id}")
        return success

    def test_get_teams(self):
        """Test getting all teams"""
        success, response = self.run_test(
            "Get All Teams",
            "GET",
            "teams",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} teams")
        return success

    def test_get_admin_teams(self):
        """Test getting all teams as admin"""
        success, response = self.run_test(
            "Get All Teams (Admin)",
            "GET",
            "admin/teams",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} teams (admin view)")
        return success

    def test_create_calendar_event_admin(self):
        """Test creating a calendar event as admin"""
        calendar_data = {
            "title": "Test Tournament",
            "description": "Annual test basketball tournament",
            "date": "2024-12-25",
            "time": "14:00",
            "location": "Main Court"
        }
        
        success, response = self.run_test(
            "Create Calendar Event (Admin)",
            "POST",
            "admin/calendar-events",
            200,
            data=calendar_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_calendar_event_id = response['id']
            print(f"✅ Calendar event created with ID: {self.created_calendar_event_id}")
        return success

    def test_get_calendar_events(self):
        """Test getting calendar events"""
        success, response = self.run_test(
            "Get Calendar Events",
            "GET",
            "calendar-events",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} calendar events")
        return success

    def test_contact_form_submission(self):
        """Test contact form submission"""
        contact_data = {
            "name": "John Test",
            "email": "john.test@example.com",
            "phone": "555-0140",
            "subject": "Test Inquiry",
            "message": "This is a test contact form submission"
        }
        
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        
        if success and 'id' in response:
            self.contact_submission_id = response['id']
            print(f"✅ Contact submission created with ID: {self.contact_submission_id}")
        return success

    def test_volunteer_application(self):
        """Test volunteer application submission"""
        volunteer_data = {
            "name": "Jane Volunteer",
            "email": "jane.volunteer@example.com",
            "phone": "555-0141",
            "interest": "Coaching",
            "availability": "Weekends",
            "experience": "5 years coaching youth basketball",
            "message": "I would love to help coach the youth teams"
        }
        
        success, response = self.run_test(
            "Volunteer Application",
            "POST",
            "volunteer",
            200,
            data=volunteer_data
        )
        
        if success and 'id' in response:
            self.volunteer_application_id = response['id']
            print(f"✅ Volunteer application created with ID: {self.volunteer_application_id}")
        return success

    def test_sponsorship_inquiry(self):
        """Test sponsorship inquiry submission"""
        sponsorship_data = {
            "company": "Test Sports Inc",
            "contact": "Mike Sponsor",
            "email": "mike@testsports.com",
            "phone": "555-0142",
            "interest": "Team Sponsorship",
            "message": "We are interested in sponsoring a youth team"
        }
        
        success, response = self.run_test(
            "Sponsorship Inquiry",
            "POST",
            "sponsorship",
            200,
            data=sponsorship_data
        )
        
        if success and 'id' in response:
            self.sponsorship_inquiry_id = response['id']
            print(f"✅ Sponsorship inquiry created with ID: {self.sponsorship_inquiry_id}")
        return success

    def test_get_admin_contact_submissions(self):
        """Test getting contact submissions as admin"""
        success, response = self.run_test(
            "Get Contact Submissions (Admin)",
            "GET",
            "admin/contact-submissions",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} contact submissions")
        return success

    def test_get_admin_volunteer_applications(self):
        """Test getting volunteer applications as admin"""
        success, response = self.run_test(
            "Get Volunteer Applications (Admin)",
            "GET",
            "admin/volunteer-applications",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} volunteer applications")
        return success

    def test_get_admin_sponsorship_inquiries(self):
        """Test getting sponsorship inquiries as admin"""
        success, response = self.run_test(
            "Get Sponsorship Inquiries (Admin)",
            "GET",
            "admin/sponsorship-inquiries",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} sponsorship inquiries")
        return success

    def test_get_memberships(self):
        """Test getting all memberships"""
        success, response = self.run_test(
            "Get All Memberships",
            "GET",
            "memberships",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} memberships")
        return success

    def test_create_membership_admin(self):
        """Test creating a membership as admin"""
        membership_data = {
            "type": "Individual",
            "tier": "Premium",
            "price": 99.99,
            "benefits": ["Court Access", "Equipment Rental", "Training Sessions"],
            "description": "Premium individual membership with full access",
            "active": True
        }
        
        success, response = self.run_test(
            "Create Membership (Admin)",
            "POST",
            "memberships",
            200,
            data=membership_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_membership_id = response['id']
            print(f"✅ Membership created with ID: {self.created_membership_id}")
        return success

    def test_get_payment_plans_admin(self):
        """Test getting payment plans as admin"""
        success, response = self.run_test(
            "Get Payment Plans (Admin)",
            "GET",
            "admin/payment-plans",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} payment plans")
        return success

    def test_create_payment_plan_admin(self):
        """Test creating a payment plan as admin"""
        if not self.user_id:
            print("❌ No user ID available for payment plan test")
            return False
            
        payment_plan_data = {
            "user_id": self.user_id,
            "total_amount": 300.00,
            "num_installments": 3,
            "frequency": "monthly",
            "first_payment_date": "2024-01-15"
        }
        
        success, response = self.run_test(
            "Create Payment Plan (Admin)",
            "POST",
            "admin/payment-plans",
            200,
            data=payment_plan_data,
            use_admin=True
        )
        
        if success and 'id' in response:
            self.created_payment_plan_id = response['id']
            print(f"✅ Payment plan created with ID: {self.created_payment_plan_id}")
        return success

    def test_get_my_payment_plans(self):
        """Test getting user's payment plans"""
        success, response = self.run_test(
            "Get My Payment Plans",
            "GET",
            "payment-plans/me",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} payment plans for user")
        return success

    def test_get_admin_users(self):
        """Test getting all users as admin"""
        success, response = self.run_test(
            "Get All Users (Admin)",
            "GET",
            "admin/users",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} users")
        return success

    def test_update_user_role_admin(self):
        """Test updating user role as admin"""
        if not self.user_id:
            print("❌ No user ID available for role update test")
            return False
            
        success, response = self.run_test(
            "Update User Role (Admin)",
            "PUT",
            f"admin/users/{self.user_id}/role?role=member",
            200,
            use_admin=True
        )
        return success

    def test_unauthorized_payment_access(self):
        """Test unauthorized access to payment endpoints"""
        # Test without authentication
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Payment Access",
            "POST",
            "enhanced-registrations/fake-id/checkout",
            401,
            data={"origin_url": self.base_url}
        )
        
        # Restore token
        self.token = temp_token
        return success

    def test_nonexistent_registration_payment(self):
        """Test payment for non-existent registration"""
        success, response = self.run_test(
            "Non-existent Registration Payment",
            "POST",
            "enhanced-registrations/fake-registration-id/checkout",
            404,
            data={"origin_url": self.base_url}
        )
        return success

    def test_get_enhanced_registrations(self):
        """Test getting user's enhanced registrations"""
        success, response = self.run_test(
            "Get User Enhanced Registrations",
            "GET",
            "enhanced-registrations",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} enhanced registrations")
        return success

    def test_get_adult_registrations(self):
        """Test getting user's adult registrations"""
        success, response = self.run_test(
            "Get User Adult Registrations",
            "GET",
            "adult-registrations",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} adult registrations")
        return success

    def test_get_admin_enhanced_registrations(self):
        """Test getting all enhanced registrations as admin"""
        success, response = self.run_test(
            "Get All Enhanced Registrations (Admin)",
            "GET",
            "admin/enhanced-registrations",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} total enhanced registrations")
        return success

    def test_get_admin_adult_registrations(self):
        """Test getting all adult registrations as admin"""
        success, response = self.run_test(
            "Get All Adult Registrations (Admin)",
            "GET",
            "admin/adult-registrations",
            200,
            use_admin=True
        )
        
        if success:
            print(f"✅ Found {len(response)} total adult registrations")
        return success

def main():
    print("🏀 Starting MNASE Basketball League API Tests")
    print("=" * 50)
    
    tester = MNASEBasketballAPITester()
    
    # Test sequence
    test_results = []
    
    # Authentication Tests
    print("\n📝 AUTHENTICATION TESTS")
    test_results.append(("User Registration", tester.test_user_registration()))
    test_results.append(("Admin Login", tester.test_admin_login()))
    test_results.append(("Get Current User", tester.test_get_current_user()))
    
    # Public Endpoints Tests
    print("\n🌐 PUBLIC ENDPOINTS TESTS")
    test_results.append(("Get Events", tester.test_get_events()))
    test_results.append(("Get Facilities", tester.test_get_facilities()))
    test_results.append(("Get Programs", tester.test_get_programs()))
    test_results.append(("Get Teams", tester.test_get_teams()))
    test_results.append(("Get Calendar Events", tester.test_get_calendar_events()))
    test_results.append(("Get Memberships", tester.test_get_memberships()))
    
    # User Dashboard Tests
    print("\n👤 USER DASHBOARD TESTS")
    test_results.append(("Get User Registrations", tester.test_get_registrations()))
    test_results.append(("Get User Bookings", tester.test_get_bookings()))
    test_results.append(("Get My Payment Plans", tester.test_get_my_payment_plans()))
    
    # Registration Tests
    print("\n📝 REGISTRATION TESTS")
    test_results.append(("Create Youth Registration", tester.test_create_youth_registration()))
    test_results.append(("Create Adult Registration", tester.test_create_adult_registration()))
    test_results.append(("Get User Enhanced Registrations", tester.test_get_enhanced_registrations()))
    test_results.append(("Get User Adult Registrations", tester.test_get_adult_registrations()))
    
    # Admin Registration Management Tests
    print("\n🔧 ADMIN REGISTRATION MANAGEMENT TESTS")
    test_results.append(("Get All Enhanced Registrations (Admin)", tester.test_get_admin_enhanced_registrations()))
    test_results.append(("Get All Adult Registrations (Admin)", tester.test_get_admin_adult_registrations()))
    test_results.append(("Approve Youth Registration (Admin)", tester.test_approve_youth_registration()))
    test_results.append(("Approve Adult Registration (Admin)", tester.test_approve_adult_registration()))
    
    # Payment Integration Tests
    print("\n💳 STRIPE PAYMENT INTEGRATION TESTS")
    test_results.append(("Youth Registration Checkout", tester.test_youth_registration_checkout()))
    test_results.append(("Adult Registration Checkout", tester.test_adult_registration_checkout()))
    test_results.append(("Youth Payment Status Check", tester.test_youth_payment_status()))
    test_results.append(("Adult Payment Status Check", tester.test_adult_payment_status()))
    test_results.append(("Facility Booking Checkout", tester.test_facility_booking_checkout()))
    test_results.append(("Booking Payment Status Check", tester.test_booking_payment_status()))
    
    # Security Tests
    print("\n🔒 SECURITY TESTS")
    test_results.append(("Unauthorized Payment Access", tester.test_unauthorized_payment_access()))
    test_results.append(("Non-existent Registration Payment", tester.test_nonexistent_registration_payment()))

    # Admin Content Management Tests
    print("\n🔧 ADMIN CONTENT MANAGEMENT TESTS")
    test_results.append(("Create Event (Admin)", tester.test_create_event_admin()))
    test_results.append(("Update Event (Admin)", tester.test_update_event_admin()))
    test_results.append(("Create Facility (Admin)", tester.test_create_facility_admin()))
    test_results.append(("Update Facility (Admin)", tester.test_update_facility_admin()))
    test_results.append(("Create Program (Admin)", tester.test_create_program_admin()))
    test_results.append(("Get Program by Slug", tester.test_get_program_by_slug()))
    test_results.append(("Create Team (Admin)", tester.test_create_team_admin()))
    test_results.append(("Get All Teams (Admin)", tester.test_get_admin_teams()))
    test_results.append(("Create Calendar Event (Admin)", tester.test_create_calendar_event_admin()))
    test_results.append(("Create Membership (Admin)", tester.test_create_membership_admin()))
    test_results.append(("Get All Registrations (Admin)", tester.test_get_admin_registrations()))
    test_results.append(("Get All Bookings (Admin)", tester.test_get_admin_bookings()))
    test_results.append(("Delete Event (Admin)", tester.test_delete_event_admin()))
    test_results.append(("Delete Facility (Admin)", tester.test_delete_facility_admin()))
    
    # Admin User Management Tests
    print("\n👥 ADMIN USER MANAGEMENT TESTS")
    test_results.append(("Get All Users (Admin)", tester.test_get_admin_users()))
    test_results.append(("Update User Role (Admin)", tester.test_update_user_role_admin()))
    
    # Forms & Communications Tests
    print("\n📋 FORMS & COMMUNICATIONS TESTS")
    test_results.append(("Contact Form Submission", tester.test_contact_form_submission()))
    test_results.append(("Volunteer Application", tester.test_volunteer_application()))
    test_results.append(("Sponsorship Inquiry", tester.test_sponsorship_inquiry()))
    test_results.append(("Get Contact Submissions (Admin)", tester.test_get_admin_contact_submissions()))
    test_results.append(("Get Volunteer Applications (Admin)", tester.test_get_admin_volunteer_applications()))
    test_results.append(("Get Sponsorship Inquiries (Admin)", tester.test_get_admin_sponsorship_inquiries()))
    
    # Payment Plans Tests
    print("\n💰 PAYMENT PLANS TESTS")
    test_results.append(("Get Payment Plans (Admin)", tester.test_get_payment_plans_admin()))
    test_results.append(("Create Payment Plan (Admin)", tester.test_create_payment_plan_admin()))
    
    # Print results summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    failed_tests = []
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if not result:
            failed_tests.append(test_name)
    
    print(f"\n📈 Overall: {tester.tests_passed}/{tester.tests_run} tests passed")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📊 Success Rate: {success_rate:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed Tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n🎉 All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())