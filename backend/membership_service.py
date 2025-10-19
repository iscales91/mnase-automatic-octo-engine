"""
Membership Service for MNASE Basketball League
Handles membership creation, pricing, and management
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List

# Membership pricing configuration
MEMBERSHIP_PRICING = {
    "individual": {
        "basic": {
            "monthly": 29.99,
            "annual": 299.99,
            "benefits": [
                "Access to open gym sessions",
                "10% discount on camps and clinics",
                "Member-only events access",
                "MNASE newsletter"
            ]
        },
        "premium": {
            "monthly": 49.99,
            "annual": 499.99,
            "benefits": [
                "All Basic benefits",
                "Unlimited open gym access",
                "20% discount on camps and clinics",
                "Priority registration for events",
                "1 free skills clinic per month",
                "Access to member lounge"
            ]
        },
        "elite": {
            "monthly": 99.99,
            "annual": 999.99,
            "benefits": [
                "All Premium benefits",
                "Personal training session (monthly)",
                "30% discount on all programs",
                "VIP event access",
                "Free tournament registration",
                "Exclusive coaching sessions",
                "MNASE merchandise package"
            ]
        }
    },
    "team": {
        "basic": {
            "monthly": 199.99,
            "annual": 1999.99,
            "team_size": 10,
            "benefits": [
                "Team practice court time (4 hours/week)",
                "Team registration for local tournaments",
                "Team jerseys (one-time)",
                "Coach support for strategy sessions",
                "Team storage locker"
            ]
        },
        "premium": {
            "monthly": 349.99,
            "annual": 3499.99,
            "team_size": 15,
            "benefits": [
                "All Basic benefits",
                "Extended court time (8 hours/week)",
                "Professional coaching (2 sessions/week)",
                "Video analysis tools",
                "Tournament fee coverage (up to 2 per season)",
                "Team website and stats tracking",
                "Strength and conditioning program"
            ]
        },
        "elite": {
            "monthly": 599.99,
            "annual": 5999.99,
            "team_size": 20,
            "benefits": [
                "All Premium benefits",
                "Dedicated court time (12 hours/week)",
                "Elite coaching staff",
                "Travel tournament support",
                "Professional athletic training",
                "Team equipment package",
                "Recruiting assistance",
                "Sports psychology sessions"
            ]
        }
    }
}

class MembershipService:
    def __init__(self):
        print("✅ MembershipService initialized")
    
    def get_pricing(self, membership_type: str, tier: str, billing_cycle: str) -> float:
        """Get price for a membership configuration"""
        try:
            return MEMBERSHIP_PRICING[membership_type][tier][billing_cycle]
        except KeyError:
            raise ValueError(f"Invalid membership configuration: {membership_type}/{tier}/{billing_cycle}")
    
    def get_benefits(self, membership_type: str, tier: str) -> List[str]:
        """Get benefits for a membership tier"""
        try:
            return MEMBERSHIP_PRICING[membership_type][tier]["benefits"]
        except KeyError:
            raise ValueError(f"Invalid membership configuration: {membership_type}/{tier}")
    
    def calculate_end_date(self, start_date: datetime, billing_cycle: str) -> datetime:
        """Calculate membership end date based on billing cycle"""
        if billing_cycle == "monthly":
            return start_date + timedelta(days=30)
        elif billing_cycle == "annual":
            return start_date + timedelta(days=365)
        else:
            raise ValueError(f"Invalid billing cycle: {billing_cycle}")
    
    def get_team_size(self, tier: str) -> int:
        """Get maximum team size for a tier"""
        try:
            return MEMBERSHIP_PRICING["team"][tier].get("team_size", 10)
        except KeyError:
            return 10
    
    def validate_membership_config(self, membership_type: str, tier: str, billing_cycle: str) -> bool:
        """Validate membership configuration"""
        try:
            self.get_pricing(membership_type, tier, billing_cycle)
            return True
        except ValueError:
            return False
    
    def get_all_tiers(self, membership_type: str) -> Dict:
        """Get all available tiers for a membership type"""
        return MEMBERSHIP_PRICING.get(membership_type, {})
    
    def is_membership_active(self, membership: Dict) -> bool:
        """Check if membership is currently active"""
        if membership["status"] != "active":
            return False
        
        if membership.get("end_date"):
            end_date = membership["end_date"]
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date)
            
            return end_date > datetime.now(timezone.utc)
        
        return True
    
    def should_auto_renew(self, membership: Dict) -> bool:
        """Check if membership should be auto-renewed"""
        if not membership.get("auto_renew"):
            return False
        
        if membership["status"] != "active":
            return False
        
        # Check if membership is close to expiry (within 7 days)
        if membership.get("end_date"):
            end_date = membership["end_date"]
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date)
            
            days_until_expiry = (end_date - datetime.now(timezone.utc)).days
            return 0 <= days_until_expiry <= 7
        
        return False

# Initialize service
membership_service = MembershipService()
