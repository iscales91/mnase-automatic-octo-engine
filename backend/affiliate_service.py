"""
Affiliate Ticket Sales Service
Manages athlete affiliate program, ticket sales, and commission tracking
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict
import secrets
import string

class AffiliateService:
    def __init__(self, db):
        self.db = db
        self.commission_rate = 0.15  # 15% default commission
    
    def generate_referral_code(self, length=8):
        """Generate unique referral code for athlete"""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(characters) for _ in range(length))
            # Check if code already exists
            existing = self.db.affiliates.find_one({"referral_code": code})
            if not existing:
                return code
    
    async def create_affiliate_application(self, user_id: str, application_data: dict):
        """Create new affiliate application"""
        application = {
            "user_id": user_id,
            "status": "pending",  # pending, approved, rejected
            "applied_at": datetime.now(timezone.utc).isoformat(),
            "role_type": application_data.get("role_type"),  # coach or athlete
            "sport_experience": application_data.get("sport_experience", ""),
            "social_media_links": application_data.get("social_media_links", []),
            "motivation": application_data.get("motivation", ""),
            "approved_at": None,
            "rejected_at": None,
            "reviewed_by": None
        }
        result = await self.db.affiliate_applications.insert_one(application)
        return str(result.inserted_id)
    
    async def approve_affiliate(self, application_id: str, admin_id: str):
        """Approve affiliate application and create affiliate account"""
        application = await self.db.affiliate_applications.find_one({"_id": application_id})
        if not application:
            raise ValueError("Application not found")
        
        if application["status"] == "approved":
            raise ValueError("Application already approved")
        
        # Generate unique referral code
        referral_code = self.generate_referral_code()
        
        # Create affiliate account
        affiliate = {
            "user_id": application["user_id"],
            "referral_code": referral_code,
            "commission_rate": self.commission_rate,
            "status": "active",  # active, suspended, inactive
            "total_sales": 0,
            "total_earnings": 0.0,
            "pending_earnings": 0.0,
            "paid_earnings": 0.0,
            "stripe_connect_id": None,
            "stripe_onboarded": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "activated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await self.db.affiliates.insert_one(affiliate)
        
        # Update application status
        await self.db.affiliate_applications.update_one(
            {"_id": application_id},
            {
                "$set": {
                    "status": "approved",
                    "approved_at": datetime.now(timezone.utc).isoformat(),
                    "reviewed_by": admin_id
                }
            }
        )
        
        return {
            "affiliate_id": str(result.inserted_id),
            "referral_code": referral_code
        }
    
    async def reject_affiliate(self, application_id: str, admin_id: str, reason: str = ""):
        """Reject affiliate application"""
        await self.db.affiliate_applications.update_one(
            {"_id": application_id},
            {
                "$set": {
                    "status": "rejected",
                    "rejected_at": datetime.now(timezone.utc).isoformat(),
                    "reviewed_by": admin_id,
                    "rejection_reason": reason
                }
            }
        )
    
    async def get_affiliate_by_user(self, user_id: str):
        """Get affiliate by user ID"""
        return await self.db.affiliates.find_one({"user_id": user_id})
    
    async def get_affiliate_by_code(self, referral_code: str):
        """Get affiliate by referral code"""
        return await self.db.affiliates.find_one({"referral_code": referral_code})
    
    async def record_ticket_sale(self, ticket_sale_data: dict):
        """Record ticket sale with affiliate tracking"""
        sale = {
            "ticket_id": ticket_sale_data["ticket_id"],
            "event_id": ticket_sale_data["event_id"],
            "buyer_id": ticket_sale_data.get("buyer_id"),
            "buyer_email": ticket_sale_data["buyer_email"],
            "ticket_type": ticket_sale_data["ticket_type"],
            "quantity": ticket_sale_data["quantity"],
            "seat_numbers": ticket_sale_data.get("seat_numbers", []),
            "unit_price": ticket_sale_data["unit_price"],
            "total_amount": ticket_sale_data["total_amount"],
            "referral_code": ticket_sale_data.get("referral_code"),
            "affiliate_id": ticket_sale_data.get("affiliate_id"),
            "commission_amount": 0.0,
            "stripe_payment_id": ticket_sale_data.get("stripe_payment_id"),
            "purchased_at": datetime.now(timezone.utc).isoformat(),
            "status": "completed"  # completed, refunded, cancelled
        }
        
        # Calculate commission if affiliate referral
        if sale["referral_code"] and sale["affiliate_id"]:
            affiliate = await self.db.affiliates.find_one({"_id": sale["affiliate_id"]})
            if affiliate:
                commission = sale["total_amount"] * affiliate["commission_rate"]
                sale["commission_amount"] = round(commission, 2)
                
                # Update affiliate earnings
                await self.db.affiliates.update_one(
                    {"_id": sale["affiliate_id"]},
                    {
                        "$inc": {
                            "total_sales": 1,
                            "total_earnings": commission,
                            "pending_earnings": commission
                        }
                    }
                )
        
        result = await self.db.ticket_sales.insert_one(sale)
        return str(result.inserted_id)
    
    async def get_affiliate_sales(self, affiliate_id: str, limit: int = 50):
        """Get sales history for affiliate"""
        sales = await self.db.ticket_sales.find(
            {"affiliate_id": affiliate_id}
        ).sort("purchased_at", -1).limit(limit).to_list(length=limit)
        return sales
    
    async def get_affiliate_earnings_summary(self, affiliate_id: str):
        """Get earnings summary for affiliate"""
        affiliate = await self.db.affiliates.find_one({"_id": affiliate_id})
        if not affiliate:
            return None
        
        # Get payout history
        payouts = await self.db.affiliate_payouts.find(
            {"affiliate_id": affiliate_id}
        ).sort("payout_date", -1).to_list(length=100)
        
        return {
            "total_sales": affiliate.get("total_sales", 0),
            "total_earnings": affiliate.get("total_earnings", 0.0),
            "pending_earnings": affiliate.get("pending_earnings", 0.0),
            "paid_earnings": affiliate.get("paid_earnings", 0.0),
            "commission_rate": affiliate.get("commission_rate", 0.15),
            "referral_code": affiliate.get("referral_code"),
            "payouts": payouts
        }
    
    async def process_monthly_payouts(self):
        """Process monthly payouts for all affiliates (run on 1st of month)"""
        # Find all affiliates with pending earnings > 0
        affiliates = await self.db.affiliates.find(
            {"pending_earnings": {"$gt": 0}, "stripe_onboarded": True}
        ).to_list(length=1000)
        
        payout_results = []
        for affiliate in affiliates:
            try:
                payout = {
                    "affiliate_id": affiliate["_id"],
                    "user_id": affiliate["user_id"],
                    "amount": affiliate["pending_earnings"],
                    "stripe_connect_id": affiliate.get("stripe_connect_id"),
                    "status": "pending",  # pending, processing, completed, failed
                    "payout_date": datetime.now(timezone.utc).isoformat(),
                    "period_start": None,  # Set based on last payout
                    "period_end": datetime.now(timezone.utc).isoformat(),
                    "processed_at": None,
                    "error_message": None
                }
                
                result = await self.db.affiliate_payouts.insert_one(payout)
                payout_results.append({
                    "affiliate_id": str(affiliate["_id"]),
                    "payout_id": str(result.inserted_id),
                    "amount": affiliate["pending_earnings"],
                    "status": "scheduled"
                })
                
                # Update affiliate pending to 0, add to paid
                await self.db.affiliates.update_one(
                    {"_id": affiliate["_id"]},
                    {
                        "$inc": {
                            "paid_earnings": affiliate["pending_earnings"]
                        },
                        "$set": {
                            "pending_earnings": 0.0,
                            "last_payout_date": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
            except Exception as e:
                payout_results.append({
                    "affiliate_id": str(affiliate["_id"]),
                    "status": "error",
                    "error": str(e)
                })
        
        return payout_results
    
    async def update_commission_rate(self, affiliate_id: str, new_rate: float):
        """Update commission rate for specific affiliate (super admin only)"""
        if new_rate < 0 or new_rate > 1:
            raise ValueError("Commission rate must be between 0 and 1")
        
        await self.db.affiliates.update_one(
            {"_id": affiliate_id},
            {"$set": {"commission_rate": new_rate}}
        )
    
    async def get_all_affiliates(self, status: Optional[str] = None):
        """Get all affiliates (admin view)"""
        query = {}
        if status:
            query["status"] = status
        
        affiliates = await self.db.affiliates.find(query).to_list(length=1000)
        
        # Enrich with user data
        for affiliate in affiliates:
            user = await self.db.users.find_one({"id": affiliate["user_id"]})
            if user:
                affiliate["user_name"] = user.get("name", "Unknown")
                affiliate["user_email"] = user.get("email", "Unknown")
        
        return affiliates
    
    async def get_pending_applications(self):
        """Get all pending affiliate applications"""
        applications = await self.db.affiliate_applications.find(
            {"status": "pending"}
        ).sort("applied_at", -1).to_list(length=1000)
        
        # Enrich with user data
        for app in applications:
            user = await self.db.users.find_one({"id": app["user_id"]})
            if user:
                app["user_name"] = user.get("name", "Unknown")
                app["user_email"] = user.get("email", "Unknown")
        
        return applications
