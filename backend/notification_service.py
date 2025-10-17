"""
Notification Service for MNASE Basketball League
Handles in-app notifications for users
"""
import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import uuid


class NotificationService:
    """
    Service for creating and managing in-app notifications
    Supports various notification types and delivery methods
    """
    
    def __init__(self):
        print("✅ NotificationService initialized")
    
    def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "info",
        link: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a notification object
        
        Args:
            user_id: Recipient user ID
            title: Notification title
            message: Notification message
            notification_type: Type (info, success, warning, error, registration, payment, team, event)
            link: Optional link for the notification
            metadata: Optional additional data
            
        Returns:
            Notification dict ready for database insertion
        """
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "link": link,
            "metadata": metadata or {},
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        return notification
    
    def create_registration_approved_notification(
        self,
        user_id: str,
        athlete_name: str,
        registration_id: str,
        registration_type: str = "youth"
    ) -> Dict[str, Any]:
        """Create notification for registration approval"""
        return self.create_notification(
            user_id=user_id,
            title="✅ Registration Approved",
            message=f"Great news! The registration for {athlete_name} has been approved. Please complete payment to secure your spot.",
            notification_type="registration",
            link=f"/member-dashboard",
            metadata={
                "registration_id": registration_id,
                "registration_type": registration_type,
                "action_required": True
            }
        )
    
    def create_registration_rejected_notification(
        self,
        user_id: str,
        athlete_name: str,
        registration_id: str
    ) -> Dict[str, Any]:
        """Create notification for registration rejection"""
        return self.create_notification(
            user_id=user_id,
            title="❌ Registration Update",
            message=f"Unfortunately, the registration for {athlete_name} was not approved. Please contact us for more information.",
            notification_type="registration",
            link=f"/contact",
            metadata={
                "registration_id": registration_id,
                "action_required": False
            }
        )
    
    def create_payment_success_notification(
        self,
        user_id: str,
        amount: float,
        item_name: str
    ) -> Dict[str, Any]:
        """Create notification for successful payment"""
        return self.create_notification(
            user_id=user_id,
            title="💳 Payment Successful",
            message=f"Your payment of ${amount:.2f} for {item_name} has been processed successfully.",
            notification_type="payment",
            link=f"/member-dashboard",
            metadata={
                "amount": amount,
                "item_name": item_name
            }
        )
    
    def create_team_assignment_notification(
        self,
        user_id: str,
        team_name: str,
        team_id: str
    ) -> Dict[str, Any]:
        """Create notification for team assignment"""
        return self.create_notification(
            user_id=user_id,
            title="🏀 Team Assignment",
            message=f"You've been assigned to team {team_name}! Check your dashboard for team details and schedule.",
            notification_type="team",
            link=f"/member-dashboard",
            metadata={
                "team_id": team_id,
                "team_name": team_name
            }
        )
    
    def create_event_reminder_notification(
        self,
        user_id: str,
        event_name: str,
        event_date: str,
        event_time: str
    ) -> Dict[str, Any]:
        """Create notification for event reminder"""
        return self.create_notification(
            user_id=user_id,
            title="📅 Upcoming Event",
            message=f"Reminder: {event_name} is scheduled for {event_date} at {event_time}.",
            notification_type="event",
            link=f"/events",
            metadata={
                "event_name": event_name,
                "event_date": event_date,
                "event_time": event_time
            }
        )
    
    def create_facility_booking_confirmation(
        self,
        user_id: str,
        facility_name: str,
        booking_date: str,
        start_time: str
    ) -> Dict[str, Any]:
        """Create notification for facility booking confirmation"""
        return self.create_notification(
            user_id=user_id,
            title="🏟️ Booking Confirmed",
            message=f"Your booking for {facility_name} on {booking_date} at {start_time} has been confirmed.",
            notification_type="success",
            link=f"/member-dashboard",
            metadata={
                "facility_name": facility_name,
                "booking_date": booking_date,
                "start_time": start_time
            }
        )
    
    def create_announcement_notification(
        self,
        user_id: str,
        title: str,
        message: str
    ) -> Dict[str, Any]:
        """Create notification for general announcements"""
        return self.create_notification(
            user_id=user_id,
            title=f"📢 {title}",
            message=message,
            notification_type="info",
            link=None,
            metadata={}
        )
    
    def create_welcome_notification(self, user_id: str, user_name: str) -> Dict[str, Any]:
        """Create welcome notification for new users"""
        return self.create_notification(
            user_id=user_id,
            title="👋 Welcome to MNASE Basketball League!",
            message=f"Hi {user_name}! Welcome to our community. Explore programs, register for events, and book facilities.",
            notification_type="info",
            link="/programs",
            metadata={"is_welcome": True}
        )
    
    def get_notification_icon(self, notification_type: str) -> str:
        """Get icon for notification type"""
        icons = {
            "info": "ℹ️",
            "success": "✅",
            "warning": "⚠️",
            "error": "❌",
            "registration": "📝",
            "payment": "💳",
            "team": "🏀",
            "event": "📅"
        }
        return icons.get(notification_type, "🔔")
    
    def get_notification_color(self, notification_type: str) -> str:
        """Get color for notification type"""
        colors = {
            "info": "#3b82f6",
            "success": "#10b981",
            "warning": "#f59e0b",
            "error": "#ef4444",
            "registration": "#8b5cf6",
            "payment": "#06b6d4",
            "team": "#ec4899",
            "event": "#f97316"
        }
        return colors.get(notification_type, "#6b7280")


# Global notification service instance
notification_service = NotificationService()
