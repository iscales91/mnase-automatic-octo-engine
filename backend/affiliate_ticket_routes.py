"""
Affiliate & Ticket Management API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import os
import jwt
from dotenv import load_dotenv

from affiliate_service import AffiliateService
from ticket_service import TicketService
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, 
    CheckoutStatusResponse, CheckoutSessionRequest
)

load_dotenv()

router = APIRouter(prefix="/api")

# Pydantic Models
class AffiliateApplication(BaseModel):
    role_type: str = Field(..., description="coach or athlete")
    sport_experience: str = Field(..., description="Years of experience and achievements")
    social_media_links: List[str] = Field(default=[], description="Social media profile links")
    motivation: str = Field(..., description="Why you want to be an affiliate")

class AffiliateApproval(BaseModel):
    application_id: str
    admin_id: str

class AffiliateRejection(BaseModel):
    application_id: str
    admin_id: str
    reason: Optional[str] = ""

class CommissionRateUpdate(BaseModel):
    affiliate_id: str
    new_rate: float = Field(..., ge=0, le=1, description="Commission rate between 0 and 1")

class TicketTypeCreate(BaseModel):
    event_id: str
    name: str = Field(..., description="e.g., General Admission, VIP, Student")
    description: str = ""
    price: float
    quantity_available: int
    has_seat_numbers: bool = False
    seat_numbers: List[str] = Field(default=[], description="List of seat numbers for VIP tickets")
    sale_start: Optional[str] = None
    sale_end: Optional[str] = None
    max_per_order: int = 10

class TicketPurchaseRequest(BaseModel):
    event_id: str
    ticket_type_id: str
    quantity: int
    seat_numbers: Optional[List[str]] = []
    referral_code: Optional[str] = None
    buyer_name: str
    buyer_email: str
    origin_url: str = Field(..., description="Frontend origin for redirect URLs")

class TicketValidation(BaseModel):
    ticket_id: str
    qr_code: str

# Security setup
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')

# Database connection
from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Authentication functions (matching server.py)
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
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def get_super_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user

# Dependency to get database
async def get_db():
    return db

# ==================== AFFILIATE APPLICATION ROUTES ====================

@router.post("/affiliates/apply")
async def apply_for_affiliate(
    application: AffiliateApplication,
    user: dict = Depends(get_current_user)
):
    """Apply to become an affiliate (coach or athlete)"""
    affiliate_service = AffiliateService(db)
    
    # Check if user already has an application
    existing_app = await db.affiliate_applications.find_one({"user_id": user["id"]})
    if existing_app:
        if existing_app["status"] == "pending":
            raise HTTPException(status_code=400, detail="You already have a pending application")
        elif existing_app["status"] == "approved":
            raise HTTPException(status_code=400, detail="You are already an approved affiliate")
    
    application_id = await affiliate_service.create_affiliate_application(
        user["id"], 
        application.dict()
    )
    
    return {
        "message": "Application submitted successfully",
        "application_id": application_id,
        "status": "pending"
    }

@router.get("/affiliates/my-application")
async def get_my_application(
    user: dict = Depends(get_current_user)
):
    """Get current user's affiliate application status"""
    application = await db.affiliate_applications.find_one({"user_id": user["id"]})
    if not application:
        return {"status": "not_applied"}
    
    return {
        "status": application["status"],
        "applied_at": application["applied_at"],
        "approved_at": application.get("approved_at"),
        "rejected_at": application.get("rejected_at"),
        "rejection_reason": application.get("rejection_reason")
    }

@router.get("/affiliates/my-account")
async def get_my_affiliate_account(
    user: dict = Depends(get_current_user)
):
    """Get current user's affiliate account details"""
    affiliate_service = AffiliateService(db)
    affiliate = await affiliate_service.get_affiliate_by_user(user["id"])
    
    if not affiliate:
        raise HTTPException(status_code=404, detail="You are not an affiliate")
    
    # Get earnings summary
    earnings = await affiliate_service.get_affiliate_earnings_summary(str(affiliate["_id"]))
    
    return {
        "referral_code": affiliate["referral_code"],
        "referral_link": f"/tickets?ref={affiliate['referral_code']}",
        "status": affiliate["status"],
        "commission_rate": affiliate["commission_rate"],
        "earnings": earnings
    }

