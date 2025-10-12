import requests
import sys
import json
from datetime import datetime

class MNASEBasketballAPITester:
    def __init__(self, base_url="https://mnase-hoops-1.preview.emergentagent.com"):
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
        self.youth_registration_id = None
        self.adult_registration_id = None
        self.youth_session_id = None
        self.adult_session_id = None

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
            "name": "Test User"
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
    
    # User Dashboard Tests
    print("\n👤 USER DASHBOARD TESTS")
    test_results.append(("Get User Registrations", tester.test_get_registrations()))
    test_results.append(("Get User Bookings", tester.test_get_bookings()))
    
    # Admin Tests
    print("\n🔧 ADMIN FUNCTIONALITY TESTS")
    test_results.append(("Create Event (Admin)", tester.test_create_event_admin()))
    test_results.append(("Update Event (Admin)", tester.test_update_event_admin()))
    test_results.append(("Create Facility (Admin)", tester.test_create_facility_admin()))
    test_results.append(("Update Facility (Admin)", tester.test_update_facility_admin()))
    test_results.append(("Get All Registrations (Admin)", tester.test_get_admin_registrations()))
    test_results.append(("Get All Bookings (Admin)", tester.test_get_admin_bookings()))
    test_results.append(("Delete Event (Admin)", tester.test_delete_event_admin()))
    test_results.append(("Delete Facility (Admin)", tester.test_delete_facility_admin()))
    
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