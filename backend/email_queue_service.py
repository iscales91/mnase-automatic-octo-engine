"""
Email Queue Service - Handle email sending with rate limiting for Gmail
"""
import asyncio
from datetime import datetime, timezone
from typing import Optional, List
from email_service import EmailService

class EmailQueueService:
    def __init__(self, db):
        self.db = db
        self.email_service = EmailService()  # EmailService doesn't take db parameter
        self.rate_limit = 100  # Gmail free account limit: 100 emails/day
        self.processing = False
    
    async def queue_email(self, to_email: str, subject: str, body: str, 
                         priority: str = "normal"):
        """Add email to queue"""
        email_doc = {
            "to_email": to_email,
            "subject": subject,
            "body": body,
            "priority": priority,  # high, normal, low
            "status": "pending",  # pending, sending, sent, failed
            "attempts": 0,
            "max_attempts": 3,
            "queued_at": datetime.now(timezone.utc).isoformat(),
            "sent_at": None,
            "error": None
        }
        
        result = await self.db.email_queue.insert_one(email_doc)
        return {"queued": True, "queue_id": str(result.inserted_id)}
    
    async def process_queue(self):
        """Process pending emails in queue with rate limiting"""
        if self.processing:
            return {"message": "Queue processing already in progress"}
        
        self.processing = True
        processed = 0
        failed = 0
        
        try:
            # Check daily limit
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            sent_today = await self.db.email_queue.count_documents({
                "status": "sent",
                "sent_at": {"$gte": today_start.isoformat()}
            })
            
            if sent_today >= self.rate_limit:
                return {
                    "message": f"Daily rate limit reached ({self.rate_limit} emails)",
                    "processed": 0,
                    "failed": 0
                }
            
            # Get pending emails (prioritize by priority and queue time)
            available_slots = self.rate_limit - sent_today
            priority_order = {"high": 1, "normal": 2, "low": 3}
            
            pending_emails = await self.db.email_queue.find({
                "status": "pending",
                "$or": [
                    {"attempts": {"$lt": 3}},
                    {"attempts": {"$exists": False}}
                ]
            }).sort([
                ("priority", 1),  # High priority first
                ("queued_at", 1)  # Older emails first
            ]).limit(available_slots).to_list(length=available_slots)
            
            # Process each email
            for email in pending_emails:
                try:
                    # Update status to sending
                    await self.db.email_queue.update_one(
                        {"_id": email["_id"]},
                        {
                            "$set": {"status": "sending"},
                            "$inc": {"attempts": 1}
                        }
                    )
                    
                    # Send email using email service
                    await self.email_service.send_email(
                        email["to_email"],
                        email["subject"],
                        email["body"]
                    )
                    
                    # Mark as sent
                    await self.db.email_queue.update_one(
                        {"_id": email["_id"]},
                        {
                            "$set": {
                                "status": "sent",
                                "sent_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    )
                    
                    processed += 1
                    
                    # Rate limiting: Wait 1 second between emails to avoid spam filters
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    # Mark as failed or retry
                    attempts = email.get("attempts", 0) + 1
                    status = "failed" if attempts >= 3 else "pending"
                    
                    await self.db.email_queue.update_one(
                        {"_id": email["_id"]},
                        {
                            "$set": {
                                "status": status,
                                "error": str(e),
                                "last_attempt_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    )
                    
                    failed += 1
            
            return {
                "message": "Queue processed successfully",
                "processed": processed,
                "failed": failed,
                "remaining": await self.db.email_queue.count_documents({"status": "pending"})
            }
            
        finally:
            self.processing = False
    
    async def get_queue_status(self):
        """Get current queue status"""
        pending = await self.db.email_queue.count_documents({"status": "pending"})
        sending = await self.db.email_queue.count_documents({"status": "sending"})
        sent_today = await self.db.email_queue.count_documents({
            "status": "sent",
            "sent_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()}
        })
        failed = await self.db.email_queue.count_documents({"status": "failed"})
        
        return {
            "pending": pending,
            "sending": sending,
            "sent_today": sent_today,
            "failed": failed,
            "rate_limit": self.rate_limit,
            "remaining_today": max(0, self.rate_limit - sent_today)
        }
    
    async def retry_failed_emails(self):
        """Retry all failed emails"""
        result = await self.db.email_queue.update_many(
            {"status": "failed"},
            {
                "$set": {
                    "status": "pending",
                    "attempts": 0,
                    "error": None
                }
            }
        )
        
        return {"message": f"Retrying {result.modified_count} failed emails"}
    
    async def clear_old_emails(self, days: int = 30):
        """Clear emails older than specified days"""
        cutoff_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
        cutoff_date = cutoff_date.replace(day=cutoff_date.day - days)
        
        result = await self.db.email_queue.delete_many({
            "status": "sent",
            "sent_at": {"$lt": cutoff_date.isoformat()}
        })
        
        return {"message": f"Deleted {result.deleted_count} old emails"}