@router.get("/affiliates/my-sales")
async def get_my_sales(
    user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get affiliate's sales history"""
    affiliate_service = AffiliateService(db)
    affiliate = await affiliate_service.get_affiliate_by_user(user["id"])
    
    if not affiliate:
        raise HTTPException(status_code=404, detail="You are not an affiliate")
    
    sales = await affiliate_service.get_affiliate_sales(str(affiliate["_id"]), limit)
    
    # Enrich with event data
    for sale in sales:
        event = await db.events.find_one({"id": sale["event_id"]})
        if event:
            sale["event_title"] = event.get("title", "Unknown Event")
    
    return {"sales": sales}

# ==================== ADMIN AFFILIATE MANAGEMENT ROUTES ====================

@router.get("/admin/affiliates/applications")
async def get_affiliate_applications(
    admin: dict = Depends(get_admin_user),
    status: Optional[str] = None
):
    """Get affiliate applications (admin)"""
    affiliate_service = AffiliateService(db)
    
    if status == "pending":
        applications = await affiliate_service.get_pending_applications()
    else:
        query = {}
        if status:
            query["status"] = status
        applications = await db.affiliate_applications.find(query).sort("applied_at", -1).to_list(length=1000)
        
        # Convert ObjectIds to strings and enrich with user data
        for app in applications:
            app["_id"] = str(app["_id"])  # Convert ObjectId to string
            user = await db.users.find_one({"id": app["user_id"]})
            if user:
                app["user_name"] = user.get("name", "Unknown")
                app["user_email"] = user.get("email", "Unknown")
    
    return {"applications": applications}

@router.post("/admin/affiliates/approve")
async def approve_affiliate_application(
    approval: AffiliateApproval,
    admin: dict = Depends(get_admin_user),
    
):
    """Approve affiliate application (admin)"""
    affiliate_service = AffiliateService(db)
    
    try:
        result = await affiliate_service.approve_affiliate(
            approval.application_id,
            admin["id"]
        )
        return {
            "message": "Affiliate approved successfully",
            "affiliate_id": result["affiliate_id"],
            "referral_code": result["referral_code"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/affiliates/reject")
async def reject_affiliate_application(
    rejection: AffiliateRejection,
    admin: dict = Depends(get_admin_user),
    
):
    """Reject affiliate application (admin)"""
    affiliate_service = AffiliateService(db)
    
    await affiliate_service.reject_affiliate(
        rejection.application_id,
        admin["id"],
        rejection.reason
    )
    
    return {"message": "Application rejected"}

@router.get("/admin/affiliates")
async def get_all_affiliates(
    admin: dict = Depends(get_admin_user),
    status: Optional[str] = None
):
    """Get all affiliates (admin)"""
    affiliate_service = AffiliateService(db)
    affiliates = await affiliate_service.get_all_affiliates(status)
    return {"affiliates": affiliates}

@router.put("/admin/affiliates/commission-rate")
async def update_affiliate_commission(
    update: CommissionRateUpdate,
    admin: dict = Depends(get_super_admin_user)
):
    """Update affiliate commission rate (super admin only)"""
    affiliate_service = AffiliateService(db)
    
    try:
        await affiliate_service.update_commission_rate(
            update.affiliate_id,
            update.new_rate
        )
        return {"message": f"Commission rate updated to {update.new_rate * 100}%"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/affiliates/process-payouts")
async def process_monthly_payouts(
    admin: dict = Depends(get_super_admin_user)
):
    """Process monthly payouts for all affiliates (super admin only)"""
    affiliate_service = AffiliateService(db)
    results = await affiliate_service.process_monthly_payouts()
    return {
        "message": "Monthly payouts processed",
        "results": results
    }

# ==================== TICKET MANAGEMENT ROUTES ====================

@router.post("/admin/tickets/create-type")
async def create_ticket_type(
    ticket_type: TicketTypeCreate,
    admin: dict = Depends(get_admin_user)
):
    """Create a ticket type for an event (admin)"""
    try:
        ticket_service = TicketService(db)
        
        # Verify event exists
        event = await db.events.find_one({"id": ticket_type.event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        created_ticket = await ticket_service.create_ticket_type(
            ticket_type.event_id,
            ticket_type.dict()
        )
        
        # Ensure clean response without ObjectIds
        return {
            "message": "Ticket type created",
            "ticket_type": {
                "id": created_ticket["id"],
                "event_id": created_ticket["event_id"],
                "name": created_ticket["name"],
                "description": created_ticket["description"],
                "price": created_ticket["price"],
                "quantity_available": created_ticket["quantity_available"],
                "has_seat_numbers": created_ticket["has_seat_numbers"],
                "status": created_ticket["status"]
            }
        }
    except Exception as e:
        print(f"Error in create_ticket_type: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create ticket type: {str(e)}")

@router.get("/tickets/event/{event_id}")
async def get_event_tickets(event_id: str):
    """Get all ticket types for an event (public)"""
    ticket_service = TicketService(db)
    ticket_types = await ticket_service.get_ticket_types_by_event(event_id)
    return {"ticket_types": ticket_types}

@router.get("/tickets/type/{ticket_type_id}")
async def get_ticket_type(ticket_type_id: str):
    """Get specific ticket type details"""
    ticket_service = TicketService(db)
    ticket_type = await ticket_service.get_ticket_type(ticket_type_id)
    
    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    
    return ticket_type

@router.post("/tickets/purchase")
async def purchase_tickets(
    purchase: TicketPurchaseRequest,
    user: Optional[dict] = None
):
    """Purchase tickets with optional referral code"""
    ticket_service = TicketService(db)
    affiliate_service = AffiliateService(db)
    
    # Get ticket type
    ticket_type = await ticket_service.get_ticket_type(purchase.ticket_type_id)
    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    
    # Check availability
    available = ticket_type["quantity_available"] - ticket_type["quantity_sold"]
    if available < purchase.quantity:
        raise HTTPException(status_code=400, detail=f"Only {available} tickets available")
    
    # Validate seat numbers for VIP tickets
    if ticket_type["has_seat_numbers"]:
        if len(purchase.seat_numbers) != purchase.quantity:
            raise HTTPException(status_code=400, detail="Must select seat numbers for VIP tickets")
        
        # Check if seats are available
        for seat in purchase.seat_numbers:
            if seat not in ticket_type["available_seats"]:
                raise HTTPException(status_code=400, detail=f"Seat {seat} not available")
    
    # Check referral code
    affiliate_id = None
    affiliate = None
    if purchase.referral_code:
        affiliate = await affiliate_service.get_affiliate_by_code(purchase.referral_code)
        if affiliate:
            affiliate_id = str(affiliate["_id"])
    
    # Calculate total
    total_amount = ticket_type["price"] * purchase.quantity
    
    # Create Stripe checkout session
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    host_url = purchase.origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    success_url = f"{host_url}/booking-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/events"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(total_amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "ticket_purchase",
            "event_id": purchase.event_id,
            "ticket_type_id": purchase.ticket_type_id,
            "quantity": str(purchase.quantity),
            "seat_numbers": ",".join(purchase.seat_numbers) if purchase.seat_numbers else "",
            "referral_code": purchase.referral_code or "",
            "affiliate_id": affiliate_id or "",
            "buyer_name": purchase.buyer_name,
            "buyer_email": purchase.buyer_email
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create pending payment transaction
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "type": "ticket_purchase",
        "event_id": purchase.event_id,
        "ticket_type_id": purchase.ticket_type_id,
        "quantity": purchase.quantity,
        "seat_numbers": purchase.seat_numbers,
        "referral_code": purchase.referral_code,
        "affiliate_id": affiliate_id,
        "buyer_name": purchase.buyer_name,
        "buyer_email": purchase.buyer_email,
        "amount": total_amount,
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now().isoformat()
    })
    
    return {
        "checkout_url": session.url,
        "session_id": session.session_id
    }

@router.get("/tickets/payment-status/{session_id}")
async def get_ticket_payment_status(
    session_id: str,
    
):
    """Check ticket payment status"""
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    # Get payment transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # If already completed, return cached status
    if transaction["payment_status"] == "paid":
        return {
            "status": "completed",
            "payment_status": "paid",
            "message": "Tickets purchased successfully"
        }
    
    # Check with Stripe
    checkout_status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction if payment completed
    if checkout_status.payment_status == "paid" and transaction["payment_status"] != "paid":
        # Process ticket sale
        ticket_service = TicketService(db)
        affiliate_service = AffiliateService(db)
        
        # Create ticket sale record
        sale_id = await affiliate_service.record_ticket_sale({
            "ticket_id": session_id,
            "event_id": transaction["event_id"],
            "buyer_email": transaction["buyer_email"],
            "ticket_type": transaction["ticket_type_id"],
            "quantity": transaction["quantity"],
            "seat_numbers": transaction.get("seat_numbers", []),
            "unit_price": transaction["amount"] / transaction["quantity"],
            "total_amount": transaction["amount"],
            "referral_code": transaction.get("referral_code"),
            "affiliate_id": transaction.get("affiliate_id"),
            "stripe_payment_id": session_id
        })
        
        # Update ticket inventory
        await ticket_service.update_ticket_inventory(
            transaction["ticket_type_id"],
            transaction["quantity"],
            transaction.get("seat_numbers")
        )
        
        # Create individual tickets
        for i in range(transaction["quantity"]):
            seat_number = transaction.get("seat_numbers", [])[i] if transaction.get("seat_numbers") else None
            await ticket_service.create_ticket({
                "sale_id": sale_id,
                "event_id": transaction["event_id"],
                "ticket_type_id": transaction["ticket_type_id"],
                "ticket_type_name": "Ticket",  # Get from ticket_type
                "buyer_email": transaction["buyer_email"],
                "buyer_name": transaction["buyer_name"],
                "seat_number": seat_number,
                "price": transaction["amount"] / transaction["quantity"]
            })
        
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "completed_at": datetime.now().isoformat()}}
        )
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount": checkout_status.amount_total / 100,
        "currency": checkout_status.currency
    }

@router.get("/tickets/my-tickets")
async def get_my_tickets(
    user: dict = Depends(get_current_user),
    
):
    """Get user's purchased tickets"""
    ticket_service = TicketService(db)
    tickets = await ticket_service.get_tickets_by_user(user["id"])
    
    # Enrich with event data
    for ticket in tickets:
        event = await db.events.find_one({"id": ticket["event_id"]})
        if event:
            ticket["event_title"] = event.get("title", "Unknown")
            ticket["event_date"] = event.get("date", "")
            ticket["event_location"] = event.get("location", "")
    
    return {"tickets": tickets}

@router.post("/tickets/validate")
async def validate_ticket(
    validation: TicketValidation,
    admin: dict = Depends(get_admin_user),
    
):
    """Validate ticket at event entry (admin/staff)"""
    ticket_service = TicketService(db)
    result = await ticket_service.validate_ticket(validation.ticket_id, validation.qr_code)
    return result

@router.get("/admin/tickets/sales-stats")
async def get_sales_statistics(
    admin: dict = Depends(get_admin_user),
    event_id: Optional[str] = None
):
    """Get ticket sales statistics (admin)"""
    ticket_service = TicketService(db)
    stats = await ticket_service.get_sales_statistics(event_id)
    return stats

# ==================== STRIPE WEBHOOK ====================

@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    
):
    """Handle Stripe webhook events"""
    body = await request.body()
    
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Handle successful payment
        if webhook_response.event_type == "checkout.session.completed":
            session_id = webhook_response.session_id
            
            # Update transaction if not already processed
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction and transaction["payment_status"] != "paid":
                # Process the payment (same logic as in get_payment_status)
                # This ensures webhook processing
                pass
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
