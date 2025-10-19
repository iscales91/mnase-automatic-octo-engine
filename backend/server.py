from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables FIRST before any other imports
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from email_service import email_service
from image_service import image_service
from search_service import search_service
from notification_service import notification_service
from activity_log_service import activity_log_service
from membership_service import membership_service, MEMBERSHIP_PRICING
from calendar_service import calendar_service
from error_utils import (
    ValidationUtils, ValidationError, CustomHTTPException,
    not_found_error, validation_error, unauthorized_error, 
    forbidden_error, conflict_error, server_error
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
SETUP_SECRET_TOKEN = os.environ.get('SETUP_SECRET_TOKEN', 'mnase-setup-token-2025')

# Permissions Configuration
PERMISSIONS = {
    'user_management': ['view_users', 'create_users', 'edit_users', 'delete_users', 'assign_roles'],
    'team_management': ['view_teams', 'create_teams', 'edit_teams', 'delete_teams', 'manage_players'],
    'registration_management': ['view_registrations', 'approve_registrations', 'edit_registrations', 'delete_registrations'],
    'payment_billing': ['view_payments', 'process_refunds', 'view_invoices', 'manage_payment_plans'],
    'event_calendar': ['view_events', 'create_events', 'edit_events', 'delete_events', 'manage_calendar'],
    'content_management': ['manage_news', 'manage_gallery', 'manage_testimonials', 'manage_pages'],
    'analytics': ['view_analytics', 'export_reports'],
    'form_submissions': ['view_forms', 'respond_forms', 'delete_forms'],
    'facility_management': ['view_facilities', 'edit_facilities', 'manage_bookings'],
    'system_settings': ['manage_roles', 'system_configuration', 'view_logs']
}

# Role Definitions with default permissions
DEFAULT_ROLES = {
    'super_admin': {
        'display_name': 'Super Administrator',
        'description': 'Full system access with ability to manage all roles and permissions',
        'permissions': [perm for perms in PERMISSIONS.values() for perm in perms],  # All permissions
        'is_system_role': True
    },
    'admin': {
        'display_name': 'Administrator',
        'description': 'Administrative access to manage users, teams, registrations, and content',
        'permissions': [
            'view_users', 'create_users', 'edit_users',
            'view_teams', 'create_teams', 'edit_teams', 'manage_players',
            'view_registrations', 'approve_registrations', 'edit_registrations',
            'view_payments', 'view_invoices', 'manage_payment_plans',
            'view_events', 'create_events', 'edit_events', 'manage_calendar',
            'manage_news', 'manage_gallery', 'manage_testimonials',
            'view_analytics',
            'view_forms', 'respond_forms',
            'view_facilities', 'edit_facilities'
        ],
        'is_system_role': True
    },
    'manager': {
        'display_name': 'Manager',
        'description': 'Manage specific operational areas like teams, events, and facilities',
        'permissions': [
            'view_users', 'view_teams', 'create_teams', 'edit_teams', 'manage_players',
            'view_registrations', 'approve_registrations',
            'view_events', 'create_events', 'edit_events', 'manage_calendar',
            'view_forms', 'respond_forms',
            'view_facilities', 'edit_facilities', 'manage_bookings'
        ],
        'is_system_role': True
    },
    'staff': {
        'display_name': 'Staff Member',
        'description': 'Limited management access for registrations, events, and forms',
        'permissions': [
            'view_users', 'view_teams', 'view_registrations', 'approve_registrations',
            'view_events', 'create_events', 'view_forms', 'respond_forms'
        ],
        'is_system_role': True
    },
    'coach': {
        'display_name': 'Coach',
        'description': 'Team management and player communication',
        'permissions': [
            'view_users', 'view_teams', 'edit_teams', 'manage_players',
            'view_events', 'view_forms'
        ],
        'is_system_role': True
    },
    'treasurer': {
        'display_name': 'Treasurer',
        'description': 'Financial and billing management',
        'permissions': [
            'view_users', 'view_registrations',
            'view_payments', 'process_refunds', 'view_invoices', 'manage_payment_plans',
            'view_analytics', 'export_reports'
        ],
        'is_system_role': True
    },
    'user': {
        'display_name': 'Member',
        'description': 'Standard member access',
        'permissions': ['view_events', 'view_teams'],
        'is_system_role': True
    }
}


# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")


# Global exception handlers
@app.exception_handler(CustomHTTPException)
async def custom_http_exception_handler(request: Request, exc: CustomHTTPException):
    """Handle custom HTTP exceptions"""
    return {
        "error": exc.error,
        "message": exc.message,
        "details": exc.details,
        "validation_errors": exc.validation_errors
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle standard HTTP exceptions"""
    # Log the error for server-side tracking
    if exc.status_code >= 500:
        logging.error(f"Server error on {request.url}: {exc.detail}")
    
    return {
        "error": "http_error",
        "message": str(exc.detail) if exc.detail else "An error occurred",
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle any unhandled exceptions"""
    logging.error(f"Unhandled exception on {request.url}: {str(exc)}")
    
    return {
        "error": "internal_server_error",
        "message": "An unexpected error occurred. Please try again later.",
        "details": {"type": type(exc).__name__} if logging.getLogger().level == logging.DEBUG else None
    }


# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "user"  # super_admin, admin, manager, staff, coach, treasurer, user
    permissions: List[str] = Field(default_factory=list)  # List of permission strings
    date_of_birth: Optional[str] = None  # YYYY-MM-DD format
    phone: Optional[str] = None
    parent_account_id: Optional[str] = None  # Links youth to parent account
    is_parent: bool = False  # True if this account manages youth
    profile_image: Optional[str] = None  # Path to profile image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    date_of_birth: str  # Required to verify age (18+)
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Role(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # super_admin, admin, manager, staff, coach, treasurer, user
    display_name: str  # Human-readable name
    description: str
    permissions: List[str]  # List of permission identifiers
    is_system_role: bool = False  # Cannot be deleted if True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoleCreate(BaseModel):
    name: str
    display_name: str
    description: str
    permissions: List[str]

class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

class AssignRoleRequest(BaseModel):
    user_id: str
    role: str
    permissions: Optional[List[str]] = None  # Optional custom permissions

class SetupAdminRequest(BaseModel):
    secret_token: str
    email: EmailStr
    password: str
    name: str
    date_of_birth: str


class ChildAccountCreate(BaseModel):
    name: str
    date_of_birth: str  # YYYY-MM-DD format
    email: Optional[EmailStr] = None  # Optional for youth
    phone: Optional[str] = None



class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # User who performed the action
    user_email: Optional[str] = None  # Email for reference
    action: str  # e.g., "login", "create_user", "update_role", "delete_event"
    resource_type: str  # e.g., "user", "event", "role", "registration"
    resource_id: Optional[str] = None  # ID of the affected resource
    details: Optional[Dict] = Field(default_factory=dict)  # Additional context
    ip_address: Optional[str] = None
    status: str = "success"  # success, failure, error
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityLogQuery(BaseModel):
    user_id: Optional[str] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    limit: int = 100



class Membership(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    membership_type: str  # "individual" or "team"
    tier: str  # "basic", "premium", "elite"
    status: str = "active"  # active, expired, cancelled, pending
    price: float
    billing_cycle: str = "monthly"  # monthly, annual
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: Optional[datetime] = None
    auto_renew: bool = True
    payment_status: str = "unpaid"  # unpaid, paid, failed
    checkout_session_id: Optional[str] = None
    team_name: Optional[str] = None  # For team memberships
    team_size: Optional[int] = None  # For team memberships
    benefits: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MembershipCreate(BaseModel):
    membership_type: str
    tier: str
    billing_cycle: str = "monthly"
    team_name: Optional[str] = None
    team_size: Optional[int] = None

class MembershipUpdate(BaseModel):
    status: Optional[str] = None
    auto_renew: Optional[bool] = None
    end_date: Optional[str] = None



# Basketball Stats Models
class PlayerStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    team_name: str
    jersey_number: Optional[int] = None
    position: Optional[str] = None  # PG, SG, SF, PF, C
    games_played: int = 0
    minutes_played: float = 0.0
    points: int = 0
    field_goals_made: int = 0
    field_goals_attempted: int = 0
    three_pointers_made: int = 0
    three_pointers_attempted: int = 0
    free_throws_made: int = 0
    free_throws_attempted: int = 0
    offensive_rebounds: int = 0
    defensive_rebounds: int = 0
    total_rebounds: int = 0
    assists: int = 0
    steals: int = 0
    blocks: int = 0
    turnovers: int = 0
    fouls: int = 0
    season: str  # e.g., "2024-2025"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_date: str  # YYYY-MM-DD
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    location: str
    game_type: str = "regular"  # regular, playoff, tournament, championship
    tournament_name: Optional[str] = None
    player_stats: List[Dict] = Field(default_factory=list)  # Individual game stats
    notes: Optional[str] = None
    season: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamStandings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_name: str
    wins: int = 0
    losses: int = 0
    points_for: int = 0
    points_against: int = 0
    season: str
    division: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlayerStatsCreate(BaseModel):
    player_name: str
    team_name: str
    jersey_number: Optional[int] = None
    position: Optional[str] = None
    season: str

class GameStatsCreate(BaseModel):
    game_date: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    location: str
    game_type: str = "regular"
    tournament_name: Optional[str] = None
    player_stats: List[Dict] = Field(default_factory=list)
    notes: Optional[str] = None
    season: str

class StatsUpdate(BaseModel):
    games_played: Optional[int] = None
    minutes_played: Optional[float] = None
    points: Optional[int] = None
    field_goals_made: Optional[int] = None
    field_goals_attempted: Optional[int] = None
    three_pointers_made: Optional[int] = None
    three_pointers_attempted: Optional[int] = None
    free_throws_made: Optional[int] = None
    free_throws_attempted: Optional[int] = None
    offensive_rebounds: Optional[int] = None
    defensive_rebounds: Optional[int] = None
    total_rebounds: Optional[int] = None
    assists: Optional[int] = None
    steals: Optional[int] = None
    blocks: Optional[int] = None
    turnovers: Optional[int] = None
    fouls: Optional[int] = None


class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: str
    time: str
    end_time: Optional[str] = None  # End time for the event
    location: str
    capacity: int
    price: float
    category: str
    event_type: Optional[str] = "single"  # single, recurring
    recurrence_pattern: Optional[str] = None  # daily, weekly, monthly
    recurrence_end_date: Optional[str] = None  # When recurring events stop
    recurrence_days: Optional[List[str]] = Field(default_factory=list)  # For weekly: ["monday", "wednesday"]
    parent_event_id: Optional[str] = None  # Links recurring instances to parent
    tags: List[str] = Field(default_factory=list)  # For filtering
    reminder_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: str
    end_time: Optional[str] = None
    location: str
    capacity: int
    price: float
    category: str
    event_type: Optional[str] = "single"
    recurrence_pattern: Optional[str] = None
    recurrence_end_date: Optional[str] = None
    recurrence_days: Optional[List[str]] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)

class Facility(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    hourly_rate: float
    amenities: List[str]
    capacity: int
    available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FacilityCreate(BaseModel):
    name: str
    description: str
    hourly_rate: float
    amenities: List[str]
    capacity: int
    available: bool = True

class Registration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_id: str
    payment_status: str = "pending"  # pending, completed, failed
    checkout_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RegistrationCreate(BaseModel):
    event_id: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    facility_id: str
    booking_date: str
    start_time: str
    end_time: str
    hours: int
    total_cost: float
    payment_status: str = "pending"
    checkout_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    facility_id: str
    booking_date: str
    start_time: str
    end_time: str
    hours: int

class CheckoutRequest(BaseModel):
    origin_url: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    amount: float
    currency: str
    payment_status: str
    metadata: Dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Programs
class Program(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    season: str
    description: str
    long_description: str
    age_range: str
    price: float
    inclusions: List[str]
    schedule: str
    registration_info: str
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProgramCreate(BaseModel):
    slug: str
    name: str
    season: str
    description: str
    long_description: str
    age_range: str
    price: float
    inclusions: List[str]
    schedule: str
    registration_info: str
    active: bool = True

# Memberships
class Membership(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    tier: str
    price: float
    benefits: List[str]
    description: str
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MembershipCreate(BaseModel):
    type: str
    tier: str
    price: float
    benefits: List[str]
    description: str
    active: bool = True

# User Membership Enrollment
class UserMembership(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    membership_id: str
    status: str = "active"  # active, expired, cancelled
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: Optional[datetime] = None
    payment_status: str = "pending"  # pending, paid, failed
    auto_renew: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserMembershipCreate(BaseModel):
    user_id: str
    membership_id: str
    auto_renew: bool = False

# Invoices
class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    invoice_number: str
    items: List[Dict]  # [{name, description, amount, quantity}]
    subtotal: float
    tax: float = 0.0
    total: float
    status: str = "draft"  # draft, sent, paid, overdue, cancelled
    due_date: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

class InvoiceCreate(BaseModel):
    user_id: str
    items: List[Dict]
    subtotal: float
    tax: float = 0.0
    total: float
    due_date: Optional[str] = None
    notes: Optional[str] = None

# Payment Plans
class PaymentPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    program_id: Optional[str] = None
    total_amount: float
    num_installments: int
    installment_amount: float
    frequency: str = "monthly"  # weekly, bi-weekly, monthly
    status: str = "active"  # active, completed, cancelled, defaulted
    next_payment_date: Optional[str] = None
    payments_made: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentPlanCreate(BaseModel):
    user_id: str
    program_id: Optional[str] = None
    total_amount: float
    num_installments: int
    frequency: str = "monthly"
    first_payment_date: str

# Payment Plan Transactions
class PaymentPlanTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_plan_id: str
    installment_number: int
    amount: float
    due_date: str
    status: str = "pending"  # pending, paid, failed, skipped
    paid_at: Optional[datetime] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Calendar Events
class CalendarEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    date: str  # YYYY-MM-DD format
    time: Optional[str] = None  # HH:MM format
    location: Optional[str] = None
    type: str  # program, tournament, camp, clinic, workshop, event, other
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: str
    time: Optional[str] = None
    location: Optional[str] = None
    type: str  # program, tournament, camp, clinic, workshop, event, other

# Contact Form Submission
class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str
    status: str = "new"  # new, read, responded
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

# Volunteer Application
class VolunteerApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    interest: str
    availability: str
    experience: Optional[str] = None
    message: Optional[str] = None
    status: str = "pending"  # pending, reviewed, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VolunteerApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    interest: str
    availability: str
    experience: Optional[str] = None
    message: Optional[str] = None

# Sponsorship Inquiry
class SponsorshipInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    contact: str
    email: EmailStr
    phone: str
    interest: str
    message: Optional[str] = None
    status: str = "new"  # new, contacted, in_discussion, approved, declined
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SponsorshipInquiryCreate(BaseModel):
    company: str
    contact: str
    email: EmailStr
    phone: str
    interest: str
    message: Optional[str] = None



# Enhanced Registration
class EnhancedRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_id: Optional[str] = None
    program_id: Optional[str] = None
    
    # Athlete Info
    athlete_first_name: str
    athlete_last_name: str
    athlete_date_of_birth: str
    athlete_gender: str
    athlete_grade: str
    athlete_school: str
    athlete_email: Optional[str] = None
    athlete_phone: Optional[str] = None
    
    # Parent Info
    parent_first_name: str
    parent_last_name: str
    parent_email: str
    parent_phone: str
    parent_address: str
    parent_city: str
    parent_state: str
    parent_zip: Optional[str] = None
    
    # Emergency Contact
    emergency_name: str
    emergency_relationship: str
    emergency_phone: str
    
    # Medical
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    insurance_provider: str
    insurance_policy_number: str
    physician_name: Optional[str] = None
    physician_phone: Optional[str] = None
    
    # Uniform
    shirt_size: str
    shorts_size: str
    shoe_size: Optional[str] = None
    
    # Experience
    years_playing: str
    previous_teams: Optional[str] = None
    position: Optional[str] = None
    skill_level: str
    
    # Consents
    media_consent: bool = False
    liability_waiver: bool
    code_of_conduct: bool
    medical_treatment: bool
    
    # Additional
    special_requests: Optional[str] = None
    how_heard_about: Optional[str] = None
    
    status: str = "pending"  # pending, approved, rejected
    payment_status: str = "unpaid"  # unpaid, pending_payment, paid
    checkout_session_id: Optional[str] = None
    registration_fee: float = 150.0  # Default registration fee
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnhancedRegistrationCreate(BaseModel):
    event_id: Optional[str] = None
    program_id: Optional[str] = None
    athlete_first_name: str
    athlete_last_name: str
    athlete_date_of_birth: str
    athlete_gender: str
    athlete_grade: str
    athlete_school: str
    athlete_email: Optional[str] = None
    athlete_phone: Optional[str] = None
    parent_first_name: str
    parent_last_name: str
    parent_email: str
    parent_phone: str
    parent_address: str
    parent_city: str
    parent_state: str
    parent_zip: Optional[str] = None
    emergency_name: str
    emergency_relationship: str
    emergency_phone: str
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    insurance_provider: str
    insurance_policy_number: str
    physician_name: Optional[str] = None
    physician_phone: Optional[str] = None
    shirt_size: str
    shorts_size: str
    shoe_size: Optional[str] = None
    years_playing: str
    previous_teams: Optional[str] = None
    position: Optional[str] = None
    skill_level: str
    media_consent: bool = False
    liability_waiver: bool
    code_of_conduct: bool
    medical_treatment: bool
    special_requests: Optional[str] = None
    how_heard_about: Optional[str] = None


# Adult Registration (18+)
class AdultRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_id: Optional[str] = None
    program_id: Optional[str] = None
    
    # Participant Info
    participant_name: str
    participant_email: EmailStr
    participant_phone: str
    
    # Emergency Contact
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str
    
    # Medical (Optional)
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    
    # Experience
    skill_level: str
    years_playing: Optional[str] = None
    position: Optional[str] = None
    previous_experience: Optional[str] = None
    
    # Uniform
    shirt_size: str
    shorts_size: str
    
    # Consents
    liability_waiver: bool
    code_of_conduct: bool
    media_consent: bool = False
    
    # Additional
    special_requests: Optional[str] = None
    
    status: str = "pending"
    payment_status: str = "unpaid"  # unpaid, pending_payment, paid
    checkout_session_id: Optional[str] = None
    registration_fee: float = 200.0  # Default adult registration fee
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdultRegistrationCreate(BaseModel):
    event_id: Optional[str] = None
    program_id: Optional[str] = None
    participant_name: str
    participant_email: EmailStr
    participant_phone: str
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    skill_level: str
    years_playing: Optional[str] = None
    position: Optional[str] = None
    previous_experience: Optional[str] = None
    shirt_size: str
    shorts_size: str
    liability_waiver: bool
    code_of_conduct: bool
    media_consent: bool = False
    special_requests: Optional[str] = None


# Teams
class Team(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    division: str  # U10, U12, U14, U16, U18, Adult
    age_group: str
    season: str
    coach_name: str
    coach_email: Optional[str] = None
    coach_phone: Optional[str] = None
    max_roster_size: int = 15
    practice_schedule: Optional[str] = None
    home_venue: Optional[str] = None
    players: List[dict] = []
    status: str = "active"  # active, inactive
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamCreate(BaseModel):
    name: str
    division: str
    age_group: str


# News/Blog Post Model
class NewsPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str  # URL-friendly version of title
    content: str
    excerpt: str  # Short summary
    author_id: str
    author_name: str
    category: str  # news, announcement, feature, tournament, success-story
    tags: List[str] = []
    featured_image: Optional[str] = None
    published: bool = False
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

class NewsPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    published: bool = False

class NewsPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    published: Optional[bool] = None

    season: str


# Testimonial Model
class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_name: str
    author_role: str  # e.g., "Parent", "Player", "Coach", "Alumni"
    content: str
    rating: int  # 1-5 stars
    program: Optional[str] = None  # Which program/service they're reviewing
    featured: bool = False
    approved: bool = False
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestimonialCreate(BaseModel):
    author_name: str
    author_role: str
    content: str
    rating: int
    program: Optional[str] = None

class TestimonialUpdate(BaseModel):
    featured: Optional[bool] = None
    approved: Optional[bool] = None

    coach_name: str
    coach_email: Optional[str] = None
    coach_phone: Optional[str] = None
    max_roster_size: int = 15
    practice_schedule: Optional[str] = None
    home_venue: Optional[str] = None

class AddPlayerToTeam(BaseModel):
    registration_id: str

    shirt_size: str
    shorts_size: str
    liability_waiver: bool
    code_of_conduct: bool
    media_consent: bool = False
    special_requests: Optional[str] = None

    media_consent: bool = False
    liability_waiver: bool
    code_of_conduct: bool
    medical_treatment: bool
    special_requests: Optional[str] = None
    how_heard_about: Optional[str] = None

    type: str = "event"


# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: User = Depends(get_current_user)):
    if user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# Permission checking utilities
def has_permission(user: User, required_permission: str) -> bool:
    """Check if user has a specific permission"""
    if user.role == "super_admin":
        return True
    return required_permission in user.permissions

def has_any_permission(user: User, required_permissions: List[str]) -> bool:
    """Check if user has at least one of the required permissions"""
    if user.role == "super_admin":
        return True
    return any(perm in user.permissions for perm in required_permissions)

def has_all_permissions(user: User, required_permissions: List[str]) -> bool:
    """Check if user has all required permissions"""
    if user.role == "super_admin":
        return True
    return all(perm in user.permissions for perm in required_permissions)

async def require_permission(permission: str):
    """Dependency for routes requiring specific permission"""
    async def permission_checker(user: User = Depends(get_current_user)):
        if not has_permission(user, permission):
            raise HTTPException(
                status_code=403, 
                detail=f"Permission required: {permission}"
            )
        return user
    return permission_checker

async def require_any_permission(permissions: List[str]):
    """Dependency for routes requiring any of the permissions"""
    async def permission_checker(user: User = Depends(get_current_user)):
        if not has_any_permission(user, permissions):
            raise HTTPException(
                status_code=403, 
                detail=f"One of these permissions required: {', '.join(permissions)}"
            )
        return user
    return permission_checker

async def require_role(required_role: str):
    """Dependency for routes requiring specific role"""
    async def role_checker(user: User = Depends(get_current_user)):
        if user.role != required_role and user.role != "super_admin":
            raise HTTPException(
                status_code=403, 
                detail=f"Role required: {required_role}"
            )
        return user
    return role_checker

async def get_super_admin_user(user: User = Depends(get_current_user)):
    """Get current user and verify they are super admin"""
    if user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user


# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate, request: Request):
    """Register a new user with comprehensive validation"""
    try:
        # Validation errors list
        errors = []
        
        # Validate email format
        if not ValidationUtils.validate_email(user_data.email):
            errors.append(ValidationError(
                field="email",
                message="Invalid email format",
                code="invalid_email"
            ))
        
        # Validate password strength
        is_strong, pwd_message = ValidationUtils.validate_password_strength(user_data.password)
        if not is_strong:
            errors.append(ValidationError(
                field="password",
                message=pwd_message,
                code="weak_password"
            ))
        
        # Validate date of birth format
        if not ValidationUtils.validate_date_format(user_data.date_of_birth):
            errors.append(ValidationError(
                field="date_of_birth",
                message="Invalid date format. Use YYYY-MM-DD",
                code="invalid_date"
            ))
        
        # Validate phone number if provided
        if user_data.phone and not ValidationUtils.validate_phone(user_data.phone):
            errors.append(ValidationError(
                field="phone",
                message="Invalid phone number format",
                code="invalid_phone"
            ))
        
        # If there are validation errors, return them
        if errors:
            raise validation_error(errors)
        
        # Check if email already exists
        existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
        if existing:
            raise conflict_error("user", "Email already registered")
        
        # Verify user is 18+ years old
        is_adult, age = ValidationUtils.validate_age(user_data.date_of_birth, 18)
        if not is_adult:
            raise CustomHTTPException(
                status_code=400,
                error="age_requirement",
                message="You must be 18 years or older to create an account",
                details={"current_age": age, "required_age": 18}
            )
        
        # Create user
        user = User(
            email=ValidationUtils.sanitize_input(user_data.email.lower()),
            name=ValidationUtils.sanitize_input(user_data.name),
            role="user",
            date_of_birth=user_data.date_of_birth,
            phone=user_data.phone,
            is_parent=True,  # All adult accounts can manage youth
            permissions=[]
        )
        
        doc = user.model_dump()
        doc['password'] = hash_password(user_data.password)
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.users.insert_one(doc)
        
        # Log registration activity
        await activity_log_service.log_activity(
            action="register",
            resource_type="user",
            user_id=user.id,
            user_email=user.email,
            ip_address=request.client.host if request else None,
            details={"role": user.role}
        )
        
        # Create welcome notification
        try:
            welcome_notification = notification_service.create_welcome_notification(user.id, user.name)
            await db.notifications.insert_one(welcome_notification)
        except Exception as e:
            logging.error(f"Failed to create welcome notification: {e}")
        
        # Send welcome email
        try:
            await email_service.send_email(
                to_email=user.email,
                subject="Welcome to MNASE Basketball League!",
                body=f"""
                <h2>Welcome to MNASE, {user.name}!</h2>
                <p>Your account has been successfully created.</p>
                <p>You can now access your member dashboard to:</p>
                <ul>
                    <li>Register for programs and events</li>
                    <li>Manage your profile</li>
                    <li>Book facilities</li>
                    <li>View upcoming activities</li>
                </ul>
                <p>Thank you for joining MNASE Basketball League!</p>
                """
            )
        except Exception as e:
            logging.error(f"Failed to send welcome email: {e}")
        
        token = create_access_token({"user_id": user.id, "email": user.email})
        return {"user": user, "token": token, "message": "Registration successful"}
        
    except CustomHTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {e}")
        raise server_error("An error occurred during registration")

@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    # Log failed login attempt
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        await activity_log_service.log_activity(
            action="login",
            resource_type="auth",
            user_email=credentials.email,
            ip_address=request.client.host if request else None,
            status="failure",
            error_message="Invalid credentials"
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    # Log successful login
    await activity_log_service.log_activity(
        action="login",
        resource_type="auth",
        user_id=user.id,
        user_email=user.email,
        ip_address=request.client.host if request else None,
        details={"role": user.role}
    )
    
    return {"user": user, "token": token}

@api_router.get("/auth/me", response_model=User)
async def get_me(user: User = Depends(get_current_user)):
    return user



# Parent-Child Account Management Endpoints
@api_router.post("/users/children", response_model=User)
async def create_child_account(
    child_data: ChildAccountCreate,
    request: Request,
    parent: User = Depends(get_current_user)
):
    """Create a child account linked to parent - Parent must be 18+"""
    try:
        # Verify parent is adult
        is_adult, _ = ValidationUtils.validate_age(parent.date_of_birth, 18)
        if not is_adult:
            raise forbidden_error("Only adults can create child accounts")
        
        # Validate child data
        errors = []
        
        if not ValidationUtils.validate_date_format(child_data.date_of_birth):
            errors.append(ValidationError(
                field="date_of_birth",
                message="Invalid date format. Use YYYY-MM-DD",
                code="invalid_date"
            ))
        
        # Verify child is under 18
        is_youth, child_age = ValidationUtils.validate_age(child_data.date_of_birth, 18)
        if is_youth:
            raise CustomHTTPException(
                status_code=400,
                error="age_requirement",
                message="Child must be under 18 years old. For adults, please have them create their own account.",
                details={"age": child_age}
            )
        
        if errors:
            raise validation_error(errors)
        
        # Generate temporary password or use parent email for notifications
        temp_password = f"Youth{str(uuid.uuid4())[:8]}"
        
        # Create child user account
        child = User(
            email=child_data.email or f"youth_{str(uuid.uuid4())[:8]}@mnase.temp",
            name=ValidationUtils.sanitize_input(child_data.name),
            role="user",
            date_of_birth=child_data.date_of_birth,
            phone=child_data.phone,
            parent_account_id=parent.id,
            is_parent=False,
            permissions=[]
        )
        
        doc = child.model_dump()
        doc['password'] = hash_password(temp_password)
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.users.insert_one(doc)
        
        # Update parent's is_parent flag if not already set
        if not parent.is_parent:
            await db.users.update_one(
                {"id": parent.id},
                {"$set": {"is_parent": True}}
            )
        
        # Log activity
        await activity_log_service.log_activity(
            action="create_child_account",
            resource_type="user",
            user_id=parent.id,
            user_email=parent.email,
            resource_id=child.id,
            ip_address=request.client.host if request else None,
            details={
                "child_name": child.name,
                "child_age": child_age
            }
        )
        
        # Send notification to parent
        try:
            await email_service.send_email(
                to_email=parent.email,
                subject="Child Account Created - MNASE Basketball League",
                body=f"""
                <h2>Child Account Created</h2>
                <p>Hi {parent.name},</p>
                <p>You have successfully created a youth account for <strong>{child.name}</strong>.</p>
                <p>You can now register them for programs and manage their activities from your dashboard.</p>
                <p>Thank you for being part of MNASE Basketball League!</p>
                """
            )
        except Exception as e:
            logging.error(f"Failed to send child account creation email: {e}")
        
        return child
        
    except CustomHTTPException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating child account: {e}")
        raise server_error("Failed to create child account")

@api_router.get("/users/children", response_model=List[User])
async def get_my_children(parent: User = Depends(get_current_user)):
    """Get all child accounts linked to current parent"""
    children = await db.users.find(
        {"parent_account_id": parent.id},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    
    result = []
    for child in children:
        if isinstance(child.get('created_at'), str):
            child['created_at'] = datetime.fromisoformat(child['created_at'])
        result.append(User(**child))
    
    return result

@api_router.get("/users/children/{child_id}", response_model=User)
async def get_child_account(
    child_id: str,
    parent: User = Depends(get_current_user)
):
    """Get specific child account - Parent must own the account"""
    child = await db.users.find_one({"id": child_id}, {"_id": 0, "password": 0})
    
    if not child:
        raise not_found_error("Child account", child_id)
    
    # Verify parent owns this child account
    if child.get("parent_account_id") != parent.id:
        raise forbidden_error("You don't have access to this account")
    
    if isinstance(child.get('created_at'), str):
        child['created_at'] = datetime.fromisoformat(child['created_at'])
    
    return User(**child)

@api_router.get("/users/children/{child_id}/activities")
async def get_child_activities(
    child_id: str,
    parent: User = Depends(get_current_user)
):
    """Get all activities for a child (registrations, memberships, etc.)"""
    # Verify parent owns this child account
    child = await db.users.find_one({"id": child_id}, {"_id": 0})
    if not child:
        raise not_found_error("Child account", child_id)
    
    if child.get("parent_account_id") != parent.id:
        raise forbidden_error("You don't have access to this account")
    
    # Get child's registrations
    youth_registrations = await db.enhanced_registrations.find(
        {"user_id": child_id},
        {"_id": 0}
    ).to_list(1000)
    
    adult_registrations = await db.adult_registrations.find(
        {"user_id": child_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Get child's memberships
    memberships = await db.memberships.find(
        {"user_id": child_id},
        {"_id": 0}
    ).to_list(1000)
    
    return {
        "child_id": child_id,
        "child_name": child["name"],
        "youth_registrations": youth_registrations,
        "adult_registrations": adult_registrations,
        "memberships": memberships,
        "total_activities": len(youth_registrations) + len(adult_registrations) + len(memberships)
    }

@api_router.put("/users/children/{child_id}")
async def update_child_account(
    child_id: str,
    update_data: UserCreate,
    parent: User = Depends(get_current_user)
):
    """Update child account information - Parent only"""
    # Verify parent owns this child account
    child = await db.users.find_one({"id": child_id}, {"_id": 0})
    if not child:
        raise not_found_error("Child account", child_id)
    
    if child.get("parent_account_id") != parent.id:
        raise forbidden_error("You don't have access to this account")
    
    # Update child info
    update_dict = {
        "name": ValidationUtils.sanitize_input(update_data.name),
        "date_of_birth": update_data.date_of_birth,
        "phone": update_data.phone
    }
    
    if update_data.email and update_data.email != child.get("email"):
        # Check if new email already exists
        existing = await db.users.find_one({"email": update_data.email}, {"_id": 0})
        if existing:
            raise conflict_error("user", "Email already in use")
        update_dict["email"] = update_data.email
    
    await db.users.update_one({"id": child_id}, {"$set": update_dict})
    
    # Log activity
    await activity_log_service.log_activity(
        action="update_child_account",
        resource_type="user",
        user_id=parent.id,
        user_email=parent.email,
        resource_id=child_id,
        details=update_dict
    )
    
    updated_child = await db.users.find_one({"id": child_id}, {"_id": 0, "password": 0})
    if isinstance(updated_child.get('created_at'), str):
        updated_child['created_at'] = datetime.fromisoformat(updated_child['created_at'])
    
    return User(**updated_child)

@api_router.get("/users/family-dashboard")
async def get_family_dashboard(parent: User = Depends(get_current_user)):
    """Get complete family dashboard with all children and their activities"""
    # Get all children
    children = await db.users.find(
        {"parent_account_id": parent.id},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    
    family_data = {
        "parent": {
            "id": parent.id,
            "name": parent.name,
            "email": parent.email
        },
        "children": [],
        "summary": {
            "total_children": len(children),
            "total_registrations": 0,
            "total_memberships": 0,
            "pending_payments": 0
        }
    }
    
    for child in children:
        # Get child's activities
        youth_regs = await db.enhanced_registrations.find(
            {"user_id": child["id"]},
            {"_id": 0}
        ).to_list(1000)
        
        adult_regs = await db.adult_registrations.find(
            {"user_id": child["id"]},
            {"_id": 0}
        ).to_list(1000)
        
        memberships = await db.memberships.find(
            {"user_id": child["id"]},
            {"_id": 0}
        ).to_list(1000)
        
        # Count pending payments
        pending = sum(1 for r in youth_regs + adult_regs if r.get("payment_status") == "unpaid")
        pending += sum(1 for m in memberships if m.get("payment_status") == "unpaid")
        
        child_data = {
            "id": child["id"],
            "name": child["name"],
            "date_of_birth": child.get("date_of_birth"),
            "registrations_count": len(youth_regs) + len(adult_regs),
            "memberships_count": len(memberships),
            "pending_payments": pending,
            "registrations": youth_regs + adult_regs,
            "memberships": memberships
        }
        
        family_data["children"].append(child_data)
        family_data["summary"]["total_registrations"] += child_data["registrations_count"]
        family_data["summary"]["total_memberships"] += child_data["memberships_count"]
        family_data["summary"]["pending_payments"] += pending
    
    return family_data


# Admin Setup endpoint (one-time use to create super admin)
@api_router.post("/admin/setup")
async def setup_super_admin(request: SetupAdminRequest):
    """Create the first super admin user - secured by secret token"""
    # Verify secret token
    if request.secret_token != SETUP_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid setup token")
    
    # Check if super admin already exists
    existing_super_admin = await db.users.find_one({"role": "super_admin"}, {"_id": 0})
    if existing_super_admin:
        raise HTTPException(status_code=400, detail="Super admin already exists")
    
    # Check if email is already registered
    existing = await db.users.find_one({"email": request.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create super admin user
    hashed_password = hash_password(request.password)
    user = User(
        email=request.email,
        name=request.name,
        role="super_admin",
        date_of_birth=request.date_of_birth,
        permissions=DEFAULT_ROLES['super_admin']['permissions']
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password'] = hashed_password
    
    await db.users.insert_one(user_doc)
    
    # Initialize default roles in database if not exists
    for role_name, role_config in DEFAULT_ROLES.items():
        existing_role = await db.roles.find_one({"name": role_name}, {"_id": 0})
        if not existing_role:
            role = Role(
                name=role_name,
                display_name=role_config['display_name'],
                description=role_config['description'],
                permissions=role_config['permissions'],
                is_system_role=role_config['is_system_role']
            )
            role_doc = role.model_dump()
            role_doc['created_at'] = role_doc['created_at'].isoformat()
            await db.roles.insert_one(role_doc)
    
    # Send notification email
    try:
        await email_service.send_email(
            to_email=request.email,
            subject="Super Admin Account Created - MNASE Basketball League",
            body=f"""
            <h2>Welcome, {request.name}!</h2>
            <p>Your Super Administrator account has been successfully created for the MNASE Basketball League management system.</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p>You now have full access to manage all aspects of the system including:</p>
            <ul>
                <li>User and role management</li>
                <li>System configuration</li>
                <li>All administrative functions</li>
            </ul>
            <p>Please keep your credentials secure.</p>
            """
        )
    except Exception as e:
        logging.error(f"Failed to send super admin creation email: {e}")
    
    # Create notification
    try:
        await notification_service.create_notification(
            user_id=user.id,
            title="Welcome to MNASE!",
            message=f"Your Super Administrator account has been created. You have full system access.",
            notification_type="system"
        )
    except Exception as e:
        logging.error(f"Failed to create notification: {e}")
    
    token = create_access_token({"user_id": user.id, "email": user.email})
    return {"user": user, "token": token, "message": "Super admin created successfully"}

# Role Management Endpoints
@api_router.get("/admin/roles", response_model=List[Role])
async def get_roles(admin: User = Depends(get_admin_user)):
    """Get all roles - Admin access required"""
    roles = await db.roles.find({}, {"_id": 0}).to_list(1000)
    for role in roles:
        if isinstance(role['created_at'], str):
            role['created_at'] = datetime.fromisoformat(role['created_at'])
    return roles

@api_router.get("/admin/roles/{role_id}", response_model=Role)
async def get_role(role_id: str, admin: User = Depends(get_admin_user)):
    """Get a specific role by ID"""
    role = await db.roles.find_one({"id": role_id}, {"_id": 0})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if isinstance(role['created_at'], str):
        role['created_at'] = datetime.fromisoformat(role['created_at'])
    return Role(**role)

@api_router.post("/admin/roles", response_model=Role)
async def create_role(role_data: RoleCreate, super_admin: User = Depends(get_super_admin_user)):
    """Create a new custom role - Super Admin only"""
    # Check if role name already exists
    existing = await db.roles.find_one({"name": role_data.name}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    role = Role(
        name=role_data.name,
        display_name=role_data.display_name,
        description=role_data.description,
        permissions=role_data.permissions,
        is_system_role=False
    )
    
    role_doc = role.model_dump()
    role_doc['created_at'] = role_doc['created_at'].isoformat()
    await db.roles.insert_one(role_doc)
    
    return role

@api_router.put("/admin/roles/{role_id}", response_model=Role)
async def update_role(role_id: str, role_data: RoleUpdate, super_admin: User = Depends(get_super_admin_user)):
    """Update a role - Super Admin only"""
    role = await db.roles.find_one({"id": role_id}, {"_id": 0})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Cannot modify system roles
    if role.get('is_system_role'):
        raise HTTPException(status_code=403, detail="Cannot modify system roles")
    
    update_data = {k: v for k, v in role_data.model_dump().items() if v is not None}
    if update_data:
        await db.roles.update_one({"id": role_id}, {"$set": update_data})
    
    updated_role = await db.roles.find_one({"id": role_id}, {"_id": 0})
    if isinstance(updated_role['created_at'], str):
        updated_role['created_at'] = datetime.fromisoformat(updated_role['created_at'])
    return Role(**updated_role)

@api_router.delete("/admin/roles/{role_id}")
async def delete_role(role_id: str, super_admin: User = Depends(get_super_admin_user)):
    """Delete a custom role - Super Admin only"""
    role = await db.roles.find_one({"id": role_id}, {"_id": 0})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Cannot delete system roles
    if role.get('is_system_role'):
        raise HTTPException(status_code=403, detail="Cannot delete system roles")
    
    # Check if any users have this role
    users_with_role = await db.users.count_documents({"role": role['name']})
    if users_with_role > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete role. {users_with_role} user(s) are assigned this role"
        )
    
    await db.roles.delete_one({"id": role_id})
    return {"message": "Role deleted successfully"}

@api_router.get("/admin/permissions")
async def get_all_permissions(admin: User = Depends(get_admin_user)):
    """Get all available permissions grouped by category"""
    return PERMISSIONS

# User Role Assignment Endpoints
@api_router.post("/admin/users/assign-role")
async def assign_role_to_user(request: AssignRoleRequest, super_admin: User = Depends(get_super_admin_user)):
    """Assign a role to a user - Super Admin only"""
    # Get user
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify role exists
    role = await db.roles.find_one({"name": request.role}, {"_id": 0})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get default permissions for the role
    permissions = role['permissions']
    
    # Override with custom permissions if provided
    if request.permissions:
        permissions = request.permissions
    
    # Update user
    await db.users.update_one(
        {"id": request.user_id},
        {"$set": {"role": request.role, "permissions": permissions}}
    )
    
    # Create notification
    try:
        await notification_service.create_notification(
            user_id=request.user_id,
            title="Role Updated",
            message=f"Your role has been updated to {role['display_name']}",
            notification_type="system"
        )
    except Exception as e:
        logging.error(f"Failed to create notification: {e}")
    
    # Send email
    try:
        await email_service.send_email(
            to_email=user['email'],
            subject="Role Assignment - MNASE Basketball League",
            body=f"""
            <h2>Role Updated</h2>
            <p>Hi {user['name']},</p>
            <p>Your role in the MNASE Basketball League system has been updated to <strong>{role['display_name']}</strong>.</p>
            <p><strong>Description:</strong> {role['description']}</p>
            <p>You now have access to new features and capabilities based on your role.</p>
            """
        )
    except Exception as e:
        logging.error(f"Failed to send role assignment email: {e}")
    
    # Log the role assignment activity
    await activity_log_service.log_activity(
        action="assign_role",
        resource_type="user",
        user_id=super_admin.id,
        user_email=super_admin.email,
        resource_id=request.user_id,
        details={
            "assigned_role": request.role,
            "role_display_name": role['display_name'],
            "target_user_email": user['email'],
            "custom_permissions": request.permissions is not None
        }
    )
    
    updated_user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if isinstance(updated_user['created_at'], str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    return {"message": "Role assigned successfully", "user": User(**updated_user)}

@api_router.get("/admin/users/{user_id}/permissions")
async def get_user_permissions(user_id: str, admin: User = Depends(get_admin_user)):
    """Get a user's permissions"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user_id,
        "role": user.get('role', 'user'),
        "permissions": user.get('permissions', [])
    }



# Activity Log Endpoints
@api_router.post("/admin/activity-logs")
async def create_activity_log(
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[Dict] = None,
    request: Request = None,
    user: User = Depends(get_current_user)
):
    """Create an activity log entry"""
    ip_address = request.client.host if request else None
    
    await activity_log_service.log_activity(
        action=action,
        resource_type=resource_type,
        user_id=user.id,
        user_email=user.email,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address
    )
    
    return {"message": "Activity logged successfully"}

@api_router.post("/admin/activity-logs/query", response_model=List[ActivityLog])
async def query_activity_logs(
    query: ActivityLogQuery,
    admin: User = Depends(get_admin_user)
):
    """Query activity logs with filters - Admin only"""
    start_date = None
    end_date = None
    
    if query.start_date:
        start_date = datetime.fromisoformat(query.start_date)
    if query.end_date:
        end_date = datetime.fromisoformat(query.end_date)
    
    logs = await activity_log_service.get_logs(
        user_id=query.user_id,
        action=query.action,
        resource_type=query.resource_type,
        status=query.status,
        start_date=start_date,
        end_date=end_date,
        limit=query.limit
    )
    
    # Convert to ActivityLog models
    result = []
    for log in logs:
        if isinstance(log.get('created_at'), str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
        result.append(ActivityLog(**log))
    
    return result

@api_router.get("/admin/activity-logs/recent", response_model=List[ActivityLog])
async def get_recent_activity_logs(
    limit: int = 100,
    admin: User = Depends(get_admin_user)
):
    """Get recent activity logs - Admin only"""
    logs = await activity_log_service.get_recent_logs(limit=limit)
    
    result = []
    for log in logs:
        if isinstance(log.get('created_at'), str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
        result.append(ActivityLog(**log))
    
    return result

@api_router.get("/admin/activity-logs/user/{user_id}", response_model=List[ActivityLog])
async def get_user_activity_logs(
    user_id: str,
    limit: int = 50,
    admin: User = Depends(get_admin_user)
):
    """Get activity logs for a specific user - Admin only"""
    logs = await activity_log_service.get_user_activity(user_id=user_id, limit=limit)
    
    result = []
    for log in logs:
        if isinstance(log.get('created_at'), str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
        result.append(ActivityLog(**log))
    
    return result

@api_router.get("/admin/activity-logs/failed", response_model=List[ActivityLog])
async def get_failed_activity_logs(
    limit: int = 50,
    admin: User = Depends(get_admin_user)
):
    """Get failed/error activity logs - Admin only"""
    logs = await activity_log_service.get_failed_actions(limit=limit)
    
    result = []
    for log in logs:
        if isinstance(log.get('created_at'), str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
        result.append(ActivityLog(**log))
    
    return result

@api_router.get("/admin/activity-logs/stats")
async def get_activity_stats(admin: User = Depends(get_admin_user)):
    """Get activity log statistics - Admin only"""
    stats = await activity_log_service.get_stats()
    return stats



# Membership Endpoints
@api_router.get("/memberships/pricing")
async def get_membership_pricing():
    """Get all membership pricing and tiers - Public endpoint"""
    return MEMBERSHIP_PRICING

@api_router.post("/memberships", response_model=Membership)
async def create_membership(
    membership_data: MembershipCreate,
    user: User = Depends(get_current_user)
):
    """Create a new membership for the current user"""
    try:
        # Validate membership configuration
        if not membership_service.validate_membership_config(
            membership_data.membership_type,
            membership_data.tier,
            membership_data.billing_cycle
        ):
            raise validation_error([ValidationError(
                field="membership_type",
                message="Invalid membership configuration",
                code="invalid_config"
            )])
        
        # Get pricing and benefits
        price = membership_service.get_pricing(
            membership_data.membership_type,
            membership_data.tier,
            membership_data.billing_cycle
        )
        benefits = membership_service.get_benefits(
            membership_data.membership_type,
            membership_data.tier
        )
        
        # Calculate end date
        start_date = datetime.now(timezone.utc)
        end_date = membership_service.calculate_end_date(
            start_date,
            membership_data.billing_cycle
        )
        
        # Create membership
        membership = Membership(
            user_id=user.id,
            membership_type=membership_data.membership_type,
            tier=membership_data.tier,
            price=price,
            billing_cycle=membership_data.billing_cycle,
            start_date=start_date,
            end_date=end_date,
            team_name=membership_data.team_name,
            team_size=membership_data.team_size,
            benefits=benefits,
            status="pending",
            payment_status="unpaid"
        )
        
        doc = membership.model_dump()
        doc['start_date'] = doc['start_date'].isoformat()
        doc['end_date'] = doc['end_date'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.memberships.insert_one(doc)
        
        # Log activity
        await activity_log_service.log_activity(
            action="create_membership",
            resource_type="membership",
            user_id=user.id,
            user_email=user.email,
            resource_id=membership.id,
            details={
                "type": membership_data.membership_type,
                "tier": membership_data.tier,
                "price": price
            }
        )
        
        return membership
        
    except CustomHTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating membership: {e}")
        raise server_error("Failed to create membership")

@api_router.post("/memberships/{membership_id}/checkout")
async def create_membership_checkout(
    membership_id: str,
    checkout_request: CheckoutRequest,
    user: User = Depends(get_current_user)
):
    """Create Stripe checkout session for membership payment"""
    try:
        # Get membership
        membership = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
        if not membership:
            raise not_found_error("Membership", membership_id)
        
        # Verify ownership
        if membership["user_id"] != user.id:
            raise forbidden_error("You don't have access to this membership")
        
        # Check if already paid
        if membership["payment_status"] == "paid":
            raise conflict_error("membership", "Membership already paid")
        
        # Create Stripe checkout session
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
        
        session_request = CheckoutSessionRequest(
            success_url=f"{checkout_request.origin_url}/membership-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{checkout_request.origin_url}/memberships",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(membership["price"] * 100),
                    "product_data": {
                        "name": f"{membership['tier'].title()} {membership['membership_type'].title()} Membership",
                        "description": f"{membership['billing_cycle'].title()} billing"
                    }
                },
                "quantity": 1
            }],
            mode="payment",
            metadata={
                "membership_id": membership_id,
                "user_id": user.id
            }
        )
        
        session = stripe_checkout.create_checkout_session(session_request)
        
        # Update membership with session ID
        await db.memberships.update_one(
            {"id": membership_id},
            {"$set": {
                "checkout_session_id": session.id,
                "payment_status": "pending"
            }}
        )
        
        return {"checkout_url": session.url, "session_id": session.id}
        
    except CustomHTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating checkout: {e}")
        raise server_error("Failed to create checkout session")

@api_router.get("/memberships/payment-status/{session_id}")
async def get_membership_payment_status(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Get payment status for a membership checkout session"""
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
        status = stripe_checkout.get_checkout_status(session_id)
        
        # If payment succeeded, update membership
        if status.status == "complete":
            membership = await db.memberships.find_one(
                {"checkout_session_id": session_id},
                {"_id": 0}
            )
            
            if membership and membership["payment_status"] != "paid":
                await db.memberships.update_one(
                    {"id": membership["id"]},
                    {"$set": {
                        "payment_status": "paid",
                        "status": "active"
                    }}
                )
                
                # Log activity
                await activity_log_service.log_activity(
                    action="membership_payment",
                    resource_type="membership",
                    user_id=user.id,
                    user_email=user.email,
                    resource_id=membership["id"],
                    details={"amount": membership["price"]}
                )
                
                # Send confirmation email
                try:
                    await email_service.send_email(
                        to_email=user.email,
                        subject="Membership Activated - MNASE Basketball League",
                        body=f"""
                        <h2>Welcome to {membership['tier'].title()} Membership!</h2>
                        <p>Hi {user.name},</p>
                        <p>Your membership has been activated successfully.</p>
                        <p><strong>Membership Details:</strong></p>
                        <ul>
                            <li>Type: {membership['membership_type'].title()}</li>
                            <li>Tier: {membership['tier'].title()}</li>
                            <li>Billing: {membership['billing_cycle'].title()}</li>
                            <li>Price: ${membership['price']}</li>
                        </ul>
                        <p>Thank you for being part of MNASE Basketball League!</p>
                        """
                    )
                except Exception as e:
                    logging.error(f"Failed to send membership confirmation email: {e}")
        
        return {"status": status.status, "amount_total": status.amount_total}
        
    except Exception as e:
        logging.error(f"Error getting payment status: {e}")
        raise server_error("Failed to get payment status")

@api_router.get("/memberships/my-memberships", response_model=List[Membership])
async def get_my_memberships(user: User = Depends(get_current_user)):
    """Get current user's memberships"""
    memberships = await db.memberships.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    
    result = []
    for membership in memberships:
        if isinstance(membership.get('start_date'), str):
            membership['start_date'] = datetime.fromisoformat(membership['start_date'])
        if isinstance(membership.get('end_date'), str):
            membership['end_date'] = datetime.fromisoformat(membership['end_date'])
        if isinstance(membership.get('created_at'), str):
            membership['created_at'] = datetime.fromisoformat(membership['created_at'])
        result.append(Membership(**membership))
    
    return result

@api_router.get("/admin/memberships", response_model=List[Membership])
async def get_all_memberships(admin: User = Depends(get_admin_user)):
    """Get all memberships - Admin only"""
    memberships = await db.memberships.find({}, {"_id": 0}).to_list(1000)
    
    result = []
    for membership in memberships:
        if isinstance(membership.get('start_date'), str):
            membership['start_date'] = datetime.fromisoformat(membership['start_date'])
        if isinstance(membership.get('end_date'), str):
            membership['end_date'] = datetime.fromisoformat(membership['end_date'])
        if isinstance(membership.get('created_at'), str):
            membership['created_at'] = datetime.fromisoformat(membership['created_at'])
        result.append(Membership(**membership))
    
    return result

@api_router.put("/admin/memberships/{membership_id}")
async def update_membership_admin(
    membership_id: str,
    update_data: MembershipUpdate,
    admin: User = Depends(get_admin_user)
):
    """Update membership - Admin only"""
    membership = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
    if not membership:
        raise not_found_error("Membership", membership_id)
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.memberships.update_one({"id": membership_id}, {"$set": update_dict})
        
        # Log activity
        await activity_log_service.log_activity(
            action="update_membership",
            resource_type="membership",
            user_id=admin.id,
            user_email=admin.email,
            resource_id=membership_id,
            details=update_dict
        )
    
    updated = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
    if isinstance(updated.get('start_date'), str):
        updated['start_date'] = datetime.fromisoformat(updated['start_date'])
    if isinstance(updated.get('end_date'), str):
        updated['end_date'] = datetime.fromisoformat(updated['end_date'])
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Membership(**updated)



# Basketball Stats Endpoints
@api_router.get("/stats/players", response_model=List[PlayerStats])
async def get_player_stats(
    season: Optional[str] = None,
    team_name: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Get player statistics - Logged in users only"""
    query = {}
    if season:
        query["season"] = season
    if team_name:
        query["team_name"] = team_name
    
    players = await db.player_stats.find(query, {"_id": 0}).sort("points", -1).to_list(1000)
    
    result = []
    for player in players:
        if isinstance(player.get('created_at'), str):
            player['created_at'] = datetime.fromisoformat(player['created_at'])
        if isinstance(player.get('updated_at'), str):
            player['updated_at'] = datetime.fromisoformat(player['updated_at'])
        result.append(PlayerStats(**player))
    
    return result

@api_router.get("/stats/games", response_model=List[GameStats])
async def get_game_stats(
    season: Optional[str] = None,
    team_name: Optional[str] = None,
    game_type: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Get game statistics - Logged in users only"""
    query = {}
    if season:
        query["season"] = season
    if team_name:
        query["$or"] = [{"home_team": team_name}, {"away_team": team_name}]
    if game_type:
        query["game_type"] = game_type
    
    games = await db.game_stats.find(query, {"_id": 0}).sort("game_date", -1).to_list(1000)
    
    result = []
    for game in games:
        if isinstance(game.get('created_at'), str):
            game['created_at'] = datetime.fromisoformat(game['created_at'])
        if isinstance(game.get('updated_at'), str):
            game['updated_at'] = datetime.fromisoformat(game['updated_at'])
        result.append(GameStats(**game))
    
    return result

@api_router.get("/stats/standings", response_model=List[TeamStandings])
async def get_team_standings(
    season: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Get team standings - Logged in users only"""
    query = {}
    if season:
        query["season"] = season
    
    standings = await db.team_standings.find(query, {"_id": 0}).sort("wins", -1).to_list(1000)
    
    result = []
    for team in standings:
        if isinstance(team.get('created_at'), str):
            team['created_at'] = datetime.fromisoformat(team['created_at'])
        if isinstance(team.get('updated_at'), str):
            team['updated_at'] = datetime.fromisoformat(team['updated_at'])
        result.append(TeamStandings(**team))
    
    return result

@api_router.get("/stats/leaders")
async def get_stat_leaders(
    stat_type: str = "points",
    season: Optional[str] = None,
    limit: int = 10,
    user: User = Depends(get_current_user)
):
    """Get statistical leaders - Logged in users only"""
    query = {}
    if season:
        query["season"] = season
    
    # Valid stat types
    valid_stats = ["points", "assists", "rebounds", "steals", "blocks", "three_pointers_made"]
    if stat_type not in valid_stats:
        stat_type = "points"
    
    leaders = await db.player_stats.find(query, {"_id": 0}).sort(stat_type, -1).limit(limit).to_list(limit)
    
    return {
        "stat_type": stat_type,
        "season": season,
        "leaders": leaders
    }

# Admin-only Stats Management
@api_router.post("/admin/stats/players", response_model=PlayerStats)
async def create_player_stats(
    stats_data: PlayerStatsCreate,
    admin: User = Depends(get_admin_user)
):
    """Create player stats entry - Admin only"""
    try:
        # Check if player already exists for this season
        existing = await db.player_stats.find_one({
            "player_name": stats_data.player_name,
            "team_name": stats_data.team_name,
            "season": stats_data.season
        }, {"_id": 0})
        
        if existing:
            raise conflict_error("player_stats", "Player stats already exist for this season")
        
        stats = PlayerStats(
            player_name=stats_data.player_name,
            team_name=stats_data.team_name,
            jersey_number=stats_data.jersey_number,
            position=stats_data.position,
            season=stats_data.season
        )
        
        doc = stats.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.player_stats.insert_one(doc)
        
        # Log activity
        await activity_log_service.log_activity(
            action="create_player_stats",
            resource_type="stats",
            user_id=admin.id,
            user_email=admin.email,
            resource_id=stats.id,
            details={"player": stats_data.player_name, "team": stats_data.team_name}
        )
        
        return stats
        
    except CustomHTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating player stats: {e}")
        raise server_error("Failed to create player stats")

@api_router.put("/admin/stats/players/{player_id}")
async def update_player_stats(
    player_id: str,
    update_data: StatsUpdate,
    admin: User = Depends(get_admin_user)
):
    """Update player statistics - Admin only"""
    player = await db.player_stats.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise not_found_error("Player stats", player_id)
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    if update_dict:
        await db.player_stats.update_one({"id": player_id}, {"$set": update_dict})
        
        # Log activity
        await activity_log_service.log_activity(
            action="update_player_stats",
            resource_type="stats",
            user_id=admin.id,
            user_email=admin.email,
            resource_id=player_id,
            details=update_dict
        )
    
    updated = await db.player_stats.find_one({"id": player_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return PlayerStats(**updated)

@api_router.post("/admin/stats/games", response_model=GameStats)
async def create_game_stats(
    game_data: GameStatsCreate,
    admin: User = Depends(get_admin_user)
):
    """Create game stats entry - Admin only"""
    try:
        game = GameStats(**game_data.model_dump())
        
        doc = game.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.game_stats.insert_one(doc)
        
        # Update team standings
        await update_team_standings(game_data.home_team, game_data.away_team, 
                                    game_data.home_score, game_data.away_score, 
                                    game_data.season)
        
        # Log activity
        await activity_log_service.log_activity(
            action="create_game_stats",
            resource_type="stats",
            user_id=admin.id,
            user_email=admin.email,
            resource_id=game.id,
            details={"home": game_data.home_team, "away": game_data.away_team, "score": f"{game_data.home_score}-{game_data.away_score}"}
        )
        
        return game
        
    except Exception as e:
        logging.error(f"Error creating game stats: {e}")
        raise server_error("Failed to create game stats")

@api_router.delete("/admin/stats/players/{player_id}")
async def delete_player_stats(
    player_id: str,
    admin: User = Depends(get_admin_user)
):
    """Delete player statistics - Admin only"""
    player = await db.player_stats.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise not_found_error("Player stats", player_id)
    
    await db.player_stats.delete_one({"id": player_id})
    
    # Log activity
    await activity_log_service.log_activity(
        action="delete_player_stats",
        resource_type="stats",
        user_id=admin.id,
        user_email=admin.email,
        resource_id=player_id,
        details={"player": player['player_name']}
    )
    
    return {"message": "Player stats deleted successfully"}

@api_router.delete("/admin/stats/games/{game_id}")
async def delete_game_stats(
    game_id: str,
    admin: User = Depends(get_admin_user)
):
    """Delete game statistics - Admin only"""
    game = await db.game_stats.find_one({"id": game_id}, {"_id": 0})
    if not game:
        raise not_found_error("Game stats", game_id)
    
    await db.game_stats.delete_one({"id": game_id})
    
    # Log activity
    await activity_log_service.log_activity(
        action="delete_game_stats",
        resource_type="stats",
        user_id=admin.id,
        user_email=admin.email,
        resource_id=game_id,
        details={"game": f"{game['home_team']} vs {game['away_team']}"}
    )
    
    return {"message": "Game stats deleted successfully"}

# Helper function to update team standings
async def update_team_standings(home_team: str, away_team: str, home_score: int, away_score: int, season: str):
    """Update team standings based on game result"""
    # Update home team
    home_standing = await db.team_standings.find_one({"team_name": home_team, "season": season}, {"_id": 0})
    if not home_standing:
        home_standing = TeamStandings(team_name=home_team, season=season).model_dump()
        home_standing['created_at'] = home_standing['created_at'].isoformat()
        home_standing['updated_at'] = home_standing['updated_at'].isoformat()
        await db.team_standings.insert_one(home_standing)
    
    # Update away team
    away_standing = await db.team_standings.find_one({"team_name": away_team, "season": season}, {"_id": 0})
    if not away_standing:
        away_standing = TeamStandings(team_name=away_team, season=season).model_dump()
        away_standing['created_at'] = away_standing['created_at'].isoformat()
        away_standing['updated_at'] = away_standing['updated_at'].isoformat()
        await db.team_standings.insert_one(away_standing)
    
    # Update records
    if home_score > away_score:
        # Home team wins
        await db.team_standings.update_one(
            {"team_name": home_team, "season": season},
            {"$inc": {"wins": 1, "points_for": home_score, "points_against": away_score}}
        )
        await db.team_standings.update_one(
            {"team_name": away_team, "season": season},
            {"$inc": {"losses": 1, "points_for": away_score, "points_against": home_score}}
        )
    else:
        # Away team wins
        await db.team_standings.update_one(
            {"team_name": away_team, "season": season},
            {"$inc": {"wins": 1, "points_for": away_score, "points_against": home_score}}
        )
        await db.team_standings.update_one(
            {"team_name": home_team, "season": season},
            {"$inc": {"losses": 1, "points_for": home_score, "points_against": away_score}}
        )


# Event endpoints
@api_router.get("/events", response_model=List[Event])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    for event in events:
        if isinstance(event['created_at'], str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if isinstance(event['created_at'], str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    return Event(**event)

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, admin: User = Depends(get_admin_user)):
    """Create event with optional recurring pattern"""
    try:
        # Create base event
        event = Event(**event_data.model_dump())
        doc = event.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        # Check for conflicts if end_time provided
        if event_data.end_time:
            all_events = await db.events.find({}, {"_id": 0}).to_list(1000)
            has_conflict = calendar_service.check_event_conflict(
                event_data.location,
                event_data.date,
                event_data.time,
                event_data.end_time,
                all_events
            )
            if has_conflict:
                raise CustomHTTPException(
                    status_code=409,
                    error="scheduling_conflict",
                    message="Event conflicts with existing event at this location and time"
                )
        
        await db.events.insert_one(doc)
        
        # Generate recurring events if specified
        if event_data.event_type == "recurring" and event_data.recurrence_pattern and event_data.recurrence_end_date:
            recurring_events = calendar_service.generate_recurring_events(
                doc,
                event_data.date,
                event_data.recurrence_end_date,
                event_data.recurrence_pattern,
                event_data.recurrence_days
            )
            
            # Insert all recurring instances
            if recurring_events:
                for rec_event in recurring_events:
                    rec_event['created_at'] = datetime.now(timezone.utc).isoformat()
                await db.events.insert_many(recurring_events)
        
        # Log activity
        await activity_log_service.log_activity(
            action="create_event",
            resource_type="event",
            user_id=admin.id,
            user_email=admin.email,
            resource_id=event.id,
            details={
                "title": event_data.title,
                "date": event_data.date,
                "recurring": event_data.event_type == "recurring"
            }
        )
        
        return event
        
    except CustomHTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating event: {e}")
        raise server_error("Failed to create event")

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventCreate, admin: User = Depends(get_admin_user)):
    existing = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    
    updated_doc = event_data.model_dump()
    await db.events.update_one({"id": event_id}, {"$set": updated_doc})
    
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if isinstance(event['created_at'], str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    return Event(**event)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, admin: User = Depends(get_admin_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# Facility endpoints
@api_router.get("/facilities", response_model=List[Facility])
async def get_facilities():
    facilities = await db.facilities.find({}, {"_id": 0}).to_list(1000)
    for facility in facilities:
        if isinstance(facility['created_at'], str):
            facility['created_at'] = datetime.fromisoformat(facility['created_at'])
    return facilities

@api_router.get("/facilities/{facility_id}", response_model=Facility)
async def get_facility(facility_id: str):
    facility = await db.facilities.find_one({"id": facility_id}, {"_id": 0})
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    if isinstance(facility['created_at'], str):
        facility['created_at'] = datetime.fromisoformat(facility['created_at'])
    return Facility(**facility)

@api_router.post("/facilities", response_model=Facility)
async def create_facility(facility_data: FacilityCreate, admin: User = Depends(get_admin_user)):
    facility = Facility(**facility_data.model_dump())
    doc = facility.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.facilities.insert_one(doc)
    return facility

@api_router.put("/facilities/{facility_id}", response_model=Facility)
async def update_facility(facility_id: str, facility_data: FacilityCreate, admin: User = Depends(get_admin_user)):
    existing = await db.facilities.find_one({"id": facility_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    updated_doc = facility_data.model_dump()
    await db.facilities.update_one({"id": facility_id}, {"$set": updated_doc})
    
    facility = await db.facilities.find_one({"id": facility_id}, {"_id": 0})
    if isinstance(facility['created_at'], str):
        facility['created_at'] = datetime.fromisoformat(facility['created_at'])
    return Facility(**facility)

@api_router.delete("/facilities/{facility_id}")
async def delete_facility(facility_id: str, admin: User = Depends(get_admin_user)):
    result = await db.facilities.delete_one({"id": facility_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Facility not found")
    return {"message": "Facility deleted"}

# Registration endpoints
@api_router.get("/registrations", response_model=List[Registration])
async def get_registrations(user: User = Depends(get_current_user)):
    query = {} if user.role == "admin" else {"user_id": user.id}
    registrations = await db.registrations.find(query, {"_id": 0}).to_list(1000)
    for reg in registrations:
        if isinstance(reg['created_at'], str):
            reg['created_at'] = datetime.fromisoformat(reg['created_at'])
    return registrations

@api_router.post("/registrations/checkout")
async def create_registration_checkout(reg_data: RegistrationCreate, checkout_req: CheckoutRequest, user: User = Depends(get_current_user)):
    event = await db.events.find_one({"id": reg_data.event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    registration = Registration(
        user_id=user.id,
        event_id=reg_data.event_id,
        payment_status="pending"
    )
    
    # Create Stripe checkout
    webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{checkout_req.origin_url}/registration-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{checkout_req.origin_url}/events"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(event['price']),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "event_registration",
            "registration_id": registration.id,
            "event_id": reg_data.event_id,
            "user_id": user.id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    registration.checkout_session_id = session.session_id
    
    # Save registration
    reg_doc = registration.model_dump()
    reg_doc['created_at'] = reg_doc['created_at'].isoformat()
    await db.registrations.insert_one(reg_doc)
    
    # Save payment transaction
    payment_txn = PaymentTransaction(
        session_id=session.session_id,
        user_id=user.id,
        amount=float(event['price']),
        currency="usd",
        payment_status="pending",
        metadata=checkout_request.metadata
    )
    txn_doc = payment_txn.model_dump()
    txn_doc['created_at'] = txn_doc['created_at'].isoformat()
    txn_doc['updated_at'] = txn_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(txn_doc)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/registrations/status/{session_id}")
async def get_registration_status(session_id: str, user: User = Depends(get_current_user)):
    webhook_url = "http://localhost:8001/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    existing_txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing_txn and existing_txn.get('payment_status') != 'completed':
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update registration
        if status.payment_status == "paid":
            await db.registrations.update_one(
                {"checkout_session_id": session_id},
                {"$set": {"payment_status": "completed"}}
            )
    
    return status

# Booking endpoints
@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(user: User = Depends(get_current_user)):
    query = {} if user.role == "admin" else {"user_id": user.id}
    bookings = await db.bookings.find(query, {"_id": 0}).to_list(1000)
    for booking in bookings:
        if isinstance(booking['created_at'], str):
            booking['created_at'] = datetime.fromisoformat(booking['created_at'])
    return bookings

@api_router.post("/bookings/checkout")
async def create_booking_checkout(booking_data: BookingCreate, checkout_req: CheckoutRequest, user: User = Depends(get_current_user)):
    facility = await db.facilities.find_one({"id": booking_data.facility_id}, {"_id": 0})
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    total_cost = facility['hourly_rate'] * booking_data.hours
    
    booking = Booking(
        user_id=user.id,
        facility_id=booking_data.facility_id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        hours=booking_data.hours,
        total_cost=total_cost,
        payment_status="pending"
    )
    
    # Create Stripe checkout
    webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{checkout_req.origin_url}/booking-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{checkout_req.origin_url}/facilities"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(total_cost),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "facility_booking",
            "booking_id": booking.id,
            "facility_id": booking_data.facility_id,
            "user_id": user.id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    booking.checkout_session_id = session.session_id
    
    # Save booking
    booking_doc = booking.model_dump()
    booking_doc['created_at'] = booking_doc['created_at'].isoformat()
    await db.bookings.insert_one(booking_doc)
    
    # Save payment transaction
    payment_txn = PaymentTransaction(
        session_id=session.session_id,
        user_id=user.id,
        amount=float(total_cost),
        currency="usd",
        payment_status="pending",
        metadata=checkout_request.metadata
    )
    txn_doc = payment_txn.model_dump()
    txn_doc['created_at'] = txn_doc['created_at'].isoformat()
    txn_doc['updated_at'] = txn_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(txn_doc)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/bookings/status/{session_id}")
async def get_booking_status(session_id: str, user: User = Depends(get_current_user)):
    webhook_url = "http://localhost:8001/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    existing_txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing_txn and existing_txn.get('payment_status') != 'completed':
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update booking
        if status.payment_status == "paid":
            await db.bookings.update_one(
                {"checkout_session_id": session_id},
                {"$set": {"payment_status": "completed"}}
            )
    
    return status

# User Management (Admin)
@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(admin: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/admin/users/{user_id}", response_model=User)
async def get_user_by_id(user_id: str, admin: User = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: User = Depends(get_admin_user)):
    if role not in ["admin", "member"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User role updated to {role}"}

# Program endpoints
@api_router.get("/programs", response_model=List[Program])
async def get_programs():
    programs = await db.programs.find({}, {"_id": 0}).to_list(1000)
    for program in programs:
        if isinstance(program['created_at'], str):
            program['created_at'] = datetime.fromisoformat(program['created_at'])
    return programs

@api_router.get("/programs/{program_id}", response_model=Program)
async def get_program(program_id: str):
    program = await db.programs.find_one({"id": program_id}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    if isinstance(program['created_at'], str):
        program['created_at'] = datetime.fromisoformat(program['created_at'])
    return Program(**program)

@api_router.get("/programs/slug/{slug}", response_model=Program)
async def get_program_by_slug(slug: str):
    program = await db.programs.find_one({"slug": slug}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    if isinstance(program['created_at'], str):
        program['created_at'] = datetime.fromisoformat(program['created_at'])
    return Program(**program)

@api_router.post("/programs", response_model=Program)
async def create_program(program_data: ProgramCreate, admin: User = Depends(get_admin_user)):
    program = Program(**program_data.model_dump())
    doc = program.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.programs.insert_one(doc)
    return program

@api_router.put("/programs/{program_id}", response_model=Program)
async def update_program(program_id: str, program_data: ProgramCreate, admin: User = Depends(get_admin_user)):
    existing = await db.programs.find_one({"id": program_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Program not found")
    
    updated_doc = program_data.model_dump()
    await db.programs.update_one({"id": program_id}, {"$set": updated_doc})
    
    program = await db.programs.find_one({"id": program_id}, {"_id": 0})
    if isinstance(program['created_at'], str):
        program['created_at'] = datetime.fromisoformat(program['created_at'])
    return Program(**program)

@api_router.delete("/programs/{program_id}")
async def delete_program(program_id: str, admin: User = Depends(get_admin_user)):
    result = await db.programs.delete_one({"id": program_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"message": "Program deleted"}

# Membership endpoints
@api_router.get("/memberships", response_model=List[Membership])
async def get_memberships():
    memberships = await db.memberships.find({}, {"_id": 0}).to_list(1000)
    for membership in memberships:
        if isinstance(membership['created_at'], str):
            membership['created_at'] = datetime.fromisoformat(membership['created_at'])
    return memberships

@api_router.get("/memberships/{membership_id}", response_model=Membership)
async def get_membership(membership_id: str):
    membership = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    if isinstance(membership['created_at'], str):
        membership['created_at'] = datetime.fromisoformat(membership['created_at'])
    return Membership(**membership)

@api_router.post("/memberships", response_model=Membership)
async def create_membership(membership_data: MembershipCreate, admin: User = Depends(get_admin_user)):
    membership = Membership(**membership_data.model_dump())
    doc = membership.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.memberships.insert_one(doc)
    return membership

@api_router.put("/memberships/{membership_id}", response_model=Membership)
async def update_membership(membership_id: str, membership_data: MembershipCreate, admin: User = Depends(get_admin_user)):
    existing = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    updated_doc = membership_data.model_dump()
    await db.memberships.update_one({"id": membership_id}, {"$set": updated_doc})
    
    membership = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
    if isinstance(membership['created_at'], str):
        membership['created_at'] = datetime.fromisoformat(membership['created_at'])
    return Membership(**membership)

@api_router.delete("/memberships/{membership_id}")
async def delete_membership(membership_id: str, admin: User = Depends(get_admin_user)):
    result = await db.memberships.delete_one({"id": membership_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Membership not found")
    return {"message": "Membership deleted"}

# User Memberships
@api_router.post("/admin/user-memberships", response_model=UserMembership)
async def enroll_user_in_membership(enrollment: UserMembershipCreate, admin: User = Depends(get_admin_user)):
    user = await db.users.find_one({"id": enrollment.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    membership = await db.memberships.find_one({"id": enrollment.membership_id}, {"_id": 0})
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    # Calculate end date (1 year from now)
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=365)
    
    user_membership = UserMembership(
        user_id=enrollment.user_id,
        membership_id=enrollment.membership_id,
        start_date=start_date,
        end_date=end_date,
        auto_renew=enrollment.auto_renew
    )
    
    doc = user_membership.model_dump()
    doc['start_date'] = doc['start_date'].isoformat()
    doc['end_date'] = doc['end_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.user_memberships.insert_one(doc)
    return user_membership

@api_router.get("/admin/user-memberships")
async def get_all_user_memberships(admin: User = Depends(get_admin_user)):
    memberships = await db.user_memberships.find({}, {"_id": 0}).to_list(1000)
    for m in memberships:
        if isinstance(m['start_date'], str):
            m['start_date'] = datetime.fromisoformat(m['start_date'])
        if m.get('end_date') and isinstance(m['end_date'], str):
            m['end_date'] = datetime.fromisoformat(m['end_date'])
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return memberships

@api_router.get("/user-memberships/me")
async def get_my_memberships(user: User = Depends(get_current_user)):
    memberships = await db.user_memberships.find({"user_id": user.id}, {"_id": 0}).to_list(100)
    for m in memberships:
        if isinstance(m['start_date'], str):
            m['start_date'] = datetime.fromisoformat(m['start_date'])
        if m.get('end_date') and isinstance(m['end_date'], str):
            m['end_date'] = datetime.fromisoformat(m['end_date'])
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return memberships

@api_router.put("/admin/user-memberships/{membership_id}/status")
async def update_user_membership_status(membership_id: str, status: str, admin: User = Depends(get_admin_user)):
    if status not in ["active", "expired", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.user_memberships.update_one({"id": membership_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Membership enrollment not found")
    return {"message": f"Membership status updated to {status}"}

# Invoice Management
@api_router.post("/admin/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate, admin: User = Depends(get_admin_user)):
    # Generate invoice number
    count = await db.invoices.count_documents({})
    invoice_number = f"INV-{datetime.now().year}-{count + 1:05d}"
    
    invoice = Invoice(
        **invoice_data.model_dump(),
        invoice_number=invoice_number,
        status="draft"
    )
    
    doc = invoice.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.invoices.insert_one(doc)
    return invoice

@api_router.get("/admin/invoices")
async def get_all_invoices(admin: User = Depends(get_admin_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    for inv in invoices:
        if isinstance(inv['created_at'], str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
        if inv.get('sent_at') and isinstance(inv['sent_at'], str):
            inv['sent_at'] = datetime.fromisoformat(inv['sent_at'])
        if inv.get('paid_at') and isinstance(inv['paid_at'], str):
            inv['paid_at'] = datetime.fromisoformat(inv['paid_at'])
    return invoices

@api_router.get("/admin/invoices/user/{user_id}")
async def get_user_invoices(user_id: str, admin: User = Depends(get_admin_user)):
    invoices = await db.invoices.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    for inv in invoices:
        if isinstance(inv['created_at'], str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
        if inv.get('sent_at') and isinstance(inv['sent_at'], str):
            inv['sent_at'] = datetime.fromisoformat(inv['sent_at'])
        if inv.get('paid_at') and isinstance(inv['paid_at'], str):
            inv['paid_at'] = datetime.fromisoformat(inv['paid_at'])
    return invoices

@api_router.get("/invoices/me")
async def get_my_invoices(user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({"user_id": user.id}, {"_id": 0}).to_list(100)
    for inv in invoices:
        if isinstance(inv['created_at'], str):
            inv['created_at'] = datetime.fromisoformat(inv['created_at'])
        if inv.get('sent_at') and isinstance(inv['sent_at'], str):
            inv['sent_at'] = datetime.fromisoformat(inv['sent_at'])
        if inv.get('paid_at') and isinstance(inv['paid_at'], str):
            inv['paid_at'] = datetime.fromisoformat(inv['paid_at'])
    return invoices

@api_router.put("/admin/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, status: str, admin: User = Depends(get_admin_user)):
    if status not in ["draft", "sent", "paid", "overdue", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    update_data = {"status": status}
    if status == "sent" and not await db.invoices.find_one({"id": invoice_id, "sent_at": {"$ne": None}}):
        update_data["sent_at"] = datetime.now(timezone.utc).isoformat()
    elif status == "paid":
        update_data["paid_at"] = datetime.now(timezone.utc).isoformat()
        update_data["payment_status"] = "paid"
    
    result = await db.invoices.update_one({"id": invoice_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": f"Invoice status updated to {status}"}

# Payment Plans
@api_router.post("/admin/payment-plans", response_model=PaymentPlan)
async def create_payment_plan(plan_data: PaymentPlanCreate, admin: User = Depends(get_admin_user)):
    installment_amount = plan_data.total_amount / plan_data.num_installments
    
    payment_plan = PaymentPlan(
        user_id=plan_data.user_id,
        program_id=plan_data.program_id,
        total_amount=plan_data.total_amount,
        num_installments=plan_data.num_installments,
        installment_amount=installment_amount,
        frequency=plan_data.frequency,
        next_payment_date=plan_data.first_payment_date
    )
    
    doc = payment_plan.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.payment_plans.insert_one(doc)
    
    # Create payment plan transactions
    from datetime import datetime as dt
    current_date = dt.strptime(plan_data.first_payment_date, "%Y-%m-%d")
    
    for i in range(1, plan_data.num_installments + 1):
        transaction = PaymentPlanTransaction(
            payment_plan_id=payment_plan.id,
            installment_number=i,
            amount=installment_amount,
            due_date=current_date.strftime("%Y-%m-%d")
        )
        txn_doc = transaction.model_dump()
        txn_doc['created_at'] = txn_doc['created_at'].isoformat()
        await db.payment_plan_transactions.insert_one(txn_doc)
        
        # Calculate next date based on frequency
        if plan_data.frequency == "weekly":
            current_date += timedelta(weeks=1)
        elif plan_data.frequency == "bi-weekly":
            current_date += timedelta(weeks=2)
        else:  # monthly
            current_date += timedelta(days=30)
    
    return payment_plan

@api_router.get("/admin/payment-plans")
async def get_all_payment_plans(admin: User = Depends(get_admin_user)):
    plans = await db.payment_plans.find({}, {"_id": 0}).to_list(1000)
    for plan in plans:
        if isinstance(plan['created_at'], str):
            plan['created_at'] = datetime.fromisoformat(plan['created_at'])
    return plans

@api_router.get("/admin/payment-plans/{plan_id}/transactions")
async def get_payment_plan_transactions(plan_id: str, admin: User = Depends(get_admin_user)):
    transactions = await db.payment_plan_transactions.find({"payment_plan_id": plan_id}, {"_id": 0}).to_list(100)
    for txn in transactions:
        if isinstance(txn['created_at'], str):
            txn['created_at'] = datetime.fromisoformat(txn['created_at'])
        if txn.get('paid_at') and isinstance(txn['paid_at'], str):
            txn['paid_at'] = datetime.fromisoformat(txn['paid_at'])
    return transactions

@api_router.get("/payment-plans/me")
async def get_my_payment_plans(user: User = Depends(get_current_user)):
    plans = await db.payment_plans.find({"user_id": user.id}, {"_id": 0}).to_list(100)
    for plan in plans:
        if isinstance(plan['created_at'], str):
            plan['created_at'] = datetime.fromisoformat(plan['created_at'])
    return plans

@api_router.put("/admin/payment-plan-transactions/{transaction_id}/mark-paid")


# Adult Registration Endpoints
@api_router.post("/adult-registrations", response_model=AdultRegistration)
async def create_adult_registration(registration_data: AdultRegistrationCreate, current_user: User = Depends(get_current_user)):
    """Create a new adult registration (18+ programs)"""
    registration = AdultRegistration(**registration_data.model_dump(), user_id=current_user.id)
    doc = registration.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.adult_registrations.insert_one(doc)
    
    # Send confirmation email
    try:
        email_service.send_registration_confirmation(
            to_email=registration_data.participant_email,
            athlete_name=registration_data.participant_name,
            parent_name=registration_data.participant_name,
            registration_id=registration.id
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return registration


# Teams Endpoints
@api_router.post("/admin/teams", response_model=Team)
async def create_team(team_data: TeamCreate, admin: User = Depends(get_admin_user)):
    """Create a new team (admin only)"""
    team = Team(**team_data.model_dump())
    doc = team.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.teams.insert_one(doc)
    return team

@api_router.get("/admin/teams", response_model=List[Team])
async def get_all_teams(admin: User = Depends(get_admin_user)):
    """Get all teams (admin only)"""
    teams = await db.teams.find({}, {"_id": 0}).to_list(length=None)
    return [Team(**team) for team in teams]

@api_router.put("/admin/teams/{team_id}", response_model=Team)
async def update_team(team_id: str, team_data: TeamCreate, admin: User = Depends(get_admin_user)):
    """Update a team (admin only)"""
    existing = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")
    
    await db.teams.update_one(
        {"id": team_id},
        {"$set": team_data.model_dump()}
    )
    updated = await db.teams.find_one({"id": team_id}, {"_id": 0})
    return Team(**updated)

@api_router.delete("/admin/teams/{team_id}")
async def delete_team(team_id: str, admin: User = Depends(get_admin_user)):
    """Delete a team (admin only)"""
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}

@api_router.post("/admin/teams/{team_id}/players")
async def add_player_to_team(team_id: str, player_data: AddPlayerToTeam, admin: User = Depends(get_admin_user)):
    """Add player to team (admin only)"""
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get registration details
    registration = await db.enhanced_registrations.find_one({"id": player_data.registration_id}, {"_id": 0})
    if not registration:
        registration = await db.adult_registrations.find_one({"id": player_data.registration_id}, {"_id": 0})
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Check if team is full
    if len(team.get('players', [])) >= team['max_roster_size']:
        raise HTTPException(status_code=400, detail="Team roster is full")
    
    # Create player object
    player = {
        "id": str(uuid.uuid4()),
        "registration_id": player_data.registration_id,
        "name": f"{registration.get('athlete_first_name', registration.get('participant_name', 'Unknown'))} {registration.get('athlete_last_name', '')}".strip(),
        "position": registration.get('position', ''),
        "jersey_number": None
    }
    
    # Add player to team
    await db.teams.update_one(
        {"id": team_id},
        {"$push": {"players": player}}
    )
    
    return {"message": "Player added to team successfully"}

@api_router.delete("/admin/teams/{team_id}/players/{player_id}")
async def remove_player_from_team(team_id: str, player_id: str, admin: User = Depends(get_admin_user)):
    """Remove player from team (admin only)"""
    result = await db.teams.update_one(
        {"id": team_id},
        {"$pull": {"players": {"id": player_id}}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Player removed from team successfully"}

@api_router.get("/teams", response_model=List[Team])
async def get_public_teams():
    """Get all active teams (public)"""
    teams = await db.teams.find({"status": "active"}, {"_id": 0}).to_list(length=None)
    return [Team(**team) for team in teams]

    # Send confirmation email
    try:
        email_service.send_registration_confirmation(
            to_email=registration_data.participant_email,
            athlete_name=registration_data.participant_name,
            parent_name=registration_data.participant_name,
            registration_id=registration.id
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return registration

@api_router.get("/adult-registrations", response_model=List[AdultRegistration])
async def get_user_adult_registrations(current_user: User = Depends(get_current_user)):
    """Get user's adult registrations"""
    registrations = await db.adult_registrations.find({"user_id": current_user.id}, {"_id": 0}).to_list(length=None)
    return [AdultRegistration(**reg) for reg in registrations]

@api_router.get("/admin/adult-registrations", response_model=List[AdultRegistration])
async def get_all_adult_registrations(admin: User = Depends(get_admin_user)):
    """Get all adult registrations (admin only)"""
    registrations = await db.adult_registrations.find({}, {"_id": 0}).to_list(length=None)
    return [AdultRegistration(**reg) for reg in registrations]

@api_router.put("/admin/adult-registrations/{registration_id}/status")
async def update_adult_registration_status(registration_id: str, status: str, admin: User = Depends(get_admin_user)):
    """Update adult registration status (admin only)"""
    # Get registration details
    registration = await db.adult_registrations.find_one({"id": registration_id}, {"_id": 0})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Update status
    result = await db.adult_registrations.update_one(
        {"id": registration_id},
        {"$set": {"status": status}}
    )
    
    # Create notification
    participant_name = registration['participant_name']
    
    if status == "approved":
        notification = notification_service.create_registration_approved_notification(
            user_id=registration['user_id'],
            athlete_name=participant_name,
            registration_id=registration_id,
            registration_type="adult"
        )
    elif status == "rejected":
        notification = notification_service.create_registration_rejected_notification(
            user_id=registration['user_id'],
            athlete_name=participant_name,
            registration_id=registration_id
        )
    else:
        notification = None
    
    if notification:
        await db.notifications.insert_one(notification)
    
    return {"message": "Status updated successfully"}

async def mark_payment_plan_transaction_paid(transaction_id: str, admin: User = Depends(get_admin_user)):
    result = await db.payment_plan_transactions.update_one(
        {"id": transaction_id},
        {"$set": {
            "status": "paid",
            "paid_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction marked as paid"}

# Enhanced Registration Endpoints
@api_router.post("/enhanced-registrations", response_model=EnhancedRegistration)
async def create_enhanced_registration(registration_data: EnhancedRegistrationCreate, current_user: User = Depends(get_current_user)):
    """Create a new enhanced registration"""
    # Verify athlete is 17 or younger (youth requirement)
    from datetime import date
    athlete_dob = datetime.strptime(registration_data.athlete_date_of_birth, "%Y-%m-%d").date()
    today = date.today()
    athlete_age = today.year - athlete_dob.year - ((today.month, today.day) < (athlete_dob.month, athlete_dob.day))
    
    if athlete_age > 17:
        raise HTTPException(
            status_code=400,
            detail="Enhanced registration is for youth athletes (17 and under). Athletes 18+ should create their own accounts."
        )
    
    registration = EnhancedRegistration(**registration_data.model_dump(), user_id=current_user.id)
    doc = registration.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.enhanced_registrations.insert_one(doc)
    
    # Send confirmation email
    athlete_full_name = f"{registration_data.athlete_first_name} {registration_data.athlete_last_name}"
    parent_full_name = f"{registration_data.parent_first_name} {registration_data.parent_last_name}"
    
    try:
        email_service.send_registration_confirmation(
            to_email=registration_data.parent_email,
            athlete_name=athlete_full_name,
            parent_name=parent_full_name,
            registration_id=registration.id
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Continue even if email fails
    
    return registration

@api_router.get("/enhanced-registrations", response_model=List[EnhancedRegistration])
async def get_user_enhanced_registrations(current_user: User = Depends(get_current_user)):
    """Get user's enhanced registrations"""
    registrations = await db.enhanced_registrations.find({"user_id": current_user.id}, {"_id": 0}).to_list(length=None)
    return [EnhancedRegistration(**reg) for reg in registrations]

@api_router.get("/admin/enhanced-registrations", response_model=List[EnhancedRegistration])
async def get_all_enhanced_registrations(admin: User = Depends(get_admin_user)):
    """Get all enhanced registrations (admin only)"""
    registrations = await db.enhanced_registrations.find({}, {"_id": 0}).to_list(length=None)
    return [EnhancedRegistration(**reg) for reg in registrations]

@api_router.put("/admin/enhanced-registrations/{registration_id}/status")
async def update_enhanced_registration_status(registration_id: str, status: str, admin: User = Depends(get_admin_user)):
    """Update enhanced registration status (admin only)"""
    # Get registration details
    registration = await db.enhanced_registrations.find_one({"id": registration_id}, {"_id": 0})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Update status
    result = await db.enhanced_registrations.update_one(
        {"id": registration_id},
        {"$set": {"status": status}}
    )
    
    # Create notification
    athlete_name = f"{registration['athlete_first_name']} {registration['athlete_last_name']}"
    
    if status == "approved":
        notification = notification_service.create_registration_approved_notification(
            user_id=registration['user_id'],
            athlete_name=athlete_name,
            registration_id=registration_id,
            registration_type="youth"
        )
    elif status == "rejected":
        notification = notification_service.create_registration_rejected_notification(
            user_id=registration['user_id'],
            athlete_name=athlete_name,
            registration_id=registration_id
        )
    else:
        notification = None
    
    if notification:
        await db.notifications.insert_one(notification)
    
    return {"message": "Status updated successfully"}

# Youth Registration Payment Endpoints
@api_router.post("/enhanced-registrations/{registration_id}/checkout")
async def create_youth_registration_checkout(registration_id: str, checkout_req: CheckoutRequest, user: User = Depends(get_current_user)):
    """Create Stripe checkout session for approved youth registration"""
    registration = await db.enhanced_registrations.find_one({"id": registration_id}, {"_id": 0})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if registration['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if registration['status'] != 'approved':
        raise HTTPException(status_code=400, detail="Registration must be approved before payment")
    
    if registration.get('payment_status') == 'paid':
        raise HTTPException(status_code=400, detail="Registration already paid")
    
    # Create Stripe checkout
    webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{checkout_req.origin_url}/registration-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{checkout_req.origin_url}/member-dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(registration.get('registration_fee', 150.0)),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "youth_registration_payment",
            "registration_id": registration_id,
            "user_id": user.id,
            "athlete_name": f"{registration['athlete_first_name']} {registration['athlete_last_name']}"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update registration with session ID
    await db.enhanced_registrations.update_one(
        {"id": registration_id},
        {"$set": {
            "checkout_session_id": session.session_id,
            "payment_status": "pending_payment"
        }}
    )
    
    # Save payment transaction
    payment_txn = PaymentTransaction(
        session_id=session.session_id,
        user_id=user.id,
        amount=float(registration.get('registration_fee', 150.0)),
        currency="usd",
        payment_status="pending",
        metadata=checkout_request.metadata
    )
    txn_doc = payment_txn.model_dump()
    txn_doc['created_at'] = txn_doc['created_at'].isoformat()
    txn_doc['updated_at'] = txn_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(txn_doc)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/enhanced-registrations/payment-status/{session_id}")
async def get_youth_registration_payment_status(session_id: str, user: User = Depends(get_current_user)):
    """Check payment status for youth registration"""
    webhook_url = "http://localhost:8001/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    existing_txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing_txn and existing_txn.get('payment_status') != 'completed':
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update registration payment status
        if status.payment_status == "paid":
            await db.enhanced_registrations.update_one(
                {"checkout_session_id": session_id},
                {"$set": {"payment_status": "paid"}}
            )
    
    return status

# Adult Registration Payment Endpoints
@api_router.post("/adult-registrations/{registration_id}/checkout")
async def create_adult_registration_checkout(registration_id: str, checkout_req: CheckoutRequest, user: User = Depends(get_current_user)):
    """Create Stripe checkout session for approved adult registration"""
    registration = await db.adult_registrations.find_one({"id": registration_id}, {"_id": 0})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if registration['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if registration['status'] != 'approved':
        raise HTTPException(status_code=400, detail="Registration must be approved before payment")
    
    if registration.get('payment_status') == 'paid':
        raise HTTPException(status_code=400, detail="Registration already paid")
    
    # Create Stripe checkout
    webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{checkout_req.origin_url}/registration-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{checkout_req.origin_url}/member-dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(registration.get('registration_fee', 200.0)),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "adult_registration_payment",
            "registration_id": registration_id,
            "user_id": user.id,
            "participant_name": registration['participant_name']
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update registration with session ID
    await db.adult_registrations.update_one(
        {"id": registration_id},
        {"$set": {
            "checkout_session_id": session.session_id,
            "payment_status": "pending_payment"
        }}
    )
    
    # Save payment transaction
    payment_txn = PaymentTransaction(
        session_id=session.session_id,
        user_id=user.id,
        amount=float(registration.get('registration_fee', 200.0)),
        currency="usd",
        payment_status="pending",
        metadata=checkout_request.metadata
    )
    txn_doc = payment_txn.model_dump()
    txn_doc['created_at'] = txn_doc['created_at'].isoformat()
    txn_doc['updated_at'] = txn_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(txn_doc)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/adult-registrations/payment-status/{session_id}")
async def get_adult_registration_payment_status(session_id: str, user: User = Depends(get_current_user)):
    """Check payment status for adult registration"""
    webhook_url = "http://localhost:8001/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    existing_txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing_txn and existing_txn.get('payment_status') != 'completed':
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update registration payment status
        if status.payment_status == "paid":
            await db.adult_registrations.update_one(
                {"checkout_session_id": session_id},
                {"$set": {"payment_status": "paid"}}
            )
    
    return status

# Stripe webhook
@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    webhook_url = "http://localhost:8001/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    


# Contact Form Endpoint
@api_router.post("/contact", response_model=ContactSubmission)
async def submit_contact_form(submission_data: ContactSubmissionCreate):
    """Submit a contact form"""
    submission = ContactSubmission(**submission_data.model_dump())
    doc = submission.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_submissions.insert_one(doc)
    return submission

@api_router.get("/admin/contact-submissions", response_model=List[ContactSubmission])
async def get_contact_submissions(admin: User = Depends(get_admin_user)):
    """Get all contact form submissions (admin only)"""
    submissions = await db.contact_submissions.find({}, {"_id": 0}).to_list(length=None)
    return [ContactSubmission(**sub) for sub in submissions]

@api_router.put("/admin/contact-submissions/{submission_id}/status")
async def update_contact_submission_status(submission_id: str, status: str, admin: User = Depends(get_admin_user)):
    """Update contact submission status (admin only)"""
    result = await db.contact_submissions.update_one(
        {"id": submission_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Status updated successfully"}

# Volunteer Application Endpoints
@api_router.post("/volunteer", response_model=VolunteerApplication)
async def submit_volunteer_application(application_data: VolunteerApplicationCreate):
    """Submit a volunteer application"""
    application = VolunteerApplication(**application_data.model_dump())
    doc = application.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.volunteer_applications.insert_one(doc)
    return application

@api_router.get("/admin/volunteer-applications", response_model=List[VolunteerApplication])
async def get_volunteer_applications(admin: User = Depends(get_admin_user)):
    """Get all volunteer applications (admin only)"""
    applications = await db.volunteer_applications.find({}, {"_id": 0}).to_list(length=None)
    return [VolunteerApplication(**app) for app in applications]

@api_router.put("/admin/volunteer-applications/{application_id}/status")
async def update_volunteer_application_status(application_id: str, status: str, admin: User = Depends(get_admin_user)):
    """Update volunteer application status (admin only)"""
    result = await db.volunteer_applications.update_one(
        {"id": application_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Status updated successfully"}

# Sponsorship Inquiry Endpoints
@api_router.post("/sponsorship", response_model=SponsorshipInquiry)
async def submit_sponsorship_inquiry(inquiry_data: SponsorshipInquiryCreate):
    """Submit a sponsorship inquiry"""
    inquiry = SponsorshipInquiry(**inquiry_data.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sponsorship_inquiries.insert_one(doc)
    return inquiry

@api_router.get("/admin/sponsorship-inquiries", response_model=List[SponsorshipInquiry])
async def get_sponsorship_inquiries(admin: User = Depends(get_admin_user)):
    """Get all sponsorship inquiries (admin only)"""
    inquiries = await db.sponsorship_inquiries.find({}, {"_id": 0}).to_list(length=None)
    return [SponsorshipInquiry(**inq) for inq in inquiries]

@api_router.put("/admin/sponsorship-inquiries/{inquiry_id}/status")
async def update_sponsorship_inquiry_status(inquiry_id: str, status: str, admin: User = Depends(get_admin_user)):
    """Update sponsorship inquiry status (admin only)"""
    result = await db.sponsorship_inquiries.update_one(
        {"id": inquiry_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Status updated successfully"}

    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {
                    "payment_status": "completed",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update registration or booking
            metadata = event.metadata
            if metadata.get("type") == "event_registration":
                await db.registrations.update_one(
                    {"checkout_session_id": event.session_id},
                    {"$set": {"payment_status": "completed"}}
                )
            elif metadata.get("type") == "facility_booking":
                await db.bookings.update_one(
                    {"checkout_session_id": event.session_id},
                    {"$set": {"payment_status": "completed"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# Calendar Events Endpoints
@api_router.get("/calendar-events", response_model=List[CalendarEvent])
async def get_calendar_events():
    """Get all calendar events"""
    events = await db.calendar_events.find({}, {"_id": 0}).to_list(length=None)
    return [CalendarEvent(**event) for event in events]

@api_router.post("/admin/calendar-events", response_model=CalendarEvent)
async def create_calendar_event(event_data: CalendarEventCreate, admin: User = Depends(get_admin_user)):
    """Create a new calendar event (admin only)"""
    event = CalendarEvent(**event_data.model_dump())
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.calendar_events.insert_one(doc)
    return event

@api_router.put("/admin/calendar-events/{event_id}", response_model=CalendarEvent)
async def update_calendar_event(event_id: str, event_data: CalendarEventCreate, admin: User = Depends(get_admin_user)):
    """Update a calendar event (admin only)"""
    existing = await db.calendar_events.find_one({"id": event_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    await db.calendar_events.update_one(
        {"id": event_id},
        {"$set": event_data.model_dump()}
    )
    updated = await db.calendar_events.find_one({"id": event_id}, {"_id": 0})
    return CalendarEvent(**updated)

@api_router.delete("/admin/calendar-events/{event_id}")
async def delete_calendar_event(event_id: str, admin: User = Depends(get_admin_user)):
    """Delete a calendar event (admin only)"""
    result = await db.calendar_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return {"message": "Calendar event deleted successfully"}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# IMAGE UPLOAD ENDPOINTS
# ============================================================================

@api_router.post("/upload/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    """Upload user profile image"""
    try:
        # Save image
        image_path = image_service.save_profile_image(file, user.id)
        
        # Update user record
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"profile_image": image_path}}
        )
        
        # Get full URL
        image_url = image_service.get_image_url(image_path, "/uploads")
        
        return {
            "message": "Profile image uploaded successfully",
            "image_path": image_path,
            "image_url": image_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@api_router.post("/upload/team-logo/{team_id}")
async def upload_team_logo(
    team_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_admin_user)
):
    """Upload team logo (admin only)"""
    try:
        # Check if team exists
        team = await db.teams.find_one({"id": team_id}, {"_id": 0})
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Save image
        image_path = image_service.save_team_logo(file, team_id)
        
        # Update team record
        await db.teams.update_one(
            {"id": team_id},
            {"$set": {"logo": image_path}}
        )
        
        image_url = image_service.get_image_url(image_path, "/uploads")
        
        return {
            "message": "Team logo uploaded successfully",
            "image_path": image_path,
            "image_url": image_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload logo: {str(e)}")

@api_router.post("/upload/event-image/{event_id}")
async def upload_event_image(
    event_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_admin_user)
):
    """Upload event image (admin only)"""
    try:
        # Check if event exists
        event = await db.events.find_one({"id": event_id}, {"_id": 0})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Save image
        image_path = image_service.save_event_image(file, event_id)
        
        # Update event record
        await db.events.update_one(
            {"id": event_id},
            {"$set": {"image": image_path}}
        )
        
        image_url = image_service.get_image_url(image_path, "/uploads")
        
        return {
            "message": "Event image uploaded successfully",
            "image_path": image_path,
            "image_url": image_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@api_router.post("/upload/gallery-image")
async def upload_gallery_image(
    file: UploadFile = File(...),
    category: str = "general",
    user: User = Depends(get_admin_user)
):
    """Upload gallery image (admin only)"""
    try:
        # Save image
        image_path = image_service.save_gallery_image(file, category)
        
        # Save to gallery collection
        gallery_item = {
            "id": str(uuid.uuid4()),
            "image_path": image_path,
            "category": category,
            "uploaded_by": user.id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.gallery.insert_one(gallery_item)
        
        image_url = image_service.get_image_url(image_path, "/uploads")
        
        return {
            "message": "Gallery image uploaded successfully",
            "image_path": image_path,
            "image_url": image_url,
            "category": category
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@api_router.get("/gallery")
async def get_gallery_images(category: Optional[str] = None):
    """Get all gallery images, optionally filtered by category"""
    try:
        query = {}
        if category:
            query["category"] = category
        
        images = await db.gallery.find(query, {"_id": 0}).to_list(length=None)
        
        # Add full URLs
        for image in images:
            image["image_url"] = image_service.get_image_url(image["image_path"], "/uploads")
        
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch gallery images: {str(e)}")

@api_router.delete("/upload/image")
async def delete_image(
    image_path: str,
    user: User = Depends(get_admin_user)
):
    """Delete an uploaded image (admin only)"""
    try:
        success = image_service.delete_image(image_path)
        
        if success:
            # Remove from gallery if it's a gallery image
            if image_path.startswith("gallery/"):
                await db.gallery.delete_one({"image_path": image_path})
            
            return {"message": "Image deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")


# ============================================================================
# SEARCH & FILTER ENDPOINTS
# ============================================================================

@api_router.get("/search/events")
async def search_events(
    search: Optional[str] = None,
    event_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "date_asc",
    limit: int = 50
):
    """
    Search and filter events
    
    Query Parameters:
    - search: Text search across title, description, location
    - event_type: Filter by event type
    - date_from: Start date filter (YYYY-MM-DD)
    - date_to: End date filter (YYYY-MM-DD)
    - location: Filter by location
    - min_price: Minimum price
    - max_price: Maximum price
    - sort: Sort order (date_asc, date_desc, price_asc, price_desc, newest)
    - limit: Maximum results (default 50)
    """
    try:
        query = search_service.build_event_search_query(
            search=search,
            event_type=event_type,
            date_from=date_from,
            date_to=date_to,
            location=location,
            min_price=min_price,
            max_price=max_price
        )
        
        sort_params = search_service.parse_sort_param(sort)
        
        events = await db.events.find(query, {"_id": 0}).sort(sort_params).limit(limit).to_list(length=limit)
        
        return {
            "count": len(events),
            "results": events,
            "filters_applied": {
                "search": search,
                "event_type": event_type,
                "date_from": date_from,
                "date_to": date_to,
                "location": location,
                "price_range": f"{min_price}-{max_price}" if min_price or max_price else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.get("/search/programs")
async def search_programs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    age_group: Optional[str] = None,
    skill_level: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "name_asc",
    limit: int = 50
):
    """
    Search and filter programs
    
    Query Parameters:
    - search: Text search across name, description
    - category: Program category (camp, clinic, workshop)
    - age_group: Age group filter
    - skill_level: Skill level filter (beginner, intermediate, advanced)
    - min_price: Minimum price
    - max_price: Maximum price
    - sort: Sort order (name_asc, price_asc, newest)
    - limit: Maximum results (default 50)
    """
    try:
        query = search_service.build_program_search_query(
            search=search,
            category=category,
            age_group=age_group,
            skill_level=skill_level,
            min_price=min_price,
            max_price=max_price
        )
        
        sort_params = search_service.parse_sort_param(sort)
        
        programs = await db.programs.find(query, {"_id": 0}).sort(sort_params).limit(limit).to_list(length=limit)
        
        return {
            "count": len(programs),
            "results": programs,
            "filters_applied": {
                "search": search,
                "category": category,
                "age_group": age_group,
                "skill_level": skill_level,
                "price_range": f"{min_price}-{max_price}" if min_price or max_price else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.get("/search/facilities")
async def search_facilities(
    search: Optional[str] = None,
    facility_type: Optional[str] = None,
    amenities: Optional[str] = None,  # Comma-separated list
    sort: Optional[str] = "name_asc",
    limit: int = 50
):
    """
    Search and filter facilities
    
    Query Parameters:
    - search: Text search across name, description, location
    - facility_type: Type of facility
    - amenities: Comma-separated list of required amenities
    - sort: Sort order (name_asc, newest)
    - limit: Maximum results (default 50)
    """
    try:
        amenities_list = amenities.split(",") if amenities else None
        
        query = search_service.build_facility_search_query(
            search=search,
            facility_type=facility_type,
            amenities=amenities_list
        )
        
        sort_params = search_service.parse_sort_param(sort)
        
        facilities = await db.facilities.find(query, {"_id": 0}).sort(sort_params).limit(limit).to_list(length=limit)
        
        return {
            "count": len(facilities),
            "results": facilities,
            "filters_applied": {
                "search": search,
                "facility_type": facility_type,
                "amenities": amenities_list
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.get("/search/teams")
async def search_teams(
    search: Optional[str] = None,
    division: Optional[str] = None,
    age_group: Optional[str] = None,
    sort: Optional[str] = "name_asc",
    limit: int = 50
):
    """
    Search and filter teams
    
    Query Parameters:
    - search: Text search across team name, coach name
    - division: Division filter
    - age_group: Age group filter
    - sort: Sort order (name_asc, newest)
    - limit: Maximum results (default 50)
    """
    try:
        query = search_service.build_team_search_query(
            search=search,
            division=division,
            age_group=age_group
        )
        
        sort_params = search_service.parse_sort_param(sort)
        
        teams = await db.teams.find(query, {"_id": 0}).sort(sort_params).limit(limit).to_list(length=limit)
        
        return {
            "count": len(teams),
            "results": teams,
            "filters_applied": {
                "search": search,
                "division": division,
                "age_group": age_group
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.get("/search/calendar")
async def search_calendar_events(
    search: Optional[str] = None,
    event_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort: Optional[str] = "date_asc",
    limit: int = 100
):
    """
    Search calendar events with filters
    
    Query Parameters:
    - search: Text search across title, description
    - event_type: Filter by type (program, tournament, camp, clinic, workshop, event)
    - date_from: Start date (YYYY-MM-DD)
    - date_to: End date (YYYY-MM-DD)
    - sort: Sort order (date_asc, date_desc, newest)
    - limit: Maximum results (default 100)
    """
    try:
        query = {}
        conditions = []
        
        # Text search
        if search:
            text_query = search_service.create_text_search_query(
                search,
                ["title", "description", "location"]
            )
            conditions.append(text_query)
        
        # Type filter
        if event_type:
            query["type"] = event_type
        
        # Date range
        if date_from:
            query["date"] = query.get("date", {})
            query["date"]["$gte"] = date_from
        
        if date_to:
            query["date"] = query.get("date", {})
            query["date"]["$lte"] = date_to
        
        if conditions:
            query["$and"] = conditions
        
        sort_params = search_service.parse_sort_param(sort)
        
        events = await db.calendar_events.find(query, {"_id": 0}).sort(sort_params).limit(limit).to_list(length=limit)
        
        return {
            "count": len(events),
            "results": events,
            "filters_applied": {
                "search": search,
                "event_type": event_type,
                "date_from": date_from,
                "date_to": date_to
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@api_router.get("/search/global")
async def global_search(search: str, limit: int = 20):
    """
    Global search across all content types
    
    Returns results from events, programs, facilities, teams, and calendar
    """
    try:
        if not search or len(search) < 2:
            raise HTTPException(status_code=400, detail="Search term must be at least 2 characters")
        
        # Search across all collections
        pattern = re.compile(search, re.IGNORECASE)
        
        # Events
        events = await db.events.find(
            {"$or": [
                {"title": {"$regex": pattern}},
                {"description": {"$regex": pattern}}
            ]},
            {"_id": 0}
        ).limit(limit).to_list(length=limit)
        
        # Programs
        programs = await db.programs.find(
            {"$or": [
                {"name": {"$regex": pattern}},
                {"description": {"$regex": pattern}}
            ]},
            {"_id": 0}
        ).limit(limit).to_list(length=limit)
        
        # Facilities
        facilities = await db.facilities.find(
            {"$or": [
                {"name": {"$regex": pattern}},
                {"description": {"$regex": pattern}}
            ]},
            {"_id": 0}
        ).limit(limit).to_list(length=limit)
        
        # Teams
        teams = await db.teams.find(
            {"$or": [
                {"name": {"$regex": pattern}},
                {"coach_name": {"$regex": pattern}}
            ]},
            {"_id": 0}
        ).limit(limit).to_list(length=limit)
        
        # Calendar Events
        calendar_events = await db.calendar_events.find(
            {"$or": [
                {"title": {"$regex": pattern}},
                {"description": {"$regex": pattern}}
            ]},
            {"_id": 0}
        ).limit(limit).to_list(length=limit)
        
        # Add type to each result
        for event in events:
            event["result_type"] = "event"
        for program in programs:
            program["result_type"] = "program"
        for facility in facilities:
            facility["result_type"] = "facility"
        for team in teams:
            team["result_type"] = "team"
        for cal_event in calendar_events:
            cal_event["result_type"] = "calendar_event"
        
        all_results = events + programs + facilities + teams + calendar_events
        
        return {
            "search_term": search,
            "total_count": len(all_results),
            "results_by_type": {
                "events": len(events),
                "programs": len(programs),
                "facilities": len(facilities),
                "teams": len(teams),
                "calendar_events": len(calendar_events)
            },
            "results": all_results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Global search failed: {str(e)}")



# ============================================================================
# NOTIFICATION ENDPOINTS
# ============================================================================

@api_router.get("/notifications")
async def get_user_notifications(
    unread_only: bool = False,
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """
    Get notifications for current user
    
    Query Parameters:
    - unread_only: Only return unread notifications
    - limit: Maximum number of notifications (default 50)
    """
    try:
        query = {"user_id": user.id}
        
        if unread_only:
            query["read"] = False
        
        notifications = await db.notifications.find(query, {"_id": 0})\
            .sort([("created_at", -1)])\
            .limit(limit)\
            .to_list(length=limit)
        
        unread_count = await db.notifications.count_documents({
            "user_id": user.id,
            "read": False
        })
        
        return {
            "notifications": notifications,
            "unread_count": unread_count,
            "total_count": len(notifications)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notifications: {str(e)}")

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    try:
        result = await db.notifications.update_one(
            {"id": notification_id, "user_id": user.id},
            {"$set": {"read": True}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification: {str(e)}")

@api_router.put("/notifications/mark-all-read")
async def mark_all_notifications_read(user: User = Depends(get_current_user)):
    """Mark all notifications as read for current user"""
    try:
        result = await db.notifications.update_many(
            {"user_id": user.id, "read": False},
            {"$set": {"read": True}}
        )
        
        return {
            "message": "All notifications marked as read",
            "count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notifications: {str(e)}")


# ============================================================================
# NEWS/BLOG ENDPOINTS
# ============================================================================

@api_router.get("/news")
async def get_news_posts(
    published_only: bool = True,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """
    Get news/blog posts with optional filters
    
    Query Parameters:
    - published_only: Only return published posts (default: true)
    - category: Filter by category
    - tag: Filter by tag
    - limit: Maximum results (default: 20)
    - skip: Skip results for pagination
    """
    try:
        query = {}
        
        if published_only:
            query["published"] = True
        
        if category:
            query["category"] = category
        
        if tag:
            query["tags"] = tag
        
        posts = await db.news_posts.find(query, {"_id": 0})\
            .sort([("published_at", -1), ("created_at", -1)])\
            .skip(skip)\
            .limit(limit)\
            .to_list(length=limit)
        
        # Convert datetime objects to strings
        for post in posts:
            if isinstance(post.get('created_at'), datetime):
                post['created_at'] = post['created_at'].isoformat()
            if isinstance(post.get('updated_at'), datetime):
                post['updated_at'] = post['updated_at'].isoformat()
            if isinstance(post.get('published_at'), datetime):
                post['published_at'] = post['published_at'].isoformat()
        
        total = await db.news_posts.count_documents(query)
        
        return {
            "posts": posts,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news posts: {str(e)}")

@api_router.get("/news/{post_id}")
async def get_news_post(post_id: str):
    """Get a single news post by ID or slug"""
    try:
        # Try to find by ID first, then by slug
        post = await db.news_posts.find_one({"id": post_id}, {"_id": 0})
        if not post:
            post = await db.news_posts.find_one({"slug": post_id}, {"_id": 0})
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Increment view count
        await db.news_posts.update_one(
            {"id": post["id"]},
            {"$inc": {"views": 1}}
        )
        post["views"] = post.get("views", 0) + 1
        
        # Convert datetime objects
        if isinstance(post.get('created_at'), datetime):
            post['created_at'] = post['created_at'].isoformat()
        if isinstance(post.get('updated_at'), datetime):
            post['updated_at'] = post['updated_at'].isoformat()
        if isinstance(post.get('published_at'), datetime):
            post['published_at'] = post['published_at'].isoformat()
        
        return post
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch post: {str(e)}")

@api_router.post("/admin/news")
async def create_news_post(post_data: NewsPostCreate, admin: User = Depends(get_admin_user)):
    """Create a new news/blog post (admin only)"""
    try:
        # Generate slug from title
        slug = post_data.title.lower()
        slug = slug.replace(' ', '-')
        slug = ''.join(c for c in slug if c.isalnum() or c == '-')
        
        # Ensure slug is unique
        existing = await db.news_posts.find_one({"slug": slug}, {"_id": 0})
        if existing:
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        post = NewsPost(
            title=post_data.title,
            slug=slug,
            content=post_data.content,
            excerpt=post_data.excerpt,
            author_id=admin.id,
            author_name=admin.name,
            category=post_data.category,
            tags=post_data.tags,
            featured_image=post_data.featured_image,
            published=post_data.published,
            published_at=datetime.now(timezone.utc) if post_data.published else None
        )
        
        post_dict = post.model_dump()
        post_dict['created_at'] = post_dict['created_at'].isoformat()
        post_dict['updated_at'] = post_dict['updated_at'].isoformat()
        if post_dict['published_at']:
            post_dict['published_at'] = post_dict['published_at'].isoformat()
        
        await db.news_posts.insert_one(post_dict)
        
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@api_router.put("/admin/news/{post_id}")
async def update_news_post(
    post_id: str,
    post_data: NewsPostUpdate,
    admin: User = Depends(get_admin_user)
):
    """Update a news/blog post (admin only)"""
    try:
        existing = await db.news_posts.find_one({"id": post_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Post not found")
        
        update_data = {k: v for k, v in post_data.model_dump().items() if v is not None}
        
        # Update slug if title changes
        if "title" in update_data:
            slug = update_data["title"].lower()
            slug = slug.replace(' ', '-')
            slug = ''.join(c for c in slug if c.isalnum() or c == '-')
            update_data["slug"] = slug
        
        # Set published_at if publishing for first time
        if "published" in update_data and update_data["published"] and not existing.get("published"):
            update_data["published_at"] = datetime.now(timezone.utc).isoformat()
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await db.news_posts.update_one(
            {"id": post_id},
            {"$set": update_data}
        )
        
        return {"message": "Post updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update post: {str(e)}")


# ============================================================================
# TESTIMONIALS ENDPOINTS
# ============================================================================

@api_router.get("/testimonials")
async def get_testimonials(
    approved_only: bool = True,
    featured_only: bool = False,
    program: Optional[str] = None,
    limit: int = 20
):
    """Get testimonials with optional filters"""
    try:
        query = {}
        
        if approved_only:
            query["approved"] = True
        
        if featured_only:
            query["featured"] = True
        
        if program:
            query["program"] = program
        
        testimonials = await db.testimonials.find(query, {"_id": 0})\
            .sort([("featured", -1), ("created_at", -1)])\
            .limit(limit)\
            .to_list(length=limit)
        
        # Convert datetime
        for testimonial in testimonials:
            if isinstance(testimonial.get('created_at'), datetime):
                testimonial['created_at'] = testimonial['created_at'].isoformat()
        
        return testimonials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch testimonials: {str(e)}")

@api_router.post("/testimonials")
async def submit_testimonial(testimonial_data: TestimonialCreate):
    """Submit a new testimonial (public endpoint, requires approval)"""
    try:
        testimonial = Testimonial(
            author_name=testimonial_data.author_name,
            author_role=testimonial_data.author_role,
            content=testimonial_data.content,
            rating=testimonial_data.rating,
            program=testimonial_data.program,
            approved=False,  # Requires admin approval
            featured=False
        )
        
        testimonial_dict = testimonial.model_dump()
        testimonial_dict['created_at'] = testimonial_dict['created_at'].isoformat()
        
        await db.testimonials.insert_one(testimonial_dict)
        
        return {
            "message": "Thank you for your testimonial! It will be reviewed shortly.",
            "testimonial": testimonial
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit testimonial: {str(e)}")

@api_router.put("/admin/testimonials/{testimonial_id}")
async def update_testimonial(
    testimonial_id: str,
    update_data: TestimonialUpdate,
    admin: User = Depends(get_admin_user)
):
    """Update testimonial (admin only)"""
    try:
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        result = await db.testimonials.update_one(
            {"id": testimonial_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        return {"message": "Testimonial updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update testimonial: {str(e)}")

@api_router.delete("/admin/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, admin: User = Depends(get_admin_user)):
    """Delete testimonial (admin only)"""
    try:
        result = await db.testimonials.delete_one({"id": testimonial_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        return {"message": "Testimonial deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete testimonial: {str(e)}")


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@api_router.get("/admin/analytics/overview")
async def get_analytics_overview(admin: User = Depends(get_admin_user)):
    """Get comprehensive analytics overview (admin only)"""
    try:
        # User stats
        total_users = await db.users.count_documents({})
        new_users_30d = await db.users.count_documents({
            "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()}
        })
        
        # Registration stats
        total_registrations = await db.enhanced_registrations.count_documents({})
        adult_registrations = await db.adult_registrations.count_documents({})
        pending_registrations = await db.enhanced_registrations.count_documents({"status": "pending"})
        approved_registrations = await db.enhanced_registrations.count_documents({"status": "approved"})
        
        # Payment stats
        total_transactions = await db.payment_transactions.count_documents({})
        completed_payments = await db.payment_transactions.count_documents({"payment_status": "completed"})
        
        # Calculate total revenue
        revenue_pipeline = [
            {"$match": {"payment_status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        revenue_result = await db.payment_transactions.aggregate(revenue_pipeline).to_list(length=1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Event stats
        total_events = await db.events.count_documents({})
        upcoming_events = await db.events.count_documents({
            "date": {"$gte": datetime.now(timezone.utc).isoformat()}
        })
        
        # Facility stats
        total_facilities = await db.facilities.count_documents({})
        total_bookings = await db.bookings.count_documents({})
        
        # Team stats
        total_teams = await db.teams.count_documents({})
        
        # Content stats
        total_news = await db.news_posts.count_documents({})
        published_news = await db.news_posts.count_documents({"published": True})
        total_gallery = await db.gallery.count_documents({})
        total_testimonials = await db.testimonials.count_documents({})
        approved_testimonials = await db.testimonials.count_documents({"approved": True})
        
        # Notification stats
        total_notifications = await db.notifications.count_documents({})
        unread_notifications = await db.notifications.count_documents({"read": False})
        
        return {
            "users": {
                "total": total_users,
                "new_30d": new_users_30d
            },
            "registrations": {
                "total_youth": total_registrations,
                "total_adult": adult_registrations,
                "pending": pending_registrations,
                "approved": approved_registrations
            },
            "payments": {
                "total_transactions": total_transactions,
                "completed": completed_payments,
                "total_revenue": total_revenue
            },
            "events": {
                "total": total_events,
                "upcoming": upcoming_events
            },
            "facilities": {
                "total": total_facilities,
                "bookings": total_bookings
            },
            "teams": {
                "total": total_teams
            },
            "content": {
                "news_total": total_news,
                "news_published": published_news,
                "gallery_images": total_gallery,
                "testimonials_total": total_testimonials,
                "testimonials_approved": approved_testimonials
            },
            "notifications": {
                "total": total_notifications,
                "unread": unread_notifications
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

@api_router.get("/admin/analytics/revenue")
async def get_revenue_analytics(
    period: str = "30d",
    admin: User = Depends(get_admin_user)
):
    """Get revenue analytics by time period (admin only)"""
    try:
        # Calculate date range
        if period == "7d":
            start_date = datetime.now(timezone.utc) - timedelta(days=7)
        elif period == "30d":
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        elif period == "90d":
            start_date = datetime.now(timezone.utc) - timedelta(days=90)
        else:
            start_date = datetime.now(timezone.utc) - timedelta(days=365)
        
        # Get transactions
        pipeline = [
            {"$match": {
                "payment_status": "completed",
                "created_at": {"$gte": start_date.isoformat()}
            }},
            {"$group": {
                "_id": {"$substr": ["$created_at", 0, 10]},
                "revenue": {"$sum": "$amount"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        results = await db.payment_transactions.aggregate(pipeline).to_list(length=None)
        
        return {
            "period": period,
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch revenue analytics: {str(e)}")

@api_router.get("/admin/analytics/registrations")
async def get_registration_analytics(
    period: str = "30d",
    admin: User = Depends(get_admin_user)
):
    """Get registration analytics by time period (admin only)"""
    try:
        # Calculate date range
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        else:
            days = 365
        
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Youth registrations by day
        youth_pipeline = [
            {"$match": {"created_at": {"$gte": start_date.isoformat()}}},
            {"$group": {
                "_id": {"$substr": ["$created_at", 0, 10]},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        youth_results = await db.enhanced_registrations.aggregate(youth_pipeline).to_list(length=None)
        
        # Adult registrations by day
        adult_pipeline = [
            {"$match": {"created_at": {"$gte": start_date.isoformat()}}},
            {"$group": {
                "_id": {"$substr": ["$created_at", 0, 10]},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        adult_results = await db.adult_registrations.aggregate(adult_pipeline).to_list(length=None)
        
        # Status breakdown
        youth_status = await db.enhanced_registrations.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]).to_list(length=None)
        
        adult_status = await db.adult_registrations.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]).to_list(length=None)
        
        return {
            "period": period,
            "youth_by_day": youth_results,
            "adult_by_day": adult_results,
            "youth_by_status": youth_status,
            "adult_by_status": adult_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch registration analytics: {str(e)}")

@api_router.get("/admin/analytics/users")
async def get_user_analytics(admin: User = Depends(get_admin_user)):
    """Get user analytics (admin only)"""
    try:
        # User growth by month
        pipeline = [
            {"$group": {
                "_id": {"$substr": ["$created_at", 0, 7]},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}},
            {"$limit": 12}
        ]
        
        growth_results = await db.users.aggregate(pipeline).to_list(length=None)
        
        # Users by role
        role_pipeline = [
            {"$group": {"_id": "$role", "count": {"$sum": 1}}}
        ]
        
        role_results = await db.users.aggregate(role_pipeline).to_list(length=None)
        
        return {
            "growth_by_month": growth_results,
            "by_role": role_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user analytics: {str(e)}")

@api_router.get("/admin/analytics/popular-programs")
async def get_popular_programs(admin: User = Depends(get_admin_user)):
    """Get most popular programs by registrations (admin only)"""
    try:
        # Most registered programs
        pipeline = [
            {"$group": {
                "_id": "$program",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        youth_programs = await db.enhanced_registrations.aggregate(pipeline).to_list(length=None)
        adult_programs = await db.adult_registrations.aggregate(pipeline).to_list(length=None)
        
        return {
            "youth_programs": youth_programs,
            "adult_programs": adult_programs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch program analytics: {str(e)}")

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        return {"message": "Testimonial deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete testimonial: {str(e)}")

@api_router.get("/admin/testimonials/pending")
async def get_pending_testimonials(admin: User = Depends(get_admin_user)):
    """Get all pending testimonials for review (admin only)"""
    try:
        testimonials = await db.testimonials.find(
            {"approved": False},
            {"_id": 0}
        ).sort([("created_at", -1)]).to_list(length=None)
        
        # Convert datetime
        for testimonial in testimonials:
            if isinstance(testimonial.get('created_at'), datetime):
                testimonial['created_at'] = testimonial['created_at'].isoformat()
        
        return testimonials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pending testimonials: {str(e)}")

@api_router.delete("/admin/news/{post_id}")
async def delete_news_post(post_id: str, admin: User = Depends(get_admin_user)):
    """Delete a news/blog post (admin only)"""
    try:
        result = await db.news_posts.delete_one({"id": post_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {"message": "Post deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete post: {str(e)}")

@api_router.get("/news/categories/list")
async def get_news_categories():
    """Get all news categories with post counts"""
    try:
        pipeline = [
            {"$match": {"published": True}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        
        categories = []
        async for doc in db.news_posts.aggregate(pipeline):
            categories.append({
                "category": doc["_id"],
                "count": doc["count"]
            })
        
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

@api_router.get("/news/tags/list")
async def get_news_tags():
    """Get all tags with post counts"""
    try:
        pipeline = [
            {"$match": {"published": True}},
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        tags = []
        async for doc in db.news_posts.aggregate(pipeline):
            tags.append({
                "tag": doc["_id"],
                "count": doc["count"]
            })
        
        return tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tags: {str(e)}")

@api_router.get("/news/featured")
async def get_featured_news():
    """Get most recent published posts (featured/homepage)"""
    try:
        posts = await db.news_posts.find(
            {"published": True},
            {"_id": 0}
        ).sort([("published_at", -1)]).limit(5).to_list(length=5)
        
        # Convert datetime objects
        for post in posts:
            if isinstance(post.get('created_at'), datetime):
                post['created_at'] = post['created_at'].isoformat()
            if isinstance(post.get('updated_at'), datetime):
                post['updated_at'] = post['updated_at'].isoformat()
            if isinstance(post.get('published_at'), datetime):
                post['published_at'] = post['published_at'].isoformat()
        
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured posts: {str(e)}")

        
        return {
            "message": "All notifications marked as read",
            "count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notifications: {str(e)}")

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a notification"""
    try:
        result = await db.notifications.delete_one({
            "id": notification_id,
            "user_id": user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete notification: {str(e)}")

@api_router.post("/admin/notifications/broadcast")
async def broadcast_notification(
    title: str,
    message: str,
    target_users: Optional[List[str]] = None,
    admin: User = Depends(get_admin_user)
):
    """
    Broadcast notification to all users or specific users (admin only)
    
    Args:
        title: Notification title
        message: Notification message
        target_users: Optional list of user IDs. If None, sends to all users.
    """
    try:
        # Get target users
        if target_users:
            users = await db.users.find({"id": {"$in": target_users}}, {"_id": 0, "id": 1}).to_list(length=None)
        else:
            users = await db.users.find({}, {"_id": 0, "id": 1}).to_list(length=None)
        
        # Create notifications for all users
        notifications = []
        for user in users:
            notification = notification_service.create_announcement_notification(
                user_id=user["id"],
                title=title,
                message=message
            )
            notifications.append(notification)
        
        # Insert all notifications
        if notifications:
            await db.notifications.insert_many(notifications)
        
        return {
            "message": "Notification broadcast successfully",
            "recipient_count": len(notifications)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to broadcast notification: {str(e)}")

@api_router.get("/notifications/stats")
async def get_notification_stats(user: User = Depends(get_current_user)):
    """Get notification statistics for current user"""
    try:
        total = await db.notifications.count_documents({"user_id": user.id})
        unread = await db.notifications.count_documents({"user_id": user.id, "read": False})
        
        # Get counts by type
        pipeline = [
            {"$match": {"user_id": user.id}},
            {"$group": {"_id": "$type", "count": {"$sum": 1}}}
        ]
        
        type_counts = {}
        async for doc in db.notifications.aggregate(pipeline):
            type_counts[doc["_id"]] = doc["count"]
        
        return {
            "total": total,
            "unread": unread,
            "read": total - unread,
            "by_type": type_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()