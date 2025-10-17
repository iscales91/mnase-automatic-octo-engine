from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "member"  # member or admin
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

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: str
    time: str
    location: str
    capacity: int
    price: float
    category: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    capacity: int
    price: float
    category: str

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
    season: str
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
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Verify user is 18+ years old
    from datetime import date
    dob = datetime.strptime(user_data.date_of_birth, "%Y-%m-%d").date()
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    
    if age < 18:
        raise HTTPException(
            status_code=400, 
            detail="You must be 18 years or older to create an account. Youth registrations must be completed by a parent or guardian."
        )
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role="member",
        date_of_birth=user_data.date_of_birth,
        phone=user_data.phone,
        is_parent=True  # All adult accounts can manage youth
    )
    
    doc = user.model_dump()
    doc['password'] = hash_password(user_data.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_access_token({"user_id": user.id, "email": user.email})
    return {"user": user, "token": token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_access_token({"user_id": user.id, "email": user.email})
    return {"user": user, "token": token}

@api_router.get("/auth/me", response_model=User)
async def get_me(user: User = Depends(get_current_user)):
    return user

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
    event = Event(**event_data.model_dump())
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.insert_one(doc)
    return event

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
    result = await db.adult_registrations.update_one(
        {"id": registration_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
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
    result = await db.enhanced_registrations.update_one(
        {"id": registration_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
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